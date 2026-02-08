"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getClassroomByAge } from "@/lib/classrooms"

async function getOrCreateService(supabase: Awaited<ReturnType<typeof createClient>>, serviceDate: string, timeSlot: string) {
  let { data: service } = await supabase
    .from("services")
    .select("id")
    .eq("service_date", serviceDate)
    .eq("time_slot", timeSlot)
    .single()

  if (!service) {
    const { data: newService, error } = await supabase
      .from("services")
      .insert({ service_date: serviceDate, time_slot: timeSlot })
      .select("id")
      .single()

    if (error || !newService) {
      console.error("[getOrCreateService] Erro ao criar culto no Supabase (data:", serviceDate, "turno:", timeSlot, "):", error?.message, "| Código:", error?.code, "| Detalhes:", error?.details)
      return null
    }
    service = newService
  }

  return service
}

export async function registerAttendance(formData: FormData) {
  const supabase = await createClient()

  const serviceDate = formData.get("service_date") as string
  const timeSlot = formData.get("time_slot") as string
  const childIds = formData.getAll("child_ids") as string[]
  const classroom = formData.get("classroom") as string

  if (!serviceDate || !timeSlot || !classroom || childIds.length === 0) {
    console.warn("[registerAttendance] Dados incompletos:", { serviceDate, timeSlot, classroom, childIdsCount: childIds.length })
    return { error: "Selecione pelo menos uma criança" }
  }

  const service = await getOrCreateService(supabase, serviceDate, timeSlot)
  if (!service) {
    return { error: "Erro ao criar culto. Verifique os logs do servidor para mais detalhes." }
  }

  // Check for existing attendance records to avoid duplicates
  const { data: existing, error: fetchError } = await supabase
    .from("attendance")
    .select("child_id")
    .eq("service_id", service.id)
    .eq("classroom", classroom)
    .in("child_id", childIds)

  if (fetchError) {
    console.error("[registerAttendance] Erro ao verificar presenças existentes:", fetchError.message, "| Código:", fetchError.code)
  }

  const existingIds = new Set(existing?.map((e) => e.child_id) ?? [])
  const newChildIds = childIds.filter((id) => !existingIds.has(id))

  if (newChildIds.length === 0) {
    return { error: "Todas as crianças já foram registradas neste culto" }
  }

  const records = newChildIds.map((childId) => ({
    service_id: service.id,
    child_id: childId,
    is_visitor: false,
    classroom,
  }))

  const { error } = await supabase.from("attendance").insert(records)

  if (error) {
    console.error("[registerAttendance] Erro ao inserir presenças no Supabase:", error.message, "| Código:", error.code, "| Detalhes:", error.details, "| Quantidade:", records.length)
    return { error: "Erro ao registrar presença" }
  }

  revalidatePath("/presenca")
  return { success: true, count: newChildIds.length }
}

export async function registerVisitor(formData: FormData) {
  const supabase = await createClient()

  const serviceDate = formData.get("service_date") as string
  const timeSlot = formData.get("time_slot") as string
  const visitorName = formData.get("visitor_name") as string
  const visitorBirthDate = formData.get("visitor_birth_date") as string
  const visitorGuardianName = formData.get("visitor_guardian_name") as string
  const visitorPhone = formData.get("visitor_phone") as string

  if (!serviceDate || !timeSlot || !visitorName || !visitorBirthDate) {
    console.warn("[registerVisitor] Campos obrigatórios ausentes:", { serviceDate: !!serviceDate, timeSlot: !!timeSlot, visitorName: !!visitorName, visitorBirthDate: !!visitorBirthDate })
    return { error: "Nome e data de nascimento são obrigatórios" }
  }

  const classroom = getClassroomByAge(visitorBirthDate)
  if (!classroom) {
    console.warn("[registerVisitor] Idade fora da faixa para visitante:", visitorName, "nascimento:", visitorBirthDate)
    return { error: "Idade fora da faixa do departamento infantil" }
  }

  const service = await getOrCreateService(supabase, serviceDate, timeSlot)
  if (!service) {
    return { error: "Erro ao criar culto. Verifique os logs do servidor para mais detalhes." }
  }

  const { error } = await supabase.from("attendance").insert({
    service_id: service.id,
    is_visitor: true,
    visitor_name: visitorName.trim(),
    visitor_birth_date: visitorBirthDate,
    visitor_guardian_name: visitorGuardianName?.trim() || null,
    visitor_phone: visitorPhone?.trim() || null,
    classroom,
  })

  if (error) {
    console.error("[registerVisitor] Erro ao inserir visitante no Supabase:", error.message, "| Código:", error.code, "| Detalhes:", error.details)
    return { error: "Erro ao registrar visitante" }
  }

  revalidatePath("/presenca")
  return { success: true }
}

export async function removeAttendance(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("attendance").delete().eq("id", id)

  if (error) {
    console.error("[removeAttendance] Erro ao remover presença no Supabase (id:", id, "):", error.message, "| Código:", error.code, "| Detalhes:", error.details)
    return { error: "Erro ao remover presença" }
  }

  revalidatePath("/presenca")
  return { success: true }
}

export async function getRegisteredChildIds(serviceDate: string, timeSlot: string, classroom: string): Promise<string[]> {
  const supabase = await createClient()

  const { data: service } = await supabase
    .from("services")
    .select("id")
    .eq("service_date", serviceDate)
    .eq("time_slot", timeSlot)
    .single()

  if (!service) return []

  const { data: records, error } = await supabase
    .from("attendance")
    .select("child_id")
    .eq("service_id", service.id)
    .eq("classroom", classroom)
    .eq("is_visitor", false)

  if (error) {
    console.error("[getRegisteredChildIds] Erro ao buscar presenças registradas:", error.message, "| Código:", error.code)
  }

  return (records ?? []).map((r) => r.child_id).filter(Boolean) as string[]
}

export async function getAttendanceByMonth(year: number, month: number) {
  const supabase = await createClient()

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`

  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id, service_date, time_slot")
    .gte("service_date", startDate)
    .lt("service_date", endDate)
    .order("service_date")

  if (servicesError) {
    console.error("[getAttendanceByMonth] Erro ao buscar cultos:", servicesError.message, "| Período:", startDate, "a", endDate)
  }

  if (!services || services.length === 0) {
    return []
  }

  const serviceIds = services.map((s) => s.id)

  const { data: attendanceRecords, error: attendanceError } = await supabase
    .from("attendance")
    .select("*, children(name)")
    .in("service_id", serviceIds)
    .order("classroom")

  if (attendanceError) {
    console.error("[getAttendanceByMonth] Erro ao buscar registros de presença:", attendanceError.message, "| Código:", attendanceError.code)
  }

  return (attendanceRecords ?? []).map((record) => {
    const service = services.find((s) => s.id === record.service_id)
    return {
      ...record,
      date: service?.service_date ?? "",
      time_slot: service?.time_slot ?? "",
      child_name: record.is_visitor
        ? record.visitor_name
        : (record.children as { name: string } | null)?.name ?? "Desconhecido",
    }
  })
}
