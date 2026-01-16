'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
    }, []);

    const toggleTheme = () => {
        if (!mounted) return;

        const html = document.documentElement;
        const isDarkMode = html.classList.contains('dark');

        if (isDarkMode) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    if (!mounted) return null;

    return (
        <Button
            onClick={toggleTheme}
            variant="outline"
            size="icon"
            className="w-10 h-10"
        >
            {isDark ? (
                <Sun className="w-4 h-4 text-warning-500" />
            ) : (
                <Moon className="w-4 h-4 text-primary-600" />
            )}
        </Button>
    );
}
