"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createServant, updateServant } from "@/app/(app)/servos/actions"

interface ServantFormProps {
  servant?: {
    id: string
    name: string
    phone: string | null
  }
  onSuccess?: () => void
}

export function ServantForm({ servant, onSuccess }: ServantFormProps) {
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = servant
        ? await updateServant(servant.id, formData)
        : await createServant(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(servant ? "Servo atualizado!" : "Servo cadastrado!")
        onSuccess?.()
      }
    })
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          placeholder="Nome completo"
          defaultValue={servant?.name}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="(00) 00000-0000"
          defaultValue={servant?.phone ?? ""}
        />
      </div>

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "Salvando..." : servant ? "Atualizar" : "Cadastrar"}
      </Button>
    </form>
  )
}
