import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

import { AttachmentThumb } from './attachment-thumb';
import { TeamAvatar } from './team-avatar';

export interface ChatMessageProps {
  author: 'user' | 'team';
  body: string;
  attachments?: string[];
  /** Importance of a feature request, shown under its first message. */
  priority?: number | null;
  onOpenAttachment?: (path: string) => void;
}

interface AttachmentsProps {
  paths: string[];
  onOpen?: (path: string) => void;
  alignEnd?: boolean;
}

const noop = () => {};

function Attachments({ paths, onOpen = noop, alignEnd }: AttachmentsProps) {
  if (!paths.length) return null;
  return (
    <View className={cn('flex-row flex-wrap gap-1.5', alignEnd && 'justify-end')}>
      {paths.map((path) => (
        <AttachmentThumb key={path} path={path} onOpen={onOpen} />
      ))}
    </View>
  );
}

/** User bubble (accent, right) or team bubble with the "F" avatar (left), as in 01f-3e. */
export function ChatMessage({
  author,
  body,
  attachments = [],
  priority,
  onOpenAttachment,
}: ChatMessageProps) {
  const { t } = useTranslation('support');
  const text = body.trim();

  if (author === 'team') {
    return (
      <View className="max-w-[84%] flex-row items-end gap-2">
        <TeamAvatar size={28} />
        <View className="shrink gap-1">
          <Attachments paths={attachments} onOpen={onOpenAttachment} />
          {text ? (
            <View className="rounded-[20px] bg-raised px-3.5 py-2.5">
              <Text className="font-inter text-[15px] leading-5.25">{text}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View className="max-w-[78%] items-end gap-1.5 self-end">
      <Attachments paths={attachments} onOpen={onOpenAttachment} alignEnd />
      {text ? (
        <View className="rounded-[20px] bg-accent px-3.5 py-2.5">
          <Text tone="onAccent" className="font-inter text-[15px] leading-5.25">
            {text}
          </Text>
        </View>
      ) : null}
      {priority ? (
        <View className="flex-row items-center gap-2 pr-1">
          <Text className="font-inter text-xs text-subtle">{t('chat.priority')}</Text>
          <View className="size-7 items-center justify-center rounded-full bg-fg-mid">
            <Text variant="caption" tone="onAccent">
              {priority}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
