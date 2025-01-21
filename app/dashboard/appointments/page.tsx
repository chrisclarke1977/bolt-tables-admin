'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar, Search, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  user_id: string;
  location_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  locations: {
    name: string;
    address: string;
    city: string;
  };
  users: {
    full_name: string;
    email: string;
  };
}

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
}

const STATUS_OPTIONS = [
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no-show',
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    user_id: '',
    location_id: '',
    start_time: '',
    end_time: '',
    status: 'scheduled',
    notes: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
    fetchLocations();
    fetchUsers();

    const subscription = supabase
      .channel('appointments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          locations (
            name,
            address,
            city
          ),
          users (
            full_name,
            email
          )
        `)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching appointments',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, address, city')
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching locations',
        description: error.message,
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching users',
        description: error.message,
      });
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([newAppointment]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Appointment created successfully',
      });

      setIsAddDialogOpen(false);
      setNewAppointment({
        user_id: '',
        location_id: '',
        start_time: '',
        end_time: '',
        status: 'scheduled',
        notes: '',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating appointment',
        description: error.message,
      });
    }
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          location_id: selectedAppointment.location_id,
          start_time: selectedAppointment.start_time,
          end_time: selectedAppointment.end_time,
          status: selectedAppointment.status,
          notes: selectedAppointment.notes,
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Appointment updated successfully',
      });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating appointment',
        description: error.message,
      });
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Appointment deleted successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting appointment',
        description: error.message,
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      'no-show': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredAppointments = appointments.filter(appointment =>
    appointment.users.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.locations.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appointment.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Add Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="user" className="text-sm font-medium">
                  User
                </label>
                <Select
                  value={newAppointment.user_id}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, user_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Location
                </label>
                <Select
                  value={newAppointment.location_id}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, location_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} - {location.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="start_time" className="text-sm font-medium">
                    Start Time
                  </label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={newAppointment.start_time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="end_time" className="text-sm font-medium">
                    End Time
                  </label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={newAppointment.end_time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={newAppointment.status}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, status: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="notes"
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Appointment</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search appointments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.users.full_name}</TableCell>
                  <TableCell>
                    {appointment.locations.name}
                    <br />
                    <span className="text-sm text-muted-foreground">
                      {appointment.locations.city}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(appointment.start_time).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(appointment.end_time).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>{appointment.notes || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAppointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No appointments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <form onSubmit={handleUpdateAppointment} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit_location" className="text-sm font-medium">
                  Location
                </label>
                <Select
                  value={selectedAppointment.location_id}
                  onValueChange={(value) => setSelectedAppointment({ ...selectedAppointment, location_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} - {location.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit_start_time" className="text-sm font-medium">
                    Start Time
                  </label>
                  <Input
                    id="edit_start_time"
                    type="datetime-local"
                    value={new Date(selectedAppointment.start_time).toISOString().slice(0, 16)}
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit_end_time" className="text-sm font-medium">
                    End Time
                  </label>
                  <Input
                    id="edit_end_time"
                    type="datetime-local"
                    value={new Date(selectedAppointment.end_time).toISOString().slice(0, 16)}
                    onChange={(e) => setSelectedAppointment({ ...selectedAppointment, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit_status" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={selectedAppointment.status}
                  onValueChange={(value) => setSelectedAppointment({ ...selectedAppointment, status: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit_notes" className="text-sm font-medium">
                  Notes
                </label>
                <Textarea
                  id="edit_notes"
                  value={selectedAppointment.notes || ''}
                  onChange={(e) => setSelectedAppointment({ ...selectedAppointment, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}