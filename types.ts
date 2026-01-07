
export type PricingStatus = 'CORRECT' | 'MARKET' | 'ABOVE_MARKET';
export type UserRole = 'MASTER' | 'MANAGER' | 'AGENT';
export type FinancialStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED';
export type SaleCategory = 'DIRECT' | 'PARTNERSHIP' | 'BUILDER';
export type ExclusivityStatus = 'ACTIVE' | 'SOLD' | 'RENEWED' | 'EXPIRED';

export interface Property {
  id: string;
  ilistCode?: string;
  title: string;
  price: number;
  marketValue: number;
  status: PricingStatus;
  leads: number;
  agentId: string;
  dateListed: string;
  exclusivityDeadline: string;
  exclusivityStatus: ExclusivityStatus;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  isTeamMember?: boolean;
}

export interface Transaction {
  id: string;
  propertyId: string;
  agentId: string;
  vgv: number;
  vgc: number;
  date: string;
  type: 'SALE' | 'RENT';
}

export interface FinancialEntry {
  id: string;
  agentId: string;
  propertyId?: string; // Vínculo com o imóvel
  saleValue: number;
  commissionValue: number; // Comissão Total
  agencyShare: number;      // Parte da Imobiliária
  agentShare: number;       // Parte do Corretor
  teamShare: number;        // Parte do Time
  partialCommission: number;
  receiptDate: string;
  observation: string;
  status: FinancialStatus;
  createdAt: string;
  approvedBy?: string;
  saleCategory: SaleCategory;
  partnerAgency?: string;
  partnerBroker?: string;
  partnerContact?: string;
  buyerName?: string;
  sellerName?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface MarketStudy {
  id: string;
  agentId: string;
  date: string;
  title: string;
}

export interface Goals {
  vgv: number;
  vgc: number;
  transactions: number;
  captures: number;
  marketStudies: number;
}
