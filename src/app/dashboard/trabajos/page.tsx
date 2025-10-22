import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { jobs, users } from "@/lib/data";
import { Job, JobStatus } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import { PlusCircle, Wrench, User, DollarSign } from "lucide-react";
import Link from 'next/link';

const statusConfig: { [key in JobStatus]: { color: string, icon: React.ReactNode } } = {
  'Cotización': { color: 'border-gray-500', icon: <DollarSign className="h-4 w-4" /> },
  'Aprobado': { color: 'border-purple-500', icon: <Wrench className="h-4 w-4" /> },
  'En Progreso': { color: 'border-blue-500', icon: <Wrench className="h-4 w-4" /> },
  'Pendiente de Pago': { color: 'border-yellow-500', icon: <DollarSign className="h-4 w-4" /> },
  'Completado': { color: 'border-green-500', icon: <Wrench className="h-4 w-4" /> },
  'Cancelado': { color: 'border-red-500', icon: <Wrench className="h-4 w-4" /> },
};

const JobCard = ({ job }: { job: Job }) => {
  return (
    <Link href={`/dashboard/trabajos/${job.id}`} className="block">
      <Card className="mb-4 hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2">{job.title}</h4>
          <p className="text-sm text-muted-foreground mb-2">{job.client.name}</p>
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-primary">${job.quoteAmount.toFixed(2)}</span>
            {job.technician && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{job.technician.name.split(' ')[0]}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const KanbanColumn = ({ title, jobs, status }: { title: string, jobs: Job[], status: JobStatus }) => {
  const { color } = statusConfig[status];
  return (
    <div className="flex-1 min-w-[300px] bg-muted/50 rounded-lg">
      <div className={cn("p-4 border-t-4 rounded-t-lg", color)}>
        <h3 className="font-semibold">{title} ({jobs.length})</h3>
      </div>
      <div className="p-4 pt-2 overflow-y-auto h-[calc(100vh-250px)]">
        {jobs.map(job => <JobCard key={job.id} job={job} />)}
      </div>
    </div>
  );
};

export default function TrabajosPage() {
  const columns: { status: JobStatus, title: string }[] = [
    { status: 'Cotización', title: 'Cotización' },
    { status: 'Aprobado', title: 'Aprobado' },
    { status: 'En Progreso', title: 'En Progreso' },
    { status: 'Pendiente de Pago', title: 'Pendiente de Pago' },
    { status: 'Completado', title: 'Completado' },
  ];

  const jobsByStatus = (status: JobStatus) => jobs.filter(job => job.status === status);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Flujo de Trabajos</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Trabajo
        </Button>
      </div>
      <div className="flex-1 w-full overflow-x-auto">
        <div className="flex gap-6 pb-4">
          {columns.map(col => (
            <KanbanColumn
              key={col.status}
              title={col.title}
              status={col.status}
              jobs={jobsByStatus(col.status)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
