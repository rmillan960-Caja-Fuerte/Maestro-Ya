import { DocumentReference } from "firebase/firestore";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'owner' | 'admin' | 'employee';
  address: string;
  employeeType?: string;
};

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
};

export type Quotation = {
  id: string;
  serviceRequestId: string;
  serviceRequestRef?: DocumentReference;
  description: string;
  amount: number;
  creationDate: string;
  expiryDate: string;
  initialPaymentPercentage: number;
  guaranteeDays: number;
};

export type JobStatus = 'Cotización' | 'Aprobado' | 'En Progreso' | 'Completado' | 'Cancelado' | 'Pendiente de Pago';

export type ServiceRequest = {
  id: string;
  clientId: string;
  clientRef?: DocumentReference;
  description: string;
  requestDate: string;
  status: JobStatus;
  assignedTechnicianId?: string;
  assignedTechnicianRef?: DocumentReference;
  category: string;
  quoteAmount?: number; // Denormalized from Quotation for easier access
  images?: { url: string, hint: string }[];
};

// Combining ServiceRequest with related data for easier use in components
export interface Job extends ServiceRequest {
  client?: Client;
  technician?: User;
}
