'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { generateMessageAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Send, Bot, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Job } from '@/lib/definitions';

const initialState = {
  message: '',
  error: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Bot className="mr-2 h-4 w-4" />
      {pending ? 'Generando...' : 'Generar Mensaje'}
    </Button>
  );
}

export function WhatsAppGenerator({ job }: { job: Job }) {
  const [state, formAction] = useFormState(generateMessageAction, initialState);
  const { toast } = useToast();

  const handleCopy = () => {
    if (state.message) {
      navigator.clipboard.writeText(state.message);
      toast({
        title: 'Copiado',
        description: 'Mensaje copiado al portapapeles.',
      });
    }
  };

  const handleSend = () => {
    if (state.message && job.client?.phone) {
      const phoneNumber = job.client.phone.replace(/[^0-9]/g, '');
      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(state.message)}`;
      window.open(url, '_blank');
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se puede enviar el mensaje. Verifique el número de teléfono del cliente.',
        });
    }
  };

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error de Generación',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  if (!job.client) {
    return <Card><CardHeader><CardTitle>Generador de Mensajes de WhatsApp</CardTitle></CardHeader><CardContent><p>Cargando datos del cliente...</p></CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generador de Mensajes de WhatsApp</CardTitle>
        <CardDescription>
          Use IA para generar mensajes profesionales para sus clientes.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <input type="hidden" name="clientName" value={`${job.client.firstName} ${job.client.lastName}`} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="repairStatus">Estado de la Reparación</Label>
                <Input id="repairStatus" name="repairStatus" defaultValue={job.status} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="pricingInformation">Información de Precios (Opcional)</Label>
                <Input id="pricingInformation" name="pricingInformation" placeholder={`Ej: El costo es $${(job.quoteAmount || 0).toFixed(2)}`} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additionalConsiderations">Consideraciones Adicionales (Opcional)</Label>
            <Input id="additionalConsiderations" name="additionalConsiderations" placeholder="Ej: El trabajo tomará 2 horas" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="generatedMessage">Mensaje Generado</Label>
            <Textarea
              id="generatedMessage"
              placeholder="El mensaje generado por IA aparecerá aquí..."
              readOnly
              value={state.message}
              className="h-32"
            />
          </div>
          {state.error && (
            <div className="text-destructive text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <p>{state.error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCopy} disabled={!state.message}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
            <Button type="button" variant="outline" onClick={handleSend} disabled={!state.message}>
              <Send className="mr-2 h-4 w-4" />
              Enviar
            </Button>
          </div>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
