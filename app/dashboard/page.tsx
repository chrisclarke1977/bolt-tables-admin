'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
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
} from 'lucide-react';
import { getStats, type Stats } from '@/lib/api';

const stats = [
  {
    label: 'Users',
    key: 'users',
    icon: Users,
    color: 'text-sky-500',
    bgColor: 'bg-sky-100',
  },
  {
    label: 'Products',
    key: 'products',
    icon: ShoppingBag,
    color: 'text-violet-500',
    bgColor: 'bg-violet-100',
  },
  {
    label: 'Posts',
    key: 'posts',
    icon: FileText,
    color: 'text-pink-700',
    bgColor: 'bg-pink-100',
  },
  {
    label: 'Comments',
    key: 'comments',
    icon: MessageSquare,
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  {
    label: 'Reactions',
    key: 'reactions',
    icon: Heart,
    color: 'text-rose-500',
    bgColor: 'bg-rose-100',
  },
  {
    label: 'Categories',
    key: 'categories',
    icon: Tag,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100',
  },
  {
    label: 'Orders',
    key: 'orders',
    icon: ShoppingCart,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  {
    label: 'Appointments',
    key: 'appointments',
    icon: Calendar,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  {
    label: 'Locations',
    key: 'locations',
    icon: MapPin,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
] as const;

export default function DashboardPage() {
  const [counts, setCounts] = useState<Stats>({
    users: 0,
    products: 0,
    posts: 0,
    comments: 0,
    reactions: 0,
    categories: 0,
    orders: 0,
    appointments: 0,
    locations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await getStats();
        if (data) {
          setCounts(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {stats.map((stat) => (
          <Card key={stat.key} className="p-4">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total {stat.label}
                </p>
                <h3 className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-16 animate-pulse bg-gray-200 rounded" />
                  ) : (
                    counts[stat.key]
                  )}
                </h3>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}