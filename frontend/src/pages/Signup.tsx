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

export default function Signup() {
  const { sendOtp, signup, loginGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [otp, setOtp] = useState("");

  const from = location.state?.from || "/";
  const state = location.state || {};

  const handleSendOtp = async () => {
    if (name.trim().length < 2) { toast.error("Enter your name"); return; }
    if (!email.includes("@")) { toast.error("Enter a valid email"); return; }
    
    setIsSending(true);
    try {
      await sendOtp(email);
      toast.success("OTP sent to your email!");
      setOtpSent(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setIsSending(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) return;

    if (otp.length < 5) { toast.error("Enter valid OTP"); return; }
    if (password.length < 6) { toast.error("Password must be 6+ chars"); return; }

    try {
      await signup(name, email, password, otp);
      toast.success("Account created successfully!");
      navigate(from, { replace: true, state });
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
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
        <h1 className="font-display text-4xl mt-4">Join Plants Vigor</h1>
        <p className="text-muted-foreground mt-1">Create your account</p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
        <div><Label>Full name</Label><Input value={name} onChange={e => setName(e.target.value)} required disabled={otpSent} /></div>
        <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={otpSent} /></div>
        
        {!otpSent ? (
          <>
            <Button type="button" onClick={handleSendOtp} disabled={isSending} className="w-full rounded-full" size="lg">
              {isSending ? "Sending OTP..." : "Send OTP"}
            </Button>
            <div className="flex justify-center my-2">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    if (credentialResponse.credential) {
                      await loginGoogle(credentialResponse.credential);
                      toast.success("Signed in with Google");
                      navigate(from, { replace: true, state });
                    }
                  } catch (err: any) {
                    toast.error(err.message || "Failed to sign in with Google");
                  }
                }}
                onError={() => toast.error("Google Login Failed")}
              />
            </div>
          </>
        ) : (
          <>
            <div><Label>Enter OTP</Label><Input type="text" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="123456" maxLength={6} /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <Button type="submit" className="w-full rounded-full" size="lg">Create account</Button>
          </>
        )}
        <p className="text-sm text-center text-muted-foreground">Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link></p>
      </form>
    </div>
  );
}
