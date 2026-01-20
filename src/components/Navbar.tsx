'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavbarProps {
    currentPage?: 'dashboard' | 'teams' | 'workouts';
}

export function Navbar({ currentPage }: NavbarProps) {
    const { logout, user } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <nav className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
                <div className="flex justify-between items-center gap-2">
                    <Link href="/dashboard">
                        <h1 className="text-base sm:text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400 truncate cursor-pointer hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                            💪 FiT Team
                        </h1>
                    </Link>
                    <div className="flex gap-1 sm:gap-2 md:gap-4 items-center shrink-0">
                        {currentPage !== 'dashboard' && (
                            <Link href="/dashboard" className="hidden md:inline-block">
                                <Button variant="ghost" size="sm">Dashboard</Button>
                            </Link>
                        )}
                        {currentPage !== 'workouts' && (
                            <Link href="/trainings" className="hidden md:inline-block">
                                <Button variant="ghost" size="sm">Workouts</Button>
                            </Link>
                        )}
                        {currentPage !== 'teams' && (
                            <Link href="/teams" className="hidden md:inline-block">
                                <Button variant="ghost" size="sm">Teams</Button>
                            </Link>
                        )}
                        <ThemeToggle />
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-10 h-10"
                            title="Logout"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
