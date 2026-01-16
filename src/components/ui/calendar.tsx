import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type CalendarProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> & {
    value?: string
    onChange?: (date: string) => void
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
    ({ className, value, onChange, ...props }, ref) => {
        const [currentMonth, setCurrentMonth] = React.useState<Date>(
            value ? new Date(value) : new Date()
        )

        const getDaysInMonth = (date: Date) => {
            return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
        }

        const getFirstDayOfMonth = (date: Date) => {
            return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
        }

        const handleDateClick = (day: number) => {
            const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
            const dateString = selectedDate.toISOString().split('T')[0]
            onChange?.(dateString)
        }

        const previousMonth = () => {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
        }

        const nextMonth = () => {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
        }

        const daysInMonth = getDaysInMonth(currentMonth)
        const firstDayOfMonth = getFirstDayOfMonth(currentMonth)
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
        const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

        const monthYear = currentMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        })

        const selectedDay = value ? new Date(value).getDate() : null
        const isCurrentMonth =
            value &&
            new Date(value).getMonth() === currentMonth.getMonth() &&
            new Date(value).getFullYear() === currentMonth.getFullYear()

        return (
            <div
                ref={ref}
                className={cn("p-3", className)}
                {...props}
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between space-x-4">
                        <h2 className="text-sm font-semibold">{monthYear}</h2>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                                onClick={previousMonth}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                                onClick={nextMonth}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="grid w-full grid-cols-7 gap-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                <div
                                    key={day}
                                    className="text-center text-xs font-medium text-muted-foreground"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid w-full grid-cols-7 gap-2">
                            {emptyDays.map((_, i) => (
                                <div key={`empty-${i}`} />
                            ))}
                            {days.map((day) => (
                                <button
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    className={cn(
                                        "h-8 w-8 rounded text-sm font-medium transition-colors",
                                        isCurrentMonth && selectedDay === day
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-accent"
                                    )}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)
Calendar.displayName = "Calendar"

export { Calendar }
