'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

export const dynamic = 'force-dynamic';

function RegisterContent() {
    const { register } = useAuth();
    const searchParams = useSearchParams();
    const teamId = searchParams.get('team');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await register(formData.name, formData.email, formData.password, 'member', teamId || undefined);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Animated background elements - Enhanced */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Primary orb */}
                <div className="absolute top-0 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
                {/* Secondary orb */}
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                {/* Tertiary orb */}
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                {/* Additional floating orbs */}
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1) 76%, transparent 77%, transparent)',
                backgroundSize: '50px 50px'
            }}></div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md space-y-8">
                {/* Logo/Branding - Enhanced */}
                <div className="text-center space-y-3 mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
                            <div className="relative text-6xl bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text">💪</div>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent">FiT Team</h1>
                    <p className="text-slate-300 text-lg font-medium">Transform Your Training</p>
                </div>

                {/* Card - Enhanced with gradient border */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 via-blue-600 to-cyan-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                    <Card className="relative border-0 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
                        <CardHeader className="space-y-3">
                            <CardTitle className="text-3xl bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">Get Started</CardTitle>
                            <CardDescription className="text-slate-400">Create your FiT Team account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <Alert className="mb-4 bg-red-500/20 text-red-200 border-red-500/40 rounded-lg">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name Field */}
                                <div className="group">
                                    <Label htmlFor="name" className="text-sm font-semibold text-slate-300 group-focus-within:text-primary-400 transition-colors">Full Name</Label>
                                    <div className="relative mt-2">
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="group">
                                    <Label htmlFor="email" className="text-sm font-semibold text-slate-300 group-focus-within:text-primary-400 transition-colors">Email Address</Label>
                                    <div className="relative mt-2">
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="group">
                                    <Label htmlFor="password" className="text-sm font-semibold text-slate-300 group-focus-within:text-primary-400 transition-colors">Password</Label>
                                    <div className="relative mt-2">
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            className="bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-primary-500/50 hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                                    disabled={loading}
                                    size="lg"
                                >
                                    <span className="relative z-10">{loading ? 'Creating Account...' : 'Create Account'}</span>
                                </Button>
                            </form>

                            <p className="text-center text-sm text-slate-400 mt-8">
                                Already have an account?{' '}
                                <Link href="/auth/login" className="text-primary-400 hover:text-primary-300 transition-colors font-semibold hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Footer text */}
                <p className="text-center text-xs text-slate-500 mt-8">
                    © 2026 FiT Team. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default function Register() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
                <Card className="w-full max-w-md">
                    <CardContent className="py-12 text-center">Loading...</CardContent>
                </Card>
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}
