const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DATE_PREFIX_REGEX = /^(\d{4}-\d{2}-\d{2})/;

const formatDatePart = (value: number) => String(value).padStart(2, '0');

const fromDateParts = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const dateKeyFromDate = (date: Date): string => (
    `${date.getFullYear()}-${formatDatePart(date.getMonth() + 1)}-${formatDatePart(date.getDate())}`
);

export const toDateKey = (value: Date | string): string => {
    if (value instanceof Date) {
        return dateKeyFromDate(value);
    }

    if (DATE_ONLY_REGEX.test(value)) {
        return value;
    }

    const prefixedDate = value.match(DATE_PREFIX_REGEX)?.[1];
    if (prefixedDate) {
        return prefixedDate;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error('Invalid date');
    }

    return dateKeyFromDate(parsed);
};

export const toDateAtLocalMidnight = (value: Date | string): Date => fromDateParts(toDateKey(value));

export const formatDateLabel = (
    value: Date | string,
    options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }
): string => toDateAtLocalMidnight(value).toLocaleDateString('en-US', options);

export const addMonthsToDateKey = (dateKey: string, monthOffset: number): string => {
    const sourceDate = toDateAtLocalMidnight(dateKey);
    const sourceYear = sourceDate.getFullYear();
    const sourceMonth = sourceDate.getMonth();
    const sourceDay = sourceDate.getDate();

    const shiftedMonth = sourceMonth + monthOffset;
    const targetYear = sourceYear + Math.floor(shiftedMonth / 12);
    const targetMonth = ((shiftedMonth % 12) + 12) % 12;
    const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const targetDay = Math.min(sourceDay, lastDayOfTargetMonth);

    return dateKeyFromDate(new Date(targetYear, targetMonth, targetDay));
};
