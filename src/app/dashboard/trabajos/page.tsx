'use client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { db } from "@/firebase";
import { ServiceRequest } from "@/lib/definitions";
import { collection, orderBy, query, getDocs } from "firebase/firestore";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

const statusColors: { [key in ServiceRequest["status"]]: string } = {
    Quote: "bg-gray-500",
    Pending: "bg-yellow-500",
    Approved: "bg-blue-500",
    InProgress: "bg-purple-500",
    Completed: "bg-green-500",
    Closed: "bg-black",
    Canceled: "bg-red-500",
    Warranty: "bg-orange-500",
};

// We are now assuming the client data is embedded in the ServiceRequest object
interface EnrichedServiceRequest extends ServiceRequest {
    clientName: string;
}

export default function TrabajosPage() {
    const [jobs, setJobs] = useState<EnrichedServiceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoading(true);
            try {
                const jobsQuery = query(collection(db, 'serviceRequests'), orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(jobsQuery);
                const jobsData = querySnapshot.docs.map(doc => {
                    const data = doc.data() as ServiceRequest;
                    // Directly use the client data embedded in the job document
                    const clientName = data.client ? `${data.client.firstName} ${data.client.lastName}` : 'Cliente no especificado';
                    return {
                        id: doc.id,
                        ...data,
                        clientName,
                    } as EnrichedServiceRequest;
                });
                setJobs(jobsData);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
            setIsLoading(false);
        };

        fetchJobs();
    }, []);

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
                        {!isLoading && jobs.length > 0 && jobs.map(job => (
                            <TableRow key={job.id}>
                                <TableCell className="font-medium">{job.clientName}</TableCell>
                                <TableCell>{job.description}</TableCell>
                                <TableCell>{job.assignedMaster ? job.assignedMaster.name : <span className="text-gray-500">No asignado</span>}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className={`${statusColors[job.status]} text-white`}>
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
                        {!isLoading && jobs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">Trabajo no encontrado.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
