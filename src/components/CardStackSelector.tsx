import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  interpolate,
  Extrapolation,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
export type CardStackSelectorProps<T> = {
  items: readonly T[];
  keyExtractor: (item: T) => string;
  getAccessibilityLabel: (item: T) => string;
  renderCard: (info: { item: T; isSelected: boolean }) => ReactNode;
  selectedId?: string;
  defaultSelectedId?: string;
  onSelectedChange?: (id: string) => void;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  collapseOnSelect?: boolean;
  cardHeight: number;
  collapsedOffset?: number;
  spacing?: number;
  springConfig?: { stiffness?: number; damping?: number; mass?: number };
  style?: StyleProp<ViewStyle>;
  testID?: string;
};
function StackCard({
  index,
  count,
  progress,
  selection,
  height,
  offset,
  spacing,
  selected,
  expanded,
  label,
  onPress,
  children,
}: {
  index: number;
  count: number;
  progress: SharedValue<number>;
  selection: SharedValue<number>;
  height: number;
  offset: number;
  spacing: number;
  selected: boolean;
  expanded: boolean;
  label: string;
  onPress: () => void;
  children: ReactNode;
}) {
  const positions = useMemo(
    () =>
      Array.from({ length: count }, (_, chosen) =>
        index === chosen ? 0 : index < chosen ? index + 1 : index
      ),
    [count, index]
  );
  const indices = useMemo(() => positions.map((_, i) => i), [positions]);
  const animatedStyle = useAnimatedStyle(() => {
    const rank =
      count === 1
        ? 0
        : interpolate(selection.value, indices, positions, Extrapolation.CLAMP);
    return {
      transform: [
        {
          translateY:
            rank * offset * (1 - progress.value) +
            index * (height + spacing) * progress.value,
        },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.card,
        { height, zIndex: selected ? count + 1 : count - index },
        animatedStyle,
      ]}
      pointerEvents={expanded || selected ? 'auto' : 'none'}
      accessibilityElementsHidden={!expanded && !selected}
      importantForAccessibility={
        !expanded && !selected ? 'no-hide-descendants' : 'auto'
      }
    >
      <Pressable
        style={styles.target}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected, expanded }}
        onPress={onPress}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
export function CardStackSelector<T>({
  items,
  keyExtractor,
  getAccessibilityLabel,
  renderCard,
  selectedId,
  defaultSelectedId,
  onSelectedChange,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  collapseOnSelect = true,
  cardHeight,
  collapsedOffset = 16,
  spacing = 12,
  springConfig,
  style,
  testID,
}: CardStackSelectorProps<T>) {
  const ids = items.map(keyExtractor);
  if (new Set(ids).size !== ids.length)
    throw new Error('CardStackSelector requires unique item IDs');
  if (!Number.isFinite(cardHeight) || cardHeight < 48)
    throw new Error('cardHeight must be finite and at least 48');
  if (
    !Number.isFinite(collapsedOffset) ||
    collapsedOffset < 0 ||
    collapsedOffset > cardHeight / 2
  )
    throw new Error('collapsedOffset must be between 0 and half cardHeight');
  if (!Number.isFinite(spacing) || spacing < 0)
    throw new Error('spacing must be finite and nonnegative');
  const [internalId, setInternalId] = useState(defaultSelectedId);
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const candidate = selectedId ?? internalId;
  const currentId = ids.includes(candidate ?? '') ? candidate : ids[0];
  const currentIndex = Math.max(0, ids.indexOf(currentId ?? ''));
  const open = expanded ?? internalExpanded;
  const requestedId = useRef(currentId);
  const requestedOpen = useRef(open);
  useEffect(() => {
    requestedId.current = currentId;
  }, [currentId]);
  useEffect(() => {
    requestedOpen.current = open;
  }, [open]);
  const progress = useSharedValue(open ? 1 : 0);
  const selection = useSharedValue(currentIndex);
  const stiffness = springConfig?.stiffness ?? 260;
  const damping = springConfig?.damping ?? 30;
  const mass = springConfig?.mass ?? 1;
  if (
    [stiffness, damping, mass].some(
      (value) => !Number.isFinite(value) || value <= 0
    )
  )
    throw new Error(
      'CardStackSelector spring parameters must be finite and positive'
    );
  useEffect(() => {
    const config = {
      stiffness,
      damping,
      mass,
      overshootClamping: true,
      reduceMotion: ReduceMotion.System,
    };
    progress.value = withSpring(open ? 1 : 0, config);
    selection.value = withSpring(currentIndex, config);
  }, [open, currentIndex, progress, selection, stiffness, damping, mass]);
  useEffect(
    () => () => {
      cancelAnimation(progress);
      cancelAnimation(selection);
    },
    [progress, selection]
  );
  const count = items.length;
  const containerStyle = useAnimatedStyle(() => ({
    height:
      count === 0
        ? 0
        : cardHeight +
          (count - 1) *
            (collapsedOffset * (1 - progress.value) +
              (cardHeight + spacing) * progress.value),
  }));
  function requestExpansion(next: boolean) {
    if (requestedOpen.current === next) return;
    requestedOpen.current = next;
    if (expanded === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
  }
  if (count === 0) return null;
  return (
    <View style={style} testID={testID}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={open ? 'Collapse cards' : 'Expand cards'}
        accessibilityState={{ expanded: open }}
        onPress={() => requestExpansion(!requestedOpen.current)}
        style={styles.control}
      >
        <Text>{open ? 'Close cards' : 'Choose a card'}</Text>
      </Pressable>
      <Animated.View style={containerStyle}>
        {items.map((item, index) => (
          <StackCard
            key={ids[index]}
            index={index}
            count={count}
            progress={progress}
            selection={selection}
            height={cardHeight}
            offset={collapsedOffset}
            spacing={spacing}
            selected={ids[index] === currentId}
            expanded={open}
            label={getAccessibilityLabel(item)}
            onPress={() => {
              if (!open) {
                requestExpansion(true);
                return;
              }
              const id = ids[index]!;
              if (requestedId.current !== id) {
                requestedId.current = id;
                if (selectedId === undefined) setInternalId(id);
                onSelectedChange?.(id);
              }
              if (collapseOnSelect) requestExpansion(false);
            }}
          >
            {renderCard({ item, isSelected: ids[index] === currentId })}
          </StackCard>
        ))}
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: { position: 'absolute', left: 0, right: 0 },
  target: { flex: 1 },
  control: { minHeight: 48, justifyContent: 'center' },
});
