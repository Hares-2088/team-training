import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: string
    onChange?: (value: string) => void
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
    ({ className, value, onChange, ...props }, ref) => {
        const [open, setOpen] = React.useState(false)

        const displayDate = value
            ? new Date(value).toLocaleDateString('en-US', {
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
