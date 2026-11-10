import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  AppState,
  I18nManager,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type {
  LayoutChangeEvent,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import {
  GestureDetector,
  useLongPressGesture,
} from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export type HoldToConfirmStatus = 'idle' | 'processing' | 'success' | 'error';
export type HoldToConfirmProps = {
  status: HoldToConfirmStatus;
  onConfirm: () => void;
  label?: string;
  /** Integer milliseconds, 500..10000. Native recognition owns completion. */
  holdDuration?: number;
  disabled?: boolean;
  resetKey?: string | number;
  accessibilityLabel?: string;
  labels?: Partial<
    Record<
      'holding' | 'confirmed' | 'processing' | 'success' | 'error' | 'disabled',
      string
    >
  >;
  style?: StyleProp<ViewStyle>;
  progressStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  testID?: string;
};
const defaults = {
  holding: 'Keep holding…',
  confirmed: 'Confirmed',
  processing: 'Processing…',
  success: 'Completed',
  error: 'Not completed — reset to retry',
  disabled: 'Unavailable',
};
const foreground = () =>
  AppState.currentState !== 'background' &&
  AppState.currentState !== 'inactive';

/** Hold confirms intent; the application owns operation results and retry. */
export function HoldToConfirm({
  status,
  onConfirm,
  label = 'Hold to confirm',
  holdDuration = 1200,
  disabled = false,
  resetKey,
  accessibilityLabel,
  labels,
  style,
  progressStyle,
  labelStyle,
  testID,
}: HoldToConfirmProps) {
  if (
    !Number.isInteger(holdDuration) ||
    holdDuration < 500 ||
    holdDuration > 10000
  )
    throw new Error(
      'HoldToConfirm holdDuration must be an integer between 500 and 10000 ms'
    );
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [active, setActive] = useState(foreground);
  const [phase, setPhase] = useState<'idle' | 'holding' | 'confirmed'>('idle');
  const progress = useSharedValue(0);
  const reduced = useSharedValue(true);
  const generation = useSharedValue(0);
  const gestureGeneration = useSharedValue(0);
  const sequence = useSharedValue(0);
  const engaged = useSharedValue(false);
  const invalid = useSharedValue(false);
  const locked = useSharedValue(false);
  const allowed = useSharedValue(false);
  const epoch = useRef(0);
  const attempt = useRef(0);
  const interrupted = useRef(!foreground());
  const mounted = useRef(true);
  const latch = useRef(status !== 'idle');
  const previous = useRef({ status, resetKey });
  const latest = useRef({ status, disabled, onConfirm, active, size });
  latest.current = { status, disabled, onConfirm, active, size };
  const rtl = I18nManager.isRTL;

  useLayoutEffect(() => {
    if (
      status === 'idle' &&
      (previous.current.status !== 'idle' ||
        previous.current.resetKey !== resetKey)
    )
      latch.current = false;
    if (status !== 'idle') latch.current = true;
    previous.current = { status, resetKey };
    epoch.current += 1;
    generation.value = epoch.current;
    engaged.value = false;
    locked.value = latch.current;
    allowed.value =
      !disabled &&
      active &&
      status === 'idle' &&
      size.width > 0 &&
      size.height > 0;
    cancelAnimation(progress);
    progress.value = status === 'error' ? 0 : latch.current ? 1 : 0;
    setPhase(status === 'idle' && latch.current ? 'confirmed' : 'idle');
  }, [
    status,
    disabled,
    active,
    resetKey,
    holdDuration,
    size,
    rtl,
    generation,
    engaged,
    locked,
    allowed,
    progress,
  ]);

  useEffect(() => {
    let alive = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (value) => {
        changed = true;
        reduced.value = value;
      }
    );
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (alive && !changed) reduced.value = value;
      })
      .catch(() => {});
    return () => {
      alive = false;
      subscription.remove();
    };
  }, [reduced]);

  useEffect(() => {
    const interrupt = () => {
      interrupted.current = true;
      epoch.current += 1;
      generation.value = epoch.current;
      engaged.value = false;
      allowed.value = false;
      cancelAnimation(progress);
      progress.value =
        latch.current && latest.current.status !== 'error' ? 1 : 0;
      setPhase(
        latch.current && latest.current.status === 'idle' ? 'confirmed' : 'idle'
      );
      setActive(false);
    };
    const change = AppState.addEventListener('change', (state) => {
      if (state !== 'active') interrupt();
      else {
        interrupted.current = false;
        setActive(true);
      }
    });
    const blur =
      Platform.OS === 'android'
        ? AppState.addEventListener('blur', interrupt)
        : undefined;
    const focus =
      Platform.OS === 'android'
        ? AppState.addEventListener('focus', () => {
            if (foreground()) {
              interrupted.current = false;
              setActive(true);
            }
          })
        : undefined;
    return () => {
      change.remove();
      blur?.remove();
      focus?.remove();
    };
  }, [allowed, engaged, generation, progress]);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      epoch.current += 1;
      generation.value = epoch.current;
      allowed.value = false;
      engaged.value = false;
      cancelAnimation(progress);
    };
  }, [allowed, engaged, generation, progress]);

  const notify = useCallback((token: number, id: number, holding: boolean) => {
    if (!mounted.current || epoch.current !== token || latch.current) return;
    if (holding) {
      attempt.current = id;
      setPhase('holding');
    } else if (attempt.current === id) setPhase('idle');
  }, []);
  const accept = useCallback(
    (token: number, id?: number) => {
      const current = latest.current;
      if (
        !mounted.current ||
        epoch.current !== token ||
        latch.current ||
        current.disabled ||
        interrupted.current ||
        !current.active ||
        !foreground() ||
        current.status !== 'idle' ||
        current.size.width <= 0 ||
        current.size.height <= 0 ||
        (id !== undefined && attempt.current !== id)
      )
        return;
      latch.current = true;
      locked.value = true;
      engaged.value = false;
      cancelAnimation(progress);
      progress.value = 1;
      setPhase('confirmed');
      current.onConfirm();
    },
    [engaged, locked, progress]
  );

  const hold = useLongPressGesture({
    testID: testID ? `${testID}-hold` : 'hold-to-confirm-hold',
    enabled: !disabled && active && status === 'idle' && phase !== 'confirmed',
    minDuration: holdDuration,
    maxDistance: 12,
    numberOfPointers: 1,
    shouldCancelWhenOutside: true,
    onTouchesDown: (event) => {
      if (event.numberOfTouches > 1) {
        invalid.value = true;
        cancelAnimation(progress);
        progress.value = 0;
      }
    },
    onBegin: (event) => {
      if (!allowed.value || locked.value) return;
      invalid.value = event.numberOfPointers !== 1;
      engaged.value = true;
      gestureGeneration.value = generation.value;
      sequence.value += 1;
      cancelAnimation(progress);
      progress.value = 0;
      // Visual clock only. Native LongPress activation is the sole authority.
      progress.value = withTiming(1, {
        duration: holdDuration,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.Never,
      });
      scheduleOnRN(notify, gestureGeneration.value, sequence.value, true);
    },
    onActivate: (event) => {
      if (
        !engaged.value ||
        invalid.value ||
        !allowed.value ||
        locked.value ||
        gestureGeneration.value !== generation.value ||
        event.numberOfPointers !== 1
      )
        return;
      locked.value = true;
      engaged.value = false;
      cancelAnimation(progress);
      progress.value = 1;
      scheduleOnRN(accept, gestureGeneration.value, sequence.value);
    },
    onFinalize: () => {
      if (!engaged.value) return;
      engaged.value = false;
      if (gestureGeneration.value !== generation.value || locked.value) return;
      cancelAnimation(progress);
      progress.value = reduced.value
        ? 0
        : withTiming(0, { duration: 160, reduceMotion: ReduceMotion.System });
      scheduleOnRN(notify, gestureGeneration.value, sequence.value, false);
    },
  });
  const fill = useAnimatedStyle(() => {
    let value = Math.max(0, Math.min(locked.value ? 1 : 0.99, progress.value));
    if (reduced.value && !locked.value) value = Math.floor(value * 4) / 4;
    return {
      transform: [
        { translateX: ((rtl ? 1 : -1) * size.width * (1 - value)) / 2 },
        { scaleX: value },
      ],
    };
  });
  const words = { ...defaults, ...labels };
  const feedback =
    status !== 'idle'
      ? words[status]
      : phase === 'confirmed'
        ? words.confirmed
        : disabled || !active
          ? words.disabled
          : phase === 'holding'
            ? words.holding
            : label;
  const lastAnnouncement = useRef(status === 'idle' ? 'idle' : status);
  useEffect(() => {
    const key =
      status !== 'idle' ? status : phase === 'confirmed' ? 'confirmed' : 'idle';
    if (key !== lastAnnouncement.current && key !== 'idle')
      AccessibilityInfo.announceForAccessibility(feedback);
    lastAnnouncement.current = key;
  }, [status, phase, feedback]);
  const unavailable =
    disabled ||
    !active ||
    status !== 'idle' ||
    phase === 'confirmed' ||
    size.width <= 0;
  const activate = () => accept(epoch.current);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    const next = { width: Math.max(0, width), height: Math.max(0, height) };
    setSize((current) =>
      current.width === next.width && current.height === next.height
        ? current
        : next
    );
  }, []);
  return (
    <GestureDetector gesture={hold}>
      <Animated.View
        testID={testID}
        onLayout={onLayout}
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityValue={{ text: feedback }}
        accessibilityHint="Hold until confirmed, or use the accessibility activate action."
        accessibilityState={{
          disabled: unavailable,
          busy: status === 'processing' || phase === 'confirmed',
        }}
        accessibilityActions={[
          { name: 'activate', label: accessibilityLabel ?? label },
        ]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'activate') activate();
        }}
        onAccessibilityTap={activate}
        style={[
          styles.track,
          status === 'error' && styles.error,
          status === 'success' && styles.success,
          disabled && styles.disabled,
          style,
        ]}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
        >
          <Animated.View
            testID={testID ? `${testID}-progress` : undefined}
            style={[styles.fill, progressStyle, fill]}
          />
          <Text style={[styles.label, labelStyle]}>{feedback}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
const styles = StyleSheet.create({
  track: {
    minHeight: 56,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A8BBAE',
    backgroundColor: '#EBF0EB',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#BCD5C3',
  },
  label: {
    color: '#173B2C',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  disabled: { opacity: 0.5 },
  error: { borderColor: '#9A302C', backgroundColor: '#F7E6E4' },
  success: { borderColor: '#356B45' },
});
