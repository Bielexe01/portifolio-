export interface NavSection {
  id: string
  label: string
  code: string
  title: string
}

export const sections: readonly NavSection[] = [
  { id: 'perfil', label: 'Perfil', code: '01', title: 'SYSTEM PROFILE' },
  { id: 'projetos', label: 'Projetos', code: '02', title: 'SELECTED PROJECTS' },
  { id: 'processo', label: 'Processo', code: '03', title: 'ENGINEERING MINDSET' },
  { id: 'stack', label: 'Stack', code: '04', title: 'TECH STACK' },
  { id: 'contato', label: 'Contato', code: '05', title: 'THE NEXT BUILD' },
]

export const observedSectionIds: readonly string[] = ['inicio', ...sections.map((section) => section.id)]

export function sectionMeta(id: string): NavSection {
  const found = sections.find((section) => section.id === id)
  if (!found) throw new Error(`Seção desconhecida: ${id}`)
  return found
}
