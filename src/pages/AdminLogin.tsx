
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First get the user record
      const { data: user, error: getUserError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .single();

      if (getUserError) throw getUserError;
      if (!user) throw new Error('User not found');

      // Verify the password (currently stored as plain text)
      if (user.password_hash !== password) {
        throw new Error('Invalid password');
      }

      // If everything is valid, set admin flag and navigate
      localStorage.setItem("isAdmin", "true");
      navigate("/admin");
    } catch (err) {
      alert((err instanceof Error) ? err.message : 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <Card className="bg-black/40 border-purple-500/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto bg-purple-600 rounded-full p-3 w-fit mb-4">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
            <CardDescription className="text-gray-400">
              Access the UwU eSports management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-black/20 border-purple-500/30 text-white placeholder-gray-400"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-black/20 border-purple-500/30 text-white placeholder-gray-400"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/" className="text-purple-400 hover:text-purple-300 text-sm">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
