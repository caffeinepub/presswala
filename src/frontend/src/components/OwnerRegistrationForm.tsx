import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useRegisterShop } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import {
  Store,
  User,
  Phone,
  MapPin,
  Clock,
  IndianRupee,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

interface StepOneData {
  mobile: string;
  pin: string;
}

interface StepTwoData {
  ownerName: string;
  shopName: string;
  address: string;
  serviceArea: number;
  pricePerCloth: string;
  workingHours: string;
  idProofNote: string;
}

const STEP_LABELS = ['Verify Mobile', 'Shop Details', 'Submitted'];

export default function OwnerRegistrationForm() {
  const navigate = useNavigate();
  const registerShop = useRegisterShop();

  const [step, setStep] = useState(1);

  const [stepOne, setStepOne] = useState<StepOneData>({ mobile: '', pin: '' });
  const [stepTwo, setStepTwo] = useState<StepTwoData>({
    ownerName: '',
    shopName: '',
    address: '',
    serviceArea: 2,
    pricePerCloth: '',
    workingHours: '',
    idProofNote: '',
  });

  // ── Step 1 validation ──────────────────────────────────────────────────────
  const validateStepOne = () => {
    if (!/^\d{10}$/.test(stepOne.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!/^\d{4}$/.test(stepOne.pin)) {
      toast.error('Please enter a 4-digit PIN.');
      return false;
    }
    return true;
  };

  // ── Step 2 validation ──────────────────────────────────────────────────────
  const validateStepTwo = () => {
    if (!stepTwo.ownerName.trim()) { toast.error('Owner name is required.'); return false; }
    if (!stepTwo.shopName.trim()) { toast.error('Shop name is required.'); return false; }
    if (!stepTwo.address.trim()) { toast.error('Shop address is required.'); return false; }
    const price = Number(stepTwo.pricePerCloth);
    if (!stepTwo.pricePerCloth || isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price per cloth.');
      return false;
    }
    if (!stepTwo.workingHours.trim()) { toast.error('Working hours are required.'); return false; }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStepOne()) setStep(2);
  };

  const handleSubmit = async () => {
    if (!validateStepTwo()) return;

    try {
      await registerShop.mutateAsync({
        ownerName: stepTwo.ownerName.trim(),
        mobile: stepOne.mobile,
        shopName: stepTwo.shopName.trim(),
        address: stepTwo.address.trim(),
        serviceArea: BigInt(stepTwo.serviceArea),
        pricePerCloth: BigInt(Math.round(Number(stepTwo.pricePerCloth))),
        workingHours: stepTwo.workingHours.trim(),
      });
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {STEP_LABELS.map((label, idx) => {
          const num = idx + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={num} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    isDone
                      ? 'bg-primary text-primary-foreground'
                      : isActive
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : num}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </div>
              {idx < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 mx-1 rounded ${step > num ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Mobile Verification ── */}
      {step === 1 && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">Verify Your Mobile</h2>
              <p className="text-xs text-muted-foreground">Enter your mobile number and set a 4-digit PIN</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="mobile" className="text-sm font-semibold">
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={stepOne.mobile}
                  onChange={(e) => setStepOne((p) => ({ ...p, mobile: e.target.value.replace(/\D/g, '') }))}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pin" className="text-sm font-semibold">
                4-Digit PIN <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pin"
                type="password"
                placeholder="Set a 4-digit PIN"
                maxLength={4}
                value={stepOne.pin}
                onChange={(e) => setStepOne((p) => ({ ...p, pin: e.target.value.replace(/\D/g, '') }))}
                className="tracking-widest text-center text-lg"
              />
              <p className="text-[11px] text-muted-foreground">
                This PIN will be used to verify your identity in future logins.
              </p>
            </div>
          </div>

          <Button onClick={handleNextStep} className="w-full gap-2">
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* ── Step 2: Shop Details ── */}
      {step === 2 && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-card space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">Shop Details</h2>
              <p className="text-xs text-muted-foreground">Tell us about your pressing shop</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ownerName" className="text-sm font-semibold">
                  Owner Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="ownerName"
                    placeholder="Your full name"
                    value={stepTwo.ownerName}
                    onChange={(e) => setStepTwo((p) => ({ ...p, ownerName: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="shopName" className="text-sm font-semibold">
                  Shop Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="shopName"
                    placeholder="e.g. Raj Press"
                    value={stepTwo.shopName}
                    onChange={(e) => setStepTwo((p) => ({ ...p, shopName: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-sm font-semibold">
                Shop Address <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="address"
                  placeholder="Full shop address including area and city"
                  value={stepTwo.address}
                  onChange={(e) => setStepTwo((p) => ({ ...p, address: e.target.value }))}
                  className="pl-9 min-h-[80px] resize-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Service Area Radius: <span className="text-primary">{stepTwo.serviceArea} km</span>
              </Label>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[stepTwo.serviceArea]}
                onValueChange={([val]) => setStepTwo((p) => ({ ...p, serviceArea: val }))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1 km</span>
                <span>10 km</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-sm font-semibold">
                  Price / Cloth (₹) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    min={1}
                    placeholder="e.g. 12"
                    value={stepTwo.pricePerCloth}
                    onChange={(e) => setStepTwo((p) => ({ ...p, pricePerCloth: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hours" className="text-sm font-semibold">
                  Working Hours <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="hours"
                    placeholder="e.g. 9am – 8pm"
                    value={stepTwo.workingHours}
                    onChange={(e) => setStepTwo((p) => ({ ...p, workingHours: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="idProof" className="text-sm font-semibold">
                ID Proof Note <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </Label>
              <Input
                id="idProof"
                placeholder="e.g. Aadhaar card available"
                value={stepTwo.idProofNote}
                onChange={(e) => setStepTwo((p) => ({ ...p, idProofNote: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-1.5">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={registerShop.isPending}
              className="flex-1 gap-2"
            >
              {registerShop.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
              ) : (
                <>Submit for Approval <ChevronRight className="w-4 h-4" /></>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Confirmation ── */}
      {step === 3 && (
        <div className="bg-card rounded-2xl border border-border p-8 shadow-card text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Registration Submitted!</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Your shop <span className="font-semibold text-foreground">{stepTwo.shopName}</span> is under verification.
              You will be notified after approval.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left space-y-2">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">What happens next?</p>
            <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
              <li className="flex items-start gap-2"><span className="mt-0.5">📋</span> Admin reviews your shop details</li>
              <li className="flex items-start gap-2"><span className="mt-0.5">✅</span> Once approved, your shop goes live</li>
              <li className="flex items-start gap-2"><span className="mt-0.5">📦</span> Customers in your area can place orders</li>
            </ul>
          </div>

          <Button
            onClick={() => navigate({ to: '/owner/dashboard' })}
            className="w-full"
          >
            Go to My Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
