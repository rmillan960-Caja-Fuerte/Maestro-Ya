
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

        revalidatePath('/dashboard/cotizaciones');

        return { success: true, message: `Estado actualizado a ${newStatus}` };
    } catch (error) {
        console.error('Error actualizando el estado de la solicitud de servicio:', error);
        return { success: false, message: 'Ocurrió un error al actualizar el estado.' };
    }
}

/**
 * Generates a WhatsApp URL with a pre-filled quote message.
 * @param quoteId The ID of the quote to generate the message for.
 * @param serviceRequestId The ID of the related service request.
 * @returns A promise that resolves with an object containing the WhatsApp URL or an error message.
 */
export async function generateQuoteWhatsAppUrl(quoteId: string, serviceRequestId: string) {
    if (!quoteId || !serviceRequestId) {
        return { success: false, message: 'ID de cotización y de servicio son requeridos.' };
    }

    try {
        // Fetch Service Request and Client data
        const serviceRequestRef = firestore.collection('serviceRequests').doc(serviceRequestId);
        const serviceRequestSnap = await serviceRequestRef.get();
        if (!serviceRequestSnap.exists) {
            return { success: false, message: 'No se encontró la solicitud de servicio.' };
        }
        const serviceRequestData = serviceRequestSnap.data()!;

        const clientRef = serviceRequestData.clientRef;
        const clientSnap = await clientRef.get();
        if (!clientSnap.exists) {
            return { success: false, message: 'No se encontró el cliente.' };
        }
        const clientData = clientSnap.data()!;
        const clientPhone = clientData.phone;
        const clientName = `${clientData.firstName}`.split(' ')[0]; // Get first name

        // Fetch Quotation data
        const quoteRef = serviceRequestRef.collection('quotations').doc(quoteId);
        const quoteSnap = await quoteRef.get();
        if (!quoteSnap.exists) {
            return { success: false, message: 'No se encontró la cotización.' };
        }
        const quoteData = quoteSnap.data()!;
        const totalAmount = quoteData.amount;
        const advancePayment = totalAmount * 0.30;

        // Construct the message
        const message = `¡Hola ${clientName}! Te saluda el equipo de Maestro-Ya.

` +
                        `Te enviamos la cotización para el trabajo solicitado:

` +
                        `Descripción: ${serviceRequestData.description}
` +
                        `Monto Total: S/ ${totalAmount.toFixed(2)}

` +
                        `Para iniciar el trabajo, requerimos un adelanto del 30% (S/ ${advancePayment.toFixed(2)}).

` +
                        `Puedes realizar el pago a través de Yape, Plin o transferencia bancaria. ` +
                        `Por favor, envíanos la constancia de pago para programar el inicio del trabajo.

` +
                        `Quedamos atentos a tu confirmación.

` +
                        `Saludos,
` +
                        `El equipo de Maestro-Ya`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/51${clientPhone}?text=${encodedMessage}`;

        return { success: true, url: whatsappUrl };

    } catch (error) {
        console.error('Error generando la URL de WhatsApp:', error);
        return { success: false, message: 'Ocurrió un error al generar el mensaje.' };
    }
}
