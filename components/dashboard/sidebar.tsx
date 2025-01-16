'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  ShoppingBag,
  FileText,
  MessageSquare,
  Heart,
  Tag,
  ShoppingCart,
  Calendar,
  MapPin,
  Layout,
} from 'lucide-react';

const routes = [
  {
    label: 'Users',
    icon: Users,
    href: '/dashboard/users',
    color: 'text-sky-500',
  },
  {
    label: 'Products',
    icon: ShoppingBag,
    href: '/dashboard/products',
    color: 'text-violet-500',
  },
  {
    label: 'Posts',
    icon: FileText,
    href: '/dashboard/posts',
    color: 'text-pink-700',
  },
  {
    label: 'Comments',
    icon: MessageSquare,
    href: '/dashboard/comments',
    color: 'text-orange-700',
  },
  {
    label: 'Reactions',
    icon: Heart,
    href: '/dashboard/reactions',
    color: 'text-rose-500',
  },
  {
    label: 'Categories',
    icon: Tag,
    href: '/dashboard/categories',
    color: 'text-emerald-500',
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    href: '/dashboard/orders',
    color: 'text-green-700',
  },
  {
    label: 'Appointments',
    icon: Calendar,
    href: '/dashboard/appointments',
    color: 'text-blue-700',
  },
  {
    label: 'Locations',
    icon: MapPin,
    href: '/dashboard/locations',
    color: 'text-yellow-700',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <Layout className="h-8 w-8 mr-4" />
          <h1 className="text-2xl font-bold">
            Admin
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition',
                pathname === route.href ? 'text-white bg-white/10' : 'text-zinc-400',
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}