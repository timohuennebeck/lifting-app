import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Icon, type IconName } from '@/shared/ui/icon';

import { ExportSheet } from './export-sheet';
import { PreferenceCard } from './preference-card';
import { SettingsOverline } from './settings-section';

/** Import and export of the user's data. Importing isn't built yet: its card does nothing. */
export function DataSection() {
  const { t } = useTranslation('profile');
  const [exporting, setExporting] = useState(false);
  return (
    <View className="gap-2.5 px-4 pt-7">
      <SettingsOverline title={t('settings.data.title')} />
      <View className="flex-row gap-2.5">
        <PreferenceCard
          label={t('settings.data.import')}
          value={t('settings.data.importFormats')}
          icon={<CardIcon name="upload" />}
          onPress={() => {}}
        />
        <PreferenceCard
          label={t('settings.data.export')}
          value={t('settings.data.exportFormat')}
          icon={<CardIcon name="download" />}
          onPress={() => setExporting(true)}
        />
      </View>
      <ExportSheet
        visible={exporting}
        onClose={() => setExporting(false)}
        onRetry={() => setExporting(true)}
      />
    </View>
  );
}

function CardIcon({ name }: { name: IconName }) {
  return (
    <View className="size-8 items-center justify-center rounded-full bg-control">
      <Icon name={name} size={14} color={colors.fg} />
    </View>
  );
}
