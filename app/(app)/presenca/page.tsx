import { createClient } from "@/lib/supabase/server"
import { PresencaPageClient } from "./client"

export default async function PresencaPage() {
  const supabase = await createClient()

  const { data: children } = await supabase
    .from("children")
    .select("id, name, birth_date")
    .eq("active", true)
    .order("name")

  const { data: servants } = await supabase
    .from("servants")
    .select("id, name")
    .eq("active", true)
    .order("name")

  return <PresencaPageClient children={children ?? []} servants={servants ?? []} />
}
