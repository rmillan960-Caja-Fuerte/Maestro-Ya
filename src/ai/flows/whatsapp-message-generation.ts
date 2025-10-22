'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating WhatsApp messages to clients.
 *
 * It allows technicians to quickly update clients on the status of their repair, incorporating pricing
 * information and other considerations using AI-powered templates.
 *
 * - generateWhatsAppMessage - A function that generates a WhatsApp message.
 * - WhatsAppMessageInput - The input type for the generateWhatsAppMessage function.
 * - WhatsAppMessageOutput - The return type for the generateWhatsAppMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WhatsAppMessageInputSchema = z.object({
  clientName: z.string().describe('The name of the client.'),
  repairStatus: z.string().describe('The current status of the repair.'),
  pricingInformation: z.string().optional().describe('Optional pricing information.'),
  additionalConsiderations: z.string().optional().describe('Any additional considerations or notes for the client.'),
});

export type WhatsAppMessageInput = z.infer<typeof WhatsAppMessageInputSchema>;

const WhatsAppMessageOutputSchema = z.object({
  message: z.string().describe('The generated WhatsApp message.'),
});

export type WhatsAppMessageOutput = z.infer<typeof WhatsAppMessageOutputSchema>;

export async function generateWhatsAppMessage(input: WhatsAppMessageInput): Promise<WhatsAppMessageOutput> {
  return generateWhatsAppMessageFlow(input);
}

const whatsappMessagePrompt = ai.definePrompt({
  name: 'whatsappMessagePrompt',
  input: {schema: WhatsAppMessageInputSchema},
  output: {schema: WhatsAppMessageOutputSchema},
  prompt: `You are an AI assistant helping technicians generate WhatsApp messages for their clients.\n\n  Based on the information provided, create a concise and informative message in Spanish.\n  Consider including the repair status, pricing information (if available), and any additional considerations.\n  The message should be friendly and professional.\n\n  Client Name: {{{clientName}}}\n  Repair Status: {{{repairStatus}}}\n  Pricing Information: {{{pricingInformation}}}\n  Additional Considerations: {{{additionalConsiderations}}}\n\n  Generated Message:`, // Ensure the output is suitable for WhatsApp.
});

const generateWhatsAppMessageFlow = ai.defineFlow(
  {
    name: 'generateWhatsAppMessageFlow',
    inputSchema: WhatsAppMessageInputSchema,
    outputSchema: WhatsAppMessageOutputSchema,
  },
  async input => {
    const {output} = await whatsappMessagePrompt(input);
    return output!;
  }
);
