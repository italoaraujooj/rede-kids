"use client"

import { useState, useTransition } from "react"
import { Plus, FileDown, Pencil, Trash2, Phone, CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { PageHeader } from "@/components/page-header"
import { ServantForm } from "@/components/servant-form"
import { deactivateServant, assignServantToService } from "@/app/(app)/servos/actions"
import { CLASSROOMS } from "@/lib/classrooms"
import { formatPhone } from "@/lib/classrooms"
import { generateServantsPDF } from "@/lib/pdf"
import { toast } from "sonner"
import { format } from "date-fns"

interface Servant {
  id: string
  name: string
  phone: string | null
}

export function ServosPageClient({ servants }: { servants: Servant[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editServant, setEditServant] = useState<Servant | null>(null)
  const [showAssign, setShowAssign] = useState<Servant | null>(null)
  const [assignTimeSlotOption, setAssignTimeSlotOption] = useState("morning")
  const [assignCustomTimeSlot, setAssignCustomTimeSlot] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleDeactivate(id: string) {
    startTransition(async () => {
      const result = await deactivateServant(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Servo removido da listagem")
      }
    })
  }

  function handleAssign(formData: FormData) {
    if (showAssign) {
      formData.set("servant_id", showAssign.id)
    }
    const finalTimeSlot = assignTimeSlotOption === "custom" ? assignCustomTimeSlot : assignTimeSlotOption
    formData.set("time_slot", finalTimeSlot)
    startTransition(async () => {
      const result = await assignServantToService(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Servo escalado com sucesso!")
        setShowAssign(null)
        setAssignTimeSlotOption("morning")
        setAssignCustomTimeSlot("")
      }
    })
  }

  // Get next Sunday
  const today = new Date()
  const daysUntilSunday = (7 - today.getDay()) % 7 || 7
  const nextSunday = new Date(today)
  nextSunday.setDate(today.getDate() + (today.getDay() === 0 ? 0 : daysUntilSunday))

  return (
    <>
      <PageHeader
        title="Servos"
        description={`${servants.length} cadastrados`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => generateServantsPDF(servants)} aria-label="Exportar PDF">
              <FileDown className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Novo
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 px-4">
        {servants.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-muted-foreground">Nenhum servo cadastrado</p>
          </div>
        ) : (
          servants.map((servant) => (
            <Card key={servant.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{servant.name}</h3>
                    {servant.phone && (
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" aria-hidden="true" />
                        {formatPhone(servant.phone)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowAssign(servant)}
                      aria-label={`Escalar ${servant.name}`}
                    >
                      <CalendarPlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditServant(servant)}
                      aria-label={`Editar ${servant.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          aria-label={`Remover ${servant.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover servo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {servant.name} será removido(a) da listagem.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeactivate(servant.id)}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New servant form */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Cadastrar Servo</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <ServantForm onSuccess={() => setShowForm(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit servant form */}
      <Sheet open={!!editServant} onOpenChange={() => setEditServant(null)}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar Servo</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {editServant && (
              <ServantForm servant={editServant} onSuccess={() => setEditServant(null)} />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Assign to service */}
      <Sheet open={!!showAssign} onOpenChange={() => setShowAssign(null)}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Escalar {showAssign?.name}</SheetTitle>
          </SheetHeader>
          <form action={handleAssign} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Data do culto</Label>
              <Input
                name="service_date"
                type="date"
                defaultValue={format(nextSunday, "yyyy-MM-dd")}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Horário</Label>
              <Select value={assignTimeSlotOption} onValueChange={setAssignTimeSlotOption}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Manhã (10h)</SelectItem>
                  <SelectItem value="evening">Noite (18h)</SelectItem>
                  <SelectItem value="custom">Outro horário</SelectItem>
                </SelectContent>
              </Select>
              {assignTimeSlotOption === "custom" && (
                <Input
                  placeholder="Ex: Sábado 15h - Evento Especial"
                  value={assignCustomTimeSlot}
                  onChange={(e) => setAssignCustomTimeSlot(e.target.value)}
                  required
                />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label>Função</Label>
              <Select name="role" defaultValue="professor">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professor">Professor(a)</SelectItem>
                  <SelectItem value="auxiliar">Auxiliar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Sala</Label>
              <Select name="classroom">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a sala" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSROOMS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Escalar"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
