'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { Client } from "@/lib/definitions";
import { collection } from "firebase/firestore";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';

export default function ClientesPage() {
    const firestore = useFirestore();
    const clientsRef = useMemoFirebase(() => collection(firestore, 'clients'), [firestore]);
    const { data: clients, isLoading } = useCollection<Client>(clientsRef);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Clientes</CardTitle>
                    <CardDescription>
                        Gestione la información de contacto de sus clientes.
                    </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="#">
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
                            <TableHead>Correo Electrónico</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={5}>Cargando...</TableCell></TableRow>}
                        {!isLoading && clients && clients.map(client => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">{client.firstName} {client.lastName}</TableCell>
                                <TableCell>{client.email}</TableCell>
                                <TableCell>{client.phone}</TableCell>
                                <TableCell>{client.address}</TableCell>
                                <TableCell>
                                    <Button size="sm" variant="outline">Editar</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {!isLoading && (!clients || clients.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No hay clientes para mostrar.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
