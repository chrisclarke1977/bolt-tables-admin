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

const stats = [
  {
    label: 'Users',
    icon: Users,
    color: 'text-sky-500',
    bgColor: 'bg-sky-100',
  },
  {
    label: 'Products',
    icon: ShoppingBag,
    color: 'text-violet-500',
    bgColor: 'bg-violet-100',
  },
  {
    label: 'Posts',
    icon: FileText,
    color: 'text-pink-700',
    bgColor: 'bg-pink-100',
  },
  {
    label: 'Comments',
    icon: MessageSquare,
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  {
    label: 'Reactions',
    icon: Heart,
    color: 'text-rose-500',
    bgColor: 'bg-rose-100',
  },
  {
    label: 'Categories',
    icon: Tag,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100',
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  {
    label: 'Appointments',
    icon: Calendar,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  {
    label: 'Locations',
    icon: MapPin,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
];

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total {stat.label}
                </p>
                <h3 className="text-2xl font-bold">0</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}