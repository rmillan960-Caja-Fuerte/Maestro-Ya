
'use server';

import { firestore } from '@/firebase-admin';
import { revalidatePath } from 'next/cache';

/**
 * Updates the status of a service request in Firestore.
 * @param serviceRequestId The ID of the service request to update.
 * @param newStatus The new status to set.
 * @returns A promise that resolves with an object indicating success or failure.
 */
export async function updateServiceRequestStatus(serviceRequestId: string, newStatus: 'Aprobado' | 'Cancelado') {
    if (!serviceRequestId || !newStatus) {
        return { success: false, message: 'ID de solicitud de servicio y nuevo estado son requeridos.' };
    }

    try {
        const serviceRequestRef = firestore.collection('serviceRequests').doc(serviceRequestId);
        
        await serviceRequestRef.update({
            status: newStatus,
            updatedAt: new Date().toISOString(),
        });

        // Revalidate the path to ensure the UI updates with the new status
        revalidatePath('/dashboard/cotizaciones');

        return { success: true, message: `Estado actualizado a ${newStatus}` };
    } catch (error) {
        console.error('Error actualizando el estado de la solicitud de servicio:', error);
        // It's better not to expose detailed error messages to the client
        return { success: false, message: 'Ocurrió un error al actualizar el estado.' };
    }
}
