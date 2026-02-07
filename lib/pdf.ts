import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatTimeSlot, CLASSROOMS, getClassroomLabel } from "@/lib/classrooms"

function formatClassroomWithAge(classroomId: string): string {
  const classroom = CLASSROOMS.find((c) => c.id === classroomId)
  if (!classroom) return classroomId
  return `${classroom.label} (${classroom.minAge}-${classroom.maxAge} anos)`
}

export function generateChildrenPDF(
  children: Array<{
    name: string
    birth_date: string
    guardian_name: string
    guardian_relationship: string
    phone: string
    classroom: string
  }>,
  classroomLabel: string
) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text("Rede Kids - Crianças Cadastradas", 14, 22)
  doc.setFontSize(12)
  doc.text(`Sala: ${classroomLabel}`, 14, 32)
  doc.text(`Data: ${format(new Date(), "dd/MM/yyyy")}`, 14, 40)

  autoTable(doc, {
    startY: 48,
    head: [["Nome", "Nascimento", "Idade", "Responsavel", "Telefone"]],
    body: children.map((c) => {
      const birth = new Date(c.birth_date)
      const ageYears = Math.floor(
        (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      )
      return [
        c.name,
        format(new Date(c.birth_date + "T12:00:00"), "dd/MM/yyyy"),
        `${ageYears} anos`,
        `${c.guardian_name} (${c.guardian_relationship})`,
        c.phone,
      ]
    }),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [26, 153, 136] },
  })

  doc.save(`criancas-${classroomLabel.toLowerCase()}-${format(new Date(), "yyyy-MM-dd")}.pdf`)
}

export function generateServantsPDF(
  servants: Array<{
    name: string
    phone: string | null
  }>
) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text("Rede Kids - Servos Cadastrados", 14, 22)
  doc.text(`Data: ${format(new Date(), "dd/MM/yyyy")}`, 14, 32)

  autoTable(doc, {
    startY: 40,
    head: [["Nome", "Telefone"]],
    body: servants.map((s) => [s.name, s.phone ?? "-"]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [26, 153, 136] },
  })

  doc.save(`servos-${format(new Date(), "yyyy-MM-dd")}.pdf`)
}

export function generateAttendancePDF(
  records: Array<{
    date: string
    time_slot: string
    child_name: string
    classroom: string
    is_visitor: boolean
  }>,
  monthLabel: string
) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text("Rede Kids - Lista de Presença", 14, 22)
  doc.setFontSize(12)
  doc.text(`Mês: ${monthLabel}`, 14, 32)

  // Totalizadores por sala
  const countByClassroom: Record<string, number> = {}
  for (const r of records) {
    countByClassroom[r.classroom] = (countByClassroom[r.classroom] || 0) + 1
  }

  let summaryY = 40
  doc.setFontSize(10)
  for (const c of CLASSROOMS) {
    const count = countByClassroom[c.id] || 0
    doc.text(`${c.label} (${c.minAge}-${c.maxAge} anos): ${count} presença(s)`, 14, summaryY)
    summaryY += 6
  }

  // Visitantes e salas desconhecidas
  const knownIds = new Set(CLASSROOMS.map((c) => c.id))
  const otherCount = Object.entries(countByClassroom)
    .filter(([id]) => !knownIds.has(id))
    .reduce((sum, [, count]) => sum + count, 0)
  if (otherCount > 0) {
    doc.text(`Outras: ${otherCount} presença(s)`, 14, summaryY)
    summaryY += 6
  }

  doc.setFont(undefined as unknown as string, "bold")
  doc.text(`Total: ${records.length} presença(s)`, 14, summaryY)
  doc.setFont(undefined as unknown as string, "normal")
  summaryY += 8

  // Agrupar por data -> turno -> sala
  const grouped: Record<string, Record<string, Record<string, typeof records>>> = {}
  for (const r of records) {
    if (!grouped[r.date]) grouped[r.date] = {}
    if (!grouped[r.date][r.time_slot]) grouped[r.date][r.time_slot] = {}
    if (!grouped[r.date][r.time_slot][r.classroom]) grouped[r.date][r.time_slot][r.classroom] = []
    grouped[r.date][r.time_slot][r.classroom].push(r)
  }

  const sortedDates = Object.keys(grouped).sort()
  let currentY = summaryY

  for (const date of sortedDates) {
    const formattedDate = format(new Date(date + "T12:00:00"), "dd/MM/yyyy")
    const timeSlots = grouped[date]
    const sortedSlots = Object.keys(timeSlots).sort((a, b) => {
      const order: Record<string, number> = { morning: 0, evening: 1 }
      return (order[a] ?? 2) - (order[b] ?? 2)
    })

    for (const slot of sortedSlots) {
      const classrooms = timeSlots[slot]
      const sortedClassrooms = Object.keys(classrooms).sort((a, b) => {
        const idxA = CLASSROOMS.findIndex((c) => c.id === a)
        const idxB = CLASSROOMS.findIndex((c) => c.id === b)
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB)
      })

      for (const classroom of sortedClassrooms) {
        const classroomRecords = classrooms[classroom]

        // Checar se precisa de nova página
        if (currentY > 250) {
          doc.addPage()
          currentY = 20
        }

        // Cabeçalho do grupo
        doc.setFontSize(11)
        doc.setFont(undefined as unknown as string, "bold")
        doc.text(`${formattedDate}  |  ${formatTimeSlot(slot)}  |  ${formatClassroomWithAge(classroom)}`, 14, currentY)
        doc.setFont(undefined as unknown as string, "normal")
        currentY += 2

        autoTable(doc, {
          startY: currentY,
          head: [["#", "Nome", "Tipo"]],
          body: classroomRecords.map((r, i) => [
            String(i + 1),
            r.child_name,
            r.is_visitor ? "Visitante" : "Membro",
          ]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [26, 153, 136] },
          margin: { left: 14 },
        })

        currentY = ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? currentY) + 8
      }
    }
  }

  doc.save(`presenca-${monthLabel.toLowerCase().replace(/\s/g, "-")}.pdf`)
}
