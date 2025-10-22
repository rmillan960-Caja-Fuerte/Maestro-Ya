'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { Client, ServiceRequest } from "@/lib/definitions";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ArrowLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { FormEvent, useState, useMemo } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const IVA_RATE = 0.15; // 15%

export default function NuevoTrabajoPage() {
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();

    // --- State Management ---
    const clientsQuery = useMemoFirebase(() => collection(firestore, 'clients'), [firestore]);
    const { data: clients, isLoading: clientsLoading } = useCollection<Client>(clientsQuery);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false);

    // --- Form State ---
    const [subtotal, setSubtotal] = useState<number>(0);
    const [applyVAT, setApplyVAT] = useState(false);
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");

    // --- New Client Form State ---
    const [newClientFirstName, setNewClientFirstName] = useState("");
    const [newClientLastName, setNewClientLastName] = useState("");
    const [newClientAddress, setNewClientAddress] = useState("");
    const [newClientPhone, setNewClientPhone] = useState("");

    // --- Derived State & Memoized Calculations ---
    const selectedClient = useMemo(() => {
        return clients?.find(c => c.id === selectedClientId) ?? null;
    }, [clients, selectedClientId]);

    const vatAmount = useMemo(() => {
        return applyVAT ? subtotal * IVA_RATE : 0;
    }, [subtotal, applyVAT]);

    const totalAmount = useMemo(() => {
        return subtotal + vatAmount;
    }, [subtotal, vatAmount]);

    // --- Event Handlers ---
    const handleCreateNewClient = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            const clientsCollection = collection(firestore, 'clients');
            const newClientData = { 
                firstName: newClientFirstName, 
                lastName: newClientLastName, 
                address: newClientAddress, 
                phone: newClientPhone,
                createdAt: serverTimestamp()
            };
            const docRef = await addDoc(clientsCollection, newClientData);
            setSelectedClientId(docRef.id);
            setIsNewClientDialogOpen(false);
            toast({ title: "Cliente creado con éxito" });
            // Reset form
            setNewClientFirstName("");
            setNewClientLastName("");
            setNewClientAddress("");
            setNewClientPhone("");
        } catch (error) {
            console.error("Error creating new client: ", error);
            toast({ variant: "destructive", title: "Error al crear cliente", description: (error as Error).message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitQuote = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedClient || !selectedClientId) {
            toast({ variant: "destructive", title: "Por favor, seleccione o cree un cliente." });
            return;
        }
        setIsSubmitting(true);

        try {
            const jobsCollection = collection(firestore, 'serviceRequests');
            const newServiceRequest: Omit<ServiceRequest, 'id'> = {
                clientId: selectedClientId, // Required by security rules
                client: selectedClient, // Denormalized data for easy access
                description,
                category,
                status: "Quote",
                createdAt: Date.now(),
                quoteSubtotal: subtotal,
                quoteVat: vatAmount,
                quoteTotal: totalAmount,
                quoteIncludesVat: applyVAT,
                warrantyPeriodDays: 90,
            };

            await addDoc(jobsCollection, newServiceRequest);
            toast({ title: "Cotización creada con éxito" });
            router.push("/dashboard/trabajos");

        } catch (error) {
            console.error("Error creating service request: ", error);
            toast({ variant: "destructive", title: "Error al crear la cotización", description: (error as Error).message });
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmitQuote}>
            <div className="flex items-center gap-4 mb-4">
                <Button asChild variant="outline" size="icon" className="h-7 w-7">
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Volver</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Crear Nueva Cotización
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalles del Trabajo</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="category">Categoría</Label>
                                <Select name="category" required onValueChange={setCategory} value={category}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="plomeria">Plomería</SelectItem>
                                        <SelectItem value="electricidad">Electricidad</SelectItem>
                                        <SelectItem value="albanileria">Albañilería</SelectItem>
                                        <SelectItem value="pintura">Pintura</SelectItem>
                                        <SelectItem value="carpinteria">Carpintería</SelectItem>
                                        <SelectItem value="otro">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-3">
                                <Label htmlFor="description">Descripción del Servicio</Label>
                                <Textarea id="description" name="description" placeholder="Ej: Reparación de fuga..." required value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="mb-4">
                        <CardHeader>
                            <CardTitle>Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <Select onValueChange={setSelectedClientId} value={selectedClientId || ''} disabled={clientsLoading}>
                                <SelectTrigger>
                                    <SelectValue placeholder={clientsLoading ? "Cargando clientes..." : "Seleccione un cliente existente"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {clients?.map(client => (
                                        <SelectItem key={client.id} value={client.id!}>
                                            {client.firstName} {client.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Crear Nuevo Cliente
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleCreateNewClient}>
                                        <DialogHeader>
                                            <DialogTitle>Crear Nuevo Cliente</DialogTitle>
                                            <DialogDescription>
                                                Añada los detalles del nuevo cliente. Se seleccionará automáticamente.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <Input placeholder="Nombre" value={newClientFirstName} onChange={e => setNewClientFirstName(e.target.value)} required />
                                            <Input placeholder="Apellido" value={newClientLastName} onChange={e => setNewClientLastName(e.target.value)} required />
                                            <Input placeholder="Dirección" value={newClientAddress} onChange={e => setNewClientAddress(e.target.value)} />
                                            <Input placeholder="Teléfono" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} />
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="ghost" onClick={() => setIsNewClientDialogOpen(false)}>Cancelar</Button>
                                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creando..." : "Crear Cliente"}</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>

                            {selectedClient && (
                                <div className="text-sm text-muted-foreground p-3 bg-slate-50 rounded-md border">
                                    <p className="font-semibold">{selectedClient.firstName} {selectedClient.lastName}</p>
                                    <p>{selectedClient.address}</p>
                                    <p>{selectedClient.phone}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Finanzas</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="subtotal">Subtotal (USD)</Label>
                                <Input id="subtotal" name="subtotal" type="number" step="0.01" placeholder="150.00" required value={subtotal} onChange={e => setSubtotal(parseFloat(e.target.value) || 0)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="apply-vat">Aplicar IVA (15%)</Label>
                                <Switch id="apply-vat" checked={applyVAT} onCheckedChange={setApplyVAT} />
                            </div>
                            <div className="text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {applyVAT && (
                                    <div className="flex justify-between">
                                        <span>IVA (15%):</span>
                                        <span>${vatAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t">
                                    <span>Total:</span>
                                    <span>${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="outline" onClick={() => router.push('/dashboard/trabajos')}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!selectedClientId || isSubmitting}>
                            {isSubmitting ? "Creando..." : "Crear Cotización"}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
