'use client';

import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useFirebase, useUser } from "@/firebase";
import { ServiceRequest, ServiceRequestStatus } from "@/lib/definitions";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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

export default function MaestroDashboard() {
    const { firestore } = useFirebase();
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    const [assignedJobs, setAssignedJobs] = useState<ServiceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isUserLoading || !user) {
            return;
        }

        const fetchAssignedJobs = async () => {
            setIsLoading(true);
            try {
                const serviceRequestsRef = collection(firestore, "serviceRequests");
                const q = query(serviceRequestsRef, where("assignedTechnicianId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const jobs = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                } as ServiceRequest));
                setAssignedJobs(jobs);
            } catch (error) {
                console.error("Error fetching assigned jobs: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssignedJobs();
    }, [user, isUserLoading, firestore]);

    const handleViewDetails = (jobId: string) => {
        // Futuro: router.push(`/dashboard/maestro/${jobId}`);
        alert(`Navegar a los detalles del trabajo ${jobId}. ¡Funcionalidad futura!`)
    };

    if (isLoading || isUserLoading) {
        return <div>Cargando trabajos asignados...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mis Trabajos Asignados</CardTitle>
                <CardDescription>
                    Esta es la lista de trabajos que tienes pendientes o en progreso.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignedJobs.length > 0 ? (
                            assignedJobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell>
                                        {job.client.firstName} {job.client.lastName}
                                        <div className="text-sm text-muted-foreground">{job.client.address}</div>
                                    </TableCell>
                                    <TableCell>{job.category}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={`${statusColors[job.status]} text-white`}>
                                            {job.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(job.id!)}>
                                            Ver Detalles y Fotos
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    No tienes trabajos asignados por el momento.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
