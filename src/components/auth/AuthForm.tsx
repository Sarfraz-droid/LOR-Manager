"use client";

import { useState } from "react";
import { BookOpen, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  onSignIn: (email: string, password: string) => Promise<string | null>;
  onSignUp: (email: string, password: string) => Promise<string | null>;
  onSignInWithGoogle: () => Promise<string | null>;
};

export function AuthForm({ onSignIn, onSignUp, onSignInWithGoogle }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleToggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    if (mode === "signin") {
      const err = await onSignIn(email, password);
      if (err) setError(err);
    } else {
      const err = await onSignUp(email, password);
      if (err) {
        setError(err);
      } else {
        setInfo("Account created! Please check your email to confirm your address, then sign in.");
        setMode("signin");
        setPassword("");
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const err = await onSignInWithGoogle();
    if (err) setError(err);
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="bg-primary p-3 rounded-2xl">
            <BookOpen className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">LoR Tracker Pro</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your letters of recommendation</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {mode === "signin" ? "Sign in to your account" : "Create an account"}
            </CardTitle>
            <CardDescription>
              {mode === "signin"
                ? "Enter your credentials to access your dashboard."
                : "Sign up to start tracking your letters of recommendation."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              {info && (
                <div className="rounded-md bg-accent/10 border border-accent/20 px-3 py-2 text-sm text-accent-foreground">
                  {info}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading || googleLoading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    {mode === "signin" ? "Signing in…" : "Creating account…"}
                  </span>
                ) : mode === "signin" ? (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" /> Sign In
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Create Account
                  </span>
                )}
              </Button>

              <div className="relative w-full flex items-center gap-2">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
              >
                {googleLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Redirecting…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {/* Google "G" logo */}
                    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </span>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={handleToggleMode}
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === "signin" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
