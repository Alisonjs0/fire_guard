export interface Unidade {
  _id: string;
  nome: string;
  descricao?: string;
  responsavel?: string;
  ativo: boolean;
  creator: string;
  createdAt: string;
  updatedAt: string;
}

export interface Extintor {
  _id: string;
  numeroIdentificacao: string;
  unidadeId: string;
  localizacao: string;
  tipoAgente: "po_abc" | "co2" | "agua" | "espuma" | "po_quimico";
  classeIncendio: "A" | "B" | "C" | "AB" | "BC" | "ABC";
  capacidade: string;
  dataFabricacao: string;
  dataValidade: string;
  fabricante: string;
  status: "conforme" | "nao_conforme" | "vencido" | "manutencao";
  qrCode?: string;
  codigoBarras?: string;
  observacoes?: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
}

export interface Checklist {
  manometro: boolean;
  rotulo: boolean;
  lacre: boolean;
  sinalizacao: boolean;
  danos: boolean;
  obstrucoes: boolean;
  fixacao: boolean;
  validade: boolean;
}

export interface Inspecao {
  _id: string;
  extintorId: string;
  inspetorId: string;
  dataInspecao: string;
  resultado: "conforme" | "nao_conforme";
  checklist: Checklist;
  observacoes?: string;
  fotos?: string[];
  proximaInspecao?: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
}

export interface Manutencao {
  _id: string;
  extintorId: string;
  tipo: "preventiva" | "corretiva" | "recarga" | "teste_hidrostatico";
  status: "agendada" | "em_andamento" | "concluida" | "cancelada";
  dataAgendada: string;
  dataRealizada?: string;
  tecnicoResponsavel: string;
  empresaManutencao: string;
  descricaoServico: string;
  custo?: number;
  observacoes?: string;
  anexos?: string[];
  creator: string;
  createdAt: string;
  updatedAt: string;
}

export interface Usuario {
  _id: string;
  nome: string;
  email: string;
  perfil: "administrador" | "tecnico" | "estagiario_tecnico";
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalExtintores: number
  extintoresConformes: number
  extintoresVencidos: number
  inspecoesMes: number
  manutencoesPendentes: number
}
