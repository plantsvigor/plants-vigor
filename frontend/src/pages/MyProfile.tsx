import { useState } from "react";
import { useAuth } from "@/store/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate, Navigate } from "react-router-dom";
import { User as UserIcon, Mail, Phone, Lock, LogOut, Loader2, ArrowLeft, KeyRound, HelpCircle, CheckCircle2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

export default function MyProfile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  // General profile state
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Change Password state
  const [showChangePass, setShowChangePass] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePassLoading, setChangePassLoading] = useState(false);

  // Forgot Password POPUP state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      setProfileLoading(true);
      await updateProfile(name.trim(), phone.trim());
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    try {
      setChangePassLoading(true);
      await api.put("/auth/change-password", { oldPassword, newPassword });
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePass(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setChangePassLoading(false);
    }
  };

  // Handle Send Forgot Password OTP
  const handleSendForgotOtp = async () => {
    try {
      setForgotLoading(true);
      await api.post("/auth/forgot-password-otp");
      toast.success(`Verification OTP sent to ${user.email}`);
      setOtpSent(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Reset Password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp || !forgotNewPassword || !forgotConfirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (forgotNewPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    try {
      setForgotLoading(true);
      await api.post("/auth/reset-forgotten-password", { 
        otp: forgotOtp, 
        newPassword: forgotNewPassword 
      });
      toast.success("Password reset successfully! Logged in with new password.");
      setIsForgotOpen(false);
      setForgotOtp("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");
      setOtpSent(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="container py-12 max-w-2xl px-4">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth mb-6 group text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="space-y-8">
        <div>
          <h1 className="font-display text-4xl md:text-5xl mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information, mobile number, and password safety.</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex items-center gap-4 border-b pb-6">
              <div className="h-16 w-16 rounded-2xl bg-[#008744]/10 flex items-center justify-center font-bold text-2xl text-[#008744] uppercase">
                {user.name[0]}
              </div>
              <div>
                <h2 className="font-display text-xl">{user.name}</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border">
                  {user.role === "admin" ? "Administrator" : "Customer Account"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Name field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#004d40] uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5" /> Full Name
                </label>
                <Input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                  className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                />
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#004d40] uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email Address
                </label>
                <Input 
                  value={user.email} 
                  disabled
                  className="rounded-xl border-border/80 bg-secondary/30 text-muted-foreground h-11"
                />
              </div>

              {/* Mobile field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#004d40] uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Mobile Number
                </label>
                <Input 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  disabled={!isEditing}
                  placeholder="Add mobile number (e.g. +91 9876543210)"
                  className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {isEditing ? (
                <>
                  <Button 
                    key="save-btn"
                    type="submit" 
                    disabled={profileLoading} 
                    className="flex-1 rounded-full h-11"
                  >
                    {profileLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                  <Button 
                    key="cancel-btn"
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setName(user.name);
                      setPhone(user.phone || "");
                      setIsEditing(false);
                    }} 
                    className="rounded-full h-11"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button 
                  key="edit-btn"
                  type="button" 
                  onClick={() => setIsEditing(true)} 
                  className="flex-1 rounded-full h-11"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#008744]/10 p-2.5 rounded-xl text-[#008744]">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg">Change Password</h3>
                <p className="text-xs text-muted-foreground">Keep your password updated and secure.</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowChangePass(!showChangePass)}
              className="rounded-full px-4 text-xs font-semibold"
            >
              {showChangePass ? "Hide" : "Show Fields"}
            </Button>
          </div>

          {showChangePass && (
            <form onSubmit={handleChangePassword} className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Enter Old Password</label>
                <Input 
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="Old password"
                  className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Enter New Password</label>
                <Input 
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Again Enter New Password</label>
                <Input 
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                />
              </div>

              <Button 
                type="submit" 
                disabled={changePassLoading} 
                className="w-full rounded-full h-11 mt-2 bg-[#008744] hover:bg-[#00733B]"
              >
                {changePassLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Change Password
              </Button>
            </form>
          )}

          {/* Forget My Password dialog trigger */}
          <div className="text-center pt-2">
            <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
              <DialogTrigger asChild>
                <button 
                  onClick={() => {
                    setOtpSent(false);
                    setForgotOtp("");
                    setForgotNewPassword("");
                    setForgotConfirmPassword("");
                  }}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Forgot my password?
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-3xl p-6">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="font-display text-2xl flex items-center gap-2">
                    <KeyRound className="h-6 w-6 text-primary" /> Reset Password
                  </DialogTitle>
                  <DialogDescription>
                    To reset your password, we'll verify it's you by sending a 6-digit OTP to your logged-in email.
                  </DialogDescription>
                </DialogHeader>

                {!otpSent ? (
                  <div className="space-y-4 py-4">
                    <div className="rounded-2xl bg-secondary/50 p-4 border flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <span className="font-semibold text-foreground">Registered Email:</span>
                        <p className="text-muted-foreground select-all">{user.email}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSendForgotOtp} 
                      disabled={forgotLoading} 
                      className="w-full rounded-full h-11"
                    >
                      {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Send OTP
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4 py-4">
                    <div className="rounded-2xl bg-green-500/5 text-green-700 p-4 border border-green-500/10 flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      An OTP has been sent successfully!
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Enter OTP</label>
                      <Input 
                        type="text"
                        maxLength={6}
                        value={forgotOtp}
                        onChange={e => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 6-digit OTP"
                        className="rounded-xl border-border/80 focus-visible:ring-primary/20 text-center font-semibold text-lg tracking-widest h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Enter New Password</label>
                      <Input 
                        type="password"
                        value={forgotNewPassword}
                        onChange={e => setForgotNewPassword(e.target.value)}
                        placeholder="New password"
                        className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground">Again Enter New Password</label>
                      <Input 
                        type="password"
                        value={forgotConfirmPassword}
                        onChange={e => setForgotConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="rounded-xl border-border/80 focus-visible:ring-primary/20 h-11"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button 
                        type="submit" 
                        disabled={forgotLoading} 
                        className="flex-1 rounded-full h-11"
                      >
                        {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Changes
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setOtpSent(false)} 
                        className="rounded-full h-11"
                      >
                        Resend OTP
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Logout Button */}
        <Button 
          variant="destructive" 
          onClick={handleLogout} 
          className="w-full rounded-full h-12 flex items-center justify-center gap-2 shadow-sm font-semibold hover:bg-destructive/90 transition-smooth"
        >
          <LogOut className="h-4 w-4" /> Logout from Account
        </Button>
      </div>
    </div>
  );
}
