
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { Quotation, ServiceRequest } from "@/lib/definitions";
import { collection, collectionGroup, getDoc, query } from "firebase/firestore";
import { PlusCircle, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useEffect, useState, useTransition } from "react";
import { updateServiceRequestStatus } from "@/lib/firebase-actions";

const statusStyles: { [key: string]: string } = {
    'Completado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'En Progreso': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Pendiente de Pago': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Cancelado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'Cotización': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'Aprobado': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

interface EnrichedQuotation extends Quotation {
    clientName?: string;
    serviceRequestId?: string;
    status?: string;
}

export default function CotizacionesPage() {
    const firestore = useFirestore();
    const quotesQuery = useMemoFirebase(() => query(collectionGroup(firestore, 'quotations')), [firestore]);
    const { data: quotes, isLoading } = useCollection<Quotation>(quotesQuery);
    const [enrichedQuotes, setEnrichedQuotes] = useState<EnrichedQuotation[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const fetchClientData = async () => {
            if (quotes) {
                const enriched = await Promise.all(quotes.map(async (quote) => {
                    let clientName = 'N/A';
                    let serviceRequestId = undefined;
                    let status = 'Cotización';

                    try {
                        const serviceRequestRef = quote.serviceRequestRef?.parent?.parent;
                         if (serviceRequestRef) {
                             serviceRequestId = serviceRequestRef.id;
                             const serviceRequestSnap = await getDoc(serviceRequestRef);
                             if (serviceRequestSnap.exists()) {
                                 const serviceRequestData = serviceRequestSnap.data() as ServiceRequest;
                                 status = serviceRequestData.status || status;
                                 if (serviceRequestData.clientRef) {
                                     const clientSnap = await getDoc(serviceRequestData.clientRef);
                                     if (clientSnap.exists()) {
                                         const clientData = clientSnap.data();
                                         clientName = `${clientData.firstName} ${clientData.lastName}`;
                                     }
                                 }
                             }
                         }
                    } catch(e) {
                        console.error("Error enriching quote: ", e);
                    }
                    return { ...quote, clientName, serviceRequestId, status };
                }));
                setEnrichedQuotes(enriched);
            }
        };

        fetchClientData();
    }, [quotes]);

    const formatDate = (timestamp: any) => {
        if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toLocaleDateString();
        }
        if (typeof timestamp === 'string') {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString();
            }
        }
        return 'N/A';
    };

    const handleStatusUpdate = (serviceRequestId: string, newStatus: 'Aprobado' | 'Cancelado') => {
        startTransition(async () => {
            await updateServiceRequestStatus(serviceRequestId, newStatus);
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Cotizaciones</CardTitle>
                    <CardDescription>
                        Administre el flujo completo de sus cotizaciones, desde el envío hasta la aprobación.
                    </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/dashboard/trabajos/nuevo">
                        <PlusCircle className="h-4 w-4" />
                        Nueva Cotización
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead className="hidden md:table-cell">Fecha</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={5} className="text-center">Cargando cotizaciones...</TableCell></TableRow>}
                        {!isLoading && enrichedQuotes.map(quote => (
                            <TableRow key={quote.id} className={isPending ? 'opacity-50' : ''}>
                                <TableCell className="font-medium">{quote.clientName || 'N/A'}</TableCell>
                                <TableCell>${(quote.amount || 0).toFixed(2)}</TableCell>
                                <TableCell className="hidden md:table-cell">{formatDate(quote.creationDate)}</TableCell>
                                <TableCell>
                                    <Badge className={cn("text-xs", statusStyles[quote.status || ''] || statusStyles['Cotización'])} variant="outline">
                                        {quote.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isPending}>
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            {quote.serviceRequestId && (
                                                <>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/trabajos/${quote.serviceRequestId}`}>Ver Detalles</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem disabled={isPending} onSelect={() => alert('Próximamente: Enviar por WhatsApp con IA')}>
                                                        Enviar por WhatsApp
                                                    </DropdownMenuItem>
                                                    {quote.status !== 'Aprobado' && (
                                                        <DropdownMenuItem disabled={isPending} onSelect={() => handleStatusUpdate(quote.serviceRequestId!, 'Aprobado')}>
                                                            Marcar como Aprobada
                                                        </DropdownMenuItem>
                                                    )}
                                                    {quote.status !== 'Cancelado' && (
                                                        <DropdownMenuItem disabled={isPending} className="text-red-600" onSelect={() => handleStatusUpdate(quote.serviceRequestId!, 'Cancelado')}>
                                                            Cancelar Cotización
                                                        </DropdownMenuItem>
                                                    )}
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                         {!isLoading && (!enrichedQuotes || enrichedQuotes.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No hay cotizaciones para mostrar.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
