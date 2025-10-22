'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { User } from "@/lib/definitions";
import { doc } from "firebase/firestore";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const roleStyles: { [key: string]: string } = {
    'Admin': 'bg-primary/20 text-primary-foreground border-primary/50',
    'Owner': 'bg-amber-500/20 text-amber-500 border-amber-500/50',
    'Technician': 'bg-accent/20 text-accent-foreground border-accent/50',
    'owner': 'bg-amber-500/20 text-amber-500 border-amber-500/50',
    'admin': 'bg-primary/20 text-primary-foreground border-primary/50',
    'employee': 'bg-accent/20 text-accent-foreground border-accent/50',
};

export default function EquipoPage() {
    const firestore = useFirestore();
    const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();

    // Create a memoized reference to the current user's document
    const userRef = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return doc(firestore, 'users', authUser.uid);
    }, [firestore, authUser]);

    // Use useDoc to fetch the single user document
    const { data: currentUser, isLoading: isCurrentUserLoading } = useDoc<User>(userRef);

    const isLoading = isAuthUserLoading || isCurrentUserLoading;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Equipo</CardTitle>
                    <CardDescription>
                        Administre los usuarios y sus roles en el sistema.
                    </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="#">
                        <PlusCircle className="h-4 w-4" />
                        Agregar Usuario
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && <TableRow><TableCell colSpan={3}>Cargando...</TableCell></TableRow>}
                        {!isLoading && currentUser && (
                            <TableRow key={currentUser.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <Image src={"https://picsum.photos/seed/user/40/40"} width={40} height={40} alt={currentUser.firstName} className="rounded-full" data-ai-hint="user avatar" />
                                        <div>
                                            <p>{currentUser.firstName} {currentUser.lastName}</p>
                                            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                     <Badge variant="outline" className={cn("font-semibold", roleStyles[currentUser.role])}>{currentUser.role}</Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button
                                            aria-haspopup="true"
                                            size="icon"
                                            variant="ghost"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem>Editar</DropdownMenuItem>
                                        <DropdownMenuItem>Eliminar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && !currentUser && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">No se pudo cargar la información del usuario.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
