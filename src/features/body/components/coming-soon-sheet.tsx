import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useAccentColor } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

export interface ComingSoonSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Placeholder for the camera body check, which ships in a later pass. */
export function ComingSoonSheet({ visible, onClose }: ComingSoonSheetProps) {
  const { t } = useTranslation('body');
  const accent = useAccentColor();
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="items-center gap-4 px-2 pt-2 pb-6">
        <View className="size-16 items-center justify-center rounded-full bg-elevated">
          <Icon name="camera" size={26} color={accent} />
        </View>
        <Text variant="headline" className="text-center">
          {t('comingSoon.title')}
        </Text>
        <Text variant="paragraph" tone="muted" className="text-center">
          {t('comingSoon.body')}
        </Text>
      </View>
      <Button label={t('comingSoon.ok')} variant="secondary" onPress={onClose} />
    </Sheet>
  );
}
