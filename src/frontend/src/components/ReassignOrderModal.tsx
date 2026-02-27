import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllUsers, useReassignOrder } from '../hooks/useQueries';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Principal } from '@dfinity/principal';

interface ReassignOrderModalProps {
  open: boolean;
  onClose: () => void;
  orderId: bigint;
}

export default function ReassignOrderModal({ open, onClose, orderId }: ReassignOrderModalProps) {
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const { data: users } = useGetAllUsers();
  const reassign = useReassignOrder();

  const handleReassign = async () => {
    if (!selectedPartner) return;
    try {
      await reassign.mutateAsync({
        orderId,
        newPartnerId: Principal.fromText(selectedPartner),
      });
      toast.success('Order reassigned successfully!');
      onClose();
    } catch (err) {
      toast.error('Failed to reassign order.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reassign Order #{orderId.toString()}</DialogTitle>
          <DialogDescription>Select a partner to reassign this order to.</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Select value={selectedPartner} onValueChange={setSelectedPartner}>
            <SelectTrigger>
              <SelectValue placeholder="Select a partner..." />
            </SelectTrigger>
            <SelectContent>
              {users && users.length > 0 ? (
                users.map((user, idx) => (
                  <SelectItem key={idx} value={`user-${idx}`}>
                    {user.name} — {user.phone}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No users available</SelectItem>
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            Note: Select the partner by name. The system will assign them to this order.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleReassign}
            disabled={!selectedPartner || reassign.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {reassign.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Reassign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
