import { router } from 'expo-router';
import { TopTabs } from 'expo-router/js-top-tabs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { openPlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { SwipeTabs } from '@/shared/components/swipe-tabs';
import { TabHeader } from '@/shared/components/tab-header';
import { useCurrentPlan } from '@/shared/data/plans';
import { QueryFocus } from '@/shared/data/query-focus';
import { IconButton } from '@/shared/ui/icon-button';
import { afterSheetClose } from '@/shared/ui/sheet';

import { CreateSheet } from './create-sheet';

/**
 * Training tab: "Pläne" (the user's plans) and "Einzeltrainings"
 * (their routines outside a plan) as swipeable top tabs. "+" makes a routine or a plan.
 */
export function TrainingLayout() {
  const { t } = useTranslation('training');
  const insets = useSafeAreaInsets();
  const { plan, profile } = useCurrentPlan();
  const [createOpen, setCreateOpen] = useState(false);
  const createPlan = () => openPlanFlow(profile, '/training', plan?.sessionsPerWeek);

  return (
    <QueryFocus>
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
        <TabHeader
          actions={
            <IconButton
              icon="plus"
              iconSize={14}
              accessibilityLabel={t('header.create')}
              onPress={() => setCreateOpen(true)}
            />
          }
        />
        <SwipeTabs>
          <TopTabs.Screen name="index" options={{ title: t('tabs.myPlan') }} />
          <TopTabs.Screen name="all" options={{ title: t('tabs.all') }} />
        </SwipeTabs>
      </View>
      <CreateSheet
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreateRoutine={() => {
          setCreateOpen(false);
          afterSheetClose(() => router.push('/routine/new'));
        }}
        onCreatePlan={() => {
          setCreateOpen(false);
          afterSheetClose(createPlan);
        }}
      />
    </QueryFocus>
  );
}
