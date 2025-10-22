import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { quotes } from "@/lib/data";
import { PlusCircle, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { cn } from "@/lib/utils";

const statusStyles: { [key: string]: string } = {
    'Sent': 'bg-blue-100 text-blue-800',
    'Approved': 'bg-green-100 text-green-800',
    'Draft': 'bg-gray-100 text-gray-800',
    'Rejected': 'bg-red-100 text-red-800',
};

export default function CotizacionesPage() {
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
                    <Link href="#">
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
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>
                                <span className="sr-only">Acciones</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotes.map(quote => (
                            <TableRow key={quote.id}>
                                <TableCell className="font-medium">{quote.id.slice(-6).toUpperCase()}</TableCell>
                                <TableCell>{quote.clientName}</TableCell>
                                <TableCell>${quote.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn("text-xs", statusStyles[quote.status])}>{quote.status}</Badge>
                                </TableCell>
                                <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                     <Button asChild size="sm" variant="outline" className="gap-1">
                                        <Link href={`/dashboard/trabajos/${quote.jobId}`}>
                                            Ver Trabajo
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
