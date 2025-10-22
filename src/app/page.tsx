'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);
  
  if (isUserLoading || user) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="loader">Cargando...</div>
        </div>
    )
  }

  const handleAuthAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth) {
      if (isLogin) {
        initiateEmailSignIn(auth, email, password);
        // No need to push here, useEffect will handle it
      } else {
        initiateEmailSignUp(auth, email, password);
        toast({
          title: '¡Cuenta Creada!',
          description: "Revisa tu correo para verificar tu cuenta y luego inicia sesión.",
        });
        setIsLogin(true); // Switch to login view after signup
      }
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold font-headline flex items-center justify-center gap-2">
              <Wrench className="h-8 w-8 text-primary" />
              ServiYa
            </h1>
            <p className="text-balance text-muted-foreground">
              {isLogin ? 'Ingrese sus credenciales para acceder' : 'Cree una nueva cuenta para empezar'}
            </p>
          </div>
          <form onSubmit={handleAuthAction}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  {isLogin && (
                    <Link
                      href="#"
                      className="ml-auto inline-block text-sm underline"
                    >
                      ¿Olvidó su contraseña?
                    </Link>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
            <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="underline">
              {isLogin ? 'Regístrate' : 'Inicia Sesión'}
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/seed/serviya-login/1920/1080"
          alt="Image"
          data-ai-hint="construction tools"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
