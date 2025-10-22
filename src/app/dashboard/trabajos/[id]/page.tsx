'use client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/firebase";
import { Master, ServiceRequest, ServiceRequestStatus } from "@/lib/definitions";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { ArrowLeft, MessageCircle, UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { generateWhatsAppMessage } from "@/lib/ai/whatsapp-message-generation";

const statusColors: { [key in ServiceRequestStatus]: string } = {
    Quote: "bg-gray-500",
    Pending: "bg-yellow-500",
    Approved: "bg-blue-500",
    InProgress: "bg-purple-500",
    Completed: "bg-green-500",
    Closed: "bg-black",
    Canceled: "bg-red-500",
    Warranty: "bg-orange-500",
};

export default function TrabajoDetallePage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    
    const [job, setJob] = useState<ServiceRequest | null>(null);
    const [masters, setMasters] = useState<Master[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);

    const jobRef = id ? doc(db, `serviceRequests/${id}`) : null;

    useEffect(() => {
        const fetchJobAndMasters = async () => {
            setIsLoading(true);
            try {
                if (jobRef) {
                    const jobSnap = await getDoc(jobRef);
                    if (jobSnap.exists()) {
                        setJob({ id: jobSnap.id, ...jobSnap.data() } as ServiceRequest);
                    }
                }
                const mastersQuery = await getDocs(collection(db, 'masters'));
                const mastersData = mastersQuery.docs.map(doc => ({ id: doc.id, ...doc.data() } as Master));
                setMasters(mastersData);
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobAndMasters();
    }, [id]);

    const changeStatus = async (newStatus: ServiceRequestStatus) => {
        if (!jobRef) return;
        try {
            await updateDoc(jobRef, { status: newStatus });
            setJob(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (error) {
            console.error("Error updating status: ", error);
        }
    };

    const handleAssignMaster = async () => {
        if (!jobRef || !selectedMasterId) return;
        setIsAssigning(true);
        try {
            const selectedMaster = masters.find(m => m.id === selectedMasterId);
            if (selectedMaster) {
                await updateDoc(jobRef, { assignedMaster: selectedMaster });
                setJob(prev => prev ? { ...prev, assignedMaster: selectedMaster } : null);
            }
        } catch (error) {
            console.error("Error assigning master: ", error);
        } finally {
            setIsAssigning(false);
        }
    };

    const handleWhatsAppClick = () => {
        if (!job) return;
        const message = generateWhatsAppMessage(job);
        const phone = job.client.phone.replace(/[^0-9]/g, '');
        const url = `https://wa.me/${phone}?text=${message}`;
        window.open(url, '_blank');
        if (job.status === 'Quote') {
            changeStatus('Pending');
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Cargando detalles...</div>;
    }

    if (!job) {
        return <div className="flex justify-center items-center h-screen">Trabajo no encontrado.</div>;
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-4">
                 <Button asChild variant="outline" size="icon" className="h-7 w-7">
                    <Link href="/dashboard/trabajos">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Volver a Trabajos</span>
                    </Link>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Detalle del Trabajo
                </h1>
                <Badge variant="secondary" className={`${statusColors[job.status]} text-white`}>{job.status}</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Descripción del Servicio</CardTitle>
                            <CardDescription>{job.category}</CardDescription>
                        </CardHeader>
                        <CardContent><p>{job.description}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Información del Cliente</CardTitle></CardHeader>
                        <CardContent>
                            <p><strong>{job.client.firstName} {job.client.lastName}</strong></p>
                            <p>{job.client.address}</p>
                            <p>{job.client.phone}</p>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                    <Card>
                        <CardHeader><CardTitle>Acciones</CardTitle></CardHeader>
                        <CardContent className="grid gap-2">
                            <Button size="sm" className="gap-1" onClick={handleWhatsAppClick}>
                                <MessageCircle className="h-3.5 w-3.5" />
                                Enviar WhatsApp (Cotización)
                            </Button>
                             {job.status === 'Pending' && (
                                <Button size="sm" variant="secondary" onClick={() => changeStatus('Approved')}>
                                    Aprobar Cotización (Manual)
                                </Button>
                            )}
                             {job.status === 'Approved' && (
                                <Button size="sm" variant="secondary" onClick={() => changeStatus('InProgress')}>
                                    Iniciar Trabajo (Pago Recibido)
                                </Button>
                            )}
                            {job.status === 'InProgress' && (
                                <Button size="sm" variant="secondary" onClick={() => changeStatus('Completed')}>
                                    Marcar como Completado
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader><CardTitle>Maestro Asignado</CardTitle></CardHeader>
                        <CardContent className="grid gap-4">
                            {job.assignedMaster ? (
                                <div>
                                    <p className="font-semibold">{job.assignedMaster.name}</p>
                                    <Button variant="outline" size="sm" className="mt-2" onClick={() => updateDoc(jobRef, { assignedMaster: null }).then(() => setJob(prev => prev ? { ...prev, assignedMaster: undefined } : null))}>
                                        Re-asignar
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                     <Select onValueChange={setSelectedMasterId} value={selectedMasterId || ''}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar Maestro" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masters.map(master => (
                                                <SelectItem key={master.id} value={master.id!}>
                                                    {master.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleAssignMaster} disabled={!selectedMasterId || isAssigning}>
                                        {isAssigning ? "Asignando..." : "Asignar Maestro"}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Finanzas</CardTitle></CardHeader>
                        <CardContent className="grid gap-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>${job.quoteSubtotal?.toFixed(2)}</span>
                            </div>
                            {job.quoteIncludesVat && (
                                 <div className="flex justify-between">
                                    <span>IVA (15%):</span>
                                    <span>${job.quoteVat?.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold border-t pt-2 mt-2">
                                <span>Total:</span>
                                <span>${job.quoteTotal?.toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}