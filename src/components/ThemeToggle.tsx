'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const THEME_CHANGE_EVENT = 'fit-team-theme-change';
const emptySubscribe = () => () => {};

const subscribeToTheme = (onStoreChange: () => void) => {
    globalThis.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
    globalThis.addEventListener('storage', onStoreChange);

    return () => {
        globalThis.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
        globalThis.removeEventListener('storage', onStoreChange);
    };
};

const getThemeSnapshot = () => document.documentElement.classList.contains('dark');

export function ThemeToggle() {
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
    const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => false);

    const toggleTheme = () => {
        if (!mounted) return;

        const html = document.documentElement;
        const isDarkMode = html.classList.contains('dark');

        if (isDarkMode) {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }

        globalThis.dispatchEvent(new Event(THEME_CHANGE_EVENT));
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
