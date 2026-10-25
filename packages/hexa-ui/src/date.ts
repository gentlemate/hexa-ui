type WeekInfoLocale = Intl.Locale & { getWeekInfo?(): { firstDay: number }; weekInfo?: { firstDay: number } };

export function createDate(year: number, month: number, day: number) {
    const date = new Date(0);
    date.setFullYear(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date;
}

export function today() {
    const now = new Date();
    return createDate(now.getFullYear(), now.getMonth(), now.getDate());
}

export function parseDate(value: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return undefined;
    const [year, month, day] = match.slice(1).map(Number);
    const date = createDate(year, month - 1, day);
    return date.getMonth() === month - 1 && date.getDate() === day ? date : undefined;
}

export function formatDate(date: Date) {
    const pad = (value: number, length: number) => String(value).padStart(length, "0");
    return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}`;
}

export function addDays(date: Date, days: number) {
    return createDate(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function daysInMonth(year: number, month: number) {
    return createDate(year, month + 1, 0).getDate();
}

export function addMonths(date: Date, months: number) {
    const month = date.getMonth() + months;
    return createDate(date.getFullYear(), month, Math.min(date.getDate(), daysInMonth(date.getFullYear(), month)));
}

export function startOfMonth(date: Date) {
    return createDate(date.getFullYear(), date.getMonth(), 1);
}

export function startOfWeek(date: Date, firstDay: number) {
    return addDays(date, -((date.getDay() - firstDay + 7) % 7));
}

export function isSameDay(a: Date, b?: Date) {
    return !!b && a.getTime() === b.getTime();
}

export function isSameMonth(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function clampDate(date: Date, min?: Date, max?: Date) {
    if (min && date < min) return min;
    if (max && date > max) return max;
    return date;
}

export function firstDayOfWeek(locale: string) {
    const info = new Intl.Locale(locale) as WeekInfoLocale;
    return ((info.getWeekInfo?.() ?? info.weekInfo)?.firstDay ?? 1) % 7;
}

export function localeOf(element: Element, locale: string) {
    return locale || element.closest("[lang]")?.getAttribute("lang") || navigator.language;
}
