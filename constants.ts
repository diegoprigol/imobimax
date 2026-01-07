
import { Property, Agent, Transaction, Goals, MarketStudy, FinancialEntry, AuditLog } from './types';

const generateAgents = (): Agent[] => {
  const baseAgents: Agent[] = [
    { id: 'admin', name: 'Ricardo Master', avatar: 'https://picsum.photos/seed/master/100', role: 'MASTER' },
    { id: 'manager', name: 'Sofia Gestora', avatar: 'https://picsum.photos/seed/manager/100', role: 'MANAGER' },
  ];

  const names = ['Ana Silva', 'Bruno Costa', 'Carla Dias', 'Diego Neves', 'Elaine Santos', 'Fabio Junior', 'Gisele B.', 'Hugo Souza'];

  const dynamicAgents: Agent[] = names.map((name, index) => ({
    id: (index + 1).toString(),
    name,
    avatar: `https://i.pravatar.cc/150?u=${name.replace(' ', '')}`,
    role: 'AGENT'
  }));

  return [...baseAgents, ...dynamicAgents];
};

export const AGENTS: Agent[] = generateAgents();

export const AGENCY_GOALS: Goals = {
  vgv: 50000000,
  vgc: 2500000,
  transactions: 120,
  captures: 250,
  marketStudies: 500
};

// Fix: Added missing agencyShare, agentShare, and teamShare properties to satisfy FinancialEntry interface
export const INITIAL_FINANCIAL_ENTRIES: FinancialEntry[] = [
  {
    id: 'f1',
    agentId: '1',
    saleValue: 1200000,
    commissionValue: 60000,
    agencyShare: 30000,
    agentShare: 24000,
    teamShare: 6000,
    partialCommission: 0,
    receiptDate: '2024-06-15',
    observation: 'Venda de apartamento em Moema.',
    status: 'APPROVED',
    createdAt: '2024-05-10T10:00:00Z',
    saleCategory: 'DIRECT'
  }
];

export const INITIAL_LOGS: AuditLog[] = [
  { id: 'l1', userId: 'admin', userName: 'Ricardo Master', action: 'SISTEMA', details: 'Dashboard inicializado', timestamp: new Date().toISOString() }
];

export const PROPERTIES: Property[] = [
  { 
    id: 'p1', 
    title: 'Cobertura Leblon', 
    price: 5500000, 
    marketValue: 5000000, 
    status: 'ABOVE_MARKET', 
    leads: 12, 
    agentId: '1', 
    dateListed: '2024-01-05',
    exclusivityDeadline: '2024-04-05',
    exclusivityStatus: 'EXPIRED'
  },
  { 
    id: 'p2', 
    title: 'Apartamento Jardins', 
    price: 2100000, 
    marketValue: 2100000, 
    status: 'MARKET', 
    leads: 45, 
    agentId: '2', 
    dateListed: '2024-03-15',
    exclusivityDeadline: '2024-06-15',
    exclusivityStatus: 'ACTIVE'
  },
  { 
    id: 'p3', 
    title: 'Casa Alphaville', 
    price: 3200000, 
    marketValue: 3500000, 
    status: 'CORRECT', 
    leads: 8, 
    agentId: '3', 
    dateListed: '2024-05-20',
    exclusivityDeadline: '2024-11-20',
    exclusivityStatus: 'ACTIVE'
  }
];

export const TRANSACTIONS: Transaction[] = []; 
export const MARKET_STUDIES: MarketStudy[] = [];
