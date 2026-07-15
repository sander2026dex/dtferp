/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Custo, Venda, Produto, Cliente, Fornecedor } from '../types';

export interface Vendedor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  comissao: number; // percentage (e.g. 10 for 10%)
  registro: string; // registration identifier
  createdAt: number;
  senha?: string; // password for salesperson login
  status: 'Pendente' | 'Ativo' | 'Bloqueado'; // approval status
  autorizadoPor?: string; // name of user who approved
  tenantEmail?: string; // main account email it is linked to
}

export interface UserAccount {
  email: string;
  nome: string;
  celular: string;
  passwordHash: string; // Plaintext representation for simulation simplicity
  createdAt: number; // Timestamp
  serialKey?: string;
  status: 'active' | 'trial' | 'blocked' | 'expired';
  empresaNome?: string;
  empresaCnpj?: string;
  empresaLogo?: string; // URL or Google Drive link
  chavePix?: string; // Random Pix Key
}

export interface SerialKey {
  key: string;
  createdBy: string; // admin email
  createdAt: number;
  assignedTo?: string; // user email
  deviceId?: string; // physical device ID
  status: 'available' | 'active' | 'blocked';
}

export interface UserData {
  custos: Custo[];
  vendas: Venda[];
  produtos: Produto[];
  clientes: Cliente[];
  fornecedores: Fornecedor[];
  vendedores?: Vendedor[];
}

// Ensure unique browser physical device ID
export function getPhysicalDeviceId(): string {
  let devId = localStorage.getItem('dtf_physical_device_id');
  if (!devId) {
    devId = `device_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    localStorage.setItem('dtf_physical_device_id', devId);
  }
  return devId;
}

// Global Users List
export function getGlobalUsers(): UserAccount[] {
  const data = localStorage.getItem('dtf_global_users');
  if (!data) {
    // Initial dummy system user/admin
    const initial: UserAccount[] = [
      {
        email: 'xboxcarioca@gmail.com',
        nome: 'Super Admin',
        celular: '11943152441',
        passwordHash: 'admin123',
        createdAt: Date.now(),
        status: 'active'
      },
      {
        email: 'admin@dtf.com',
        nome: 'Administrador',
        celular: '11943152441',
        passwordHash: 'admin123',
        createdAt: Date.now(),
        status: 'active'
      }
    ];
    localStorage.setItem('dtf_global_users', JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

export function saveGlobalUsers(users: UserAccount[]) {
  localStorage.setItem('dtf_global_users', JSON.stringify(users));
}

// Global Serials List
export function getGlobalSerials(): SerialKey[] {
  const data = localStorage.getItem('dtf_global_serials');
  if (!data) {
    // Seed some initial serials
    const initial: SerialKey[] = [
      {
        key: 'DTF-TRIAL-KEY-1111',
        createdBy: 'admin@dtf.com',
        createdAt: Date.now(),
        status: 'available'
      },
      {
        key: 'DTF-PRO-KEY-7777',
        createdBy: 'admin@dtf.com',
        createdAt: Date.now(),
        status: 'available'
      }
    ];
    localStorage.setItem('dtf_global_serials', JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
}

export function saveGlobalSerials(serials: SerialKey[]) {
  localStorage.setItem('dtf_global_serials', JSON.stringify(serials));
}

// Generate a random key
export function generateSerialKey(creator: string): string {
  const parts = [
    'DTF',
    Math.random().toString(36).substring(2, 6).toUpperCase(),
    Math.random().toString(36).substring(2, 6).toUpperCase(),
    Math.random().toString(36).substring(2, 6).toUpperCase()
  ];
  const newKey = parts.join('-');
  const serials = getGlobalSerials();
  serials.push({
    key: newKey,
    createdBy: creator,
    createdAt: Date.now(),
    status: 'available'
  });
  saveGlobalSerials(serials);
  return newKey;
}

// User-specific tenant database storage keys
const getUserStorageKey = (email: string) => `dtf_user_db_${email.toLowerCase()}`;

export function loadUserDatabase(email: string): UserData {
  const key = getUserStorageKey(email);
  const data = localStorage.getItem(key);
  if (data) {
    const parsed = JSON.parse(data);
    return {
      custos: parsed.custos || [],
      vendas: parsed.vendas || [],
      produtos: parsed.produtos || [],
      clientes: parsed.clientes || [],
      fornecedores: parsed.fornecedores || [],
      vendedores: parsed.vendedores || []
    };
  }
  
  // Return empty structure if new user, which will get seeded with defaults if desired
  return {
    custos: [],
    vendas: [],
    produtos: [],
    clientes: [],
    fornecedores: [],
    vendedores: []
  };
}

export function saveUserDatabase(email: string, data: UserData) {
  const key = getUserStorageKey(email);
  localStorage.setItem(key, JSON.stringify(data));
}

// Global user update helper
export function updateGlobalUser(email: string, updates: Partial<UserAccount>): UserAccount | null {
  const users = getGlobalUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (index === -1) return null;
  
  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  saveGlobalUsers(users);
  return updatedUser;
}

// Registration function
export function registerUser(
  nome: string, 
  email: string, 
  celular: string, 
  password: string, 
  serialKey?: string,
  empresaNome?: string,
  empresaCnpj?: string,
  empresaLogo?: string
): { success: boolean; message: string; user?: UserAccount } {
  const users = getGlobalUsers();
  const lowerEmail = email.toLowerCase();
  
  if (users.some(u => u.email.toLowerCase() === lowerEmail)) {
    return { success: false, message: 'Este e-mail já está cadastrado.' };
  }
  
  let status: 'active' | 'trial' = 'trial';
  
  if (serialKey) {
    const serials = getGlobalSerials();
    const foundSerial = serials.find(s => s.key === serialKey);
    
    if (!foundSerial) {
      return { success: false, message: 'Serial inválido ou não encontrado.' };
    }
    
    if (foundSerial.status !== 'available') {
      return { success: false, message: 'Este serial já está em uso em outro dispositivo.' };
    }
    
    // Bind serial to this device and email
    foundSerial.status = 'active';
    foundSerial.assignedTo = lowerEmail;
    foundSerial.deviceId = getPhysicalDeviceId();
    saveGlobalSerials(serials);
    
    status = 'active';
  }
  
  const newUser: UserAccount = {
    email: lowerEmail,
    nome,
    celular,
    passwordHash: password,
    createdAt: Date.now(),
    serialKey: serialKey || undefined,
    status: status,
    empresaNome: empresaNome || undefined,
    empresaCnpj: empresaCnpj || undefined,
    empresaLogo: empresaLogo || undefined
  };
  
  users.push(newUser);
  saveGlobalUsers(users);
  
  return { success: true, message: 'Cadastro realizado com sucesso!', user: newUser };
}

// Login function with Device Lock checks
export function loginUser(email: string, password: string): { 
  success: boolean; 
  message: string; 
  user?: UserAccount; 
  deviceBlocked?: boolean;
} {
  const users = getGlobalUsers();
  const lowerEmail = email.toLowerCase();
  const foundUser = users.find(u => u.email.toLowerCase() === lowerEmail && u.passwordHash === password);
  
  if (!foundUser) {
    return { success: false, message: 'E-mail ou senha incorretos.' };
  }
  
  // Verify physical device lock if user has a serial
  if (foundUser.serialKey) {
    const serials = getGlobalSerials();
    const foundSerial = serials.find(s => s.key === foundUser.serialKey);
    const myDevice = getPhysicalDeviceId();
    
    if (foundSerial) {
      if (!foundSerial.deviceId) {
        // First login with this serial, register this device
        foundSerial.deviceId = myDevice;
        foundSerial.assignedTo = lowerEmail;
        foundSerial.status = 'active';
        saveGlobalSerials(serials);
      } else if (foundSerial.deviceId !== myDevice) {
        // Locked to another physical device! Block access!
        return { 
          success: false, 
          message: 'Acesso bloqueado: Este serial está em uso em outro dispositivo físico!',
          deviceBlocked: true
        };
      }
    }
  }
  
  return { success: true, message: 'Login efetuado com sucesso!', user: foundUser };
}

// Salesperson Login across all tenant databases
export function loginVendedor(emailOrCode: string, password: string): { 
  success: boolean; 
  message: string; 
  vendedor?: Vendedor; 
  tenant?: UserAccount;
} {
  const users = getGlobalUsers();
  const searchInput = emailOrCode.trim().toLowerCase();

  for (const tenant of users) {
    const db = loadUserDatabase(tenant.email);
    if (db.vendedores && db.vendedores.length > 0) {
      const found = db.vendedores.find(v => 
        v.email.trim().toLowerCase() === searchInput || 
        v.registro.trim().toLowerCase() === searchInput
      );
      
      if (found) {
        // We found a seller with this identifier
        if (found.senha && found.senha !== password) {
          return { success: false, message: 'Senha incorreta para este vendedor.' };
        }
        if (!found.senha && password !== '123456') { // Default password if none set
          return { success: false, message: 'Senha padrão incorreta (tente 123456) ou peça para redefinir.' };
        }
        if (found.status === 'Pendente') {
          return { success: false, message: 'Acesso Pendente: Seu cadastro está aguardando liberação do gestor.' };
        }
        if (found.status === 'Bloqueado') {
          return { success: false, message: 'Acesso Bloqueado: Seu acesso foi suspenso pelo gestor da empresa.' };
        }
        return {
          success: true,
          message: 'Acesso autorizado como Vendedor!',
          vendedor: found,
          tenant: tenant
        };
      }
    }
  }
  
  return { success: false, message: 'Vendedor não encontrado com este e-mail ou código.' };
}
