import type { User, Client, Job, JobStatus } from './definitions';

export const users: User[] = [
  { id: 'user-1', name: 'Ana Pérez (Admin)', email: 'ana.perez@serviya.com', role: 'Admin', avatarUrl: 'https://picsum.photos/seed/user1/40/40' },
  { id: 'user-2', name: 'Carlos Gomez', email: 'carlos.gomez@serviya.com', role: 'Technician', avatarUrl: 'https://picsum.photos/seed/user2/40/40' },
  { id: 'user-3', name: 'Luisa Fernandez', email: 'luisa.fernandez@serviya.com', role: 'Technician', avatarUrl: 'https://picsum.photos/seed/user3/40/40' },
  { id: 'user-4', name: 'Jorge Diaz (Owner)', email: 'jorge.diaz@serviya.com', role: 'Owner', avatarUrl: 'https://picsum.photos/seed/user4/40/40' },
  { id: 'user-5', name: 'Miguel Angel', email: 'miguel.angel@serviya.com', role: 'Technician', avatarUrl: 'https://picsum.photos/seed/user5/40/40' },
];

export const clients: Client[] = [
  { id: 'client-1', name: 'Juan Rodriguez', phone: '593987654321', email: 'juan.r@email.com', address: 'Av. Amazonas, Quito' },
  { id: 'client-2', name: 'Maria Lopez', phone: '593991234567', email: 'maria.l@email.com', address: 'Calle La Pradera, Quito' },
  { id: 'client-3', name: 'Pedro Martinez', phone: '593988887777', email: 'pedro.m@email.com', address: 'Av. 6 de Diciembre, Quito' },
];

const jobStatuses: JobStatus[] = ['Cotización', 'Aprobado', 'En Progreso', 'Completado', 'Pendiente de Pago', 'Cancelado'];

export const jobs: Job[] = [
  {
    id: 'job-1',
    title: 'Reparación de fuga en baño',
    client: clients[0],
    technician: users[1],
    status: 'En Progreso',
    description: 'Fuga detectada debajo del lavamanos. Se necesita reemplazar el sifón y sellar las juntas. El cliente reporta goteo constante.',
    quoteAmount: 120.50,
    createdAt: '2024-07-20T10:00:00Z',
    images: [
      { url: 'https://picsum.photos/seed/job1-1/400/300', hint: 'leaky pipe' },
      { url: 'https://picsum.photos/seed/job1-2/400/300', hint: 'plumbing tools' },
    ]
  },
  {
    id: 'job-2',
    title: 'Instalación de circuito eléctrico',
    client: clients[1],
    technician: users[2],
    status: 'Completado',
    description: 'Instalar nuevo circuito para aire acondicionado en el dormitorio principal. Incluye cableado, caja de breakers y toma de corriente.',
    quoteAmount: 250.00,
    createdAt: '2024-07-18T14:30:00Z',
    images: [
      { url: 'https://picsum.photos/seed/job2-1/400/300', hint: 'electrical panel' },
    ]
  },
  {
    id: 'job-3',
    title: 'Cotización pintura de fachada',
    client: clients[2],
    status: 'Cotización',
    description: 'Cliente solicita cotización para pintar la fachada de una casa de dos pisos. Aproximadamente 150m². Se debe incluir preparación de la superficie.',
    quoteAmount: 950.00,
    createdAt: '2024-07-21T09:15:00Z',
    images: []
  },
    {
    id: 'job-4',
    title: 'Cambio de grifería de cocina',
    client: clients[0],
    technician: users[1],
    status: 'Aprobado',
    description: 'El cliente ha aprobado la cotización para cambiar la grifería de la cocina. El técnico debe coordinar la visita.',
    quoteAmount: 85.00,
    createdAt: '2024-07-22T11:00:00Z',
    images: []
  },
  {
    id: 'job-5',
    title: 'Arreglo de cortocircuito',
    client: clients[2],
    technician: users[4],
    status: 'Pendiente de Pago',
    description: 'Se solucionó un cortocircuito en la sala de estar. El trabajo está finalizado y se ha enviado la factura al cliente.',
    quoteAmount: 75.00,
    createdAt: '2024-07-19T16:00:00Z',
    images: []
  },
    {
    id: 'job-6',
    title: 'Mantenimiento de Calefón',
    client: clients[1],
    technician: users[1],
    status: 'Cancelado',
    description: 'El cliente canceló el servicio de mantenimiento de calefón programado.',
    quoteAmount: 60.00,
    createdAt: '2024-07-15T08:00:00Z',
    images: [],
  }
];

export const quotes = jobs.map(job => ({
  id: `quote-${job.id}`,
  jobId: job.id,
  clientName: job.client.name,
  amount: job.quoteAmount,
  status: job.status === 'Cotización' ? 'Sent' : 'Approved',
  createdAt: job.createdAt,
}));
