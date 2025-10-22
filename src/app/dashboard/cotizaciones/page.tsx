'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { Quotation, ServiceRequest } from "@/lib/definitions";
import { collection, collectionGroup, getDoc, query } from "firebase/firestore";
import { PlusCircle, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const statusStyles: { [key: string]: string } = {
    'Sent': 'bg-blue-100 text-blue-800',
    'Approved': 'bg-green-100 text-green-800',
    'Draft': 'bg-gray-100 text-gray-800',
    'Rejected': 'bg-red-100 text-red-800',
};


interface EnrichedQuotation extends Quotation {
    clientName?: string;
}

export default function CotizacionesPage() {
    const firestore = useFirestore();
    const quotesQuery = useMemoFirebase(() => query(collectionGroup(firestore, 'quotations')), [firestore]);
    const { data: quotes, isLoading } = useCollection<Quotation>(quotesQuery);
    const [enrichedQuotes, setEnrichedQuotes] = useState<EnrichedQuotation[]>([]);

    useEffect(() => {
        const fetchClientData = async () => {
            if (quotes) {
                const enriched = await Promise.all(quotes.map(async (quote) => {
                    try {
                        const serviceRequestRef = (await getDoc(quote.serviceRequestRef!)).ref.parent.parent;
                         if (serviceRequestRef) {
                             const serviceRequestSnap = await getDoc(serviceRequestRef);
                             if (serviceRequestSnap.exists()) {
                                 const serviceRequestData = serviceRequestSnap.data() as ServiceRequest;
                                 const clientRef = serviceRequestData.clientRef;
                                 if (clientRef) {
                                     const clientSnap = await getDoc(clientRef);
                                     if (clientSnap.exists()) {
                                         return { ...quote, clientName: `${clientSnap.data().firstName} ${clientSnap.data().lastName}` };
                                     }
                                 }
                             }
                         }
                    } catch(e) {
                        console.error("Error enriching quote: ", e);
                    }
                    return quote;
                }));
                setEnrichedQuotes(enriched);
            }
        };

        fetchClientData();
    }, [quotes]);


    return (
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Cotizaciones</CardTitle>
                    <CardDescription>
                        Administre y revise todas las cotizaciones enviadas a los clientes.
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
                            <TableHead>ID Cotización</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={5}>Cargando...</TableCell></TableRow>}
                        {!isLoading && enrichedQuotes && enrichedQuotes.map(quote => (
                            <TableRow key={quote.id}>
                                <TableCell className="font-medium">{quote.id.slice(-6).toUpperCase()}</TableCell>
                                <TableCell>{quote.clientName || 'N/A'}</TableCell>
                                <TableCell>${quote.amount.toFixed(2)}</TableCell>
                                <TableCell>{new Date(quote.creationDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                     <Button asChild size="sm" variant="outline" className="gap-1">
                                        <Link href={`/dashboard/trabajos/${quote.serviceRequestId}`}>
                                            Ver Trabajo
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
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
