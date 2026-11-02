import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

/** A chat in the list: its first question, the start of its first answer, when it was last used. */
export interface ChatSummary {
  id: string;
  question: string;
  preview: string;
  time: string;
}

export interface ChatSection {
  key: string;
  title: string;
  chats: ChatSummary[];
}

export interface CoachHistoryViewProps {
  sections: ChatSection[];
  onOpen: (chatId: string) => void;
  /** A chat's "…": the sheet that deletes it. */
  onMenu: (chatId: string) => void;
  onBack: () => void;
  onNew: () => void;
  /** Choosing chats to delete, with a box in front of each, as in Claude's chat list. */
  selecting: boolean;
  selected: ReadonlySet<string>;
  onSelecting: (selecting: boolean) => void;
  onToggle: (chatId: string) => void;
  onDelete: () => void;
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <View
      className={cn(
        'mt-px size-[22px] items-center justify-center rounded-full',
        checked ? 'bg-accent' : 'border-2 border-outline',
      )}
    >
      {checked ? <Icon name="check" size={12} color={colors.onAccent} /> : null}
    </View>
  );
}

interface RowProps {
  chat: ChatSummary;
  selecting: boolean;
  checked: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onMenu: () => void;
}

function ChatRow({ chat, selecting, checked, onPress, onLongPress, onMenu }: RowProps) {
  const { t } = useTranslation('coach');
  return (
    <PressableScale
      haptic="tap"
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityState={selecting ? { checked } : undefined}
      className="flex-row gap-3 py-3.5 pl-2"
    >
      {selecting ? <CheckBox checked={checked} /> : null}
      <View className="min-w-0 flex-1 gap-[5px]">
        <View className="flex-row items-baseline gap-3">
          <Text
            numberOfLines={1}
            className="min-w-0 flex-1 font-inter-semibold text-label leading-[19.5px] text-fg"
          >
            {chat.question}
          </Text>
          <Text className="font-inter text-xs leading-[15px] text-dim">{chat.time}</Text>
        </View>
        <Text numberOfLines={2} className="font-inter text-sm leading-[19.6px] text-subtle">
          {chat.preview}
        </Text>
      </View>
      {selecting ? (
        <View className="w-2" />
      ) : (
        <IconButton
          icon="more"
          size={36}
          accessibilityLabel={t('history.menu')}
          onPress={onMenu}
          className="-mt-1.5 bg-transparent"
        />
      )}
    </PressableScale>
  );
}

/**
 * Kai's earlier chats (design CO2-G), grouped by when they were last used. A chat's "…" deletes
 * it; a long press puts boxes in front for deleting several at once.
 */
export function CoachHistoryView({
  sections,
  onOpen,
  onMenu,
  onBack,
  onNew,
  selecting,
  selected,
  onSelecting,
  onToggle,
  onDelete,
}: CoachHistoryViewProps) {
  const { t } = useTranslation('coach');
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      {selecting ? (
        <ScreenHeader
          icon="close"
          onBack={() => onSelecting(false)}
          title={t('history.selected', { count: selected.size })}
          action={
            <PressableScale
              haptic="warning"
              disabled={!selected.size}
              onPress={onDelete}
              className={cn('h-10.5 justify-center px-1', !selected.size && 'opacity-35')}
            >
              <Text className="font-inter-semibold text-label text-red">{t('history.delete')}</Text>
            </PressableScale>
          }
        />
      ) : (
        <ScreenHeader
          onBack={onBack}
          title={t('history.title')}
          action={
            <IconButton
              icon="plus"
              iconSize={14}
              color={colors.onAccent}
              accessibilityLabel={t('newChat')}
              onPress={onNew}
              className="bg-accent"
            />
          }
        />
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: insets.bottom + 24 }}
      >
        {!sections.length ? (
          <Text className="pt-12 text-center font-inter text-label leading-[22px] text-subtle">
            {t('history.empty')}
          </Text>
        ) : null}
        {sections.map((section) => (
          <View key={section.key}>
            <View className="px-2 pt-[18px] pb-1">
              <Text className="font-inter-semibold text-[11px] leading-[13px] tracking-[1.1px] text-dim uppercase">
                {section.title}
              </Text>
            </View>
            {section.chats.map((chat) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                selecting={selecting}
                checked={selected.has(chat.id)}
                onPress={() => (selecting ? onToggle(chat.id) : onOpen(chat.id))}
                onLongPress={() => {
                  // The boxes appear with a tick, like any press.
                  haptics.press();
                  if (!selecting) onSelecting(true);
                  onToggle(chat.id);
                }}
                onMenu={() => onMenu(chat.id)}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
