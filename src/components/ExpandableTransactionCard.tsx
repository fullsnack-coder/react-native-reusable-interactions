import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export type ExpandableTransactionCardSpringConfig = {
  stiffness?: number;
  damping?: number;
  mass?: number;
};

export type ExpandableTransactionCardProps = {
  collapsedContent: React.ReactNode;
  expandedContent: React.ReactNode;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  springConfig?: ExpandableTransactionCardSpringConfig;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
};

/** A native, in-place disclosure card. The compact content is the toggle region. */
export function ExpandableTransactionCard({
  collapsedContent,
  expandedContent,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  springConfig,
  style,
  accessibilityLabel,
  testID,
}: ExpandableTransactionCardProps) {
  const controlled = expanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlled ? expanded : internalExpanded;
  const requestedExpanded = useRef(isExpanded);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const measuredOnce = useRef(false);
  const revealHeight = useSharedValue(0);
  const stiffness = springConfig?.stiffness ?? 240;
  const damping = springConfig?.damping ?? 28;
  const mass = springConfig?.mass ?? 1;
  if (
    [stiffness, damping, mass].some(
      (value) => !Number.isFinite(value) || value <= 0
    )
  )
    throw new Error(
      'ExpandableTransactionCard spring parameters must be finite and positive'
    );

  useEffect(() => {
    requestedExpanded.current = isExpanded;
  }, [isExpanded]);

  useEffect(() => {
    if (contentHeight === null) return;
    const target = isExpanded ? contentHeight : 0;
    if (!measuredOnce.current) {
      revealHeight.value = target;
      measuredOnce.current = true;
    } else {
      revealHeight.value = withSpring(target, {
        stiffness,
        damping,
        mass,
        overshootClamping: true,
        reduceMotion: ReduceMotion.System,
      });
    }
  }, [contentHeight, isExpanded, revealHeight, stiffness, damping, mass]);

  useEffect(() => () => cancelAnimation(revealHeight), [revealHeight]);

  const requestToggle = useCallback(() => {
    const next = !requestedExpanded.current;
    requestedExpanded.current = next;
    if (!controlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  }, [controlled, onExpandedChange]);

  const tap = Gesture.Tap()
    .runOnJS(true)
    .withTestId(
      testID ? `${testID}-gesture` : 'expandable-transaction-card-gesture'
    )
    .onEnd((_event, success) => {
      if (success) requestToggle();
    });

  const onContentLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.height;
    setContentHeight((previous) => (previous === next ? previous : next));
  }, []);

  const revealStyle = useAnimatedStyle(() => ({
    height:
      contentHeight === null && isExpanded ? undefined : revealHeight.value,
    opacity:
      contentHeight === null && isExpanded
        ? 1
        : Math.min(1, revealHeight.value / 48),
  }));

  return (
    <View style={style} testID={testID}>
      <GestureDetector gesture={tap}>
        <View
          accessible
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? 'Transaction details'}
          accessibilityHint={isExpanded ? 'Collapse details' : 'Expand details'}
          accessibilityState={{ expanded: isExpanded }}
          accessibilityActions={[{ name: 'activate', label: 'Toggle details' }]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'activate') requestToggle();
          }}
          style={styles.toggle}
          testID={testID ? `${testID}-toggle` : undefined}
        >
          {collapsedContent}
        </View>
      </GestureDetector>
      <Animated.View
        style={[styles.reveal, revealStyle]}
        pointerEvents={isExpanded ? 'auto' : 'none'}
        importantForAccessibility={isExpanded ? 'auto' : 'no-hide-descendants'}
        accessibilityElementsHidden={!isExpanded}
        testID={testID ? `${testID}-details` : undefined}
      >
        <View
          onLayout={onContentLayout}
          collapsable={false}
          style={styles.measuredContent}
        >
          {expandedContent}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { minHeight: 48, justifyContent: 'center' },
  reveal: { overflow: 'hidden' },
  measuredContent: { position: 'absolute', top: 0, left: 0, right: 0 },
});
