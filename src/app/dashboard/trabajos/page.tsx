'use client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { ServiceRequest } from "@/lib/definitions";
import { collection, query, getDoc, orderBy } from "firebase/firestore";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

const statusColors: { [key: string]: string } = {
    Quote: "bg-gray-500",
    Pending: "bg-yellow-500",
    Aprobado: "bg-blue-500",
    InProgress: "bg-purple-500",
    Completed: "bg-green-500",
    Closed: "bg-black",
    Cancelado: "bg-red-500",
    Warranty: "bg-orange-500",
};

interface EnrichedServiceRequest extends ServiceRequest {
    clientName?: string;
    quoteTotal?: number; // Ensure this is part of the enriched data
}

export default function TrabajosPage() {
    const firestore = useFirestore();
    // Correctly query the serviceRequests collection
    const servicesQuery = useMemoFirebase(() => query(collection(firestore, 'serviceRequests'), orderBy('createdAt', 'desc')), [firestore]);
    const { data: serviceRequests, isLoading } = useCollection<ServiceRequest>(servicesQuery);
    const [enrichedJobs, setEnrichedJobs] = useState<EnrichedServiceRequest[]>([]);

    useEffect(() => {
        const enrichJobs = async () => {
            if (serviceRequests) {
                const enriched = await Promise.all(serviceRequests.map(async (job) => {
                    let clientName = 'N/A';
                    // The client data is stored in clientRef, we need to fetch it
                    if (job.clientRef) {
                        try {
                            const clientSnap = await getDoc(job.clientRef);
                            if (clientSnap.exists()) {
                                const clientData = clientSnap.data();
                                clientName = `${clientData.firstName} ${clientData.lastName}`;
                            }
                        } catch (error) {
                            console.error("Error fetching client data: ", error);
                        }
                    }
                    // Ensure quoteTotal is passed through, assuming it exists on the job document
                    return { ...job, clientName, quoteTotal: job.quoteTotal || 0 };
                }));
                setEnrichedJobs(enriched);
            }
        };

        enrichJobs();
    }, [serviceRequests]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Gestión de Trabajos</CardTitle>
                    <CardDescription>
                        Supervise todas las cotizaciones y trabajos en curso.
                    </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/dashboard/trabajos/nuevo">
                        <PlusCircle className="h-4 w-4" />
                        Crear Cotización
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Maestro Asignado</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={6} className="text-center h-24">Cargando trabajos...</TableCell></TableRow>}
                        {!isLoading && enrichedJobs.map(job => (
                            <TableRow key={job.id}>
                                <TableCell className="font-medium">{job.clientName}</TableCell>
                                <TableCell>{job.description}</TableCell>
                                <TableCell>{job.assignedMaster?.name || <span className="text-gray-500">No asignado</span>}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={`${statusColors[job.status] || 'bg-gray-400'} text-white`}>
                                        {job.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>${job.quoteTotal?.toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/dashboard/trabajos/${job.id}`}>Ver detalles</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>Editar</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && enrichedJobs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">No hay trabajos para mostrar. Comience creando una cotización.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
