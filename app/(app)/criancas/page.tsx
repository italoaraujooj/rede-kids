import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/page-header"
import { ChildrenList } from "@/components/children-list"
import { ChildrenPageClient } from "./client"

export default async function CriancasPage() {
  const supabase = await createClient()

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("active", true)
    .order("name")

  return (
    <div>
      <ChildrenPageClient children={children ?? []} />
    </div>
  )
}
