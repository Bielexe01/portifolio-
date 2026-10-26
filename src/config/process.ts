export interface ProcessStep {
  code: string
  title: string
  text: string
  tags: string[]
}

export const processSteps: ProcessStep[] = [
  {
    code: '01',
    title: 'Entender o problema.',
    text: 'Antes da primeira linha de código: quem usa, o que trava e o que precisa mudar primeiro.',
    tags: ['contexto', 'usuários', 'objetivo'],
  },
  {
    code: '02',
    title: 'Projetar a solução.',
    text: 'Fluxos, telas e regras desenhados antes de construir. Decidir o caminho custa menos que refazer.',
    tags: ['fluxos', 'wireframe', 'regras'],
  },
  {
    code: '03',
    title: 'Desenvolver a arquitetura.',
    text: 'Dados, API e regras de negócio organizados para o sistema crescer sem quebrar.',
    tags: ['API', 'banco', 'modelo de dados'],
  },
  {
    code: '04',
    title: 'Construir a interface.',
    text: 'Componentes reutilizáveis, responsivos e acessíveis. É onde a experiência acontece.',
    tags: ['componentes', 'responsivo', 'acessível'],
  },
  {
    code: '05',
    title: 'Integrar e testar.',
    text: 'Interface, servidor, banco e serviços conversando. O fluxo inteiro é testado antes de ir para o ar.',
    tags: ['integração', 'testes', 'ajustes'],
  },
  {
    code: '06',
    title: 'Entregar um produto funcional.',
    text: 'No ar, funcionando e pronto para evoluir.',
    tags: ['build', 'deploy', 'evolução'],
  },
]
