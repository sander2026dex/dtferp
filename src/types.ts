/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Custo {
  id: string;
  data: string;
  categoria: string;
  descricao: string;
  valor: number;
}

export interface Venda {
  id: string;
  data: string;
  cliente: string;
  produto: string;
  quantidade: number;
  valorUnitario: number;
  status: 'Concluído' | 'Pendente';
}

export interface Produto {
  id: string;
  nome: string;
  custoUnitario: number;
  precoVenda: number;
  tempoProducao: number; // in minutes
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  tipo: 'PF' | 'PJ';
}

export interface Fornecedor {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cnpj: string;
  produtosFornecidos: string;
}

export type TabType = 'dashboard' | 'custos' | 'vendas' | 'produtos' | 'clientes' | 'fornecedores' | 'orcamentos' | 'relatorios' | 'admin';
