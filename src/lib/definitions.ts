export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Technician';
  avatarUrl: string;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
};

export type Quote = {
  id: string;
  jobId: string;
  clientName: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  createdAt: string;
};

export type JobStatus = 'Cotización' | 'Aprobado' | 'En Progreso' | 'Completado' | 'Cancelado' | 'Pendiente de Pago';

export type Job = {
  id: string;
  title: string;
  client: Client;
  technician?: User;
  status: JobStatus;
  description: string;
  quoteAmount: number;
  createdAt: string;
  images: { url: string, hint: string }[];
};
