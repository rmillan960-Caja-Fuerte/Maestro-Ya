import type { User, Client, Job, JobStatus } from './definitions';

// Seed data for the application. This data is used for development and testing purposes.

/**
 * Seed users for the application.
 * Note: In a real application, this data would come from a database.
 */
export const users: User[] = [
  {
    id: 'user-1',
    name: 'Admin Quito',
    email: 'admin.quito@maestro-ya.com',
    role: 'Admin',
    avatarUrl: 'https://picsum.photos/seed/user1/40/40',
  },
  {
    id: 'user-2',
    name: 'Técnico Quito 1',
    email: 'tecnico.quito.1@maestro-ya.com',
    role: 'Technician',
    avatarUrl: 'https://picsum.photos/seed/user2/40/40',
  },
  {
    id: 'user-3',
    name: 'Técnico Quito 2',
    email: 'tecnico.quito.2@maestro-ya.com',
    role: 'Technician',
    avatarUrl: 'https://picsum.photos/seed/user3/40/40',
  },
  {
    id: 'user-4',
    name: 'Dueño del Negocio',
    email: 'rmillan960@gmail.com', // Using your email as the owner
    role: 'Owner',
    avatarUrl: 'https://picsum.photos/seed/user4/40/40',
  },
];

/**
 * Seed clients for the application.
 */
export const clients: Client[] = [
  {
    id: 'client-1',
    name: 'Cliente Ejemplo 1',
    phone: '593987654321',
    email: 'cliente1@email.com',
    address: 'Av. González Suárez, Quito',
  },
  {
    id: 'client-2',
    name: 'Cliente Ejemplo 2',
    phone: '593991234567',
    email: 'cliente2@email.com',
    address: 'La Carolina, Quito',
  },
];

/**
 * Seed jobs for the application.
 */
export const jobs: Job[] = [
  {
    id: 'job-1',
    title: 'Reparación de fuga en cocina',
    client: clients[0],
    technician: users[1],
    status: 'En Progreso',
    description: 'Fuga en el grifo de la cocina. Se requiere cambio de empaques.',
    quoteAmount: 80.0,
    createdAt: '2024-07-25T10:00:00Z',
    images: [
      {
        url: 'https://picsum.photos/seed/job1-1/400/300',
        hint: 'grifo con fuga',
      },
    ],
  },
  {
    id: 'job-2',
    title: 'Instalación de lámpara de techo',
    client: clients[1],
    technician: users[2],
    status: 'Completado',
    description: 'Instalar nueva lámpara en la sala principal.',
    quoteAmount: 150.0,
    createdAt: '2024-07-24T14:30:00Z',
    images: [],
  },
  {
    id: 'job-3',
    title: 'Cotización para pintar apartamento',
    client: clients[0],
    status: 'Cotización',
    description: 'Cliente solicita cotización para pintar un apartamento de 2 habitaciones.',
    quoteAmount: 750.0,
    createdAt: '2024-07-26T09:15:00Z',
    images: [],
  },
];

/**
 * Seed quotes derived from jobs.
 */
export const quotes = jobs.map((job) => ({
  id: `quote-${job.id}`,
  jobId: job.id,
  clientName: job.client.name,
  amount: job.quoteAmount,
  status: job.status === 'Cotización' ? 'Sent' : 'Approved',
  createdAt: job.createdAt,
}));
