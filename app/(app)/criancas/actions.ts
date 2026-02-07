"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createChild(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const birthDate = formData.get("birth_date") as string
  const guardianName = formData.get("guardian_name") as string
  const guardianRelationship = formData.get("guardian_relationship") as string
  const phone = formData.get("phone") as string

  if (!name || !birthDate || !guardianName || !guardianRelationship || !phone) {
    return { error: "Todos os campos são obrigatórios" }
  }

  const { error } = await supabase.from("children").insert({
    name: name.trim(),
    birth_date: birthDate,
    guardian_name: guardianName.trim(),
    guardian_relationship: guardianRelationship.trim(),
    phone: phone.trim(),
  })

  if (error) {
    return { error: "Erro ao cadastrar criança" }
  }

  revalidatePath("/criancas")
  return { success: true }
}

export async function updateChild(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name") as string
  const birthDate = formData.get("birth_date") as string
  const guardianName = formData.get("guardian_name") as string
  const guardianRelationship = formData.get("guardian_relationship") as string
  const phone = formData.get("phone") as string

  if (!name || !birthDate || !guardianName || !guardianRelationship || !phone) {
    return { error: "Todos os campos são obrigatórios" }
  }

  const { error } = await supabase
    .from("children")
    .update({
      name: name.trim(),
      birth_date: birthDate,
      guardian_name: guardianName.trim(),
      guardian_relationship: guardianRelationship.trim(),
      phone: phone.trim(),
    })
    .eq("id", id)

  if (error) {
    return { error: "Erro ao atualizar criança" }
  }

  revalidatePath("/criancas")
  return { success: true }
}

export async function deactivateChild(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("children")
    .update({ active: false })
    .eq("id", id)

  if (error) {
    return { error: "Erro ao remover criança" }
  }

  revalidatePath("/criancas")
  return { success: true }
}
