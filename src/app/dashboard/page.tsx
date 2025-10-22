'use client';
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
  Wrench,
  FileText
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { collection, query } from "firebase/firestore"
import { Job } from "@/lib/definitions"

export default function Dashboard() {

  const statusStyles: { [key: string]: string } = {
    'Completado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'En Progreso': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Pendiente de Pago': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Cancelado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'Cotización': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'Aprobado': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  };
  
  const firestore = useFirestore();
  const serviceRequestsQuery = useMemoFirebase(() => query(collection(firestore, 'serviceRequests')), [firestore]);

  const { data: jobs, isLoading: jobsLoading } = useCollection<Job>(serviceRequestsQuery);

  const activeJobs = jobs?.filter(j => j.status === 'En Progreso' || j.status === 'Aprobado').length || 0;
  const pendingPayments = jobs?.filter(j => j.status === 'Pendiente de Pago').length || 0;
  const newQuotes = jobs?.filter(j => j.status === 'Cotización').length || 0;
  const totalRevenue = jobs?.filter(j => j.status === 'Completado').reduce((acc, job) => acc + (job.quoteAmount || 0), 0) || 0;
  const isLoading = jobsLoading;

  return (
    <>
      <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl font-headline">Dashboard</h1>
      </div>
       {isLoading ? <p>Cargando...</p> :
       <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total de trabajos completados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Trabajos Activos
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              Trabajos aprobados o en progreso
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Facturas enviadas sin pagar
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevas Cotizaciones</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newQuotes}</div>
            <p className="text-xs text-muted-foreground">
              Cotizaciones esperando aprobación
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Transacciones Recientes</CardTitle>
              <CardDescription>
                Resumen de los últimos trabajos registrados.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/trabajos">
                Ver Todos
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden xl:table-column">
                    Tipo
                  </TableHead>
                  <TableHead className="hidden xl:table-column">
                    Estado
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Fecha
                  </TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs && jobs.slice(0, 5).map(job => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="font-medium">{job.client?.name || 'N/A'}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                         {job.client?.email || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      {job.description}
                    </TableCell>
                    <TableCell className="hidden xl:table-column">
                      <Badge className={cn("text-xs", statusStyles[job.status])} variant="outline">
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(job.requestDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">${(job.quoteAmount || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                 {(!jobs || jobs.length === 0) && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">No hay transacciones recientes.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      </>
}
    </>
  )
}
