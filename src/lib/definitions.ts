
import { Timestamp } from 'firebase/firestore';

export type User = {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'Admin' | 'Owner' | 'Technician';
    createdAt?: Timestamp | Date;
    lastLogin?: Timestamp | Date;
};

export type Client = {
    id?: string;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    createdAt: any; 
};

export type Master = {
    id?: string;
    firstName: string;
    lastName: string;
    nationalId: string;
    phone: string;
    email: string;
    category: string;
    workZone: string;
    criminalRecordUrl?: string; // Link to the uploaded PDF file
    createdAt: any; 
};

export type ServiceRequestStatus = 
    | 'Quote'       // Cotización creada, pendiente de envío o aprobación
    | 'Pending'     // Cotización enviada, esperando respuesta del cliente
    | 'Approved'    // Cliente aprobó, esperando pago inicial o programación
    | 'InProgress'  // Trabajo en curso
    | 'Completed'   // Trabajo finalizado, esperando pago final
    | 'Closed'      // Pago final recibido, trabajo cerrado
    | 'Canceled'    // Trabajo cancelado por cliente o empresa
    | 'Warranty'    // Trabajo en período de garantía


export interface ServiceRequest {
    id?: string;
    clientId: string; 
    client: Client; // Denormalized client data
    description: string;
    category: string;
    status: ServiceRequestStatus;
    assignedMaster?: Master;
    createdAt: number; 

    // Quote details
    quoteSubtotal?: number;
    quoteVat?: number;
    quoteTotal?: number;
    quoteIncludesVat?: boolean;
    quoteSentAt?: number;
    quoteApprovedAt?: number;

    // Financials
    initialPayment?: number;
    finalPayment?: number;
    paymentMethod?: string;

    // Scheduling
    scheduledAt?: number;
    completedAt?: number;

    // Warranty
    warrantyPeriodDays?: number; // e.g., 90

    // Communication
    notes?: Array<{ note: string; createdAt: number; author: string; }>;
}