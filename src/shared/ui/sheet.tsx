import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetFooter,
  type BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { type ReactNode, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { withUniwind } from 'uniwind';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { Text } from './text';

/** Gorhom's list and input with className support; use them inside a Sheet. */
export const SheetFlatList = withUniwind(BottomSheetFlatList) as typeof BottomSheetFlatList;
export const SheetTextInput = withUniwind(BottomSheetTextInput);
const SheetView = withUniwind(BottomSheetView);

/** Runs `fn` once a closing sheet has animated out, so sheets never overlap. */
export const afterSheetClose = (fn: () => void) => setTimeout(fn, 320);

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  /** Fixed heights such as ['92%']; omit to size the sheet to its content. */
  snapPoints?: string[];
  /** Pinned to the bottom of the sheet; rides above the keyboard. */
  footer?: ReactNode;
}

function Backdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.6}
      pressBehavior="close"
    />
  );
}

/**
 * Native-feeling bottom sheet (Gorhom): drag to dismiss, backdrop tap closes,
 * keyboard-aware. Keeps the controlled `visible`/`onClose` API of the app.
 */
export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  className,
  snapPoints,
  footer,
}: SheetProps) {
  const footerInset = useFooterInset();
  const ref = useRef<BottomSheetModal>(null);
  const visibleRef = useRef(visible);

  useEffect(() => {
    visibleRef.current = visible;
    if (visible) ref.current?.present();
    else ref.current?.dismiss();
  }, [visible]);

  const fixed = !!snapPoints;

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={!fixed}
      // Only report user dismissals (drag, backdrop); parent-driven closes are already known.
      onDismiss={() => visibleRef.current && onClose()}
      backdropComponent={Backdrop}
      backgroundStyle={{ backgroundColor: colors.sheet, borderRadius: 34 }}
      handleIndicatorStyle={{ backgroundColor: colors.track, width: 36, height: 5 }}
      keyboardBehavior={fixed ? 'extend' : 'interactive'}
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      footerComponent={
        footer
          ? (props: BottomSheetFooterProps) => (
              <BottomSheetFooter {...props} bottomInset={footerInset}>
                <View className="bg-sheet px-4 pt-2">{footer}</View>
              </BottomSheetFooter>
            )
          : undefined
      }
    >
      <SheetView
        // 01·V·A sheets: title 22pt below the handle, content ends 30pt above the edge.
        className={cn('px-4 pt-3', fixed && 'flex-1', className)}
        style={{ paddingBottom: footer ? 0 : footerInset }}
      >
        {title ? (
          <View className="mb-5 gap-1.5 px-1">
            <Text variant="headline">{title}</Text>
            {subtitle ? (
              <Text variant="label" tone="subtle" className="font-inter">
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
        {children}
      </SheetView>
    </BottomSheetModal>
  );
}
