import { useTranslation } from 'react-i18next';
import { ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
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
  query: string;
  onQuery: (query: string) => void;
  onOpen: (chatId: string) => void;
  onBack: () => void;
  onNew: () => void;
  /** Choosing chats to delete, with a box in front of each, as in Claude's chat list. */
  selecting: boolean;
  selected: ReadonlySet<string>;
  onSelecting: (selecting: boolean) => void;
  onToggle: (chatId: string) => void;
  onDelete: () => void;
  /** What the home indicator covers at the bottom. */
  bottomInset: number;
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
  divider: boolean;
  selecting: boolean;
  checked: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function ChatRow({ chat, divider, selecting, checked, onPress, onLongPress }: RowProps) {
  return (
    <PressableScale
      haptic="tap"
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityState={selecting ? { checked } : undefined}
      className={cn('flex-row gap-3 px-2 py-3.5', divider && 'border-t border-chip')}
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
    </PressableScale>
  );
}

/**
 * The coach's earlier chats (design CO2-G): grouped by when they were last used, with search.
 * "Auswählen" (or a long press) puts boxes in front for deleting several at once.
 */
export function CoachHistoryView({
  sections,
  query,
  onQuery,
  onOpen,
  onBack,
  onNew,
  selecting,
  selected,
  onSelecting,
  onToggle,
  onDelete,
  bottomInset,
}: CoachHistoryViewProps) {
  const { t } = useTranslation(['coach', 'common']);
  const insets = useSafeAreaInsets();
  const empty = !sections.length;
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3.5 px-5 pt-1.5 pb-5">
        {selecting ? (
          <IconButton
            icon="close"
            accessibilityLabel={t('common:actions.cancel')}
            onPress={() => onSelecting(false)}
          />
        ) : (
          <IconButton
            icon="chevron-left"
            accessibilityLabel={t('common:actions.back')}
            onPress={onBack}
          />
        )}
        <Text
          numberOfLines={1}
          className="min-w-0 flex-1 font-inter-semibold text-[17px] leading-5 text-fg"
        >
          {selecting
            ? t('coach:history.selected', { count: selected.size })
            : t('coach:history.title')}
        </Text>
        {selecting ? (
          <PressableScale
            haptic="warning"
            disabled={!selected.size}
            onPress={onDelete}
            className={cn('h-10.5 justify-center px-1', !selected.size && 'opacity-35')}
          >
            <Text className="font-inter-semibold text-label text-red">
              {t('coach:history.delete')}
            </Text>
          </PressableScale>
        ) : (
          <>
            {!empty ? (
              <PressableScale
                haptic="tap"
                onPress={() => onSelecting(true)}
                className="h-10.5 justify-center px-1"
              >
                <Text className="font-inter-semibold text-label text-fg">
                  {t('coach:history.select')}
                </Text>
              </PressableScale>
            ) : null}
            <IconButton
              icon="plus"
              iconSize={12}
              color={colors.onAccent}
              accessibilityLabel={t('coach:newChat')}
              onPress={onNew}
              className="bg-accent"
            />
          </>
        )}
      </View>
      <View className="mx-5 h-11 flex-row items-center gap-2.5 rounded-full bg-chip px-4">
        <Icon name="search" size={15} color={colors.dim} />
        <TextInput
          value={query}
          onChangeText={onQuery}
          placeholder={t('coach:history.search')}
          placeholderTextColor={colors.dim}
          selectionColor={colors.fg}
          cursorColor={colors.fg}
          keyboardAppearance="dark"
          returnKeyType="search"
          className="min-w-0 flex-1 py-0 font-inter text-label text-fg"
        />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: bottomInset + 24 }}
      >
        {empty ? (
          <Text className="pt-12 text-center font-inter text-label leading-[22px] text-subtle">
            {query ? t('coach:history.noResults') : t('coach:history.empty')}
          </Text>
        ) : null}
        {sections.map((section) => (
          <View key={section.key}>
            <View className="px-2 pt-[18px] pb-1">
              <Text className="font-inter-semibold text-[11px] leading-[13px] tracking-[1.1px] text-dim uppercase">
                {section.title}
              </Text>
            </View>
            {section.chats.map((chat, i) => (
              <ChatRow
                key={chat.id}
                chat={chat}
                divider={i > 0}
                selecting={selecting}
                checked={selected.has(chat.id)}
                onPress={() => (selecting ? onToggle(chat.id) : onOpen(chat.id))}
                onLongPress={() => {
                  if (!selecting) onSelecting(true);
                  onToggle(chat.id);
                }}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
