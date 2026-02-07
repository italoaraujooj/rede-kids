"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
import { Pencil, Trash2, Phone } from "lucide-react"
import { getAge, getClassroomByAge, getClassroomLabel, formatPhone } from "@/lib/classrooms"
import { ChildForm } from "@/components/child-form"
import { deactivateChild } from "@/app/(app)/criancas/actions"
import { toast } from "sonner"

interface Child {
  id: string
  name: string
  birth_date: string
  guardian_name: string
  guardian_relationship: string
  phone: string
}

export function ChildrenList({ children }: { children: Child[] }) {
  const [editChild, setEditChild] = useState<Child | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDeactivate(id: string) {
    startTransition(async () => {
      const result = await deactivateChild(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Criança removida da listagem")
      }
    })
  }

  if (children.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-muted-foreground">Nenhuma criança cadastrada</p>
        <p className="text-sm text-muted-foreground">
          Toque em &quot;Nova Criança&quot; para cadastrar
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {children.map((child) => {
          const classroom = getClassroomByAge(child.birth_date)
          return (
            <Card key={child.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{child.name}</h3>
                      {classroom && (
                        <Badge variant="secondary" className="text-xs">
                          {getClassroomLabel(classroom)}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {getAge(child.birth_date)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {child.guardian_name} ({child.guardian_relationship})
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" aria-hidden="true" />
                      {formatPhone(child.phone)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditChild(child)}
                      aria-label={`Editar ${child.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          aria-label={`Remover ${child.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover criança?</AlertDialogTitle>
                          <AlertDialogDescription>
                            {child.name} será removido(a) da listagem. Esta ação pode ser desfeita pelo administrador.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeactivate(child.id)}
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
          )
        })}
      </div>

      <Sheet open={!!editChild} onOpenChange={() => setEditChild(null)}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar Criança</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {editChild && (
              <ChildForm child={editChild} onSuccess={() => setEditChild(null)} />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
