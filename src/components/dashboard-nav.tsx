'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Home,
  Wrench,
  FileText,
  Contact,
  LogOut,
  Settings,
  Hammer, // <-- IMPORTADO
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/trabajos', label: 'Trabajos', icon: Wrench },
  { href: '/dashboard/cotizaciones', label: 'Cotizaciones', icon: FileText },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Contact },
  { href: '/dashboard/equipo', label: 'Equipo', icon: Users },
  { href: '/dashboard/maestro', label: 'Portal Maestro', icon: Hammer }, // <-- AÑADIDO
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            pathname === href && 'bg-muted text-primary'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function MobileNav() {
    const pathname = usePathname();
    return (
        <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Wrench className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">ServiYa</span>
            </Link>
            {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                key={href}
                href={href}
                className={cn(
                    'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                    pathname === href && 'text-foreground'
                )}
                >
                    <Icon className="h-5 w-5" />
                    {label}
                </Link>
            ))}
      </nav>
    )
}

export function SettingsNav() {
    return (
        <nav className="mt-auto grid items-start px-2 text-sm font-medium lg:px-4">
            <Link
                href="#"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
            >
                <Settings className="h-4 w-4" />
                Configuración
            </Link>
        </nav>
    )
}
