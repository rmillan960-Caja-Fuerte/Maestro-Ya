
import { ServiceRequest } from "@/lib/definitions";

// Esta es una función simulada que en un futuro usará la IA de Gemini.
// Por ahora, generará mensajes basados en plantillas.

const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "[MONTO NO ESPECIFICADO]";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export const generateWhatsAppMessage = (job: ServiceRequest): string => {
    const clientName = `${job.client.firstName}`;
    const quoteAmount = formatCurrency(job.quoteAmount);
    const initialPayment = formatCurrency(job.quoteAmount ? job.quoteAmount * 0.3 : undefined);
    const finalPayment = formatCurrency(job.quoteAmount ? job.quoteAmount * 0.7 : undefined);

    let message = ``;

    switch (job.status) {
        case 'Quote':
        case 'Pending':
            message = `Estimado(a) ${clientName}, adjunto la cotización para el servicio de *${job.category}* solicitado:\n\n` +
                      `*Descripción:* ${job.description}\n` +
                      `*Monto Total:* ${quoteAmount}\n\n` +
                      `Para iniciar el trabajo, se requiere un pago inicial del 30% (${initialPayment}). ` +
                      `Puede confirmar su aceptación respondiendo a este mensaje.\n\n` +
                      `Gracias por su confianza,\nEl equipo de MaestroYa`;
            break;

        case 'Approved':
             message = `¡Buenas noticias, ${clientName}!\n\n` +
                      `Hemos recibido la aprobación para su servicio de *${job.category}*. ` +
                      `El siguiente paso es realizar el pago inicial de ${initialPayment} para que nuestro técnico pueda comenzar.\n\n` +
                      `Puede realizar el pago a través de [MÉTODO DE PAGO]. Por favor, envíenos el comprobante una vez realizado.\n\n` +
                      `¡Estamos listos para empezar!`;
            break;

        case 'Completed':
            message = `¡Hola, ${clientName}!\n\n` +
                      `Nos complace informarle que el trabajo de *${job.category}* ha sido completado exitosamente. ` +
                      `Adjuntaremos fotos del resultado final en breve.\n\n` +
                      `El monto restante a pagar es de ${finalPayment}. ` +
                      `Agradecemos su pronta cancelación para cerrar formalmente el servicio.\n\n` +
                      `Recuerde que su trabajo cuenta con una garantía de 90 días. ¡Gracias por elegirnos!`;
            break;
        
        default:
            message = `Hola ${clientName}, este es un mensaje sobre su servicio de ${job.category}.`;
            break;
    }

    // Codificar el mensaje para la URL de WhatsApp
    return encodeURIComponent(message);
}
