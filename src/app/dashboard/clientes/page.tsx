'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { Client } from "@/lib/definitions";
import { collection } from "firebase/firestore";
import { PlusCircle, Eye } from "lucide-react";
import Link from 'next/link';

export default function ClientesPage() {
    const firestore = useFirestore();
    const clientsRef = useMemoFirebase(() => collection(firestore, 'clients'), [firestore]);
    const { data: clients, isLoading } = useCollection<Client>(clientsRef);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Gestión de Clientes</CardTitle>
                    <CardDescription>
                        Desde aquí puede crear nuevas cotizaciones y gestionar el historial de sus clientes.
                    </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/dashboard/clientes/nuevo">
                        <PlusCircle className="h-4 w-4" />
                        Nuevo Cliente
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Historial</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={4}>Cargando clientes...</TableCell></TableRow>}
                        {!isLoading && clients && clients.map(client => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.firstName} {client.lastName}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm">{client.email}</span>
                                        <span className="text-sm text-muted-foreground">{client.phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell>0 Trabajos</TableCell> {/* Placeholder */}
                                <TableCell className="text-right space-x-2">
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/dashboard/clientes/${client.id}`}>
                                            <Eye className="h-4 w-4 mr-1" />
                                            Ver Detalles
                                        </Link>
                                    </Button>
                                    <Button asChild size="sm">
                                        <Link href={`/dashboard/trabajos/nuevo?clientId=${client.id}`}>
                                            <PlusCircle className="h-4 w-4 mr-1" />
                                            Crear Cotización
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {!isLoading && (!clients || clients.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">No se encontraron clientes. Comience creando uno.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
