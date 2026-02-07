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
    return { error: "Selecione pelo menos uma criança" }
  }

  const service = await getOrCreateService(supabase, serviceDate, timeSlot)
  if (!service) {
    return { error: "Erro ao criar culto" }
  }

  // Check for existing attendance records to avoid duplicates
  const { data: existing } = await supabase
    .from("attendance")
    .select("child_id")
    .eq("service_id", service.id)
    .eq("classroom", classroom)
    .in("child_id", childIds)

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
    return { error: "Nome e data de nascimento são obrigatórios" }
  }

  const classroom = getClassroomByAge(visitorBirthDate)
  if (!classroom) {
    return { error: "Idade fora da faixa do departamento infantil" }
  }

  const service = await getOrCreateService(supabase, serviceDate, timeSlot)
  if (!service) {
    return { error: "Erro ao criar culto" }
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
    return { error: "Erro ao registrar visitante" }
  }

  revalidatePath("/presenca")
  return { success: true }
}

export async function removeAttendance(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("attendance").delete().eq("id", id)

  if (error) {
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

  const { data: records } = await supabase
    .from("attendance")
    .select("child_id")
    .eq("service_id", service.id)
    .eq("classroom", classroom)
    .eq("is_visitor", false)

  return (records ?? []).map((r) => r.child_id).filter(Boolean) as string[]
}

export async function getAttendanceByMonth(year: number, month: number) {
  const supabase = await createClient()

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`
  const endMonth = month === 12 ? 1 : month + 1
  const endYear = month === 12 ? year + 1 : year
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`

  const { data: services } = await supabase
    .from("services")
    .select("id, service_date, time_slot")
    .gte("service_date", startDate)
    .lt("service_date", endDate)
    .order("service_date")

  if (!services || services.length === 0) {
    return []
  }

  const serviceIds = services.map((s) => s.id)

  const { data: attendanceRecords } = await supabase
    .from("attendance")
    .select("*, children(name)")
    .in("service_id", serviceIds)
    .order("classroom")

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
