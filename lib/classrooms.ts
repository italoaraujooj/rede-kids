import { differenceInYears, differenceInMonths } from "date-fns"

export const CLASSROOMS = [
  { id: "maternal", label: "Maternal", minAge: 2, maxAge: 3 },
  { id: "jardim", label: "Jardim", minAge: 4, maxAge: 6 },
  { id: "primario", label: "Primário", minAge: 7, maxAge: 9 },
] as const

export function getAgeWarning(birthDate: Date | string): string | null {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate
  const today = new Date()
  const ageInYears = differenceInYears(today, birth)

  if (ageInYears < 2) return "Não há salinhas disponíveis para essa idade."
  if (ageInYears >= 10 && ageInYears <= 11) return "Essa criança deve ser integrada à Rede Jump."
  if (ageInYears > 11) return "Essa criança deve ser integrada à Rede Livre (adolescentes)."
  return null
}

export type ClassroomId = (typeof CLASSROOMS)[number]["id"]

export function getClassroomByAge(birthDate: Date | string): ClassroomId | null {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate
  const today = new Date()
  const ageInYears = differenceInYears(today, birth)

  for (const classroom of CLASSROOMS) {
    if (ageInYears >= classroom.minAge && ageInYears <= classroom.maxAge) {
      return classroom.id
    }
  }
  return null
}

export function getClassroomLabel(classroomId: string): string {
  return CLASSROOMS.find((c) => c.id === classroomId)?.label ?? classroomId
}

export function getAge(birthDate: Date | string): string {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate
  const today = new Date()
  const years = differenceInYears(today, birth)
  if (years < 1) {
    const months = differenceInMonths(today, birth)
    return `${months} ${months === 1 ? "mes" : "meses"}`
  }
  return `${years} ${years === 1 ? "ano" : "anos"}`
}

export function formatTimeSlot(timeSlot: string): string {
  if (timeSlot === "morning") return "Manhã (10h)"
  if (timeSlot === "evening") return "Noite (18h)"
  return timeSlot
}

export const RELATIONSHIPS = ["Pai", "Mãe", "Avô", "Avó", "Tio(a)", "Responsável legal", "Outro"]

export function applyPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ""
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return phone
}
