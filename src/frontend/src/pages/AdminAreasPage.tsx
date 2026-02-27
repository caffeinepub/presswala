import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  useGetAllAreas,
  useAddArea,
  useDisableArea,
  useEnableArea,
  useAssignShopToArea,
  useGetAllShops,
} from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { MapPin, Plus, Loader2, ToggleLeft, ToggleRight, Link } from 'lucide-react';
import { ShopStatus } from '../backend';

function AreasContent() {
  const { data: areas, isLoading: areasLoading } = useGetAllAreas();
  const { data: shops } = useGetAllShops();
  const addArea = useAddArea();
  const disableArea = useDisableArea();
  const enableArea = useEnableArea();
  const assignShopToArea = useAssignShopToArea();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [toggleId, setToggleId] = useState<string | null>(null);

  const [assignAreaId, setAssignAreaId] = useState('');
  const [assignShopId, setAssignShopId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const activeShops = shops?.filter((s) => s.status === ShopStatus.active) ?? [];

  const handleAddArea = async () => {
    if (!name.trim() || !city.trim() || !pincode.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await addArea.mutateAsync({ name: name.trim(), city: city.trim(), pincode: pincode.trim() });
      toast.success(`Area "${name}" added successfully`);
      setName('');
      setCity('');
      setPincode('');
    } catch {
      toast.error('Failed to add area');
    }
  };

  const handleToggle = async (areaId: bigint, isActive: boolean) => {
    const id = areaId.toString();
    setToggleId(id);
    try {
      if (isActive) {
        await disableArea.mutateAsync(areaId);
        toast.success('Area disabled');
      } else {
        await enableArea.mutateAsync(areaId);
        toast.success('Area enabled');
      }
    } catch {
      toast.error('Failed to update area status');
    } finally {
      setToggleId(null);
    }
  };

  const handleAssign = async () => {
    if (!assignAreaId || !assignShopId) {
      toast.error('Please select both area and shop');
      return;
    }
    setAssigning(true);
    try {
      await assignShopToArea.mutateAsync({
        shopId: BigInt(assignShopId),
        areaId: BigInt(assignAreaId),
      });
      toast.success('Shop assigned to area successfully');
      setAssignAreaId('');
      setAssignShopId('');
    } catch {
      toast.error('Failed to assign shop to area');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Areas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage service zones and shop assignments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Area Form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Add New Area
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Area Name</Label>
              <Input
                placeholder="e.g. Andheri West"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">City</Label>
              <Input
                placeholder="e.g. Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Pincode</Label>
              <Input
                placeholder="e.g. 400053"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
              />
            </div>
            <Button
              onClick={handleAddArea}
              disabled={addArea.isPending}
              className="w-full"
            >
              {addArea.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Adding...</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" />Add Area</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Assign Shop to Area */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Link className="w-4 h-4 text-primary" />
              Assign Shop to Area
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Select Area</Label>
              <Select value={assignAreaId} onValueChange={setAssignAreaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose area..." />
                </SelectTrigger>
                <SelectContent>
                  {areas?.map((area) => (
                    <SelectItem key={area.id.toString()} value={area.id.toString()}>
                      {area.name} — {area.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Select Shop</Label>
              <Select value={assignShopId} onValueChange={setAssignShopId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose shop..." />
                </SelectTrigger>
                <SelectContent>
                  {activeShops.map((shop) => (
                    <SelectItem key={shop.id.toString()} value={shop.id.toString()}>
                      {shop.shopName} — {shop.ownerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAssign}
              disabled={assigning || !assignAreaId || !assignShopId}
              className="w-full"
              variant="outline"
            >
              {assigning ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Assigning...</>
              ) : (
                <><Link className="w-4 h-4 mr-2" />Assign Shop</>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Areas Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            All Areas ({areas?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {areasLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : !areas || areas.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No areas added yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Pincode</TableHead>
                  <TableHead>Shops</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areas.map((area) => {
                  const isToggling = toggleId === area.id.toString();
                  return (
                    <TableRow key={area.id.toString()} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-medium">{area.name}</TableCell>
                      <TableCell className="text-muted-foreground">{area.city}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{area.pincode}</TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{area.assignedShopIds.length}</span>
                      </TableCell>
                      <TableCell>
                        {area.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs hover:bg-emerald-100">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => handleToggle(area.id, area.isActive)}
                          disabled={isToggling}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : area.isActive ? (
                            <><ToggleRight className="w-3 h-3" />Disable</>
                          ) : (
                            <><ToggleLeft className="w-3 h-3" />Enable</>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminAreasPage() {
  return (
    <AdminLayout>
      <AreasContent />
    </AdminLayout>
  );
}
