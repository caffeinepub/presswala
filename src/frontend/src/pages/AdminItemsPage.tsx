import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
  useGetAllClothingItems,
  useAddClothingItem,
  useUpdateClothingItem,
  useDeleteClothingItem,
  useEnableClothingItem,
  useDisableClothingItem,
} from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Shirt,
  Loader2,
  Tag,
} from 'lucide-react';
import { formatDate } from '../lib/appUtils';
import type { ClothingItem } from '../backend';

// ── Add / Edit Dialog ─────────────────────────────────────────────────────────

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: { name: string; price: number };
  onSubmit: (name: string, price: number) => Promise<void>;
  title: string;
  description: string;
}

function ItemFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  title,
  description,
}: ItemFormDialogProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [price, setPrice] = useState(initial?.price?.toString() ?? '');
  const [saving, setSaving] = useState(false);

  // Sync fields when dialog opens with new initial values
  const handleOpenChange = (o: boolean) => {
    if (o) {
      setName(initial?.name ?? '');
      setPrice(initial?.price?.toString() ?? '');
    }
    onOpenChange(o);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedPrice = parseInt(price);
    if (!trimmedName || isNaN(parsedPrice) || parsedPrice <= 0) return;

    setSaving(true);
    try {
      await onSubmit(trimmedName, parsedPrice);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const isValid = name.trim().length > 0 && parseInt(price) > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              placeholder="e.g. Saree, Blazer, Kurta..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-price">Price per Item (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <Input
                id="item-price"
                type="number"
                min={1}
                max={9999}
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Content ──────────────────────────────────────────────────────────────

function AdminItemsContent() {
  const { data: items, isLoading } = useGetAllClothingItems();
  const addItem = useAddClothingItem();
  const updateItem = useUpdateClothingItem();
  const deleteItem = useDeleteClothingItem();
  const enableItem = useEnableClothingItem();
  const disableItem = useDisableClothingItem();

  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ClothingItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClothingItem | null>(null);
  const [togglingId, setTogglingId] = useState<bigint | null>(null);

  const handleAdd = async (name: string, price: number) => {
    try {
      await addItem.mutateAsync({ name, pricePerItem: BigInt(price) });
      toast.success(`"${name}" added to catalog`);
    } catch {
      toast.error('Failed to add item');
      throw new Error('Failed to add item');
    }
  };

  const handleUpdate = async (name: string, price: number) => {
    if (!editItem) return;
    try {
      await updateItem.mutateAsync({
        itemId: editItem.id,
        name,
        pricePerItem: BigInt(price),
      });
      toast.success(`"${name}" updated`);
    } catch {
      toast.error('Failed to update item');
      throw new Error('Failed to update item');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const handleToggle = async (item: ClothingItem) => {
    setTogglingId(item.id);
    try {
      if (item.isActive) {
        await disableItem.mutateAsync(item.id);
        toast.success(`"${item.name}" disabled`);
      } else {
        await enableItem.mutateAsync(item.id);
        toast.success(`"${item.name}" enabled`);
      }
    } catch {
      toast.error('Failed to update item status');
    } finally {
      setTogglingId(null);
    }
  };

  const activeCount = items?.filter((i) => i.isActive).length ?? 0;
  const totalCount = items?.length ?? 0;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Item Catalog</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage clothing items and their ironing prices
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {/* Stats row */}
      {!isLoading && (
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 text-sm">
            <Tag className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">{totalCount}</span>
            <span className="text-muted-foreground">total items</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-sm">
            <Eye className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{activeCount}</span>
            <span className="text-emerald-600/70 dark:text-emerald-500">active</span>
          </div>
        </div>
      )}

      {/* Table card */}
      <Card>
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-base text-foreground">All Items</h2>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : !items || items.length === 0 ? (
          /* Empty state */
          <div className="py-16 flex flex-col items-center gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <Shirt className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1">No items yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Add clothing items like Saree, Blazer, Kurta etc. to build your ironing price catalog.
              </p>
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Item
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Added On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...items]
                .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
                .map((item) => (
                  <TableRow key={item.id.toString()} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center shrink-0">
                          <Shirt className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="font-semibold text-sm text-foreground">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-primary text-sm">
                        ₹{Number(item.pricePerItem).toLocaleString('en-IN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-muted text-muted-foreground border-border"
                        >
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 hover:bg-accent"
                          onClick={() => setEditItem(item)}
                          title="Edit item"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>

                        {/* Toggle active/inactive */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-8 h-8 ${
                            item.isActive
                              ? 'hover:bg-amber-50 dark:hover:bg-amber-950/20'
                              : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                          }`}
                          onClick={() => handleToggle(item)}
                          disabled={togglingId === item.id}
                          title={item.isActive ? 'Disable item' : 'Enable item'}
                        >
                          {togglingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : item.isActive ? (
                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 hover:bg-destructive/10 text-destructive"
                          onClick={() => setDeleteTarget(item)}
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add dialog */}
      <ItemFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Clothing Item"
        description="Add a new item to the ironing price catalog."
        onSubmit={handleAdd}
      />

      {/* Edit dialog */}
      {editItem && (
        <ItemFormDialog
          open={true}
          onOpenChange={(o) => { if (!o) setEditItem(null); }}
          initial={{ name: editItem.name, price: Number(editItem.pricePerItem) }}
          title="Edit Item"
          description="Update the item name or price."
          onSubmit={handleUpdate}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this item from the catalog. Existing orders will not be
              affected. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              {deleteItem.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminItemsPage() {
  return (
    <AdminLayout>
      <AdminItemsContent />
    </AdminLayout>
  );
}
