/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  User, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Mail, 
  Printer, 
  Percent, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  ShoppingBag,
  FileCheck2,
  DollarSign
} from 'lucide-react';
import { Cliente, Produto } from '../types';
import { UserAccount } from '../utils/db';

interface OrcamentosTabProps {
  clientes: Cliente[];
  produtos: Produto[];
  currentUser?: UserAccount | null;
}

interface QuoteItem {
  id: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
}

export default function OrcamentosTab({ clientes, produtos, currentUser }: OrcamentosTabProps) {
  const formatLogoUrl = (url?: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.includes('drive.google.com')) {
      const matchId = trimmed.match(/\/file\/d\/([a-zA-Z0-9-_]+)/) || trimmed.match(/id=([a-zA-Z0-9-_]+)/);
      if (matchId && matchId[1]) {
        return `https://docs.google.com/uc?export=view&id=${matchId[1]}`;
      }
    }
    return trimmed;
  };
  // State for Customer selection
  const [selectedClienteId, setSelectedClienteId] = useState<string>('');
  const [customCliente, setCustomCliente] = useState({
    nome: '',
    telefone: '',
    email: '',
  });

  // Items added to the quotation
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  
  // Custom item state
  const [selectedProdutoId, setSelectedProdutoId] = useState<string>('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<string>('');
  
  // Custom manual item input
  const [isManualProduct, setIsManualProduct] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');

  // Taxes
  const [icmsPercent, setIcmsPercent] = useState<number>(18);
  const [includeIcms, setIncludeIcms] = useState<boolean>(false);
  
  const [issPercent, setIssPercent] = useState<number>(5);
  const [includeIss, setIncludeIss] = useState<boolean>(false);

  const [otherTaxPercent, setOtherTaxPercent] = useState<number>(0);
  const [otherTaxName, setOtherTaxName] = useState<string>('IPI');
  const [includeOtherTax, setIncludeOtherTax] = useState<boolean>(false);

  // Notes
  const [notes, setNotes] = useState<string>('Orçamento válido por 10 dias. Frete a combinar. Prazo de entrega de 5 a 7 dias úteis após aprovação da arte.');
  const [includeNotes, setIncludeNotes] = useState<boolean>(true);

  // Helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Get active client info
  const getActiveClient = () => {
    if (selectedClienteId === 'custom') {
      return customCliente;
    }
    const found = clientes.find(c => c.id === selectedClienteId);
    return found ? { nome: found.nome, telefone: found.telefone, email: found.email } : null;
  };

  // Handle adding an item to the quote
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    let nome = '';
    let valorUnitario = 0;

    if (isManualProduct) {
      if (!manualName || !manualPrice) return;
      nome = manualName;
      valorUnitario = parseFloat(manualPrice.replace(',', '.'));
    } else {
      const prod = produtos.find(p => p.id === selectedProdutoId);
      if (!prod) return;
      nome = prod.nome;
      valorUnitario = customPrice ? parseFloat(customPrice.replace(',', '.')) : prod.precoVenda;
    }

    if (isNaN(valorUnitario) || valorUnitario <= 0 || itemQuantity <= 0) return;

    const newItem: QuoteItem = {
      id: `item_${Date.now()}`,
      nome,
      quantidade: itemQuantity,
      valorUnitario
    };

    setQuoteItems(prev => [...prev, newItem]);
    
    // Reset inputs
    setSelectedProdutoId('');
    setItemQuantity(1);
    setCustomPrice('');
    setManualName('');
    setManualPrice('');
  };

  // Handle product select change
  const handleProductSelect = (id: string) => {
    setSelectedProdutoId(id);
    const prod = produtos.find(p => p.id === id);
    if (prod) {
      setCustomPrice(prod.precoVenda.toString());
    } else {
      setCustomPrice('');
    }
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setQuoteItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculations
  const subtotal = quoteItems.reduce((acc, curr) => acc + (curr.quantidade * curr.valorUnitario), 0);
  
  const icmsValue = includeIcms ? subtotal * (icmsPercent / 100) : 0;
  const issValue = includeIss ? subtotal * (issPercent / 100) : 0;
  const otherTaxValue = includeOtherTax ? subtotal * (otherTaxPercent / 100) : 0;
  
  const totalTaxes = icmsValue + issValue + otherTaxValue;
  const grandTotal = subtotal + totalTaxes;

  // Generate WhatsApp Message Block
  const generateWhatsAppContent = () => {
    const client = getActiveClient();
    const clientHeader = client ? `*Cliente:* ${client.nome}\n` : '';
    
    let text = `*📄 ORÇAMENTO - DTF TÊXTIL*\n`;
    text += `=========================\n`;
    if (clientHeader) text += clientHeader;
    text += `*Data:* ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    
    text += `*🛍️ DETALHES DO PEDIDO:*\n`;
    quoteItems.forEach((item, index) => {
      text += `${index + 1}. _${item.nome}_ - ${item.quantidade}x de ${formatCurrency(item.valorUnitario)} (Subtotal: ${formatCurrency(item.quantidade * item.valorUnitario)})\n`;
    });
    text += `\n`;
    
    text += `*Subtotal:* ${formatCurrency(subtotal)}\n`;
    
    if (includeIcms) text += `*ICMS (${icmsPercent}%):* ${formatCurrency(icmsValue)}\n`;
    if (includeIss) text += `*ISS (${issPercent}%):* ${formatCurrency(issValue)}\n`;
    if (includeOtherTax) text += `*${otherTaxName} (${otherTaxPercent}%):* ${formatCurrency(otherTaxValue)}\n`;
    
    text += `*💰 TOTAL DO ORÇAMENTO:* ${formatCurrency(grandTotal)}\n`;
    text += `=========================\n`;
    
    if (includeNotes && notes) {
      text += `\n*📝 NOTAS:*\n${notes}\n`;
    }
    
    return encodeURIComponent(text);
  };

  // Generate Email Content
  const generateEmailContent = () => {
    const client = getActiveClient();
    const subject = `Orçamento DTF Têxtil - ${new Date().toLocaleDateString('pt-BR')}`;
    
    let body = `Olá, ${client ? client.nome : 'Cliente'}.\n\nSegue o orçamento detalhado solicitado:\n\n`;
    
    body += `🛍️ ITENS DO ORÇAMENTO:\n`;
    quoteItems.forEach((item, index) => {
      body += `- ${item.nome}: ${item.quantidade}x de ${formatCurrency(item.valorUnitario)} = ${formatCurrency(item.quantidade * item.valorUnitario)}\n`;
    });
    body += `\n`;
    
    body += `Subtotal: ${formatCurrency(subtotal)}\n`;
    if (includeIcms) body += `ICMS (${icmsPercent}%): ${formatCurrency(icmsValue)}\n`;
    if (includeIss) body += `ISS (${issPercent}%): ${formatCurrency(issValue)}\n`;
    if (includeOtherTax) body += `${otherTaxName} (${otherTaxPercent}%): ${formatCurrency(otherTaxValue)}\n`;
    
    body += `\nVALOR TOTAL: ${formatCurrency(grandTotal)}\n\n`;
    
    if (includeNotes && notes) {
      body += `📝 OBSERVAÇÕES:\n${notes}\n\n`;
    }
    
    body += `Agradecemos a preferência!\nDTF Têxtil - Gestão de Alta Performance`;
    
    return `mailto:${client?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Open WhatsApp Link
  const handleSendWhatsApp = () => {
    const client = getActiveClient();
    const phone = client ? client.telefone.replace(/\D/g, '') : '';
    const textUrl = generateWhatsAppContent();
    const phoneParam = phone ? `phone=55${phone}&` : '';
    window.open(`https://api.whatsapp.com/send?${phoneParam}text=${textUrl}`, '_blank');
  };

  // Open Email Link
  const handleSendEmail = () => {
    window.open(generateEmailContent(), '_blank');
  };

  // Download beautifully styled self-printing HTML file that acts as a pixel-perfect PDF export
  const handleDownloadPDF = () => {
    const client = getActiveClient();
    const dateStr = new Date().toLocaleDateString('pt-BR');
    const validStr = new Date(Date.now() + 10 * 24 * 60 * 60 * 1050).toLocaleDateString('pt-BR');

    let itemsHtml = '';
    quoteItems.forEach(item => {
      itemsHtml += `
        <tr>
          <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${item.nome}</td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; font-family: monospace;">${item.quantidade}</td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">${formatCurrency(item.valorUnitario)}</td>
          <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold;">${formatCurrency(item.quantidade * item.valorUnitario)}</td>
        </tr>
      `;
    });

    let taxesHtml = '';
    if (includeIcms) {
      taxesHtml += `<div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #64748b;">
        <span>ICMS (${icmsPercent}%):</span>
        <span style="font-family: monospace;">${formatCurrency(icmsValue)}</span>
      </div>`;
    }
    if (includeIss) {
      taxesHtml += `<div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #64748b;">
        <span>ISS (${issPercent}%):</span>
        <span style="font-family: monospace;">${formatCurrency(issValue)}</span>
      </div>`;
    }
    if (includeOtherTax) {
      taxesHtml += `<div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #64748b;">
        <span>${otherTaxName} (${otherTaxPercent}%):</span>
        <span style="font-family: monospace;">${formatCurrency(otherTaxValue)}</span>
      </div>`;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Orçamento DTF Têxtil</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 40px;
      -webkit-print-color-adjust: exact;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .logo-area h1 {
      font-size: 24px;
      font-weight: 800;
      margin: 0;
      color: #0f172a;
      letter-spacing: -0.05em;
    }
    .logo-area p {
      font-size: 11px;
      font-weight: bold;
      color: #4f46e5;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin: 4px 0 0 0;
    }
    .company-details {
      font-size: 10px;
      color: #64748b;
      margin-top: 10px;
      line-height: 1.4;
    }
    .invoice-info {
      text-align: right;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background-color: #eef2ff;
      color: #4338ca;
      font-size: 10px;
      font-weight: 800;
      border-radius: 9999px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .info-row {
      font-size: 12px;
      color: #475569;
      margin: 4px 0;
    }
    .info-row strong {
      color: #0f172a;
    }
    .client-card {
      background-color: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 30px;
    }
    .client-title {
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 6px;
    }
    .client-name {
      font-size: 14px;
      font-weight: bold;
      color: #0f172a;
      margin: 0 0 8px 0;
    }
    .client-contacts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      font-size: 11px;
      color: #64748b;
    }
    .table-title {
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      border-bottom: 2px solid #cbd5e1;
      padding: 10px 8px;
      text-align: left;
    }
    .summary-area {
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      margin-bottom: 30px;
    }
    .summary-box {
      width: 300px;
      font-size: 12px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      border-top: 2px solid #0f172a;
      padding-top: 12px;
      margin-top: 12px;
    }
    .notes-card {
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
    }
    .notes-title {
      font-size: 10px;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 6px;
    }
    .notes-content {
      font-size: 11px;
      color: #64748b;
      background-color: #f8fafc;
      border: 1px solid #f1f5f9;
      padding: 12px;
      border-radius: 8px;
      line-height: 1.5;
      font-style: italic;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-area">
        <h1>SISTEMA DTF TÊXTIL</h1>
        <p>Estamparia de Alta Definição</p>
        <div class="company-details">
          <div>CNPJ: 12.345.678/0001-99</div>
          <div>Contato: contato@dtftextil.com.br</div>
        </div>
      </div>
      <div class="invoice-info">
        <div class="badge">Documento de Orçamento</div>
        <div class="info-row">Data de Emissão: <strong>${dateStr}</strong></div>
        <div class="info-row">Válido até: <strong>${validStr}</strong></div>
      </div>
    </div>

    ${client ? `
    <div class="client-card">
      <div class="client-title">DESTINATÁRIO / CLIENTE</div>
      <div class="client-name">${client.nome}</div>
      <div class="client-contacts">
        <div>WhatsApp: ${client.telefone || '-'}</div>
        <div>E-mail: ${client.email || '-'}</div>
      </div>
    </div>
    ` : ''}

    <div class="table-title">Detalhamento dos Itens</div>
    <table>
      <thead>
        <tr>
          <th>Item / Descrição</th>
          <th style="text-align: center; width: 60px;">Qtd</th>
          <th style="text-align: right; width: 120px;">Vlr Unitário</th>
          <th style="text-align: right; width: 140px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="summary-area">
      <div class="summary-box">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #64748b;">
          <span>Subtotal:</span>
          <span style="font-family: monospace; font-weight: bold;">${formatCurrency(subtotal)}</span>
        </div>
        
        ${taxesHtml}

        <div class="total-row">
          <span>VALOR TOTAL:</span>
          <span style="font-family: monospace; color: #4f46e5; font-size: 16px;">${formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>

    ${includeNotes && notes ? `
    <div class="notes-card">
      <div class="notes-title">Observações e Termos</div>
      <div class="notes-content">${notes}</div>
    </div>
    ` : ''}
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Orcamento_DTF_${client ? client.nome.replace(/\\s+/g, '_') : 'Avulso'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print fallback trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="orcamento-tab-container">
      {/* Upper Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6" id="orcamentos-action-banner">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            📄 Gerador e Emissor de Orçamentos
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Simule faturamentos rápidos, inclua tributações municipais ou estaduais e gere faturamento personalizado com envio direto para o cliente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="orcamento-grid-stage">
        
        {/* Left Side: Builder Controls */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6 print:hidden" id="builder-controls-panel">
          
          {/* STEP 1: Client Selection */}
          <div className="space-y-3" id="orc-step-1">
            <h4 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">1</span>
              Dados do Cliente
            </h4>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-600 block">Vincular Cliente Registrado</label>
              <select
                value={selectedClienteId}
                onChange={(e) => setSelectedClienteId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              >
                <option value="">-- Cliente Avulso (Não cadastrado) --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} ({c.tipo})</option>
                ))}
                <option value="custom">-- Digitar Dados Manualmente --</option>
              </select>

              {selectedClienteId === 'custom' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pt-2 pl-3 border-l-2 border-indigo-200"
                >
                  <input
                    type="text"
                    placeholder="Nome do Cliente"
                    value={customCliente.nome}
                    onChange={(e) => setCustomCliente({ ...customCliente, nome: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Telefone (WhatsApp)"
                      value={customCliente.telefone}
                      onChange={(e) => setCustomCliente({ ...customCliente, telefone: e.target.value })}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                    <input
                      type="email"
                      placeholder="E-mail"
                      value={customCliente.email}
                      onChange={(e) => setCustomCliente({ ...customCliente, email: e.target.value })}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* STEP 2: Add Items */}
          <div className="space-y-3" id="orc-step-2">
            <h4 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">2</span>
              Adicionar Itens / Produtos
            </h4>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsManualProduct(false)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    !isManualProduct 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' 
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  Catálogo
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualProduct(true)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isManualProduct 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' 
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  Lançamento Avulso
                </button>
              </div>

              {!isManualProduct ? (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-600 block">Produto do Catálogo</label>
                  <select
                    value={selectedProdutoId}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                  >
                    <option value="">-- Escolha um Produto --</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>{p.nome} (Venda: {formatCurrency(p.precoVenda)})</option>
                    ))}
                  </select>

                  {selectedProdutoId && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 block">Ajustar Preço Unitário (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: 22,50"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 block">Nome do Item Personalizado</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sacola Ecológica de Algodão"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 block">Valor Unitário (R$)</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 35,00"
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 items-end">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 block">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>
            </form>
          </div>

          {/* STEP 3: Taxes */}
          <div className="space-y-3" id="orc-step-3">
            <h4 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">3</span>
              Impostos e Alíquotas
            </h4>

            <div className="space-y-4 pt-1">
              {/* ICMS Toggle & Percent */}
              <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 block">Incidência de ICMS</span>
                  <span className="text-[10px] text-slate-400 block">Estadual sobre circulação</span>
                </div>
                <div className="flex items-center gap-2">
                  {includeIcms && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={icmsPercent}
                        onChange={(e) => setIcmsPercent(parseFloat(e.target.value) || 0)}
                        className="w-12 px-1.5 py-1 text-right bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  )}
                  <input
                    type="checkbox"
                    checked={includeIcms}
                    onChange={(e) => setIncludeIcms(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* ISS Toggle & Percent */}
              <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 block">Incidência de ISS</span>
                  <span className="text-[10px] text-slate-400 block">Municipal sobre serviços</span>
                </div>
                <div className="flex items-center gap-2">
                  {includeIss && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={issPercent}
                        onChange={(e) => setIssPercent(parseFloat(e.target.value) || 0)}
                        className="w-12 px-1.5 py-1 text-right bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  )}
                  <input
                    type="checkbox"
                    checked={includeIss}
                    onChange={(e) => setIncludeIss(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Other Custom Tax */}
              <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="space-y-0.5 flex-1 pr-2">
                  <input
                    type="text"
                    value={otherTaxName}
                    onChange={(e) => setOtherTaxName(e.target.value)}
                    placeholder="Outro (Ex: IPI)"
                    className="text-xs font-bold text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 outline-none w-24 block"
                  />
                  <span className="text-[10px] text-slate-400 block">Encargo adicional</span>
                </div>
                <div className="flex items-center gap-2">
                  {includeOtherTax && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={otherTaxPercent}
                        onChange={(e) => setOtherTaxPercent(parseFloat(e.target.value) || 0)}
                        className="w-12 px-1.5 py-1 text-right bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                  )}
                  <input
                    type="checkbox"
                    checked={includeOtherTax}
                    onChange={(e) => setIncludeOtherTax(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: Notes */}
          <div className="space-y-3" id="orc-step-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-800 font-display flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 text-xs flex items-center justify-center font-bold">4</span>
                Notas e Observações
              </h4>
              <input
                type="checkbox"
                checked={includeNotes}
                onChange={(e) => setIncludeNotes(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                title="Exibir observações no documento final"
              />
            </div>

            {includeNotes && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Insira as observações do orçamento (prazo, validade, entrega...)"
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-slate-850"
              />
            )}
          </div>

        </div>

        {/* Right Side: Invoice Preview Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden flex flex-col print:border-none print:shadow-none" id="invoice-preview-panel">
          
          {/* Real-time PDF / Paper View Frame */}
          <div className="p-8 bg-white flex-1 space-y-6 text-slate-800 print:p-0 font-sans" id="invoice-paper-view">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200/85">
              <div className="flex items-start gap-3">
                {currentUser?.empresaLogo && (
                  <div className="bg-slate-50 p-1 rounded-lg border border-slate-200/60 shrink-0">
                    <img 
                      src={formatLogoUrl(currentUser.empresaLogo)} 
                      alt="Logo Empresa" 
                      referrerPolicy="no-referrer"
                      className="h-12 w-auto max-w-[120px] object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">
                    {currentUser?.empresaNome || 'SISTEMA DTF TÊXTIL'}
                  </h3>
                  <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">
                    {currentUser?.empresaNome ? 'Estamparia Personalizada' : 'Estamparia de Alta Definição'}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-2 font-mono">
                    <p>CNPJ: {currentUser?.empresaCnpj || '12.345.678/0001-99'}</p>
                    <p>Contato: {currentUser?.email || 'contato@dtftextil.com.br'}</p>
                  </div>
                </div>
              </div>

              <div className="text-right sm:text-right">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider mb-2">
                  Documento de Orçamento
                </span>
                <p className="text-xs text-slate-500 font-medium">Data de Emissão: <strong className="text-slate-800 font-bold">{new Date().toLocaleDateString('pt-BR')}</strong></p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Válido até: <strong className="text-slate-800 font-bold">{new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}</strong></p>
              </div>
            </div>

            {/* Client Info Block */}
            {getActiveClient() ? (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">DESTINATÁRIO / CLIENTE</span>
                <p className="text-sm font-bold text-slate-900">{getActiveClient()?.nome}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 font-mono pt-1">
                  <p>WhatsApp: <span className="text-slate-700">{getActiveClient()?.telefone || '-'}</span></p>
                  <p>E-mail: <span className="text-slate-700">{getActiveClient()?.email || '-'}</span></p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3 text-amber-800 text-xs print:hidden">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p>Nenhum cliente selecionado. O orçamento será emitido como "Cliente Avulso".</p>
              </div>
            )}

            {/* Items Table */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Detalhamento dos Itens</span>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-left text-[11px] text-slate-400 font-extrabold uppercase">
                      <th className="py-2.5">Item / Descrição</th>
                      <th className="py-2.5 text-center w-16">Qtd</th>
                      <th className="py-2.5 text-right w-28">Vlr Unitário</th>
                      <th className="py-2.5 text-right w-32">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {quoteItems.length > 0 ? (
                      quoteItems.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 font-semibold text-slate-850">{item.nome}</td>
                          <td className="py-3 text-center font-mono font-bold text-slate-600">{item.quantidade}</td>
                          <td className="py-3 text-right font-mono text-slate-600">{formatCurrency(item.valorUnitario)}</td>
                          <td className="py-3 text-right font-mono font-bold text-slate-800">
                            {formatCurrency(item.quantidade * item.valorUnitario)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-slate-400 text-xs italic">
                          Nenhum produto ou serviço adicionado ao orçamento. Use os controles do painel esquerdo.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary / Total Calculations */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <div className="w-full sm:w-80 space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-slate-800">{formatCurrency(subtotal)}</span>
                </div>

                {includeIcms && (
                  <div className="flex justify-between items-center text-slate-500">
                    <span>ICMS ({icmsPercent}%):</span>
                    <span className="font-mono">{formatCurrency(icmsValue)}</span>
                  </div>
                )}

                {includeIss && (
                  <div className="flex justify-between items-center text-slate-500">
                    <span>ISS ({issPercent}%):</span>
                    <span className="font-mono">{formatCurrency(issValue)}</span>
                  </div>
                )}

                {includeOtherTax && (
                  <div className="flex justify-between items-center text-slate-500">
                    <span>{otherTaxName} ({otherTaxPercent}%):</span>
                    <span className="font-mono">{formatCurrency(otherTaxValue)}</span>
                  </div>
                )}

                {totalTaxes > 0 && (
                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-dashed border-slate-100">
                    <span>Total de Impostos Incidentes:</span>
                    <span className="font-mono">{formatCurrency(totalTaxes)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span className="uppercase text-[11px] tracking-wider text-slate-500">VALOR TOTAL:</span>
                  <span className="font-mono text-lg text-indigo-700">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Notes Section (Optional) */}
            {includeNotes && notes && (
              <div className="pt-4 border-t border-slate-100 space-y-1.5" id="preview-notes-block">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Observações e Termos</span>
                <div className="text-xs text-slate-500 whitespace-pre-wrap bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed italic">
                  {notes}
                </div>
              </div>
            )}

          </div>

          {/* Action Footer for sending */}
          <div className="bg-slate-50 px-6 py-5 border-t border-slate-200/55 flex flex-col sm:flex-row gap-3 justify-between items-center print:hidden" id="delivery-actions-bar">
            <span className="text-xs font-semibold text-slate-500">Opções de Transmissão / Entrega:</span>
            
            <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
              <button
                disabled={quoteItems.length === 0}
                onClick={handleSendWhatsApp}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                id="send-whatsapp-btn"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Formatado
              </button>

              <button
                disabled={quoteItems.length === 0}
                onClick={handleSendEmail}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
                id="send-email-btn"
              >
                <Mail className="w-4 h-4" /> Enviar por E-mail
              </button>

              <button
                disabled={quoteItems.length === 0}
                onClick={handleDownloadPDF}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/10"
                id="print-invoice-btn"
              >
                <Printer className="w-4 h-4" /> Gerar PDF / Imprimir
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
