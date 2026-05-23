import { useState, useEffect } from "react";
import { useAddress, Address } from "@/store/address";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { z } from "zod";

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is too short").max(60),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  street: z.string().trim().min(4, "Street address is too short").max(120),
  city: z.string().trim().min(2, "City name is too short").max(60),
  state: z.string().trim().min(2, "State name is too short").max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  country: z.string().trim().min(2, "Country name is too short").default("India"),
});

interface AddressFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Address | null;
}

export default function AddressForm({ open, onOpenChange, initialData }: AddressFormProps) {
  const { add, update } = useAddress();
  const [formData, setFormData] = useState<Omit<Address, "_id">>({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName,
        phone: initialData.phone,
        street: initialData.street,
        city: initialData.city,
        state: initialData.state,
        pincode: initialData.pincode,
        country: initialData.country,
        isDefault: initialData.isDefault,
      });
    } else {
      setFormData({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        isDefault: false,
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = addressSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.issues[0]?.message || "Please check your inputs");
      return;
    }

    setSubmitting(true);
    try {
      if (initialData?._id) {
        await update(initialData._id, formData);
        toast.success("Address updated successfully");
      } else {
        await add(formData);
        toast.success("Address added successfully");
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save address");
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (k: keyof typeof formData, v: any) => {
    setFormData(prev => ({ ...prev, [k]: v }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:max-w-[500px] rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {initialData ? "Edit Address" : "Add New Address"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input 
                id="fullName" 
                value={formData.fullName} 
                onChange={e => updateField("fullName", e.target.value)} 
                required 
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input 
                id="phone" 
                value={formData.phone} 
                onChange={e => updateField("phone", e.target.value)} 
                required 
                className="rounded-xl"
                placeholder="10-digit mobile"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="street">House / Street *</Label>
              <Input 
                id="street" 
                value={formData.street} 
                onChange={e => updateField("street", e.target.value)} 
                required 
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input 
                id="city" 
                value={formData.city} 
                onChange={e => updateField("city", e.target.value)} 
                required 
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input 
                id="state" 
                value={formData.state} 
                onChange={e => updateField("state", e.target.value)} 
                required 
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">PIN Code *</Label>
              <Input 
                id="pincode" 
                value={formData.pincode} 
                onChange={e => updateField("pincode", e.target.value)} 
                required 
                className="rounded-xl"
                placeholder="6-digit PIN"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input 
                id="country" 
                value={formData.country} 
                onChange={e => updateField("country", e.target.value)} 
                required 
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="isDefault" 
              checked={formData.isDefault} 
              onCheckedChange={(checked) => updateField("isDefault", !!checked)} 
            />
            <Label htmlFor="isDefault" className="text-sm font-medium leading-none cursor-pointer">
              Set as default address
            </Label>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="rounded-full px-8">
              {submitting ? "Saving..." : initialData ? "Update Address" : "Save Address"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
