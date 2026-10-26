export interface Tech {
  name: string
  /** O que é, em uma linha. */
  description: string
  /** Onde entra na prática. */
  practice: string
}

export interface TechGroup {
  id: string
  /** Nome do grupo na seção Tech Stack. */
  label: string
  /** Nome do grupo na seção System Profile. */
  profileLabel: string
  /** Nome do "arquivo" exibido no editor. */
  file: string
  items: Tech[]
  /** Itens que aparecem só na Tech Stack (não viram etiqueta no perfil). */
  stackOnly?: string[]
}

export const techGroups: TechGroup[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    profileLabel: 'Frontend',
    file: 'frontend.tsx',
    items: [
      { name: 'HTML', description: 'A estrutura semântica de cada página.', practice: 'Base acessível e fácil de indexar para qualquer interface.' },
      { name: 'CSS', description: 'Layout, tipografia, cor e movimento.', practice: 'Composições responsivas que se adaptam a cada tela.' },
      { name: 'JavaScript', description: 'A lógica que roda no navegador.', practice: 'Interações, estados e comunicação com APIs.' },
      { name: 'React', description: 'Interfaces construídas em componentes.', practice: 'Telas reutilizáveis e fáceis de evoluir, como as deste portfólio.' },
      { name: 'Vite', description: 'Ambiente de desenvolvimento e build.', practice: 'Desenvolvimento rápido e arquivos otimizados para produção.' },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    profileLabel: 'Backend',
    file: 'server.ts',
    items: [
      { name: 'PHP', description: 'Linguagem de servidor para a web.', practice: 'Back-ends, formulários e regras de negócio.' },
      { name: 'Node.js', description: 'JavaScript rodando no servidor.', practice: 'APIs, scripts e automações entre serviços.' },
      { name: 'APIs', description: 'O contrato de conversa entre sistemas.', practice: 'Ligar interface, banco de dados e serviços externos.' },
    ],
  },
  {
    id: 'database',
    label: 'Banco de dados',
    profileLabel: 'Banco de dados',
    file: 'schema.sql',
    items: [
      { name: 'PostgreSQL', description: 'Banco relacional robusto e completo.', practice: 'Dados estruturados, consultas e integridade.' },
      { name: 'MySQL', description: 'Banco relacional muito usado na web.', practice: 'Persistência de dados em aplicações e sistemas comerciais.' },
      { name: 'Supabase', description: 'PostgreSQL com autenticação e API prontas.', practice: 'Back-end ágil para colocar produtos no ar mais rápido.' },
    ],
  },
  {
    id: 'languages',
    label: 'Linguagens',
    profileLabel: 'Outras experiências',
    file: 'languages.md',
    items: [
      { name: 'Java', description: 'Linguagem orientada a objetos.', practice: 'Base sólida de lógica, classes e estruturas de software.' },
      { name: 'C', description: 'Programação próxima do hardware.', practice: 'Entender memória, ponteiros e desempenho.' },
      { name: 'Delphi', description: 'Desenvolvimento de aplicações desktop.', practice: 'Sistemas comerciais, PDV e integração com bancos de dados.' },
    ],
  },
  {
    id: 'tools',
    label: 'Ferramentas e infraestrutura',
    profileLabel: 'Ferramentas',
    file: 'workflow.yml',
    items: [
      { name: 'Git', description: 'Controle de versão do código.', practice: 'Histórico, ramificações e mudanças seguras.' },
      { name: 'GitHub', description: 'Repositórios e colaboração.', practice: 'Versionar, revisar e publicar projetos.' },
      { name: 'Integração de serviços', description: 'Sistemas diferentes trabalhando juntos.', practice: 'Conectar APIs, serviços externos e dados entre aplicações.' },
      { name: 'Suporte técnico', description: 'Diagnóstico de problemas de quem usa a tecnologia.', practice: 'Entender o usuário real antes de escrever código.' },
      { name: 'Infraestrutura', description: 'O ambiente que sustenta os sistemas.', practice: 'Equipamentos, configurações e disponibilidade no dia a dia.' },
    ],
    stackOnly: ['Suporte técnico', 'Infraestrutura'],
  },
]

export function profileTags(group: TechGroup): string[] {
  return group.items.map((item) => item.name).filter((name) => !group.stackOnly?.includes(name))
}
