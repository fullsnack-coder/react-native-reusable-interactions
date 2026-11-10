import Renderer, { act } from 'react-test-renderer';
import {
  AccessibilityInfo,
  Keyboard,
  BackHandler,
  Platform,
  StyleSheet,
  ScrollView,
  TextInput,
  Text,
} from 'react-native';
import { Touchable } from 'react-native-gesture-handler';
import { createGestureController } from 'react-native-gesture-handler/jest-utils';
import * as Worklets from 'react-native-worklets';
import { InteractivePurchaseSheet, PurchaseSheetHost } from '../src';
import type { InteractivePurchaseSheetProps } from '../src';
import {
  sheetDestination,
  sheetHeights,
  validateSheetPoints,
} from '../src/components/purchase-sheet-model';

let hardwareBack: () => void = () => {};
beforeEach(() => {
  jest
    .spyOn(BackHandler, 'addEventListener')
    .mockImplementation((_name, callback) => {
      hardwareBack = () => {
        callback({ type: 'hardwareBackPress', timeStamp: 0 });
      };
      return { remove: jest.fn() };
    });
  jest.useFakeTimers();
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(true);
  jest
    .spyOn(Worklets, 'scheduleOnRN')
    .mockImplementation((fn, ...args) => fn(...args));
  jest
    .spyOn(AccessibilityInfo, 'sendAccessibilityEvent')
    .mockImplementation(() => {});
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation(() => ({ remove: jest.fn() }));
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});
const node = (tree: Renderer.ReactTestRenderer, id: string) =>
  tree.root
    .findAllByProps({ testID: id })
    .find((n) =>
      id === 'sheet'
        ? n.props.accessibilityViewIsModal
        : n.type !== InteractivePurchaseSheet
    )!;
async function mount(extra: Partial<InteractivePurchaseSheetProps> = {}) {
  const props: InteractivePurchaseSheetProps = {
    visible: true,
    snapPoints: [0.4, 0.85],
    snapIndex: 0,
    onSnapIndexChange: jest.fn(),
    onDismissRequest: jest.fn(),
    onSnapChange: jest.fn(),
    onDismiss: jest.fn(),
    safeAreaInsets: { top: 30, bottom: 20, left: 0, right: 0 },
    children: <Text>Arbitrary content</Text>,
    testID: 'sheet',
    ...extra,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(
      <PurchaseSheetHost>
        <InteractivePurchaseSheet {...props} />
      </PurchaseSheetHost>
    );
  });
  if (props.visible) {
    await act(async () =>
      node(tree, 'sheet-viewport').props.onLayout({
        nativeEvent: { layout: { height: 800, width: 400 } },
      })
    );
  }
  return { tree, props, pan: createGestureController('sheet-pan') };
}
const action = (tree: Renderer.ReactTestRenderer, name: string) =>
  node(tree, 'sheet-handle').props.onAccessibilityAction({
    nativeEvent: { actionName: name },
  });
const drag = (
  pan: ReturnType<typeof createGestureController>,
  translationY: number,
  velocityY = 0,
  canceled = false
) => {
  pan.begin({ numberOfPointers: 1 });
  pan.activate({ translationY: 8, numberOfPointers: 1 });
  pan.update({ translationY, numberOfPointers: 1 });
  if (canceled) pan.cancel({ translationY, velocityY, numberOfPointers: 1 });
  else pan.end({ translationY, velocityY, numberOfPointers: 1 });
};

it.each(
  [
    [],
    [0.1],
    [1.1],
    [0.5, 0.4],
    [0.5, 0.5],
    [NaN],
    [0.2, 0.3, 0.4, 0.5, 0.6],
  ].map((points) => [points])
)('rejects invalid snap fractions %j', (points) => {
  expect(() => validateSheetPoints(points, 0)).toThrow('snapPoints');
});
it.each([-1, 1.5, 2, Infinity])('rejects index %s', (index) => {
  expect(() => validateSheetPoints([0.4, 0.8], index)).toThrow('snapIndex');
});
it('resolves changing viewports and minimum visible content without invalid geometry', () => {
  expect(sheetHeights([0.2, 0.8], 800)).toEqual([160, 640]);
  expect(sheetHeights([0.2, 0.8], 300)).toEqual([96, 240]);
  expect(sheetHeights([0.2, 0.8], 60)).toEqual([60, 60]);
  expect(sheetHeights([0.2, 0.8], 300, 180)).toEqual([180, 240]);
});
it.each([
  [480, 0, 0],
  [140, 0, 1],
  [760, 0, -1],
  [480, -1200, 1],
  [140, 999999, 0],
])('release %s velocity %s chooses %s', (top, velocity, index) => {
  expect(sheetDestination(top, velocity, 800, [320, 680], true)).toBe(index);
});
it('disabled dismissal and a transient crossed threshold do not choose close', () => {
  expect(sheetDestination(800, 10000, 800, [320, 680], false)).toBe(0);
  expect(sheetDestination(480, 0, 800, [320, 680], true)).toBe(0);
});

it('closed has no sheet content, gestures or backdrop', async () => {
  const { tree } = await mount({ visible: false });
  expect(tree.root.findAllByProps({ testID: 'sheet-handle' })).toHaveLength(0);
  expect(tree.root.findAllByType(Text)).toHaveLength(0);
  expect(node(tree, 'purchase-sheet-overlay').props.pointerEvents).toBe('none');
  await act(async () => tree.unmount());
});
it('renders arbitrary content, custom handle/footer and styles with adjustable semantics', async () => {
  const { tree } = await mount({
    handle: <Text>Custom handle</Text>,
    footer: <Text>Custom footer</Text>,
    style: { backgroundColor: 'pink' },
    contentContainerStyle: { padding: 24 },
  });
  expect(node(tree, 'sheet-handle').props.accessibilityRole).toBe('adjustable');
  expect(tree.root.findByType(Touchable).props.accessibilityRole).toBe(
    'button'
  );
  expect(node(tree, 'sheet-close').props.accessibilityRole).toBe('button');
  expect(node(tree, 'sheet-handle').props.accessibilityValue.now).toBe(1);
  expect(
    StyleSheet.flatten(node(tree, 'sheet').props.style).backgroundColor
  ).toBe('pink');
  expect(tree.root.findAllByType(Text).map((n) => n.props.children)).toEqual(
    expect.arrayContaining([
      'Arbitrary content',
      'Custom handle',
      'Custom footer',
    ])
  );
  await act(async () => tree.unmount());
});
it('requests accessible snaps, waits for controlled acknowledgement and deduplicates settlements', async () => {
  const { tree, props } = await mount();
  await act(async () => action(tree, 'increment'));
  expect(props.onSnapIndexChange).toHaveBeenCalledWith(1);
  expect(node(tree, 'sheet-handle').props.accessibilityValue.now).toBe(1);
  await act(async () =>
    tree.update(
      <PurchaseSheetHost>
        <InteractivePurchaseSheet {...props} snapIndex={1} />
      </PurchaseSheetHost>
    )
  );
  expect(node(tree, 'sheet-handle').props.accessibilityValue.now).toBe(2);
  await act(async () => action(tree, 'increment'));
  expect(props.onSnapIndexChange).toHaveBeenCalledTimes(1);
  await act(async () => action(tree, 'decrement'));
  expect(props.onSnapIndexChange).toHaveBeenLastCalledWith(0);
  await act(async () => tree.unmount());
});
it('handle release requests a snap or close; crossing then reversing does not dismiss', async () => {
  const { tree, props, pan } = await mount();
  await act(async () => drag(pan, -300));
  expect(props.onSnapIndexChange).toHaveBeenCalledWith(1);
  await act(async () => drag(pan, 300));
  expect(props.onDismissRequest).toHaveBeenCalledWith('gesture');
  await act(async () => {
    pan.begin({ numberOfPointers: 1 });
    pan.activate({ translationY: 8, numberOfPointers: 1 });
    pan.update({ translationY: 300, numberOfPointers: 1 });
    pan.end({ translationY: 0, velocityY: 0, numberOfPointers: 1 });
  });
  expect(props.onDismissRequest).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});
it('cancelled/multitouch drag does not request a snap or dismissal', async () => {
  const { tree, props, pan } = await mount();
  await act(async () => drag(pan, 300, 0, true));
  await act(async () => {
    pan.begin({ numberOfPointers: 1 });
    pan.activate({ translationY: 8, numberOfPointers: 1 });
    pan.update({ translationY: 300, numberOfPointers: 2 });
    pan.end({ translationY: 300, velocityY: 100, numberOfPointers: 1 });
  });
  expect(props.onDismissRequest).not.toHaveBeenCalled();
  expect(props.onSnapIndexChange).not.toHaveBeenCalled();
  await act(async () => tree.unmount());
});
it('close/backdrop/back are controlled requests, not self-dismissal', async () => {
  const { tree, props } = await mount();
  await act(async () => {
    node(tree, 'sheet-close').props.onPress();
    node(tree, 'sheet-backdrop').props.onPress();
    hardwareBack();
  });
  expect(props.onDismissRequest).toHaveBeenCalledTimes(1);
  expect(node(tree, 'purchase-sheet-overlay').props.pointerEvents).toBe(
    'box-none'
  );
  expect(props.onDismiss).not.toHaveBeenCalled();
  await act(async () =>
    tree.update(
      <PurchaseSheetHost>
        <InteractivePurchaseSheet {...props} visible={false} />
      </PurchaseSheetHost>
    )
  );
  expect(node(tree, 'purchase-sheet-overlay').props.pointerEvents).toBe('none');
  expect(props.onDismiss).toHaveBeenCalledTimes(1);
  await act(async () =>
    tree.update(
      <PurchaseSheetHost>
        <InteractivePurchaseSheet {...props} visible={false} />
      </PurchaseSheetHost>
    )
  );
  expect(props.onDismiss).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});
it('dismissal lock removes close/backdrop/actions while external close still works', async () => {
  const { tree, props } = await mount({ dismissible: false });
  expect(tree.root.findAllByProps({ testID: 'sheet-close' })).toHaveLength(0);
  expect(tree.root.findAllByProps({ testID: 'sheet-backdrop' })).toHaveLength(
    0
  );
  expect(
    node(tree, 'sheet-handle').props.accessibilityActions.map(
      (a: { name: string }) => a.name
    )
  ).not.toContain('dismiss');
  await act(async () => {
    action(tree, 'dismiss');
    hardwareBack();
  });
  expect(props.onDismissRequest).not.toHaveBeenCalled();
  await act(async () =>
    tree.update(
      <PurchaseSheetHost>
        <InteractivePurchaseSheet {...props} visible={false} />
      </PurchaseSheetHost>
    )
  );
  expect(props.onDismiss).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});
it('backdrop can be separately non-dismissable without removing close', async () => {
  const { tree } = await mount({ backdropDismissible: false });
  expect(tree.root.findAllByProps({ testID: 'sheet-backdrop' })).toHaveLength(
    0
  );
  expect(node(tree, 'sheet-close')).toBeDefined();
  await act(async () => tree.unmount());
});
it('dynamic points/index and resize invalidate an old drag', async () => {
  const { tree, props, pan } = await mount();
  await act(async () => {
    pan.begin({ numberOfPointers: 1 });
    pan.activate({ translationY: 8, numberOfPointers: 1 });
  });
  await act(async () =>
    tree.update(
      <PurchaseSheetHost>
        <InteractivePurchaseSheet {...props} snapPoints={[0.6]} snapIndex={0} />
      </PurchaseSheetHost>
    )
  );
  await act(async () =>
    node(tree, 'sheet-viewport').props.onLayout({
      nativeEvent: { layout: { height: 400, width: 800 } },
    })
  );
  await act(async () =>
    pan.end({ translationY: 300, velocityY: 0, numberOfPointers: 1 })
  );
  expect(props.onDismissRequest).not.toHaveBeenCalled();
  expect(node(tree, 'sheet-handle').props.accessibilityValue.max).toBe(1);
  await act(async () => tree.unmount());
});
it('keyboard requests the maximum snap and restores the previous logical index, then cleans listeners', async () => {
  const callbacks: Record<string, () => void> = {};
  const removes: jest.Mock[] = [];
  jest.spyOn(Keyboard, 'addListener').mockImplementation((name, callback) => {
    callbacks[name] = callback as () => void;
    const remove = jest.fn();
    removes.push(remove);
    return { remove };
  });
  const { tree, props } = await mount();
  await act(async () => callbacks.keyboardDidShow!());
  expect(props.onSnapIndexChange).toHaveBeenCalledWith(1);
  await act(async () =>
    tree.update(
      <PurchaseSheetHost>
        <InteractivePurchaseSheet {...props} snapIndex={1} />
      </PurchaseSheetHost>
    )
  );
  await act(async () => callbacks.keyboardDidHide!());
  expect(props.onSnapIndexChange).toHaveBeenLastCalledWith(0);
  await act(async () => tree.unmount());
  removes.forEach((remove) => expect(remove).toHaveBeenCalledTimes(1));
});
it('queued gesture requests cannot survive unmount', async () => {
  const queue: (() => void)[] = [];
  jest.spyOn(Worklets, 'scheduleOnRN').mockImplementation((fn, ...args) => {
    queue.push(() => fn(...args));
  });
  const { tree, props, pan } = await mount();
  await act(async () => drag(pan, 300));
  await act(async () => tree.unmount());
  await act(async () => queue.forEach((fn) => fn()));
  expect(props.onDismissRequest).not.toHaveBeenCalled();
  expect(props.onSnapIndexChange).not.toHaveBeenCalled();
  expect(props.onSnapChange).not.toHaveBeenCalled();
});
it('requires measured safe-area insets', async () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  await expect(
    mount({ safeAreaInsets: { top: -1, bottom: 0, left: 0, right: 0 } })
  ).rejects.toThrow('safeAreaInsets');
  error.mockRestore();
});

it('rapid close/reopen rejects obsolete completion callbacks', async () => {
  const queue: (() => void)[] = [];
  jest
    .spyOn(Worklets, 'scheduleOnRN')
    .mockImplementation((fn, ...args) => queue.push(() => fn(...args)));
  const { tree, props } = await mount();
  await act(async () =>
    tree.update(
      <PurchaseSheetHost>
        <InteractivePurchaseSheet {...props} visible={false} />
      </PurchaseSheetHost>
    )
  );
  await act(async () =>
    tree.update(
      <PurchaseSheetHost>
        <InteractivePurchaseSheet {...props} visible />
      </PurchaseSheetHost>
    )
  );
  await act(async () => queue.splice(0).forEach((fn) => fn()));
  expect(node(tree, 'purchase-sheet-overlay').props.pointerEvents).toBe(
    'box-none'
  );
  expect(props.onDismiss).not.toHaveBeenCalled();
  expect(node(tree, 'sheet-close').props.accessibilityRole).toBe('button');
  expect(props.onSnapChange).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});
it('live motion changes invalidate an in-flight drag without duplicate snap announcements', async () => {
  let change = (_value: boolean) => {};
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation((_name, fn) => {
      change = fn as (value: boolean) => void;
      return { remove: jest.fn() };
    });
  const { tree, props, pan } = await mount();
  await act(async () => {
    pan.begin({ numberOfPointers: 1 });
    pan.activate({ translationY: 8, numberOfPointers: 1 });
  });
  await act(async () => change(false));
  await act(async () =>
    pan.end({ translationY: 300, velocityY: 300, numberOfPointers: 1 })
  );
  await act(async () => change(true));
  expect(props.onDismissRequest).not.toHaveBeenCalled();
  expect(props.onSnapChange).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});

it('keyboard reveal converts the modal scroll origin into the responder screen coordinate space', async () => {
  const callbacks: Record<string, () => void> = {};
  jest.spyOn(Keyboard, 'addListener').mockImplementation((name, fn) => {
    callbacks[name] = fn as () => void;
    return { remove: jest.fn() };
  });
  const { tree } = await mount();
  const scroll = tree.root.findByType(ScrollView).instance;
  jest
    .spyOn(scroll, 'measureInWindow')
    .mockImplementation((callback: unknown) =>
      (callback as (x: number, y: number, w: number, h: number) => void)(
        0,
        200,
        400,
        500
      )
    );
  const input = {} as NonNullable<
    ReturnType<typeof TextInput.State.currentlyFocusedInput>
  >;
  jest.spyOn(TextInput.State, 'currentlyFocusedInput').mockReturnValue(input);
  await act(async () => callbacks.keyboardDidShow!());
  await act(async () => jest.advanceTimersByTime(20));
  expect(
    scroll.scrollResponderScrollNativeHandleToKeyboard
  ).toHaveBeenCalledWith(input, 216, true);
  await act(async () => tree.unmount());
});
it('an asynchronous keyboard measurement cannot scroll after unmount', async () => {
  const callbacks: Record<string, () => void> = {};
  jest.spyOn(Keyboard, 'addListener').mockImplementation((name, fn) => {
    callbacks[name] = fn as () => void;
    return { remove: jest.fn() };
  });
  const { tree } = await mount();
  const scroll = tree.root.findByType(ScrollView).instance;
  let measured = (
    _x: number,
    _y: number,
    _width: number,
    _height: number
  ) => {};
  jest
    .spyOn(scroll, 'measureInWindow')
    .mockImplementation((callback: unknown) => {
      measured = callback as typeof measured;
    });
  const input = {} as NonNullable<
    ReturnType<typeof TextInput.State.currentlyFocusedInput>
  >;
  jest.spyOn(TextInput.State, 'currentlyFocusedInput').mockReturnValue(input);
  await act(async () => callbacks.keyboardDidShow!());
  await act(async () => jest.advanceTimersByTime(20));
  scroll.scrollResponderScrollNativeHandleToKeyboard.mockClear();
  await act(async () => tree.unmount());
  measured(0, 200, 400, 500);
  expect(
    scroll.scrollResponderScrollNativeHandleToKeyboard
  ).not.toHaveBeenCalled();
});

it('Android host preserves supplied safe areas and prioritizes a visible keyboard on Back', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const { tree, props } = await mount();
  expect(
    StyleSheet.flatten(node(tree, 'sheet-viewport').props.style).marginBottom
  ).toBe(20);
  const visible = jest.spyOn(Keyboard, 'isVisible').mockReturnValue(true);
  const dismiss = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
  await act(async () => hardwareBack());
  expect(dismiss).toHaveBeenCalledTimes(1);
  expect(props.onDismissRequest).not.toHaveBeenCalled();
  visible.mockReturnValue(false);
  await act(async () => hardwareBack());
  expect(props.onDismissRequest).toHaveBeenCalledWith('back');
  await act(async () => tree.unmount());
});

it('host isolates background touch/accessibility only while presented and clears its slot on owner unmount', async () => {
  const { tree, props } = await mount();
  expect(node(tree, 'purchase-sheet-background').props.pointerEvents).toBe(
    'none'
  );
  expect(
    node(tree, 'purchase-sheet-background').props.importantForAccessibility
  ).toBe('no-hide-descendants');
  await act(async () =>
    tree.update(
      <PurchaseSheetHost>
        <Text>Background only</Text>
      </PurchaseSheetHost>
    )
  );
  expect(node(tree, 'purchase-sheet-overlay').props.pointerEvents).toBe('none');
  expect(node(tree, 'purchase-sheet-background').props.pointerEvents).toBe(
    'auto'
  );
  expect(props.onDismiss).not.toHaveBeenCalled();
  await act(async () => tree.unmount());
});
it('requires a host and rejects simultaneous owners instead of overwriting presentation', async () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => {});
  const props: InteractivePurchaseSheetProps = {
    visible: true,
    snapPoints: [0.5],
    snapIndex: 0,
    onSnapIndexChange: () => {},
    onDismissRequest: () => {},
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    children: <Text>Content</Text>,
  };
  await expect(
    (async () => {
      await act(async () => {
        Renderer.create(<InteractivePurchaseSheet {...props} />);
      });
    })()
  ).rejects.toThrow('PurchaseSheetHost');
  await expect(
    (async () => {
      await act(async () => {
        Renderer.create(
          <PurchaseSheetHost>
            <InteractivePurchaseSheet {...props} />
            <InteractivePurchaseSheet {...props} />
          </PurchaseSheetHost>
        );
      });
    })()
  ).rejects.toThrow('one active');
  error.mockRestore();
});
