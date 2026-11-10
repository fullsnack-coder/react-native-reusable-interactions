import {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';
import {
  compareAmounts,
  createBalanceFormatter,
  digitDestination,
} from './animated-balance-model';
import type { BalanceModel } from './animated-balance-model';

export type AnimatedBalanceProps = {
  value: string;
  currency?: string;
  locale?: string;
  fractionDigits?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  testID?: string;
};
const wheel = Array.from({ length: 30 }, (_, index) => String(index % 10)).join(
  '\n'
);

function useSystemReducedMotion() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    let mounted = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (value) => {
        changed = true;
        if (mounted) setReduced(value);
      }
    );
    AccessibilityInfo.isReduceMotionEnabled().then(
      (value) => {
        if (mounted && !changed) setReduced(value);
      },
      () => {
        /* Keep the conservative no-motion fallback. */
      }
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  return reduced;
}

const Digit = memo(function RollingDigit({
  digit,
  direction,
  duration,
  reduced,
  width,
  height,
  textStyle,
  testID,
}: {
  digit: number;
  direction: number;
  duration: number;
  reduced: boolean;
  width: number;
  height: number;
  textStyle: TextStyle;
  testID?: string;
}) {
  const offset = useSharedValue(digit);
  const previous = useRef(digit);
  useLayoutEffect(() => {
    const changed = previous.current !== digit;
    previous.current = digit;
    if (!changed && !reduced && duration !== 0) return;
    scheduleOnUI(
      (next: number, trend: number, animate: boolean, ms: number) => {
        'worklet';
        cancelAnimation(offset);
        if (!animate) {
          offset.value = next;
          return;
        }
        const destination = digitDestination(offset.value, next, trend);
        offset.value = destination.current;
        offset.value = withTiming(destination.target, {
          duration: ms,
          easing: Easing.out(Easing.cubic),
          reduceMotion: ReduceMotion.System,
        });
      },
      digit,
      direction,
      changed && !reduced && duration > 0,
      duration
    );
  }, [digit, direction, duration, offset, reduced]);
  useLayoutEffect(() => () => cancelAnimation(offset), [offset]);
  const movement = useAnimatedStyle(() => ({
    transform: [
      { translateY: -(10 + (((offset.value % 10) + 10) % 10)) * height },
    ],
  }));
  return (
    <View testID={testID} style={[styles.clip, { width, height }]}>
      <Animated.View style={[{ width, height: height * 30 }, movement]}>
        <Text
          allowFontScaling={false}
          accessible={false}
          style={[
            textStyle,
            styles.wheelText,
            { width, lineHeight: height, height: height * 30 },
          ]}
        >
          {wheel}
        </Text>
      </Animated.View>
    </View>
  );
});

function Face({
  model,
  textStyle,
  height,
  duration,
  reduced,
  testID,
}: {
  model: BalanceModel;
  textStyle: TextStyle;
  height: number;
  duration: number;
  reduced: boolean;
  testID?: string;
}) {
  const [digitWidth, setDigitWidth] = useState(0);
  const widths = useRef(new Map<number, number>());
  const previous = useRef(model.amount);
  const direction = compareAmounts(model.amount, previous.current);
  useLayoutEffect(() => {
    previous.current = model.amount;
  }, [model.amount]);
  return (
    <>
      {model.rolling && (
        <View pointerEvents="none" style={styles.probe}>
          {Array.from({ length: 10 }, (_, digit) => (
            <Text
              key={digit}
              allowFontScaling={false}
              accessible={false}
              testID={testID ? `${testID}-measure-${digit}` : undefined}
              style={textStyle}
              onLayout={(event) => {
                const width = event.nativeEvent.layout.width;
                if (!Number.isFinite(width) || width <= 0) return;
                widths.current.set(digit, width);
                if (widths.current.size === 10)
                  setDigitWidth(
                    Math.ceil(Math.max(...widths.current.values()))
                  );
              }}
            >
              {digit}
            </Text>
          ))}
        </View>
      )}
      {!model.rolling || digitWidth === 0 ? (
        <Text
          testID={testID ? `${testID}-static` : undefined}
          allowFontScaling={false}
          accessible={false}
          style={textStyle}
        >
          {model.formatted}
        </Text>
      ) : (
        <View testID={testID ? `${testID}-row` : undefined} style={styles.row}>
          {model.tokens.map((token) =>
            token.digit === undefined ? (
              <Text
                key={token.key}
                accessible={false}
                allowFontScaling={false}
                style={textStyle}
              >
                {token.text}
              </Text>
            ) : (
              <Digit
                key={token.key}
                digit={token.digit}
                direction={direction}
                duration={duration}
                reduced={reduced}
                width={digitWidth}
                height={height}
                textStyle={textStyle}
                testID={testID ? `${testID}-${token.key}` : undefined}
              />
            )
          )}
        </View>
      )}
    </>
  );
}

/** Exact numeric presentation. No financial arithmetic or automatic announcements. */
export function AnimatedBalance({
  value,
  currency,
  locale = 'en-US',
  fractionDigits,
  duration = 450,
  style,
  textStyle,
  accessibilityLabel,
  testID,
}: AnimatedBalanceProps) {
  if (!Number.isFinite(duration) || duration < 0 || duration > 2000)
    throw new Error(
      'AnimatedBalance duration must be between 0 and 2000 milliseconds'
    );
  const formatter = useMemo(
    () => createBalanceFormatter(locale, currency, fractionDigits),
    [locale, currency, fractionDigits]
  );
  const model = useMemo(() => formatter(value), [formatter, value]);
  const { fontScale } = useWindowDimensions();
  const reduced = useSystemReducedMotion();
  const flattened = StyleSheet.flatten(textStyle) ?? {};
  const size = flattened.fontSize ?? 32;
  const line = flattened.lineHeight ?? Math.ceil(size * 1.4);
  if (
    !Number.isFinite(size) ||
    size <= 0 ||
    !Number.isFinite(line) ||
    line < size
  )
    throw new Error(
      'AnimatedBalance fontSize must be positive and lineHeight at least fontSize'
    );
  const height = line * fontScale;
  const font: TextStyle = {
    color: '#173B2C',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    ...flattened,
    fontSize: size * fontScale,
    lineHeight: height,
    includeFontPadding: false,
  };
  const faceKey = JSON.stringify([locale, currency, fractionDigits, font]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={
        accessibilityLabel
          ? `${accessibilityLabel}: ${model.formatted}`
          : model.formatted
      }
      accessibilityLiveRegion="none"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        style={[styles.scroll, { height }]}
        contentContainerStyle={styles.content}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Face
          key={faceKey}
          model={model}
          textStyle={font}
          height={height}
          duration={duration}
          reduced={reduced}
          testID={testID}
        />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  wheelText: { textAlign: 'center' },
  scroll: { flexGrow: 0 },
  root: { maxWidth: '100%' },
  content: { flexGrow: 1, justifyContent: 'flex-end', alignItems: 'center' },
  row: {
    flexDirection: 'row',
    direction: 'ltr',
    flexShrink: 0,
    alignItems: 'center',
  },
  probe: {
    position: 'absolute',
    left: 0,
    top: 0,
    flexDirection: 'row',
    opacity: 0,
  },
});
