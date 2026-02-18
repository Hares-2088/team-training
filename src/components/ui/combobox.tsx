"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export type ComboboxOption = {
    value: string
    label: string
}

interface ComboboxProps {
    options: ComboboxOption[]
    value: string
    onChange: (value: string) => void
    onCreateNew?: (value: string) => Promise<void>
    placeholder?: string
    emptyText?: string
    searchPlaceholder?: string
    className?: string
    disabled?: boolean
}

export function Combobox({
    options,
    value,
    onChange,
    onCreateNew,
    placeholder = "Select option...",
    emptyText = "No option found.",
    searchPlaceholder = "Search...",
    className,
    disabled = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [searchValue, setSearchValue] = React.useState("")

    const handleSelect = (currentValue: string) => {
        onChange(currentValue === value ? "" : currentValue)
        setOpen(false)
        setSearchValue("")
    }

    const handleCreateNew = async () => {
        if (searchValue.trim() && onCreateNew) {
            await onCreateNew(searchValue.trim())
            setSearchValue("")
            setOpen(false)
        }
    }

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchValue.toLowerCase())
    )

    const exactMatch = filteredOptions.find(
        (option) => option.label.toLowerCase() === searchValue.toLowerCase()
    )

    const showCreateNew = onCreateNew && searchValue.trim() && !exactMatch

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    disabled={disabled}
                >
                    {value
                        ? options.find((option) => option.value === value)?.label
                        : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onValueChange={setSearchValue}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {showCreateNew ? (
                                <div className="px-2 py-3">
                                    <p className="text-sm text-muted-foreground mb-2">{emptyText}</p>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="w-full"
                                        onClick={handleCreateNew}
                                    >
                                        Create &quot;{searchValue}&quot;
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{emptyText}</p>
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {filteredOptions.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
