import { jobs } from '@/lib/data';
import { ArrowLeft, User, Phone, Mail, MapPin, Wrench, DollarSign, Calendar, Upload } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { WhatsAppGenerator } from '@/components/whatsapp-generator';

const statusStyles: { [key: string]: string } = {
  'Completado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'En Progreso': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  'Pendiente de Pago': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'Cancelado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'Cotización': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'Aprobado': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = jobs.find(j => j.id === params.id);

  if (!job) {
    notFound();
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" asChild>
          <Link href="/dashboard/trabajos">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Atrás</span>
          </Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
          {job.title}
        </h1>
        <Badge variant="outline" className={cn("ml-auto sm:ml-0", statusStyles[job.status])}>
          {job.status}
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 lg:gap-8">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-4 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Descripción del Trabajo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{job.description}</p>
            </CardContent>
          </Card>
          
          <WhatsAppGenerator job={job} />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fotos y Archivos</CardTitle>
              <Button size="sm" variant="outline"><Upload className="h-4 w-4 mr-2" />Cargar Archivo</Button>
            </CardHeader>
            <CardContent>
              {job.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {job.images.map((image, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                       <Image
                        src={image.url}
                        alt={`Foto del trabajo ${index + 1}`}
                        fill
                        className="object-cover"
                        data-ai-hint={image.hint}
                       />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay fotos para este trabajo.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-3 lg:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Trabajo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4"/>Monto Cotizado</span>
                    <span className="font-semibold">${job.quoteAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/>Fecha Creación</span>
                    <span className="font-semibold">{new Date(job.createdAt).toLocaleDateString('es-EC')}</span>
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="font-semibold flex items-center gap-2"><User className="h-4 w-4"/>{job.client.name}</div>
              <div className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4"/>{job.client.phone}</div>
              <div className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4"/>{job.client.email}</div>
              <div className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4"/>{job.client.address}</div>
            </CardContent>
          </Card>
          {job.technician && (
            <Card>
              <CardHeader>
                <CardTitle>Técnico Asignado</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <Image src={job.technician.avatarUrl} alt="Avatar" width={40} height={40} className="rounded-full" data-ai-hint="user avatar"/>
                  <div>
                    <div className="font-semibold flex items-center gap-2"><Wrench className="h-4 w-4"/>{job.technician.name}</div>
                    <div className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4"/>{job.technician.email}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
