import { createClient } from "@/lib/supabase/server"
import { HomePage } from "./home-client"

export default async function HomePageServer() {
  const supabase = await createClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: childrenCount },
    { count: servantsCount },
    { count: attendanceThisMonth },
    { data: recentChildren },
    { data: todayAttendance },
  ] = await Promise.all([
    supabase
      .from("children")
      .select("*", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("servants")
      .select("*", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("attendance")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthStart),
    supabase
      .from("children")
      .select("name, created_at")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("attendance")
      .select("id")
      .gte("created_at", new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString())
      .lt("created_at", new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()),
  ])

  return (
    <HomePage
      stats={{
        children: childrenCount ?? 0,
        servants: servantsCount ?? 0,
        attendanceThisMonth: attendanceThisMonth ?? 0,
        todayAttendance: todayAttendance?.length ?? 0,
      }}
      recentChildren={recentChildren ?? []}
    />
  )
}
