import { createClient } from "@/lib/supabase/server"
import { ServosPageClient } from "./client"

export default async function ServosPage() {
  const supabase = await createClient()

  const { data: servants } = await supabase
    .from("servants")
    .select("*")
    .eq("active", true)
    .order("name")

  return <ServosPageClient servants={servants ?? []} />
}
