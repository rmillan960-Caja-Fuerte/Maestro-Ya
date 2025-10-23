'use client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/firebase";
import { ServiceRequest } from "@/lib/definitions";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

export default function JobDetailsPage() {
    const { id } = useParams();
    const [job, setJob] = useState<ServiceRequest | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchJob = async () => {
                setIsLoading(true);
                try {
                    const docRef = doc(db, "serviceRequests", id as string);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setJob({ id: docSnap.id, ...docSnap.data() } as ServiceRequest);
                    }
                } catch (error) {
                    console.error("Error fetching job details:", error);
                }
                setIsLoading(false);
            };
            fetchJob();
        }
    }, [id]);

    if (isLoading) {
        return <div className="p-4">Cargando detalles del trabajo...</div>;
    }

    if (!job) {
        return <div className="p-4">No se encontró el trabajo.</div>;
    }

    return (
        <div className="p-4 md:p-6">
            <div className="flex items-center gap-4 mb-4">
                <Link href="/dashboard/trabajos">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-xl md:text-2xl font-bold">Detalles del Trabajo</h1>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                    </Button>
                    <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{job.category}</CardTitle>
                            <CardDescription>
                                {job.client.firstName} {job.client.lastName} - {job.client.address}
                            </CardDescription>
                        </div>
                        <Badge className={`${statusColors[job.status]} text-white`}>{job.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div>
                        <h3 className="font-semibold mb-2">Descripción del Problema</h3>
                        <p>{job.description}</p>
                    </div>
                    {job.assignedMaster && (
                        <div>
                            <h3 className="font-semibold mb-2">Maestro Asignado</h3>
                            <p>{job.assignedMaster.name}</p>
                        </div>
                    )}
                    {job.quoteTotal && (
                         <div>
                            <h3 className="font-semibold mb-2">Monto de la Cotización</h3>
                            <p>${job.quoteTotal.toFixed(2)}</p>
                        </div>
                    )}
                    {job.images && job.images.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2">Imágenes</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {job.images.map((url, index) => (
                                    <img key={index} src={url} alt={`Imagen del trabajo ${index + 1}`} className="rounded-lg object-cover aspect-square" />
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
