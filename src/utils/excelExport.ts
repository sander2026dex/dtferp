/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Custo, Venda, Produto, Cliente, Fornecedor } from '../types';

/**
 * Helper to format a cell value for CSV (Brazilian local: semicolon delimiter, comma decimal).
 */
function formatCell(cell: any): string {
  if (cell === null || cell === undefined) return '';
  let str = String(cell);
  
  if (typeof cell === 'number') {
    str = cell.toFixed(2).replace('.', ',');
  }
  
  // If cell is a boolean
  if (typeof cell === 'boolean') {
    str = cell ? 'Sim' : 'Não';
  }

  // Escape semicolons and double quotes
  if (str.includes(';') || str.includes('\n') || str.includes('"')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Downloads a single CSV file optimized for Excel (PT-BR) and Google Planilhas.
 */
export function exportSingleCSV(filename: string, headers: string[], rows: any[][]) {
  const BOM = '\uFEFF'; // UTF-8 BOM to fix accents in Excel
  const csvContent = BOM + [
    headers.map(formatCell).join(';'),
    ...rows.map(row => row.map(formatCell).join(';'))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports all data into a single consolidated, highly compatible CSV spreadsheet
 * separating each tab by a beautiful visual section header.
 */
export function exportAllToCSV(
  custos: Custo[],
  vendas: Venda[],
  produtos: Produto[],
  clientes: Cliente[],
  fornecedores: Fornecedor[]
) {
  const BOM = '\uFEFF';
  let csvContent = '';

  const addSection = (title: string, headers: string[], rows: any[][]) => {
    let section = '';
    section += `=== ${title.toUpperCase()} ===;;;;;;;\r\n`;
    section += headers.map(formatCell).join(';') + '\r\n';
    rows.forEach(row => {
      section += row.map(formatCell).join(';') + '\r\n';
    });
    section += ';;;;;;;\r\n'; // Spacer row
    section += ';;;;;;;\r\n'; // Spacer row
    return section;
  };

  // 1. CUSTOS
  csvContent += addSection(
    '💸 CONTROLE DE CUSTOS',
    ['Data', 'Categoria', 'Descrição', 'Valor (R$)'],
    custos.map(c => [c.data, c.categoria, c.descricao, c.valor])
  );

  // 2. VENDAS
  csvContent += addSection(
    '💰 CONTROLE DE VENDAS',
    ['Data', 'Cliente', 'Produto', 'Quantidade', 'Valor Unitário (R$)', 'Valor Total (R$)', 'Status'],
    vendas.map(v => [v.data, v.cliente, v.produto, v.quantidade, v.valorUnitario, v.quantidade * v.valorUnitario, v.status])
  );

  // 3. PRODUTOS
  csvContent += addSection(
    '📦 CATÁLOGO DE PRODUTOS',
    ['Nome', 'Custo Unitário (R$)', 'Preço de Venda (R$)', 'Lucro Unitário (R$)', 'Margem de Lucro (%)', 'Tempo de Produção (min)'],
    produtos.map(p => {
      const lucro = p.precoVenda - p.custoUnitario;
      const margem = p.precoVenda > 0 ? (lucro / p.precoVenda) * 100 : 0;
      return [p.nome, p.custoUnitario, p.precoVenda, lucro, `${margem.toFixed(2)}%`, p.tempoProducao];
    })
  );

  // 4. CLIENTES
  csvContent += addSection(
    '👥 CADASTRO DE CLIENTES',
    ['Nome', 'Telefone', 'E-mail', 'Tipo (PF/PJ)'],
    clientes.map(cl => [cl.nome, cl.telefone, cl.email, cl.tipo])
  );

  // 5. FORNECEDORES
  csvContent += addSection(
    '🏭 CADASTRO DE FORNECEDORES',
    ['Nome', 'Telefone', 'E-mail', 'CNPJ', 'Produtos Fornecidos'],
    fornecedores.map(f => [f.nome, f.telefone, f.email, f.cnpj, f.produtosFornecidos])
  );

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Planilha_Gestao_DTF_Textil.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
