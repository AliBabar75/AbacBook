import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet, Eye, EyeOff, Loader2 } from "lucide-react";

/**
 * Login Page - Authentication Module
 * 
 * DATA COMES FROM CLIENT BACKEND API
 * Expected API endpoint: POST /api/auth/login
 * Request body: { email: string, password: string }
 * Response: { token: string, user: { id, name, email, role } }
 */
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // DATA COMES FROM CLIENT BACKEND API
      // TODO: Replace with actual API call
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      localStorage.setItem('auth_token', data.token);

      // Simulating API delay for demo purposes
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Store token placeholder - actual token backend say arah hai or yea browser mai save hota hai 
      // localStorage.setItem("auth_token", "placeholder_token");
      localStorage.setItem("auth_token", data.token);
      
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <FileSpreadsheet className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">AbacBook</h1>
          <p className="text-muted-foreground mt-1">Accounting & Inventory System</p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-xl border border-border p-8 shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-6">Sign in to your account</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input-focus"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input-focus pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {/* DATA COMES FROM CLIENT BACKEND API */}
            {/* Contact admin for password reset functionality */}
            Forgot password? Contact your administrator.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected by secure authentication • AbacBook ERP
        </p>
      </div>
    </div>
  );
}
