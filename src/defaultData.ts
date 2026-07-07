/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Custo, Venda, Produto, Cliente, Fornecedor } from './types';

export const DEFAULT_CUSTOS: Custo[] = [
  { id: 'c1', data: '2024-01-15', categoria: 'Filme PET', descricao: 'Compra de 100m de filme PET', valor: 250.00 },
  { id: 'c2', data: '2024-01-20', categoria: 'Tinta DTF', descricao: 'Kit de tintas CMYK+W', valor: 450.00 },
  { id: 'c3', data: '2024-01-25', categoria: 'Pó Adesivo', descricao: 'Pó hot melt 1kg', valor: 180.00 },
  { id: 'c4', data: '2024-02-05', categoria: 'Energia Elétrica', descricao: 'Conta de energia janeiro', valor: 320.00 },
  { id: 'c5', data: '2024-02-10', categoria: 'Manutenção', descricao: 'Limpeza de cabeçotes', valor: 150.00 }
];

export const DEFAULT_VENDAS: Venda[] = [
  { id: 'v1', data: '2024-01-18', cliente: 'João Silva', produto: 'Estampa DTF A3', quantidade: 10, valorUnitario: 25.00, status: 'Concluído' },
  { id: 'v2', data: '2024-01-22', cliente: 'Maria Santos', produto: 'Camiseta Personalizada', quantidade: 5, valorUnitario: 45.00, status: 'Concluído' },
  { id: 'v3', data: '2024-02-01', cliente: 'Pedro Oliveira', produto: 'Estampa DTF A4', quantidade: 20, valorUnitario: 15.00, status: 'Concluído' },
  { id: 'v4', data: '2024-02-08', cliente: 'Ana Costa', produto: 'Moletom Personalizado', quantidade: 3, valorUnitario: 85.00, status: 'Pendente' },
  { id: 'v5', data: '2024-02-15', cliente: 'Carlos Lima', produto: 'Ecobag Personalizada', quantidade: 15, valorUnitario: 35.00, status: 'Concluído' }
];

export const DEFAULT_PRODUTOS: Produto[] = [
  { id: 'p1', nome: 'Estampa DTF A4', custoUnitario: 5.00, precoVenda: 15.00, tempoProducao: 10 },
  { id: 'p2', nome: 'Estampa DTF A3', custoUnitario: 8.00, precoVenda: 25.00, tempoProducao: 15 },
  { id: 'p3', nome: 'Camiseta Personalizada', custoUnitario: 25.00, precoVenda: 45.00, tempoProducao: 20 },
  { id: 'p4', nome: 'Moletom Personalizado', custoUnitario: 50.00, precoVenda: 85.00, tempoProducao: 30 },
  { id: 'p5', nome: 'Ecobag Personalizada', custoUnitario: 15.00, precoVenda: 35.00, tempoProducao: 12 }
];

export const DEFAULT_CLIENTES: Cliente[] = [
  { id: 'cl1', nome: 'João Silva', telefone: '(11) 98765-4321', email: 'joao@email.com', tipo: 'PF' },
  { id: 'cl2', nome: 'Maria Santos', telefone: '(11) 91234-5678', email: 'maria@email.com', tipo: 'PF' },
  { id: 'cl3', nome: 'Pedro Oliveira', telefone: '(21) 99876-5432', email: 'pedro@empresa.com', tipo: 'PJ' },
  { id: 'cl4', nome: 'Ana Costa', telefone: '(11) 98888-7777', email: 'ana@email.com', tipo: 'PF' },
  { id: 'cl5', nome: 'Carlos Lima', telefone: '(31) 97777-6666', email: 'carlos@empresa.com', tipo: 'PJ' }
];

export const DEFAULT_FORNECEDORES: Fornecedor[] = [
  { id: 'f1', nome: 'Suprimentos DTF Brasil', telefone: '(11) 99999-8888', email: 'vendas@dtfbrasil.com', cnpj: '12.345.678/0001-90', produtosFornecidos: 'Filme PET, Pó Adesivo' },
  { id: 'f2', nome: 'Tintas Premium Tex', telefone: '(21) 98888-2222', email: 'contato@tintaspremiumtex.com', cnpj: '98.765.432/0001-10', produtosFornecidos: 'Tintas DTF (CMYK+W)' },
  { id: 'f3', nome: 'Maquinários e Peças Alpha', telefone: '(19) 3456-7890', email: 'suporte@alphapecas.com', cnpj: '45.678.901/0001-23', produtosFornecidos: 'Manutenção, Peças de Reposição' }
];
