'use client';

import { useEffect, type ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    return <>{children}</>;
}
