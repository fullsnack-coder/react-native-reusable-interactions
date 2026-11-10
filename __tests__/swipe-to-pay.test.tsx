import { AccessibilityInfo, I18nManager, StyleSheet } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createGestureController } from 'react-native-gesture-handler/jest-utils';
import * as Worklets from 'react-native-worklets';
import { SwipeToPay } from '../src';
import type { SwipeToPayProps } from '../src';

const defaults: SwipeToPayProps = {
  label: 'Slide to confirm',
  accessibilityLabel: 'Confirm order',
  status: 'idle',
  onConfirm: jest.fn(),
  testID: 'swipe',
};
function render(props: SwipeToPayProps) {
  return (
    <GestureHandlerRootView>
      <SwipeToPay {...props} />
    </GestureHandlerRootView>
  );
}
async function mount(extra: Partial<SwipeToPayProps> = {}, width = 300) {
  const props = { ...defaults, onConfirm: jest.fn(), ...extra };
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(render(props));
  });
  await layout(tree, width);
  return { tree, props };
}
async function layout(tree: Renderer.ReactTestRenderer, width: number) {
  await act(async () =>
    tree.root.findByProps({ testID: 'swipe-track' }).props.onLayout({
      nativeEvent: { layout: { width, height: 64, x: 0, y: 0 } },
    })
  );
}
function button(tree: Renderer.ReactTestRenderer) {
  return tree.root.findByProps({
    accessibilityRole: 'button',
    accessibilityLabel: 'Confirm order',
  });
}
function activate(tree: Renderer.ReactTestRenderer) {
  button(tree).props.onAccessibilityAction({
    nativeEvent: { actionName: 'activate' },
  });
}
function drag(translationX: number, canceled = false) {
  const pan = createGestureController('swipe-pan');
  pan.begin({ numberOfPointers: 1 });
  pan.activate({ translationX: 0, numberOfPointers: 1 });
  pan.update({ translationX, numberOfPointers: 1 });
  if (canceled) pan.cancel({ translationX, numberOfPointers: 1 });
  else pan.end({ translationX, numberOfPointers: 1 });
}

test.each([
  [0.4, false],
  [0.849, false],
  [0.85, true],
  [0.9, true],
  [2, true],
  [-1, false],
])('release at %s travel: confirmation %s', async (fraction, accepted) => {
  const { tree, props } = await mount();
  await act(async () => drag(236 * fraction));
  expect(props.onConfirm).toHaveBeenCalledTimes(accepted ? 1 : 0);
  await act(async () => tree.unmount());
});

test('cancellation and direction reversal cannot confirm; return can be interrupted', async () => {
  const { tree, props } = await mount();
  await act(async () => drag(230, true));
  expect(props.onConfirm).not.toHaveBeenCalled();
  const pan = createGestureController('swipe-pan');
  await act(async () => {
    pan.begin();
    pan.activate({ translationX: 0, numberOfPointers: 1 });
    pan.update({ translationX: 230, numberOfPointers: 1 });
    pan.update({ translationX: -210, numberOfPointers: 1 });
    pan.end({ translationX: -210, numberOfPointers: 1 });
  });
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => activate(tree));
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});

test('accessible and gesture activations share one latch until explicit idle reset', async () => {
  const { tree, props } = await mount();
  await act(async () => {
    activate(tree);
    activate(tree);
    button(tree).props.onAccessibilityTap();
  });
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
  expect(button(tree).props.accessibilityValue.text).toBe('Confirmed');
  await act(async () => tree.update(render({ ...props, resetKey: 1 })));
  await act(async () => drag(220));
  expect(props.onConfirm).toHaveBeenCalledTimes(2);
  await act(async () => tree.unmount());
});

test.each(['processing', 'success', 'error'] as const)(
  '%s is consumer-owned and blocks activation',
  async (status) => {
    const { tree, props } = await mount({ status });
    await act(async () => activate(tree));
    expect(props.onConfirm).not.toHaveBeenCalled();
    expect(button(tree).props.accessibilityState.disabled).toBe(true);
    await act(async () => tree.update(render({ ...props, status: 'idle' })));
    await act(async () => activate(tree));
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    await act(async () => tree.unmount());
  }
);

test('disabled and too-small tracks cannot confirm; narrow tracks retain accessible confirmation', async () => {
  const { tree, props } = await mount({ disabled: true });
  await act(async () => activate(tree));
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => tree.update(render({ ...props, disabled: false })));
  await layout(tree, 30);
  await act(async () => activate(tree));
  expect(props.onConfirm).not.toHaveBeenCalled();
  await layout(tree, 80);
  await act(async () => activate(tree));
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});

test('resize and external operation changes invalidate active attempts', async () => {
  const { tree, props } = await mount();
  const pan = createGestureController('swipe-pan');
  await act(async () => {
    pan.begin();
    pan.activate({ translationX: 0, numberOfPointers: 1 });
    pan.update({ translationX: 220, numberOfPointers: 1 });
  });
  await layout(tree, 180);
  await act(async () => pan.end());
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () =>
    tree.update(render({ ...props, status: 'processing' }))
  );
  await act(async () => activate(tree));
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => tree.unmount());
});

test('multitouch invalidates a gesture and changing disabled cancels it', async () => {
  const { tree, props } = await mount();
  const pan = createGestureController('swipe-pan');
  await act(async () => {
    pan.begin();
    pan.activate({ translationX: 0, numberOfPointers: 1 });
    pan.update({ translationX: 220, numberOfPointers: 2 });
    pan.end({ numberOfPointers: 1 });
  });
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => tree.update(render({ ...props, disabled: true })));
  await act(async () => activate(tree));
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => tree.unmount());
});

test('pending UI confirmation is ignored after unmount', async () => {
  let pending = () => {};
  const schedule = jest
    .spyOn(Worklets, 'scheduleOnRN')
    .mockImplementation((fn, ...args) => {
      pending = () => {
        fn(...args);
      };
    });
  const { tree, props } = await mount();
  await act(async () => drag(220));
  await act(async () => tree.unmount());
  pending();
  expect(props.onConfirm).not.toHaveBeenCalled();
  schedule.mockRestore();
});

test('custom labels/styles and discrete status announcements', async () => {
  const announce = jest
    .spyOn(AccessibilityInfo, 'announceForAccessibility')
    .mockImplementation(() => {});
  announce.mockClear();
  const { tree, props } = await mount({
    style: { marginTop: 8 },
    trackStyle: { backgroundColor: 'white' },
    labels: { processing: 'Working locally' },
  });
  expect(button(tree).props.style).toEqual({ marginTop: 8 });
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'swipe-track' }).props.style
    ).backgroundColor
  ).toBe('white');
  await act(async () =>
    tree.update(render({ ...props, status: 'processing' }))
  );
  expect(button(tree).props.accessibilityValue.text).toBe('Working locally');
  expect(announce).toHaveBeenCalledTimes(1);
  await act(async () =>
    tree.update(render({ ...props, status: 'processing' }))
  );
  expect(announce).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
  announce.mockRestore();
});

test('RTL uses leftward distance for confirmation', async () => {
  const original = I18nManager.isRTL;
  I18nManager.isRTL = true;
  const { tree, props } = await mount();
  await act(async () => drag(-220));
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
  I18nManager.isRTL = original;
});

test('100% threshold remains reachable when the pan activates after its dead zone', async () => {
  const { tree, props } = await mount({ threshold: 1 });
  const pan = createGestureController('swipe-pan');
  await act(async () => {
    pan.begin({ numberOfPointers: 1 });
    pan.activate({ translationX: 9, numberOfPointers: 1 });
    pan.update({ translationX: 236, numberOfPointers: 1 });
    pan.end({ translationX: 236, numberOfPointers: 1 });
  });
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});

test('a queued gesture cannot confirm after the consumer changes operation status', async () => {
  let pending = () => {};
  const schedule = jest
    .spyOn(Worklets, 'scheduleOnRN')
    .mockImplementation((fn, ...args) => {
      pending = () => {
        fn(...args);
      };
    });
  const { tree, props } = await mount();
  await act(async () => drag(220));
  await act(async () =>
    tree.update(render({ ...props, status: 'processing' }))
  );
  pending();
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => tree.unmount());
  schedule.mockRestore();
});

test('release distance is authoritative when the last update event is coalesced', async () => {
  const { tree, props } = await mount();
  const pan = createGestureController('swipe-pan');
  await act(async () => {
    pan.begin({ numberOfPointers: 1 });
    pan.activate({ translationX: 9, numberOfPointers: 1 });
    pan.end({ translationX: 220, numberOfPointers: 1 });
  });
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});

test('release below threshold cancels even if the last update was above it', async () => {
  const { tree, props } = await mount();
  const pan = createGestureController('swipe-pan');
  await act(async () => {
    pan.begin({ numberOfPointers: 1 });
    pan.activate({ translationX: 0, numberOfPointers: 1 });
    pan.update({ translationX: 230, numberOfPointers: 1 });
    pan.end({ translationX: 100, numberOfPointers: 1 });
  });
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => tree.unmount());
});

test('disabled interaction does not hide the consumer operation result', async () => {
  const { tree } = await mount({ status: 'processing', disabled: true });
  expect(button(tree).props.accessibilityValue.text).toBe('Processing');
  expect(button(tree).props.accessibilityState).toMatchObject({
    disabled: true,
    busy: true,
  });
  await act(async () => tree.unmount());
});

test('changing the threshold invalidates a drag instead of reinterpreting intent', async () => {
  const { tree, props } = await mount();
  const pan = createGestureController('swipe-pan');
  await act(async () => {
    pan.begin({ numberOfPointers: 1 });
    pan.activate({ translationX: 0, numberOfPointers: 1 });
    pan.update({ translationX: 180, numberOfPointers: 1 });
  });
  await act(async () => tree.update(render({ ...props, threshold: 0.5 })));
  await act(async () => pan.end({ translationX: 180, numberOfPointers: 1 }));
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => tree.unmount());
});

// The native visual regression is verified on the owner device; these checks
// preserve the decorative/RTL contract without a brittle pixel snapshot.
test.each([false, true])(
  'decorative arrow preserves confirmation semantics with RTL=%s',
  async (rtl) => {
    const original = I18nManager.isRTL;
    I18nManager.isRTL = rtl;
    try {
      const { tree, props } = await mount();
      const arrow = tree.root.findByProps({ testID: 'swipe-arrow' });
      expect(arrow.props.accessible).toBe(false);
      expect(arrow.props.pointerEvents).toBe('none');
      const transform = StyleSheet.flatten(arrow.props.style).transform;
      expect(transform).toEqual(rtl ? [{ rotate: '180deg' }] : undefined);
      await act(async () => activate(tree));
      expect(props.onConfirm).toHaveBeenCalledTimes(1);
      await act(async () => tree.unmount());
    } finally {
      I18nManager.isRTL = original;
    }
  }
);
