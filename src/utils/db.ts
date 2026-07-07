/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Custo, Venda, Produto, Cliente, Fornecedor } from '../types';

export interface UserAccount {
  email: string;
  nome: string;
  celular: string;
  passwordHash: string; // Plaintext representation for simulation simplicity
  createdAt: number; // Timestamp
  serialKey?: string;
  status: 'active' | 'trial' | 'blocked' | 'expired';
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
    return JSON.parse(data);
  }
  
  // Return empty structure if new user, which will get seeded with defaults if desired
  return {
    custos: [],
    vendas: [],
    produtos: [],
    clientes: [],
    fornecedores: []
  };
}

export function saveUserDatabase(email: string, data: UserData) {
  const key = getUserStorageKey(email);
  localStorage.setItem(key, JSON.stringify(data));
}

// Registration function
export function registerUser(nome: string, email: string, celular: string, password: string, serialKey?: string): { success: boolean; message: string; user?: UserAccount } {
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
    status: status
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
