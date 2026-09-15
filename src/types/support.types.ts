// types/support.types.ts
export type TicketStatus = 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'ARCHIVED';

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  ticketNumber: string;
}

export interface CreateTicketPayload {
  name: string;
  email: string;
  message: string;
}

export interface CreateTicketResponse {
  message: string;
  ticket: SupportTicket;
}
export interface SupportStats {
  total: number;
  pending: number;
  processing: number;
  resolved: number;
  archived: number;
}