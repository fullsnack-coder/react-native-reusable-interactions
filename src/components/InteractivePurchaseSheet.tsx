import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ComponentRef, ReactNode, RefObject } from 'react';
import {
  AccessibilityInfo,
  Keyboard,
  KeyboardAvoidingView,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import {
  GestureDetector,
  GestureHandlerRootView,
  Touchable,
  usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { usePurchaseSheetHost } from './PurchaseSheetHost';
import {
  sheetDestination,
  sheetHeights,
  validateSheetPoints,
} from './purchase-sheet-model';

export type PurchaseSheetDismissReason =
  'gesture' | 'backdrop' | 'close' | 'back' | 'accessibility';
export type InteractivePurchaseSheetProps = {
  visible: boolean;
  snapPoints: readonly number[];
  snapIndex: number;
  /** Request; apply it through snapIndex, or keep the current index to reject. */
  onSnapIndexChange: (index: number) => void;
  /** Request; set visible=false to acknowledge. */
  onDismissRequest: (reason: PurchaseSheetDismissReason) => void;
  safeAreaInsets: { top: number; bottom: number; left: number; right: number };
  children: ReactNode;
  onSnapChange?: (index: number) => void;
  /** Close animation completed; the host slot is removed in the following commit. */
  onDismiss?: () => void;
  dismissible?: boolean;
  backdropDismissible?: boolean;
  handle?: ReactNode;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  handleLabel?: string;
  closeLabel?: string;
  returnFocusRef?: RefObject<ComponentRef<typeof View> | null>;
  testID?: string;
};
const spring = {
  stiffness: 300,
  damping: 34,
  mass: 1,
  overshootClamping: true,
  reduceMotion: ReduceMotion.System,
};

export function InteractivePurchaseSheet(props: InteractivePurchaseSheetProps) {
  validateSheetPoints(props.snapPoints, props.snapIndex);
  if (
    !props.safeAreaInsets ||
    Object.values(props.safeAreaInsets).some(
      (value) => !Number.isFinite(value) || value < 0
    ) ||
    ['top', 'bottom', 'left', 'right'].some(
      (key) => !(key in props.safeAreaInsets)
    )
  )
    throw new Error(
      'InteractivePurchaseSheet requires finite nonnegative safeAreaInsets'
    );
  const host = usePurchaseSheetHost();
  const owner = useRef({});
  const [presented, setPresented] = useState(props.visible);
  const live = useRef(props.visible);
  const mounted = useRef(true);
  const latest = useRef(props);
  latest.current = props;
  const restoreFrame = useRef<number | undefined>(undefined);
  const restore = useCallback(() => {
    if (!mounted.current || latest.current.visible) return;
    const target = latest.current.returnFocusRef?.current;
    if (target) AccessibilityInfo.sendAccessibilityEvent(target, 'focus');
  }, []);
  useLayoutEffect(() => {
    if (props.visible && !live.current) {
      live.current = true;
      setPresented(true);
    }
  }, [props.visible]);
  useLayoutEffect(() => {
    mounted.current = true;
    const identity = owner.current;
    return () => {
      mounted.current = false;
      host.remove(identity);
      if (restoreFrame.current !== undefined)
        cancelAnimationFrame(restoreFrame.current);
    };
  }, [host]);
  const closed = useCallback(() => {
    if (!mounted.current || latest.current.visible || !live.current) return;
    live.current = false;
    setPresented(false);
    restoreFrame.current = requestAnimationFrame(restore);
    latest.current.onDismiss?.();
  }, [restore]);
  useLayoutEffect(() => {
    if (presented)
      host.present(owner.current, <SheetSurface {...props} closed={closed} />);
    else host.remove(owner.current);
  }, [host, presented, props, closed]);
  return null;
}

type SurfaceProps = InteractivePurchaseSheetProps & { closed: () => void };
function SheetSurface({ closed, ...props }: SurfaceProps) {
  const shown = true;
  const {
    visible,
    snapPoints,
    snapIndex,
    safeAreaInsets,
    dismissible = true,
    backdropDismissible = true,
    testID,
  } = props;
  const [viewport, setViewport] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(48);
  const [keyboard, setKeyboard] = useState(false);
  const bottomInset = keyboard ? 0 : safeAreaInsets.bottom;
  const [reduced, setReduced] = useState(true);
  const [phase, setPhase] = useState('opening');
  const pointsKey = JSON.stringify(snapPoints);
  const heights = useMemo(
    () =>
      sheetHeights(
        JSON.parse(pointsKey) as number[],
        viewport,
        Math.max(96, headerHeight + 48)
      ),
    [pointsKey, viewport, headerHeight]
  );
  const position = useSharedValue(0);
  const start = useSharedValue(0);
  const generation = useSharedValue(0);
  const gestureGeneration = useSharedValue(0);
  const engaged = useSharedValue(false);
  const dragging = useSharedValue(false);
  const invalid = useSharedValue(false);
  const epoch = useRef(0);
  const mounted = useRef(true);
  const initialized = useRef(false);
  const lastSnap = useRef<number | undefined>(undefined);
  const focusSent = useRef(false);
  const beforeKeyboard = useRef<number | undefined>(undefined);
  const requested = useRef(false);
  const requestFrame = useRef<number | undefined>(undefined);
  const focusFrame = useRef<number | undefined>(undefined);
  const handleRef = useRef<ComponentRef<typeof View>>(null);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const latest = useRef({
    ...props,
    dismissible,
    backdropDismissible,
    viewport,
    heights,
  });
  latest.current = {
    ...props,
    dismissible,
    backdropDismissible,
    viewport,
    heights,
  };

  const revealInput = useCallback(() => {
    if (!mounted.current || !latest.current.visible) return;
    const input = TextInput.State.currentlyFocusedInput();
    const scroll = scrollRef.current;
    const token = epoch.current;
    if (input && scroll)
      scroll.measureInWindow((_x, top) => {
        if (
          !mounted.current ||
          epoch.current !== token ||
          !latest.current.visible ||
          TextInput.State.currentlyFocusedInput() !== input
        )
          return;
        // The responder helper measures content locally but compares against screen keyboard Y.
        scroll.scrollResponderScrollNativeHandleToKeyboard(
          input,
          Math.max(0, top) + 16,
          true
        );
      });
  }, []);
  const finished = useCallback(
    (token: number, index: number) => {
      if (!mounted.current || epoch.current !== token) return;
      const current = latest.current;
      if (index === -1) {
        if (!current.visible) closed();
        return;
      }
      if (!current.visible || current.snapIndex !== index) return;
      setPhase('open');
      if (!focusSent.current) {
        focusSent.current = true;
        if (handleRef.current)
          AccessibilityInfo.sendAccessibilityEvent(handleRef.current, 'focus');
      }
      if (lastSnap.current !== index) {
        lastSnap.current = index;
        AccessibilityInfo.announceForAccessibility(
          `${current.accessibilityLabel ?? 'Sheet'}: ${index + 1} of ${current.snapPoints.length}`
        );
        current.onSnapChange?.(index);
      }
      revealInput();
    },
    [closed, revealInput]
  );

  const settle = useCallback(
    (index: number, token: number) => {
      'worklet';
      cancelAnimation(position);
      const target = index === -1 ? viewport : viewport - heights[index]!;
      if (reduced) {
        position.value = target;
        scheduleOnRN(finished, token, index);
      } else
        position.value = withSpring(target, spring, (complete) => {
          if (complete) scheduleOnRN(finished, token, index);
        });
    },
    [position, viewport, heights, reduced, finished]
  );
  useLayoutEffect(() => {
    const token = ++epoch.current;
    generation.value = token;
    engaged.value = false;
    dragging.value = false;
    cancelAnimation(position);
    if (!initialized.current) {
      position.value = viewport;
      if (viewport > 0) initialized.current = true;
    }
    if (!visible) {
      setPhase('closing');
      if (viewport <= 0 || !shown) closed();
      else settle(-1, token);
    } else if (shown && viewport > 0) {
      setPhase(lastSnap.current === undefined ? 'opening' : 'settling');
      settle(snapIndex, token);
    } else position.value = viewport;
  }, [
    visible,
    shown,
    snapIndex,
    pointsKey,
    viewport,
    dismissible,
    reduced,
    settle,
    generation,
    engaged,
    dragging,
    position,
    closed,
  ]);

  const requestDismiss = useCallback((reason: PurchaseSheetDismissReason) => {
    const current = latest.current;
    if (
      !mounted.current ||
      !current.visible ||
      !current.dismissible ||
      requested.current ||
      (reason === 'backdrop' && !current.backdropDismissible)
    )
      return;
    requested.current = true;
    requestFrame.current = requestAnimationFrame(() => {
      requested.current = false;
    });
    current.onDismissRequest(reason);
  }, []);
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (Keyboard.isVisible()) Keyboard.dismiss();
        else requestDismiss('back');
        return true;
      }
    );
    return () => subscription.remove();
  }, [requestDismiss]);
  const requestSnap = useCallback((index: number) => {
    const current = latest.current;
    if (!mounted.current || !current.visible) return;
    const next = Math.max(0, Math.min(current.snapPoints.length - 1, index));
    if (next !== current.snapIndex) current.onSnapIndexChange(next);
  }, []);
  const released = useCallback(
    (token: number, index: number) => {
      if (
        !mounted.current ||
        epoch.current !== token ||
        !latest.current.visible
      )
        return;
      setPhase('settling');
      if (index === -1) requestDismiss('gesture');
      else requestSnap(index);
    },
    [requestDismiss, requestSnap]
  );
  const begin = useCallback((token: number) => {
    if (mounted.current && epoch.current === token && latest.current.visible)
      setPhase('dragging');
  }, []);

  useEffect(() => {
    let alive = true;
    let changed = false;
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (value) => {
        changed = true;
        if (alive) setReduced(value);
      }
    );
    AccessibilityInfo.isReduceMotionEnabled().then(
      (value) => {
        if (alive && !changed) setReduced(value);
      },
      () => {}
    );
    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      if (!latest.current.visible || beforeKeyboard.current !== undefined)
        return;
      beforeKeyboard.current = latest.current.snapIndex;
      setKeyboard(true);
      requestSnap(latest.current.snapPoints.length - 1);
      focusFrame.current = requestAnimationFrame(revealInput);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      const previous = beforeKeyboard.current;
      beforeKeyboard.current = undefined;
      setKeyboard(false);
      if (previous !== undefined) requestSnap(previous);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [requestSnap, revealInput]);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      epoch.current += 1;
      generation.value = epoch.current;
      engaged.value = false;
      dragging.value = false;
      cancelAnimation(position);
      if (requestFrame.current !== undefined)
        cancelAnimationFrame(requestFrame.current);
      if (focusFrame.current !== undefined)
        cancelAnimationFrame(focusFrame.current);
    };
  }, [generation, engaged, dragging, position]);

  const pan = usePanGesture({
    testID: testID ? `${testID}-pan` : 'purchase-sheet-pan',
    enabled: visible && shown && viewport > 0,
    activeOffsetY: [-6, 6],
    failOffsetX: [-16, 16],
    minPointers: 1,
    maxPointers: 1,
    onTouchesDown: (event) => {
      if (event.numberOfTouches > 1) invalid.value = true;
    },
    onBegin: (event) => {
      if (!visible || !shown || viewport <= 0) return;
      cancelAnimation(position);
      start.value = position.value;
      gestureGeneration.value = generation.value;
      engaged.value = true;
      invalid.value = event.numberOfPointers !== 1;
    },
    onActivate: () => {
      if (!engaged.value || gestureGeneration.value !== generation.value)
        return;
      dragging.value = true;
      scheduleOnRN(begin, gestureGeneration.value);
    },
    onUpdate: (event) => {
      if (!dragging.value || gestureGeneration.value !== generation.value)
        return;
      if (event.numberOfPointers !== 1) invalid.value = true;
      position.value = Math.max(
        viewport - heights[heights.length - 1]!,
        Math.min(
          dismissible ? viewport : viewport - heights[0]!,
          start.value + event.translationY
        )
      );
    },
    onDeactivate: (event) => {
      if (!dragging.value || gestureGeneration.value !== generation.value)
        return;
      dragging.value = false;
      engaged.value = false;
      const top = Math.max(
        viewport - heights[heights.length - 1]!,
        Math.min(
          dismissible ? viewport : viewport - heights[0]!,
          start.value + event.translationY
        )
      );
      const index =
        event.canceled || invalid.value || event.numberOfPointers > 1
          ? snapIndex
          : sheetDestination(
              top,
              event.velocityY,
              viewport,
              heights,
              dismissible
            );
      if (!event.canceled && !invalid.value) position.value = top;
      // Controlled state owns the destination until the parent acknowledges a request.
      settle(snapIndex, gestureGeneration.value);
      if (!event.canceled && !invalid.value)
        scheduleOnRN(released, gestureGeneration.value, index);
    },
    onFinalize: () => {
      if (engaged.value && gestureGeneration.value === generation.value) {
        engaged.value = false;
        dragging.value = false;
        settle(snapIndex, gestureGeneration.value);
      }
    },
  });
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(0, position.value) }],
    opacity: viewport > 0 && shown ? 1 : 0,
  }));
  const bodyStyle = useAnimatedStyle(() => ({
    height: Math.max(0, viewport - position.value - headerHeight),
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity:
      viewport > 0
        ? 0.4 *
          Math.max(
            0,
            Math.min(
              1,
              (viewport - position.value) / (heights[heights.length - 1] || 1)
            )
          )
        : 0,
  }));
  const layout = (event: LayoutChangeEvent) => {
    const value = Math.max(0, event.nativeEvent.layout.height);
    setViewport((current) => (current === value ? current : value));
  };
  return (
    <GestureHandlerRootView style={styles.fill}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.shade, backdropStyle]}
      />
      {dismissible && backdropDismissible ? (
        <Pressable
          testID={testID ? `${testID}-backdrop` : undefined}
          style={StyleSheet.absoluteFill}
          accessible={false}
          importantForAccessibility="no"
          onPress={() => requestDismiss('backdrop')}
        />
      ) : null}
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        pointerEvents="box-none"
      >
        <View
          testID={testID ? `${testID}-viewport` : undefined}
          onLayout={layout}
          pointerEvents="box-none"
          style={[
            styles.viewport,
            {
              marginTop: safeAreaInsets.top,
              marginBottom: bottomInset,
              marginLeft: safeAreaInsets.left,
              marginRight: safeAreaInsets.right,
            },
          ]}
        >
          <Animated.View
            testID={testID}
            accessibilityViewIsModal
            pointerEvents={visible ? 'auto' : 'none'}
            accessibilityElementsHidden={!visible}
            importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
            accessibilityLabel={props.accessibilityLabel ?? 'Purchase sheet'}
            onAccessibilityEscape={() => requestDismiss('accessibility')}
            style={[
              styles.sheet,
              props.style,
              { height: viewport },
              sheetStyle,
            ]}
          >
            <View
              style={styles.header}
              onLayout={(event) =>
                setHeaderHeight(event.nativeEvent.layout.height)
              }
            >
              <GestureDetector gesture={pan}>
                <Animated.View
                  ref={handleRef}
                  testID={testID ? `${testID}-handle` : undefined}
                  style={styles.handle}
                  accessible
                  accessibilityRole="adjustable"
                  accessibilityLabel={props.handleLabel ?? 'Resize sheet'}
                  accessibilityHint={
                    dismissible
                      ? 'Adjust the sheet size or dismiss.'
                      : 'Adjust the sheet size. Dismissal is unavailable.'
                  }
                  accessibilityValue={{
                    min: 1,
                    max: snapPoints.length,
                    now: snapIndex + 1,
                    text: `${snapIndex + 1} of ${snapPoints.length}`,
                  }}
                  accessibilityActions={[
                    { name: 'increment' },
                    { name: 'decrement' },
                    ...(dismissible
                      ? [
                          {
                            name: 'dismiss',
                            label: props.closeLabel ?? 'Close sheet',
                          },
                        ]
                      : []),
                  ]}
                  onAccessibilityAction={(event) => {
                    const name = event.nativeEvent.actionName;
                    if (name === 'increment') requestSnap(snapIndex + 1);
                    else if (name === 'decrement') requestSnap(snapIndex - 1);
                    else if (name === 'dismiss')
                      requestDismiss('accessibility');
                  }}
                >
                  <View
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    pointerEvents="none"
                  >
                    {props.handle ?? <View style={styles.indicator} />}
                  </View>
                </Animated.View>
              </GestureDetector>
              {dismissible ? (
                <Touchable
                  testID={testID ? `${testID}-close` : undefined}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel={props.closeLabel ?? 'Close sheet'}
                  onPress={() => requestDismiss('close')}
                  style={styles.close}
                >
                  <Text style={styles.closeText}>
                    {props.closeLabel ?? 'Close'}
                  </Text>
                </Touchable>
              ) : (
                <Text style={styles.locked}>Dismissal locked</Text>
              )}
            </View>
            <Animated.View
              style={bodyStyle}
              testID={testID ? `${testID}-body` : undefined}
            >
              <ScrollView
                ref={scrollRef}
                style={styles.fill}
                contentContainerStyle={[
                  styles.content,
                  props.contentContainerStyle,
                ]}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentInsetAdjustmentBehavior="never"
                automaticallyAdjustKeyboardInsets={false}
                testID={testID ? `${testID}-scroll` : undefined}
              >
                {props.children}
                {props.footer}
              </ScrollView>
            </Animated.View>
            <Text
              style={styles.hidden}
              accessible={false}
              testID={testID ? `${testID}-phase` : undefined}
            >
              {phase}
            </Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  fill: { flex: 1 },
  viewport: { flex: 1, overflow: 'hidden' },
  shade: { backgroundColor: '#000000' },
  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#D8DFD9',
  },
  handle: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#647569',
  },
  close: {
    minHeight: 48,
    minWidth: 64,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: { color: '#173B2C', fontWeight: '600', fontSize: 16 },
  locked: {
    color: '#5D655C',
    paddingHorizontal: 12,
    fontSize: 12,
    flexShrink: 1,
  },
  content: { padding: 20 },
  hidden: { display: 'none' },
});
