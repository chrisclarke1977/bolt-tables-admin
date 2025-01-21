'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { MapPin, Search, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  created_at: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLocations();

    const subscription = supabase
      .channel('locations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, () => {
        fetchLocations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLocations(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching locations',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('locations')
        .insert([newLocation]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Location created successfully',
      });

      setIsAddDialogOpen(false);
      setNewLocation({
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating location',
        description: error.message,
      });
    }
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;

    try {
      const { error } = await supabase
        .from('locations')
        .update({
          name: selectedLocation.name,
          address: selectedLocation.address,
          city: selectedLocation.city,
          state: selectedLocation.state,
          country: selectedLocation.country,
          postal_code: selectedLocation.postal_code,
        })
        .eq('id', selectedLocation.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Location updated successfully',
      });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating location',
        description: error.message,
      });
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Location deleted successfully',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error deleting location',
        description: error.message,
      });
    }
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Locations</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <MapPin className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddLocation} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Address
                </label>
                <Input
                  id="address"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    City
                  </label>
                  <Input
                    id="city"
                    value={newLocation.city}
                    onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium">
                    State
                  </label>
                  <Input
                    id="state"
                    value={newLocation.state}
                    onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium">
                    Country
                  </label>
                  <Input
                    id="country"
                    value={newLocation.country}
                    onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="postal_code" className="text-sm font-medium">
                    Postal Code
                  </label>
                  <Input
                    id="postal_code"
                    value={newLocation.postal_code}
                    onChange={(e) => setNewLocation({ ...newLocation, postal_code: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Location</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search locations..."
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
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Postal Code</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>{location.name}</TableCell>
                  <TableCell>{location.address}</TableCell>
                  <TableCell>{location.city}</TableCell>
                  <TableCell>{location.state}</TableCell>
                  <TableCell>{location.country}</TableCell>
                  <TableCell>{location.postal_code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedLocation(location);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLocation(location.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLocations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No locations found
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
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          {selectedLocation && (
            <form onSubmit={handleUpdateLocation} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit_name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="edit_name"
                  value={selectedLocation.name}
                  onChange={(e) => setSelectedLocation({ ...selectedLocation, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit_address" className="text-sm font-medium">
                  Address
                </label>
                <Input
                  id="edit_address"
                  value={selectedLocation.address}
                  onChange={(e) => setSelectedLocation({ ...selectedLocation, address: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit_city" className="text-sm font-medium">
                    City
                  </label>
                  <Input
                    id="edit_city"
                    value={selectedLocation.city}
                    onChange={(e) => setSelectedLocation({ ...selectedLocation, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit_state" className="text-sm font-medium">
                    State
                  </label>
                  <Input
                    id="edit_state"
                    value={selectedLocation.state}
                    onChange={(e) => setSelectedLocation({ ...selectedLocation, state: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit_country" className="text-sm font-medium">
                    Country
                  </label>
                  <Input
                    id="edit_country"
                    value={selectedLocation.country}
                    onChange={(e) => setSelectedLocation({ ...selectedLocation, country: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit_postal_code" className="text-sm font-medium">
                    Postal Code
                  </label>
                  <Input
                    id="edit_postal_code"
                    value={selectedLocation.postal_code}
                    onChange={(e) => setSelectedLocation({ ...selectedLocation, postal_code: e.target.value })}
                    required
                  />
                </div>
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