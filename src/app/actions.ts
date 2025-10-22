'use server';

import {
  generateWhatsAppMessage,
  WhatsAppMessageInput,
  WhatsAppMessageOutput,
} from '@/ai/flows/whatsapp-message-generation';
import { z } from 'zod';

const MessageGenerationSchema = z.object({
  clientName: z.string(),
  repairStatus: z.string(),
  pricingInformation: z.string().optional(),
  additionalConsiderations: z.string().optional(),
});

type State = {
  message?: string;
  error?: string;
};

export async function generateMessageAction(
  prevState: State,
  formData: FormData,
): Promise<State> {
  const validatedFields = MessageGenerationSchema.safeParse({
    clientName: formData.get('clientName'),
    repairStatus: formData.get('repairStatus'),
    pricingInformation: formData.get('pricingInformation'),
    additionalConsiderations: formData.get('additionalConsiderations'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Datos inválidos. Por favor, verifique la información.',
    };
  }

  try {
    const result: WhatsAppMessageOutput = await generateWhatsAppMessage(
      validatedFields.data as WhatsAppMessageInput,
    );
    return { message: result.message };
  } catch (e) {
    console.error(e);
    return { error: 'No se pudo generar el mensaje. Inténtelo de nuevo.' };
  }
}
