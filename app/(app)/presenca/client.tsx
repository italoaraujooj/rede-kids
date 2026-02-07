"use client"

import { useState, useTransition, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { UserPlus, ClipboardCheck, FileDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { CLASSROOMS, getClassroomByAge, getClassroomLabel } from "@/lib/classrooms"
import { registerAttendance, registerVisitor, getAttendanceByMonth, getRegisteredChildIds } from "./actions"
import { generateAttendancePDF } from "@/lib/pdf"
import { toast } from "sonner"

interface Child {
  id: string
  name: string
  birth_date: string
}

interface PresencaPageClientProps {
  children: Child[]
  servants: { id: string; name: string }[]
}

export function PresencaPageClient({ children, servants }: PresencaPageClientProps) {
  const [isPending, startTransition] = useTransition()
  const [showVisitorForm, setShowVisitorForm] = useState(false)
  const [selectedClassroom, setSelectedClassroom] = useState<string>("")
  const [selectedChildren, setSelectedChildren] = useState<Set<string>>(new Set())
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set())
  const [reportMonth, setReportMonth] = useState(format(new Date(), "yyyy-MM"))

  // Get current or next Sunday
  const today = new Date()
  const daysUntilSunday = (7 - today.getDay()) % 7 || 7
  const nextSunday = new Date(today)
  nextSunday.setDate(today.getDate() + (today.getDay() === 0 ? 0 : daysUntilSunday))

  const [serviceDate, setServiceDate] = useState(format(nextSunday, "yyyy-MM-dd"))
  const [timeSlotOption, setTimeSlotOption] = useState<string>("morning")
  const [customTimeSlot, setCustomTimeSlot] = useState("")
  const timeSlot = timeSlotOption === "custom" ? customTimeSlot : timeSlotOption

  // Filter children by selected classroom
  const classroomChildren = selectedClassroom
    ? children.filter((c) => getClassroomByAge(c.birth_date) === selectedClassroom)
    : []

  // Children available (not yet registered)
  const availableChildren = classroomChildren.filter((c) => !registeredIds.has(c.id))
  const registeredCount = classroomChildren.length - availableChildren.length

  const fetchRegistered = useCallback(async () => {
    if (!selectedClassroom || !serviceDate || !timeSlot) {
      setRegisteredIds(new Set())
      return
    }
    const ids = await getRegisteredChildIds(serviceDate, timeSlot, selectedClassroom)
    setRegisteredIds(new Set(ids))
  }, [selectedClassroom, serviceDate, timeSlot])

  useEffect(() => {
    fetchRegistered()
  }, [fetchRegistered])

  function toggleChild(childId: string) {
    setSelectedChildren((prev) => {
      const next = new Set(prev)
      if (next.has(childId)) {
        next.delete(childId)
      } else {
        next.add(childId)
      }
      return next
    })
  }

  function selectAll() {
    if (selectedChildren.size === availableChildren.length) {
      setSelectedChildren(new Set())
    } else {
      setSelectedChildren(new Set(availableChildren.map((c) => c.id)))
    }
  }

  function handleRegisterAttendance() {
    if (!timeSlot.trim()) {
      toast.error("Informe o horário do culto")
      return
    }
    if (!selectedClassroom || selectedChildren.size === 0) {
      toast.error("Selecione uma sala e pelo menos uma criança")
      return
    }

    const formData = new FormData()
    formData.set("service_date", serviceDate)
    formData.set("time_slot", timeSlot)
    formData.set("classroom", selectedClassroom)
    selectedChildren.forEach((id) => formData.append("child_ids", id))

    startTransition(async () => {
      const result = await registerAttendance(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${result.count} presença(s) registrada(s)!`)
        setSelectedChildren(new Set())
        await fetchRegistered()
      }
    })
  }

  function handleRegisterVisitor(formData: FormData) {
    formData.set("service_date", serviceDate)
    formData.set("time_slot", timeSlot)

    startTransition(async () => {
      const result = await registerVisitor(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Visitante registrado!")
        setShowVisitorForm(false)
      }
    })
  }

  async function handleExportPDF() {
    const [year, month] = reportMonth.split("-").map(Number)
    startTransition(async () => {
      const records = await getAttendanceByMonth(year, month)
      if (records.length === 0) {
        toast.error("Nenhum registro encontrado neste mês")
        return
      }
      const monthLabel = format(new Date(year, month - 1), "MMMM yyyy", { locale: ptBR })
      generateAttendancePDF(records, monthLabel)
    })
  }

  return (
    <>
      <PageHeader title="Presença" description="Registro de presença do culto" />

      <div className="flex flex-col gap-4 px-4">
        {/* Service selector */}
        <Card>
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Data</Label>
                <Input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => { setServiceDate(e.target.value); setSelectedChildren(new Set()) }}
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Horário</Label>
                <Select value={timeSlotOption} onValueChange={(v) => { setTimeSlotOption(v); setSelectedChildren(new Set()) }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Manhã (10h)</SelectItem>
                    <SelectItem value="evening">Noite (18h)</SelectItem>
                    <SelectItem value="custom">Outro horário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {timeSlotOption === "custom" && (
              <Input
                placeholder="Ex: Sábado 15h - Evento Especial"
                value={customTimeSlot}
                onChange={(e) => { setCustomTimeSlot(e.target.value); setSelectedChildren(new Set()) }}
              />
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="attendance">Registrar</TabsTrigger>
            <TabsTrigger value="report">Relatório</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="flex flex-col gap-4">
            {/* Classroom selector */}
            <Select value={selectedClassroom} onValueChange={(v) => { setSelectedClassroom(v); setSelectedChildren(new Set()) }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a sala" />
              </SelectTrigger>
              <SelectContent>
                {CLASSROOMS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label} ({c.minAge}-{c.maxAge} anos)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedClassroom && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground">
                      {availableChildren.length} criança(s) pendente(s)
                    </p>
                    {registeredCount > 0 && (
                      <p className="text-xs text-primary">
                        {registeredCount} já registrada(s) neste culto
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowVisitorForm(true)}>
                      <UserPlus className="mr-1 h-4 w-4" />
                      Visitante
                    </Button>
                    {availableChildren.length > 0 && (
                      <Button variant="outline" size="sm" onClick={selectAll}>
                        <Check className="mr-1 h-4 w-4" />
                        {selectedChildren.size === availableChildren.length ? "Desmarcar" : "Todos"}
                      </Button>
                    )}
                  </div>
                </div>

                {availableChildren.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {registeredCount > 0
                      ? "Todas as crianças desta sala já foram registradas neste culto"
                      : "Nenhuma criança nesta sala"}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {availableChildren.map((child) => (
                      <Card
                        key={child.id}
                        className={`cursor-pointer transition-colors ${
                          selectedChildren.has(child.id)
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                        onClick={() => toggleChild(child.id)}
                      >
                        <CardContent className="flex items-center gap-3 p-3">
                          <Checkbox
                            checked={selectedChildren.has(child.id)}
                            onCheckedChange={() => toggleChild(child.id)}
                            aria-label={`Marcar presença de ${child.name}`}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{child.name}</p>
                          </div>
                          {selectedChildren.has(child.id) && (
                            <Badge className="bg-primary text-primary-foreground">Presente</Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {selectedChildren.size > 0 && (
                  <Button
                    onClick={handleRegisterAttendance}
                    disabled={isPending}
                    className="sticky bottom-20"
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    {isPending
                      ? "Registrando..."
                      : `Registrar ${selectedChildren.size} presença(s)`}
                  </Button>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="report" className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Relatório Mensal</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  <Label>Mês</Label>
                  <Input
                    type="month"
                    value={reportMonth}
                    onChange={(e) => setReportMonth(e.target.value)}
                  />
                </div>
                <Button onClick={handleExportPDF} disabled={isPending} variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  {isPending ? "Gerando..." : "Gerar PDF"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Visitor form */}
      <Sheet open={showVisitorForm} onOpenChange={setShowVisitorForm}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Registrar Visitante</SheetTitle>
          </SheetHeader>
          <form action={handleRegisterVisitor} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="visitor_name">Nome da criança</Label>
              <Input id="visitor_name" name="visitor_name" placeholder="Nome completo" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="visitor_birth_date">Data de nascimento</Label>
              <Input id="visitor_birth_date" name="visitor_birth_date" type="date" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="visitor_guardian_name">Nome do responsável</Label>
              <Input id="visitor_guardian_name" name="visitor_guardian_name" placeholder="Nome do responsável" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="visitor_phone">Telefone</Label>
              <Input id="visitor_phone" name="visitor_phone" type="tel" placeholder="(00) 00000-0000" />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Registrando..." : "Registrar Visitante"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
