import { Link } from "react-router-dom";
import { Leaf, Facebook, Instagram, Youtube } from "lucide-react";
import logo from "@/assets/logo/plants-vigor-logo.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { categories } from "@/data/catalog";

export default function Footer() {
  const [email, setEmail] = useState("");
  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { toast.error("Enter a valid email"); return; }
    toast.success("Subscribed! Welcome to Plants Vigor 🌿");
    setEmail("");
  };
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="container py-14 grid gap-10 md:grid-cols-4">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="Plants Vigor" 
              className="h-10 w-auto object-contain"
            />
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">Bringing nature into homes across India. Carefully grown, lovingly packed, freshly delivered.</p>
          <div className="flex gap-3 text-muted-foreground">
            <a href="#" aria-label="Facebook" className="hover:text-primary"><Facebook className="h-5 w-5" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-primary"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-primary"><Youtube className="h-5 w-5" /></a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {categories.slice(0, 6).map(c => (
              <li key={c.slug}><Link to={`/category/${c.slug}`} className="hover:text-primary">{c.name}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4">Help</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/track-order" className="hover:text-primary">Track Order</Link></li>
            <li><Link to="/orders" className="hover:text-primary">My Orders</Link></li>
            <li><a href="#" className="hover:text-primary">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-primary">Plant Care Guide</a></li>
            <li><a href="#" className="hover:text-primary">Contact us</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4">Join Plants Vigor</h4>
          <p className="text-sm text-muted-foreground mb-3">Get plant care tips and 10% off your first order.</p>
          <form onSubmit={subscribe} className="flex gap-2">
            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@email.com" className="bg-background" />
            <Button type="submit" variant="default">Join</Button>
          </form>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Plants Vigor. All rights reserved.</span>
          <span>Made with 🌱 in India</span>
        </div>
      </div>
    </footer>
  );
}
