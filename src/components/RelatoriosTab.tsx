/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Download, RefreshCw, FileText, Upload, Database, CheckCircle, Info, BarChart2, PieChart as PieIcon, Layers, Users } from 'lucide-react';
import { Custo, Venda, Produto, Cliente, Fornecedor } from '../types';
import { exportAllToCSV, exportSingleCSV } from '../utils/excelExport';

interface RelatoriosTabProps {
  custos: Custo[];
  vendas: Venda[];
  produtos: Produto[];
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  onResetToDefaults: () => void;
  onImportBackup: (data: { custos: Custo[]; vendas: Venda[]; produtos: Produto[]; clientes: Cliente[]; fornecedores?: Fornecedor[] }) => void;
}

export default function RelatoriosTab({
  custos,
  vendas,
  produtos,
  clientes,
  fornecedores,
  onResetToDefaults,
  onImportBackup,
}: RelatoriosTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculations
  const receitaTotal = vendas
    .filter(v => v.status === 'Concluído')
    .reduce((acc, curr) => acc + (curr.quantidade * curr.valorUnitario), 0);

  const custoTotal = custos.reduce((acc, curr) => acc + curr.valor, 0);
  const lucroTotal = receitaTotal - custoTotal;
  const margemLucro = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0;
  const totalPedidos = vendas.filter(v => v.status === 'Concluído').length;
  const ticketMedio = totalPedidos > 0 ? receitaTotal / totalPedidos : 0;

  // Format Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // 1. Data Prep: Revenue vs Cost by Month
  const getMonthYear = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Outros';
      // Returns e.g., "Jan/24"
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${monthNames[date.getUTCMonth()]}/${date.getUTCFullYear().toString().slice(-2)}`;
    } catch {
      return 'Outros';
    }
  };

  const monthlyMap: { [key: string]: { mes: string; receita: number; custo: number } } = {};

  // Group revenues
  vendas.filter(v => v.status === 'Concluído').forEach(v => {
    const month = getMonthYear(v.data);
    if (!monthlyMap[month]) monthlyMap[month] = { mes: month, receita: 0, custo: 0 };
    monthlyMap[month].receita += v.quantidade * v.valorUnitario;
  });

  // Group costs
  custos.forEach(c => {
    const month = getMonthYear(c.data);
    if (!monthlyMap[month]) monthlyMap[month] = { mes: month, receita: 0, custo: 0 };
    monthlyMap[month].custo += c.valor;
  });

  const monthlyData = Object.values(monthlyMap).sort((a, b) => {
    // Sort logic helper (chronological)
    const [monthA, yearA] = a.mes.split('/');
    const [monthB, yearB] = b.mes.split('/');
    const yearDiff = parseInt(yearA) - parseInt(yearB);
    if (yearDiff !== 0) return yearDiff;
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months.indexOf(monthA) - months.indexOf(monthB);
  });

  // 2. Data Prep: Costs by Category
  const categoryMap: { [key: string]: number } = {};
  custos.forEach(c => {
    categoryMap[c.categoria] = (categoryMap[c.categoria] || 0) + c.valor;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // 3. Data Prep: Sales volume by Product
  const productMap: { [key: string]: number } = {};
  vendas.filter(v => v.status === 'Concluído').forEach(v => {
    productMap[v.produto] = (productMap[v.produto] || 0) + v.quantidade;
  });
  const productSalesData = Object.entries(productMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 4. Data Prep: Customer Segments
  const pfCount = clientes.filter(c => c.tipo === 'PF').length;
  const pjCount = clientes.filter(c => c.tipo === 'PJ').length;
  const clientSegmentData = [
    { name: 'Pessoa Física (PF)', value: pfCount },
    { name: 'Pessoa Jurídica (PJ)', value: pjCount }
  ];

  // Palette colors for charts
  const COLORS_PRIMARY = ['#6366f1', '#10b981', '#f43f5e', '#a855f7', '#f59e0b', '#0ea5e9'];
  const COLORS_CUSTOS = ['#f43f5e', '#fda4af', '#fecdd3', '#ffe4e6', '#fb7185', '#e11d48'];
  const COLORS_CLIENTS = ['#0ea5e9', '#6366f1'];

  // Handle Backup File Upload
  const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.custos && json.vendas && json.produtos && json.clientes) {
          onImportBackup(json);
          alert('Backup importado com sucesso!');
        } else {
          alert('Formato de backup inválido.');
        }
      } catch {
        alert('Erro ao processar arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Export current active state to JSON
  const handleExportJSON = () => {
    const backup = { custos, vendas, produtos, clientes, fornecedores };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup_dtf_textil.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8" id="relatorios-tab-container">
      {/* Upper Actions Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="relatorios-action-banner">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            📊 Central de Relatórios e Exportação
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Gere visualizações de desempenho e controle operacional. Exporte todos os dados consolidados em formatos editáveis ou salve backups de segurança.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportAllToCSV(custos, vendas, produtos, clientes, fornecedores)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 transition-all rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-600/10 cursor-pointer flex items-center gap-2"
            id="download-excel-btn"
            title="Exporta um arquivo CSV com codificação UTF-8 e delimitador ponto e vírgula, compatível diretamente com Excel (PT-BR) e Google Planilhas"
          >
            <Download className="w-4 h-4" /> Exportar Planilha (Excel / Google Planilhas)
          </button>
          
          <button
            onClick={handleExportJSON}
            className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all rounded-xl text-xs font-bold border border-slate-200 cursor-pointer flex items-center gap-2"
            id="export-json-btn"
          >
            <Database className="w-4 h-4" /> Exportar Backup JSON
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all rounded-xl text-xs font-bold border border-slate-200 cursor-pointer flex items-center gap-2"
            id="import-backup-btn"
          >
            <Upload className="w-4 h-4" /> Importar Backup
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBackupUpload}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => {
              if (confirm('Tem certeza de que deseja restaurar as tabelas para os valores originais do modelo? Quaisquer lançamentos personalizados serão apagados.')) {
                onResetToDefaults();
              }
            }}
            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all rounded-xl text-xs font-bold border border-rose-200 cursor-pointer flex items-center gap-2"
            id="reset-template-btn"
          >
            <RefreshCw className="w-4 h-4" /> Restaurar Modelo Original
          </button>
        </div>
      </div>

      {/* Financial Resumo */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4" id="relatorios-statement-wrapper">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" /> Demonstrativo de Resultados Simplificado
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" id="statement-table">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold tracking-wider uppercase text-left border-b border-slate-100">
                <th className="py-3 px-5">Indicador de Caixa</th>
                <th className="py-3 px-5 text-right">Valor Atualizado (R$)</th>
                <th className="py-3 px-5">Nota Explicativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr>
                <td className="py-4 px-5 font-semibold text-slate-800">Receita Operacional Bruta</td>
                <td className="py-4 px-5 text-right font-mono font-bold text-emerald-600">{formatCurrency(receitaTotal)}</td>
                <td className="py-4 px-5 text-slate-500 text-xs">Total acumulado de faturamento de pedidos marcados como "Concluído".</td>
              </tr>
              <tr>
                <td className="py-4 px-5 font-semibold text-slate-800">(-) Custos Operacionais de Produção</td>
                <td className="py-4 px-5 text-right font-mono font-bold text-rose-500">{formatCurrency(custoTotal)}</td>
                <td className="py-4 px-5 text-slate-500 text-xs">Soma de insumos, energia, manutenção e outras saídas declaradas.</td>
              </tr>
              <tr className="bg-indigo-50/25">
                <td className="py-4 px-5 font-bold text-slate-900">(=) Lucro Líquido do Exercício</td>
                <td className="py-4 px-5 text-right font-mono font-bold text-indigo-600">{formatCurrency(lucroTotal)}</td>
                <td className="py-4 px-5 text-slate-700 text-xs font-medium">Resultado líquido de lucro livre de despesas diretas.</td>
              </tr>
              <tr>
                <td className="py-4 px-5 font-semibold text-slate-800">Margem Líquida Real (%)</td>
                <td className="py-4 px-5 text-right font-mono font-bold text-slate-800">{margemLucro.toFixed(2).replace('.', ',')}%</td>
                <td className="py-4 px-5 text-slate-500 text-xs">Percentual de cada Real faturado que sobra como lucro líquido.</td>
              </tr>
              <tr>
                <td className="py-4 px-5 font-semibold text-slate-800">Ticket Médio por Venda</td>
                <td className="py-4 px-5 text-right font-mono font-bold text-slate-800">{formatCurrency(ticketMedio)}</td>
                <td className="py-4 px-5 text-slate-500 text-xs">Faturamento médio obtido em cada venda realizada.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analytics - Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="relatorios-charts-grid">
        
        {/* Chart 1: Revenue vs Cost by Month */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4" id="chart-panel-revenue">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-800 font-display">Receita vs Custos Mensais</h4>
          </div>
          {monthlyData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar name="Receita" dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar name="Custo" dataKey="custo" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400">Nenhum dado mensal disponível</div>
          )}
        </div>

        {/* Chart 2: Expenses by Category */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4" id="chart-panel-costs">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-rose-500" />
            <h4 className="text-sm font-bold text-slate-800 font-display">Distribuição dos Custos</h4>
          </div>
          {categoryData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_CUSTOS[index % COLORS_CUSTOS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400">Nenhuma despesa para exibir</div>
          )}
        </div>

        {/* Chart 3: Product Sales Volumes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4" id="chart-panel-products">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-800 font-display">Quantidade Vendida por Produto</h4>
          </div>
          {productSalesData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productSalesData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar name="Volume Vendido" dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400">Nenhum produto vendido</div>
          )}
        </div>

        {/* Chart 4: Customers Segmentation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4" id="chart-panel-clients">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-500" />
            <h4 className="text-sm font-bold text-slate-800 font-display">Segmentação de Clientes</h4>
          </div>
          {pfCount > 0 || pjCount > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientSegmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {clientSegmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_CLIENTS[index % COLORS_CLIENTS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-xs text-slate-400">Sem clientes para classificar</div>
          )}
        </div>

      </div>
    </div>
  );
}
