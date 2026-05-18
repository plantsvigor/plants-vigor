import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf } from "lucide-react";
import logo from "@/assets/logo/plants-vigor-logo.png";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const { login, loginGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from = location.state?.from || "/";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { toast.error("Enter a valid email"); return; }
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Failed to login");
    }
  };

  return (
    <div className="container py-16 max-w-md">
      <div className="text-center mb-8">
        <img 
          src={logo} 
          alt="Plants Vigor" 
          className="h-16 w-auto mx-auto object-contain"
        />
        <h1 className="font-display text-4xl mt-4">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Sign in to your account</p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
        <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
        <Button type="submit" className="w-full rounded-full" size="lg">Sign in</Button>
        <div className="flex justify-center my-2">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                if (credentialResponse.credential) {
                  await loginGoogle(credentialResponse.credential);
                  toast.success("Signed in with Google");
                  navigate(from, { replace: true });
                }
              } catch (err: any) {
                toast.error(err.message || "Failed to sign in with Google");
              }
            }}
            onError={() => toast.error("Google Login Failed")}
          />
        </div>
        <p className="text-sm text-center text-muted-foreground">Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link></p>
        <p className="text-xs text-center text-muted-foreground">💡 Use any email containing "admin" to access the admin panel.</p>
      </form>
    </div>
  );
}
