import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Phone } from 'lucide-react';
import { useSaveCallerUserProfile, useRegisterUser } from '../hooks/useQueries';
import { toast } from 'sonner';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const saveProfile = useSaveCallerUserProfile();
  const registerUser = useRegisterUser();

  const isValid = name.trim().length >= 2 && /^[6-9]\d{9}$/.test(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      await saveProfile.mutateAsync({ name: name.trim(), phone });
      await registerUser.mutateAsync({ name: name.trim(), phone });
      toast.success('Profile saved! Welcome to PressWala 🎉');
    } catch (err: unknown) {
      // registerUser may fail if already registered — that's okay
      const msg = err instanceof Error ? err.message : '';
      if (!msg.includes('already exists')) {
        toast.error('Failed to save profile. Please try again.');
      }
    }
  };

  const isPending = saveProfile.isPending || registerUser.isPending;

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm mx-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Welcome to PressWala! 👋</DialogTitle>
          <DialogDescription>
            Tell us a bit about yourself to get started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="font-medium">Your Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="font-medium">Mobile Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="pl-9"
                inputMode="numeric"
              />
            </div>
            {phone.length > 0 && phone.length < 10 && (
              <p className="text-xs text-muted-foreground">Enter a valid 10-digit number</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            disabled={!isValid || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Get Started'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
