import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AccessibilityInfo, I18nManager, StyleSheet, View } from 'react-native';
import type {
  LayoutChangeEvent,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export type SwipeToPayStatus = 'idle' | 'processing' | 'success' | 'error';
export type SwipeToPayProps = {
  label: string;
  status: SwipeToPayStatus;
  onConfirm: () => void;
  disabled?: boolean;
  threshold?: number;
  resetKey?: string | number;
  height?: number;
  accessibilityLabel?: string;
  labels?: Partial<
    Record<
      'confirmed' | 'processing' | 'success' | 'error' | 'disabled',
      string
    >
  >;
  style?: StyleProp<ViewStyle>;
  trackStyle?: StyleProp<ViewStyle>;
  handleStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  springConfig?: { stiffness?: number; damping?: number; mass?: number };
  testID?: string;
};
const defaultLabels = {
  confirmed: 'Confirmed',
  processing: 'Processing',
  success: 'Completed',
  error: 'Failed — reset to retry',
  disabled: 'Unavailable',
};

/** Horizontal confirmation UI. The consumer owns operation results and retry. */
export function SwipeToPay({
  label,
  status,
  onConfirm,
  disabled = false,
  threshold = 0.85,
  resetKey,
  height = 64,
  accessibilityLabel,
  labels,
  style,
  trackStyle,
  handleStyle,
  labelStyle,
  springConfig,
  testID,
}: SwipeToPayProps) {
  if (!Number.isFinite(threshold) || threshold < 0.5 || threshold > 1)
    throw new Error('SwipeToPay threshold must be between 0.5 and 1');
  if (!Number.isFinite(height) || height < 56)
    throw new Error('SwipeToPay height must be at least 56');
  const stiffness = springConfig?.stiffness ?? 260;
  const damping = springConfig?.damping ?? 30;
  const mass = springConfig?.mass ?? 1;
  if (
    [stiffness, damping, mass].some(
      (value) => !Number.isFinite(value) || value <= 0
    )
  )
    throw new Error('SwipeToPay spring parameters must be finite and positive');
  const spring = useMemo(
    () => ({
      stiffness,
      damping,
      mass,
      overshootClamping: true,
      reduceMotion: ReduceMotion.System,
    }),
    [stiffness, damping, mass]
  );
  const [width, setWidth] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const handleSize = height - 8;
  const distance = Math.max(0, width - handleSize - 8);
  const rtl = I18nManager.isRTL;
  const position = useSharedValue(0);
  const start = useSharedValue(0);
  const engaged = useSharedValue(false);
  const travel = useSharedValue(distance);
  const locked = useSharedValue(false);
  const allowed = useSharedValue(false);
  const dragging = useSharedValue(false);
  const invalid = useSharedValue(false);
  const generation = useSharedValue(0);
  const gestureGeneration = useSharedValue(0);
  const epoch = useRef(0);
  const mounted = useRef(true);
  const latch = useRef(false);
  const previous = useRef({ status, resetKey, distance });
  const latest = useRef({ status, disabled, width, onConfirm });
  latest.current = { status, disabled, width, onConfirm };

  useLayoutEffect(() => {
    const reset =
      status === 'idle' &&
      (previous.current.status !== 'idle' ||
        previous.current.resetKey !== resetKey);
    const resized = previous.current.distance !== distance;
    previous.current = { status, resetKey, distance };
    if (reset) latch.current = false;
    if (status !== 'idle') latch.current = true;
    epoch.current += 1;
    generation.value = epoch.current;
    travel.value = distance;
    allowed.value = !disabled && status === 'idle' && width >= 48;
    locked.value = latch.current || status !== 'idle';
    dragging.value = false;
    engaged.value = false;
    cancelAnimation(position);
    const target = status === 'error' ? 0 : latch.current ? distance : 0;
    position.value = resized ? target : withSpring(target, spring);
    setConfirmed(status === 'idle' && latch.current);
  }, [
    status,
    disabled,
    resetKey,
    distance,
    width,
    allowed,
    dragging,
    engaged,
    generation,
    locked,
    position,
    travel,
    spring,
    threshold,
    rtl,
  ]);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      epoch.current += 1;
      cancelAnimation(position);
    };
  }, [position]);

  const accept = useCallback(
    (attempt: number) => {
      const current = latest.current;
      if (
        !mounted.current ||
        epoch.current !== attempt ||
        latch.current ||
        current.disabled ||
        current.status !== 'idle' ||
        current.width < 48
      )
        return;
      latch.current = true;
      locked.value = true;
      position.value = withSpring(travel.value, spring);
      setConfirmed(true);
      current.onConfirm();
    },
    [locked, position, spring, travel]
  );

  const pan = usePanGesture({
    testID: testID ? `${testID}-pan` : 'swipe-to-pay-pan',
    enabled: !disabled && status === 'idle' && !confirmed && distance >= 48,
    activeOffsetX: [-8, 8],
    failOffsetY: [-10, 10],
    minPointers: 1,
    maxPointers: 1,
    onTouchesDown: (event) => {
      if (event.numberOfTouches > 1) invalid.value = true;
    },
    onBegin: (event) => {
      if (!allowed.value || locked.value || travel.value < 48) return;
      cancelAnimation(position);
      start.value = position.value;
      gestureGeneration.value = generation.value;
      invalid.value = event.numberOfPointers !== 1;
      engaged.value = true;
    },
    onActivate: (event) => {
      if (!engaged.value || !allowed.value || locked.value || travel.value < 48)
        return;
      if (event.numberOfPointers !== 1) invalid.value = true;
      dragging.value = true;
    },
    onUpdate: (event) => {
      if (
        !dragging.value ||
        locked.value ||
        !allowed.value ||
        gestureGeneration.value !== generation.value
      )
        return;
      if (event.numberOfPointers !== 1) invalid.value = true;
      position.value = Math.max(
        0,
        Math.min(
          travel.value,
          start.value + event.translationX * (rtl ? -1 : 1)
        )
      );
    },
    onDeactivate: (event) => {
      if (!dragging.value) return;
      dragging.value = false;
      engaged.value = false;
      if (
        !allowed.value ||
        locked.value ||
        gestureGeneration.value !== generation.value
      )
        return;
      const released = Math.max(
        0,
        Math.min(
          travel.value,
          start.value + event.translationX * (rtl ? -1 : 1)
        )
      );
      position.value = released;
      if (
        !event.canceled &&
        !invalid.value &&
        travel.value >= 48 &&
        released / travel.value >= threshold
      ) {
        locked.value = true;
        position.value = withSpring(travel.value, spring);
        scheduleOnRN(accept, gestureGeneration.value);
      } else position.value = withSpring(0, spring);
    },
    onFinalize: () => {
      if (engaged.value) {
        engaged.value = false;
        dragging.value = false;
        if (!locked.value && gestureGeneration.value === generation.value)
          position.value = withSpring(0, spring);
      }
    },
  });

  const words = {
    confirmed: labels?.confirmed ?? defaultLabels.confirmed,
    processing: labels?.processing ?? defaultLabels.processing,
    success: labels?.success ?? defaultLabels.success,
    error: labels?.error ?? defaultLabels.error,
    disabled: labels?.disabled ?? defaultLabels.disabled,
  };
  const feedback =
    status !== 'idle'
      ? words[status]
      : confirmed
        ? words.confirmed
        : disabled
          ? words.disabled
          : label;
  const previousStatus = useRef(status);
  useEffect(() => {
    if (previousStatus.current !== status && status !== 'idle')
      AccessibilityInfo.announceForAccessibility(feedback);
    previousStatus.current = status;
  }, [status, feedback]);
  const unavailable = disabled || status !== 'idle' || confirmed || width < 48;
  const handleAnimation = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: rtl
          ? -Math.max(0, Math.min(travel.value, position.value))
          : Math.max(0, Math.min(travel.value, position.value)),
      },
    ],
  }));
  const fillAnimation = useAnimatedStyle(() => {
    const progress =
      travel.value > 0
        ? Math.max(0, Math.min(1, position.value / travel.value))
        : 0;
    return {
      transform: [
        { translateX: ((rtl ? 1 : -1) * width * (1 - progress)) / 2 },
        { scaleX: progress },
      ],
    };
  });
  const labelAnimation = useAnimatedStyle(() => ({
    opacity:
      status === 'idle' && !confirmed && travel.value > 0
        ? Math.max(0, 1 - (position.value / travel.value) * 2.5)
        : 1,
  }));
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const next = Math.max(0, event.nativeEvent.layout.width);
    setWidth((current) => (current === next ? current : next));
  }, []);
  const activate = () => accept(epoch.current);
  return (
    <View
      style={style}
      testID={testID}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityValue={{ text: feedback }}
      accessibilityState={{
        disabled: unavailable,
        busy: status === 'processing' || confirmed,
      }}
      accessibilityActions={[
        { name: 'activate', label: accessibilityLabel ?? label },
      ]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'activate') activate();
      }}
      onAccessibilityTap={activate}
    >
      <View
        onLayout={onLayout}
        testID={testID ? `${testID}-track` : undefined}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.track,
          { minHeight: height },
          status === 'error' && styles.error,
          status === 'success' && styles.success,
          disabled && styles.disabled,
          trackStyle,
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.fill, fillAnimation]}
        />
        <Animated.Text
          style={[
            styles.label,
            { paddingHorizontal: handleSize + 12 },
            labelStyle,
            labelAnimation,
          ]}
        >
          {feedback}
        </Animated.Text>
        <GestureDetector gesture={pan}>
          <Animated.View
            accessible={false}
            style={[
              styles.handle,
              {
                width: handleSize,
                height: handleSize,
                borderRadius: handleSize / 2,
                marginTop: -handleSize / 2,
              },
              handleStyle,
              handleAnimation,
            ]}
          >
            <View
              testID={testID ? `${testID}-arrow` : undefined}
              accessible={false}
              pointerEvents="none"
              style={[styles.arrow, rtl && styles.arrowRTL]}
            >
              <View style={styles.arrowShaft} />
              <View style={styles.arrowHead} />
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  track: {
    backgroundColor: '#E8ECE8',
    borderRadius: 32,
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C4CEC6',
  },
  label: {
    fontSize: 16,
    color: '#173B2C',
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 16,
  },
  handle: {
    position: 'absolute',
    start: 3,
    top: '50%',
    backgroundColor: '#173B2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Decorative geometry avoids font baseline/padding differences on Android.
  arrow: { width: 24, height: 24 },
  arrowRTL: { transform: [{ rotate: '180deg' }] },
  arrowShaft: {
    position: 'absolute',
    left: 3,
    right: 4,
    top: 11,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  arrowHead: {
    position: 'absolute',
    right: 4,
    top: 7,
    width: 10,
    height: 10,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#BCD5C3',
  },
  error: { borderColor: '#9A302C', backgroundColor: '#F7E6E4' },
  success: { borderColor: '#356B45' },
  disabled: { opacity: 0.5 },
});
