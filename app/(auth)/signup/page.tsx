"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters long" };
    }

    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one lowercase letter" };
    }

    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one uppercase letter" };
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { isValid: false, message: "Password must contain at least one special character" };
    }

    return { isValid: true, message: "" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
        return;
      }

      setSuccess(true);
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };

    return checks;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create an Account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to get started with GearGuard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                Account created successfully! Redirecting to login...
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength={8}
              />
              
              {formData.password && (
                <div className="space-y-1 mt-2">
                  <p className="text-xs font-medium text-gray-700">Password requirements:</p>
                  <div className="space-y-1">
                    <div className={`text-xs flex items-center ${passwordStrength.length ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.length ? '✓' : '○'}</span>
                      At least 8 characters
                    </div>
                    <div className={`text-xs flex items-center ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.lowercase ? '✓' : '○'}</span>
                      One lowercase letter
                    </div>
                    <div className={`text-xs flex items-center ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.uppercase ? '✓' : '○'}</span>
                      One uppercase letter
                    </div>
                    <div className={`text-xs flex items-center ${passwordStrength.special ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{passwordStrength.special ? '✓' : '○'}</span>
                      One special character (!@#$%^&*...)
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Re-Enter Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                minLength={8}
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || success}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}