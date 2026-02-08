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
    console.warn("[createChild] Campos obrigatórios ausentes:", { name: !!name, birthDate: !!birthDate, guardianName: !!guardianName, guardianRelationship: !!guardianRelationship, phone: !!phone })
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
    console.error("[createChild] Erro ao inserir no Supabase:", error.message, "| Código:", error.code, "| Detalhes:", error.details)
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
    console.warn("[updateChild] Campos obrigatórios ausentes para id:", id)
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
    console.error("[updateChild] Erro ao atualizar no Supabase (id:", id, "):", error.message, "| Código:", error.code, "| Detalhes:", error.details)
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
    console.error("[deactivateChild] Erro ao desativar no Supabase (id:", id, "):", error.message, "| Código:", error.code, "| Detalhes:", error.details)
    return { error: "Erro ao remover criança" }
  }

  revalidatePath("/criancas")
  return { success: true }
}
