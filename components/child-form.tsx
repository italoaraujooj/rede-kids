"use client"

import { useState, useTransition } from "react"
import { AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { createChild, updateChild } from "@/app/(app)/criancas/actions"
import { getAgeWarning, getClassroomByAge, getClassroomLabel } from "@/lib/classrooms"

interface ChildFormProps {
  child?: {
    id: string
    name: string
    birth_date: string
    guardian_name: string
    guardian_relationship: string
    phone: string
  }
  onSuccess?: () => void
}

const relationships = ["Pai", "Mãe", "Avô", "Avó", "Tio(a)", "Responsável legal", "Outro"]

function applyPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ""
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function ChildForm({ child, onSuccess }: ChildFormProps) {
  const [isPending, startTransition] = useTransition()
  const [birthDate, setBirthDate] = useState(child?.birth_date ?? "")

  const isCustomRelationship = child?.guardian_relationship && !relationships.includes(child.guardian_relationship)
  const [selectedRelationship, setSelectedRelationship] = useState(
    isCustomRelationship ? "Outro" : (child?.guardian_relationship ?? "")
  )
  const [customRelationship, setCustomRelationship] = useState(
    isCustomRelationship ? child.guardian_relationship : ""
  )
  const [phone, setPhone] = useState(child?.phone ? applyPhoneMask(child.phone) : "")

  const finalRelationship = selectedRelationship === "Outro" ? customRelationship : selectedRelationship

  const ageWarning = birthDate ? getAgeWarning(birthDate) : null
  const classroom = birthDate ? getClassroomByAge(birthDate) : null
  const hasValidAge = birthDate && !ageWarning

  async function handleSubmit(formData: FormData) {
    if (ageWarning) {
      toast.error(ageWarning)
      return
    }

    if (finalRelationship) {
      formData.set("guardian_relationship", finalRelationship)
    }
    formData.set("phone", phone.replace(/\D/g, ""))

    startTransition(async () => {
      const result = child
        ? await updateChild(child.id, formData)
        : await createChild(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(child ? "Criança atualizada!" : "Criança cadastrada!")
        onSuccess?.()
      }
    })
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome da criança</Label>
        <Input
          id="name"
          name="name"
          placeholder="Nome completo"
          defaultValue={child?.name}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="birth_date">Data de nascimento</Label>
        <Input
          id="birth_date"
          name="birth_date"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          required
        />
        {ageWarning && (
          <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{ageWarning}</span>
          </div>
        )}
        {hasValidAge && classroom && (
          <div className="flex items-center gap-2 rounded-md bg-primary/10 p-3 text-sm text-primary">
            <Info className="h-4 w-4 shrink-0" />
            <span>Sala: {getClassroomLabel(classroom)}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="guardian_name">Nome do responsável</Label>
        <Input
          id="guardian_name"
          name="guardian_name"
          placeholder="Nome do responsável"
          defaultValue={child?.guardian_name}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="guardian_relationship">Parentesco</Label>
        <Select value={selectedRelationship} onValueChange={(v) => { setSelectedRelationship(v); if (v !== "Outro") setCustomRelationship("") }}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o parentesco" />
          </SelectTrigger>
          <SelectContent>
            {relationships.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedRelationship === "Outro" && (
          <Input
            placeholder="Digite o parentesco"
            value={customRelationship}
            onChange={(e) => setCustomRelationship(e.target.value)}
            required
          />
        )}
        <input type="hidden" name="guardian_relationship" value={finalRelationship} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(00) 00000-0000"
          value={phone}
          onChange={(e) => setPhone(applyPhoneMask(e.target.value))}
          required
        />
      </div>

      <Button type="submit" disabled={isPending || !!ageWarning} className="mt-2">
        {isPending ? "Salvando..." : child ? "Atualizar" : "Cadastrar"}
      </Button>
    </form>
  )
}
