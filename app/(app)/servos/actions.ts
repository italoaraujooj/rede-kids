"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createServant(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const phone = formData.get("phone") as string

  if (!name) {
    return { error: "Nome é obrigatório" }
  }

  const { error } = await supabase.from("servants").insert({
    name: name.trim(),
    phone: phone?.trim() || null,
  })

  if (error) {
    return { error: "Erro ao cadastrar servo" }
  }

  revalidatePath("/servos")
  return { success: true }
}

export async function updateServant(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const phone = formData.get("phone") as string

  if (!name) {
    return { error: "Nome é obrigatório" }
  }

  const { error } = await supabase
    .from("servants")
    .update({
      name: name.trim(),
      phone: phone?.trim() || null,
    })
    .eq("id", id)

  if (error) {
    return { error: "Erro ao atualizar servo" }
  }

  revalidatePath("/servos")
  return { success: true }
}

export async function deactivateServant(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("servants")
    .update({ active: false })
    .eq("id", id)

  if (error) {
    return { error: "Erro ao remover servo" }
  }

  revalidatePath("/servos")
  return { success: true }
}

export async function assignServantToService(formData: FormData) {
  const supabase = await createClient()

  const serviceDate = formData.get("service_date") as string
  const timeSlot = formData.get("time_slot") as string
  const servantId = formData.get("servant_id") as string
  const role = formData.get("role") as string
  const classroom = formData.get("classroom") as string

  if (!serviceDate || !timeSlot || !servantId || !role || !classroom) {
    return { error: "Todos os campos são obrigatórios" }
  }

  // Get or create the service
  let { data: service } = await supabase
    .from("services")
    .select("id")
    .eq("service_date", serviceDate)
    .eq("time_slot", timeSlot)
    .single()

  if (!service) {
    const { data: newService, error: serviceError } = await supabase
      .from("services")
      .insert({ service_date: serviceDate, time_slot: timeSlot })
      .select("id")
      .single()

    if (serviceError || !newService) {
      return { error: "Erro ao criar culto" }
    }
    service = newService
  }

  const { error } = await supabase.from("service_servants").insert({
    service_id: service.id,
    servant_id: servantId,
    role,
    classroom,
  })

  if (error) {
    return { error: "Erro ao escalar servo" }
  }

  revalidatePath("/servos")
  return { success: true }
}

export async function removeServantFromService(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("service_servants").delete().eq("id", id)

  if (error) {
    return { error: "Erro ao remover escalação" }
  }

  revalidatePath("/servos")
  return { success: true }
}
