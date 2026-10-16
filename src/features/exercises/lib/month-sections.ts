import { formatDate } from '@/shared/lib/format';

interface MonthSection<T> {
  key: string;
  /** "OKTOBER", or "OKTOBER 2025" for another year. */
  title: string;
  data: T[];
}

/** Items (newest first) by the month they started in, for a SectionList. */
export function monthSections<T extends { startedAt: string }>(
  items: T[],
  currentYear: number,
): MonthSection<T>[] {
  const sections: MonthSection<T>[] = [];
  for (const item of items) {
    const date = new Date(item.startedAt);
    const title = formatDate(date, {
      month: 'long',
      ...(date.getFullYear() !== currentYear && { year: 'numeric' }),
    }).toUpperCase();
    const section = sections.at(-1);
    if (section?.title === title) section.data.push(item);
    else sections.push({ key: title, title, data: [item] });
  }
  return sections;
}
