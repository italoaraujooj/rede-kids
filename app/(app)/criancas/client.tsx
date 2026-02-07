"use client"

import { useState } from "react"
import { Plus, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/page-header"
import { ChildrenList } from "@/components/children-list"
import { ChildForm } from "@/components/child-form"
import { CLASSROOMS, getClassroomByAge, getClassroomLabel } from "@/lib/classrooms"
import { generateChildrenPDF } from "@/lib/pdf"

interface Child {
  id: string
  name: string
  birth_date: string
  guardian_name: string
  guardian_relationship: string
  phone: string
}

export function ChildrenPageClient({ children }: { children: Child[] }) {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState("all")

  const filteredChildren =
    filter === "all"
      ? children
      : children.filter((c) => getClassroomByAge(c.birth_date) === filter)

  function handleExportPDF() {
    const label = filter === "all" ? "Todas as salas" : getClassroomLabel(filter)
    const exportChildren = filteredChildren.map((c) => ({
      ...c,
      classroom: getClassroomLabel(getClassroomByAge(c.birth_date) ?? ""),
    }))
    generateChildrenPDF(exportChildren, label)
  }

  return (
    <>
      <PageHeader
        title="Crianças"
        description={`${filteredChildren.length} cadastradas`}
        action={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Nova
          </Button>
        }
      />

      <div className="flex items-center gap-2 px-4 pb-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Filtrar por sala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as salas</SelectItem>
            {CLASSROOMS.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label} ({c.minAge}-{c.maxAge} anos)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={handleExportPDF} aria-label="Exportar PDF">
          <FileDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-4">
        <ChildrenList children={filteredChildren} />
      </div>

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Cadastrar Criança</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <ChildForm onSuccess={() => setShowForm(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
