import type { TFunction } from 'i18next';

import { isSameDay, startOfWeek } from '@/shared/lib/date';
import { formatMonthYear, formatTime } from '@/shared/lib/format';

import type { ChatSection } from '../components/coach-history-view';
import type { CoachChatSummary } from '../data/coach-chats';
import { plainText } from './answer-text';
import { dateLabel } from './charts';

/**
 * The chats in sections by when they were last answered (design CO·H): today with the time, this
 * week with the weekday, then one per month with the date.
 */
export function chatSections(
  chats: CoachChatSummary[],
  now: Date,
  t: TFunction<'coach'>,
): ChatSection[] {
  const weekStart = startOfWeek(now).getTime();
  const sections: ChatSection[] = [];
  for (const chat of chats) {
    const date = new Date(chat.updatedAt);
    let key: string;
    let title: string;
    let time: string;
    if (isSameDay(date, now)) {
      [key, title, time] = ['today', t('history.today'), formatTime(date)];
    } else if (date.getTime() >= weekStart) {
      [key, title, time] = ['week', t('history.thisWeek'), dateLabel(date, { weekday: 'short' })];
    } else {
      key = `${date.getFullYear()}-${date.getMonth()}`;
      title = formatMonthYear(date, now.getFullYear());
      time = dateLabel(date, { day: 'numeric', month: 'short' });
    }
    const last = sections.at(-1);
    const section: ChatSection = last?.key === key ? last : { key, title, data: [] };
    if (section !== last) sections.push(section);
    section.data.push({
      id: chat.id,
      question: chat.question,
      preview: plainText(chat.answer),
      time,
    });
  }
  return sections;
}
