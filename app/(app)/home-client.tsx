"use client"

import Link from "next/link"
import { Baby, Users, ClipboardCheck, CalendarDays } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface HomePageProps {
  stats: {
    children: number
    servants: number
    attendanceThisMonth: number
    todayAttendance: number
  }
  recentChildren: Array<{ name: string; created_at: string }>
}

const statCards = [
  { key: "children", label: "Crianças", icon: Baby, href: "/criancas", color: "text-primary" },
  { key: "servants", label: "Servos", icon: Users, href: "/servos", color: "text-blue-500" },
  { key: "attendanceThisMonth", label: "Presenças no mês", icon: ClipboardCheck, href: "/presenca", color: "text-amber-500" },
  { key: "todayAttendance", label: "Presenças hoje", icon: CalendarDays, href: "/presenca", color: "text-green-500" },
] as const

export function HomePage({ stats, recentChildren }: HomePageProps) {
  return (
    <>
      <PageHeader
        title="Rede Kids"
        description="Departamento Infantil"
      />

      <div className="flex flex-col gap-4 px-4">
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((card) => (
            <Link key={card.key} href={card.href}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex flex-col gap-2 p-4">
                  <card.icon className={`h-5 w-5 ${card.color}`} aria-hidden="true" />
                  <span className="text-2xl font-bold text-foreground">
                    {stats[card.key]}
                  </span>
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {recentChildren.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 text-sm font-semibold text-foreground">Cadastros recentes</h2>
              <div className="flex flex-col gap-2">
                {recentChildren.map((child, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{child.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(child.created_at), "dd/MM", { locale: ptBR })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
