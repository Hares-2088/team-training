import { ImageResponse } from 'next/og';

export const size = {
    width: 192,
    height: 192,
};

export const contentType = 'image/png';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 24,
                    background: '#0f172a',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 96,
                }}
            >
                <svg
                    width="192"
                    height="192"
                    viewBox="0 0 192 192"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Barbell bar */}
                    <rect x="36" y="96" width="120" height="8" rx="4" fill="#cbd5e1" />

                    {/* Left weight plate */}
                    <rect x="24" y="88" width="16" height="24" rx="3" fill="#64748b" />

                    {/* Right weight plate */}
                    <rect x="152" y="88" width="16" height="24" rx="3" fill="#64748b" />

                    {/* Center person (trainer) - gold */}
                    <circle cx="96" cy="64" r="14" fill="#f59e0b" />
                    <rect x="78" y="78" width="36" height="30" rx="15" fill="#f59e0b" />

                    {/* Left teammate - cyan */}
                    <circle cx="70" cy="72" r="11" fill="#38bdf8" />
                    <rect x="54" y="84" width="32" height="24" rx="12" fill="#38bdf8" />

                    {/* Right teammate - cyan */}
                    <circle cx="122" cy="72" r="11" fill="#38bdf8" />
                    <rect x="106" y="84" width="32" height="24" rx="12" fill="#38bdf8" />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    );
}
