import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  useGetPricing,
  useSetShirtPrice,
  useSetPantPrice,
  useSetDressPrice,
  useGetAllAreas,
  useSetAreaPrice,
} from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Tag, Loader2, Pencil } from 'lucide-react';
import type { Area } from '../backend';

function PriceEditor({
  label,
  currentPrice,
  onSave,
  isPending,
}: {
  label: string;
  currentPrice: number;
  onSave: (price: bigint) => Promise<void>;
  isPending: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentPrice.toString());

  useEffect(() => {
    setValue(currentPrice.toString());
  }, [currentPrice]);

  const handleSave = async () => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    await onSave(BigInt(num));
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
        {editing ? (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">₹</span>
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-8 w-24 text-sm"
              min={0}
            />
          </div>
        ) : (
          <p className="text-2xl font-extrabold text-foreground">₹{currentPrice}</p>
        )}
      </div>
      {editing ? (
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={isPending} className="h-8">
            {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="h-8">
            Cancel
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-8 gap-1.5">
          <Pencil className="w-3 h-3" />
          Edit
        </Button>
      )}
    </div>
  );
}

function AreaPriceDialog({
  area,
  open,
  onClose,
}: {
  area: Area | null;
  open: boolean;
  onClose: () => void;
}) {
  const setAreaPrice = useSetAreaPrice();
  const [shirt, setShirt] = useState('');
  const [pant, setPant] = useState('');
  const [dress, setDress] = useState('');

  useEffect(() => {
    if (area) {
      setShirt(Number(area.shirtPrice).toString());
      setPant(Number(area.pantPrice).toString());
      setDress(Number(area.dressPrice).toString());
    }
  }, [area]);

  const handleSave = async () => {
    if (!area) return;
    const s = parseInt(shirt, 10);
    const p = parseInt(pant, 10);
    const d = parseInt(dress, 10);
    if (isNaN(s) || isNaN(p) || isNaN(d) || s < 0 || p < 0 || d < 0) {
      toast.error('Please enter valid prices');
      return;
    }
    try {
      await setAreaPrice.mutateAsync({
        areaId: area.id,
        shirtPrice: BigInt(s),
        pantPrice: BigInt(p),
        dressPrice: BigInt(d),
      });
      toast.success(`Prices updated for ${area.name}`);
      onClose();
    } catch {
      toast.error('Failed to update area prices');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Area Pricing — {area?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs mb-1 block">Shirt Price (₹)</Label>
            <Input type="number" value={shirt} onChange={(e) => setShirt(e.target.value)} min={0} />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Pant Price (₹)</Label>
            <Input type="number" value={pant} onChange={(e) => setPant(e.target.value)} min={0} />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Dress Price (₹)</Label>
            <Input type="number" value={dress} onChange={(e) => setDress(e.target.value)} min={0} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={setAreaPrice.isPending}>
            {setAreaPrice.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Prices'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PricingContent() {
  const { data: pricing, isLoading: pricingLoading } = useGetPricing();
  const { data: areas, isLoading: areasLoading } = useGetAllAreas();
  const setShirtPrice = useSetShirtPrice();
  const setPantPrice = useSetPantPrice();
  const setDressPrice = useSetDressPrice();
  const [editArea, setEditArea] = useState<Area | null>(null);

  const handleShirtSave = async (price: bigint) => {
    try {
      await setShirtPrice.mutateAsync(price);
      toast.success('Shirt price updated');
    } catch {
      toast.error('Failed to update shirt price');
    }
  };

  const handlePantSave = async (price: bigint) => {
    try {
      await setPantPrice.mutateAsync(price);
      toast.success('Pant price updated');
    } catch {
      toast.error('Failed to update pant price');
    }
  };

  const handleDressSave = async (price: bigint) => {
    try {
      await setDressPrice.mutateAsync(price);
      toast.success('Dress price updated');
    } catch {
      toast.error('Failed to update dress price');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Pricing</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage default and area-specific prices</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Default Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {pricingLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : pricing ? (
            <>
              <PriceEditor
                label="Shirt"
                currentPrice={Number(pricing.shirtPrice)}
                onSave={handleShirtSave}
                isPending={setShirtPrice.isPending}
              />
              <div className="border-t border-border" />
              <PriceEditor
                label="Pant"
                currentPrice={Number(pricing.pantPrice)}
                onSave={handlePantSave}
                isPending={setPantPrice.isPending}
              />
              <div className="border-t border-border" />
              <PriceEditor
                label="Dress"
                currentPrice={Number(pricing.dressPrice)}
                onSave={handleDressSave}
                isPending={setDressPrice.isPending}
              />
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Area-Specific Pricing</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {areasLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : !areas || areas.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              No areas configured yet. Add areas in the Areas section.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Area</TableHead>
                  <TableHead>Shirt</TableHead>
                  <TableHead>Pant</TableHead>
                  <TableHead>Dress</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areas.map((area) => (
                  <TableRow key={area.id.toString()} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-medium">{area.name}</TableCell>
                    <TableCell>₹{Number(area.shirtPrice)}</TableCell>
                    <TableCell>₹{Number(area.pantPrice)}</TableCell>
                    <TableCell>₹{Number(area.dressPrice)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => setEditArea(area)}
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AreaPriceDialog
        area={editArea}
        open={editArea !== null}
        onClose={() => setEditArea(null)}
      />
    </div>
  );
}

export default function AdminPricingPage() {
  return (
    <AdminLayout>
      <PricingContent />
    </AdminLayout>
  );
}
