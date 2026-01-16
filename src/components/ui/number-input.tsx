'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    id?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function NumberInput({
    value,
    onChange,
    min = 0,
    max,
    step = 1,
    id,
    placeholder,
    className,
    disabled = false,
}: Readonly<NumberInputProps>) {
    const handleIncrement = () => {
        const newValue = value + step;
        if (max === undefined || newValue <= max) {
            onChange(newValue);
        }
    };

    const handleDecrement = () => {
        const newValue = value - step;
        if (newValue >= min) {
            onChange(newValue);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        if (inputValue === '') {
            onChange(min);
            return;
        }

        const numValue = Number.parseFloat(inputValue);
        if (!Number.isNaN(numValue)) {
            if (min !== undefined && numValue < min) {
                onChange(min);
            } else if (max !== undefined && numValue > max) {
                onChange(max);
            } else {
                onChange(numValue);
            }
        }
    };

    return (
        <div className={cn('flex items-center gap-1', className)}>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                className="h-9 w-9 p-0 shrink-0"
            >
                <Minus className="h-3 w-3" />
            </Button>
            <Input
                id={id}
                type="text"
                inputMode="numeric"
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={disabled}
                className="text-center h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleIncrement}
                disabled={disabled || (max !== undefined && value >= max)}
                className="h-9 w-9 p-0 shrink-0"
            >
                <Plus className="h-3 w-3" />
            </Button>
        </div>
    );
}
