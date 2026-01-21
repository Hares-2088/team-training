import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value?: string
    onChange?: (value: string) => void
}

// Parse date string (YYYY-MM-DD) as local date, not UTC
const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
    ({ className, value, onChange, ...props }, ref) => {
        const [open, setOpen] = React.useState(false)

        const displayDate = value
            ? parseLocalDate(value).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            })
            : 'Pick a date'

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {displayDate}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        value={value}
                        onChange={(date) => {
                            onChange?.(date)
                            setOpen(false)
                        }}
                    />
                </PopoverContent>
            </Popover>
        )
    }
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
