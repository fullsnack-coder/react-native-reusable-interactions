import Renderer, { act } from 'react-test-renderer';
import {
  AccessibilityInfo,
  AppState,
  Platform,
  StyleSheet,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createGestureController } from 'react-native-gesture-handler/jest-utils';
import * as Worklets from 'react-native-worklets';
import { HoldToConfirm } from '../src';
import type { HoldToConfirmProps } from '../src';

beforeEach(() => {
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation(() => ({ remove: jest.fn() }));
  jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation(() => ({ remove: jest.fn() }));
});
afterEach(() => jest.restoreAllMocks());

const render = (props: HoldToConfirmProps) => (
  <GestureHandlerRootView>
    <HoldToConfirm {...props} />
  </GestureHandlerRootView>
);
async function mount(extra: Partial<HoldToConfirmProps> = {}) {
  const props: HoldToConfirmProps = {
    status: 'idle',
    onConfirm: jest.fn(),
    testID: 'hold',
    ...extra,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(render(props));
  });
  await act(async () =>
    button(tree).props.onLayout({
      nativeEvent: { layout: { width: 300, height: 58 } },
    })
  );
  return { tree, props, gesture: createGestureController('hold-hold') };
}
const button = (tree: Renderer.ReactTestRenderer) =>
  tree.root
    .findAllByProps({ testID: 'hold' })
    .find((node) => node.props.accessibilityRole === 'button')!;
const activate = (tree: Renderer.ReactTestRenderer) =>
  button(tree).props.onAccessibilityAction({
    nativeEvent: { actionName: 'activate' },
  });

it('renders instruction, layout guard, custom label/styles and one accessible button', async () => {
  const { tree } = await mount({
    label: 'Keep pressed',
    style: { marginTop: 8 },
    progressStyle: { backgroundColor: 'pink' },
    labelStyle: { fontSize: 20 },
  });
  expect(button(tree).props.accessibilityLabel).toBe('Keep pressed');
  expect(button(tree).props.accessibilityValue.text).toBe('Keep pressed');
  expect(button(tree).props.accessibilityState.disabled).toBe(false);
  expect(StyleSheet.flatten(button(tree).props.style).marginTop).toBe(8);
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'hold-progress' }).props.style
    ).backgroundColor
  ).toBe('pink');
  await act(async () => tree.unmount());
});

it('early release and cancellation never confirm; a subsequent valid attempt does', async () => {
  const { tree, props, gesture } = await mount();
  await act(async () => {
    gesture.begin({ numberOfPointers: 1 });
    gesture.fail();
  });
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => {
    gesture.begin({ numberOfPointers: 1 });
    gesture.cancel();
  });
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => {
    gesture.begin({ numberOfPointers: 1 });
    gesture.activate({ numberOfPointers: 1, duration: 1200 });
    gesture.end();
  });
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
  expect(button(tree).props.accessibilityValue.text).toBe('Confirmed');
  await act(async () => tree.unmount());
});

it('holding is distinct from external processing and completion does not wait for release', async () => {
  const { tree, props, gesture } = await mount();
  await act(async () => gesture.begin({ numberOfPointers: 1 }));
  expect(button(tree).props.accessibilityValue.text).toBe('Keep holding…');
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () =>
    gesture.activate({ numberOfPointers: 1, duration: 1200 })
  );
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
  await act(async () => {
    gesture.end();
    activate(tree);
    button(tree).props.onAccessibilityTap();
  });
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});

it('accessible activation shares the latch and resetKey explicitly rearms idle', async () => {
  const { tree, props } = await mount();
  await act(async () => {
    activate(tree);
    activate(tree);
    button(tree).props.onAccessibilityTap();
  });
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
  expect(button(tree).props.accessibilityState).toEqual({
    disabled: true,
    busy: true,
  });
  await act(async () => tree.update(render({ ...props, resetKey: 1 })));
  await act(async () => activate(tree));
  expect(props.onConfirm).toHaveBeenCalledTimes(2);
  await act(async () => tree.unmount());
});

it.each(['processing', 'success', 'error'] as const)(
  'blocks activation in %s and rearms on return to idle',
  async (status) => {
    const { tree, props } = await mount({ status });
    await act(async () => activate(tree));
    expect(props.onConfirm).not.toHaveBeenCalled();
    expect(button(tree).props.accessibilityState.disabled).toBe(true);
    expect(button(tree).props.accessibilityState.busy).toBe(
      status === 'processing'
    );
    await act(async () => tree.update(render({ ...props, status: 'idle' })));
    await act(async () => activate(tree));
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
    await act(async () => tree.unmount());
  }
);

it.each([
  { disabled: true },
  { status: 'processing' as const },
  { holdDuration: 1500 },
  { resetKey: 1 },
])(
  'invalidates an existing hold on configuration change %j',
  async (change) => {
    const { tree, props, gesture } = await mount();
    await act(async () => gesture.begin({ numberOfPointers: 1 }));
    await act(async () => tree.update(render({ ...props, ...change })));
    await act(async () => {
      gesture.activate({ numberOfPointers: 1, duration: 1500 });
      gesture.end();
    });
    expect(props.onConfirm).not.toHaveBeenCalled();
    await act(async () => tree.unmount());
  }
);

it('layout changes invalidate the hold without confirming', async () => {
  const { tree, props, gesture } = await mount();
  await act(async () => gesture.begin({ numberOfPointers: 1 }));
  await act(async () =>
    button(tree).props.onLayout({
      nativeEvent: { layout: { width: 180, height: 100 } },
    })
  );
  await act(async () => {
    gesture.activate({ numberOfPointers: 1, duration: 1200 });
    gesture.end();
  });
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => tree.unmount());
});

it('multitouch at activation rejects confirmation', async () => {
  const { tree, props, gesture } = await mount();
  await act(async () => {
    gesture.begin({ numberOfPointers: 1 });
    gesture.activate({ numberOfPointers: 2, duration: 1200 });
    gesture.end();
  });
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => tree.unmount());
});

it.each(['unmount', 'disabled', 'duration', 'status'] as const)(
  'queued activation is stale after %s',
  async (action) => {
    let pending = () => {};
    const spy = jest
      .spyOn(Worklets, 'scheduleOnRN')
      .mockImplementation((fn, ...args) => {
        if (args.length === 3) fn(...args);
        else pending = () => fn(...args);
      });
    const { tree, props, gesture } = await mount();
    await act(async () => gesture.begin({ numberOfPointers: 1 }));
    await act(async () =>
      gesture.activate({ numberOfPointers: 1, duration: 1200 })
    );
    if (action === 'unmount') await act(async () => tree.unmount());
    else
      await act(async () =>
        tree.update(
          render({
            ...props,
            ...(action === 'disabled'
              ? { disabled: true }
              : action === 'duration'
                ? { holdDuration: 1600 }
                : { status: 'processing' }),
          })
        )
      );
    await act(async () => pending());
    expect(props.onConfirm).not.toHaveBeenCalled();
    spy.mockRestore();
    if (action !== 'unmount') await act(async () => tree.unmount());
  }
);

it('AppState and Android blur invalidate holding; foreground does not resume it', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const callbacks: Record<string, (value: string) => void> = {};
  const removals: jest.Mock[] = [];
  const spy = jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((name, fn) => {
      callbacks[name] = fn as (value: string) => void;
      const remove = jest.fn();
      removals.push(remove);
      return { remove };
    });
  const { tree, props, gesture } = await mount();
  await act(async () => gesture.begin({ numberOfPointers: 1 }));
  await act(async () => callbacks.change!('background'));
  await act(async () => callbacks.change!('active'));
  await act(async () => {
    gesture.activate({ numberOfPointers: 1, duration: 1200 });
    gesture.end();
  });
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => gesture.begin({ numberOfPointers: 1 }));
  await act(async () => {
    callbacks.blur!('');
    activate(tree);
  });
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => callbacks.focus!(''));
  await act(async () => activate(tree));
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
  removals.forEach((remove) => expect(remove).toHaveBeenCalledTimes(1));
  spy.mockRestore();
});

it('reduced motion retains native activation rule and does not confirm from animation', async () => {
  let change = (_value: boolean) => {};
  const spy = jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation((name, fn) => {
      if (name === 'reduceMotionChanged')
        change = fn as (value: boolean) => void;
      return { remove: jest.fn() };
    });
  const { tree, props, gesture } = await mount();
  await act(async () => {
    change(true);
    gesture.begin({ numberOfPointers: 1 });
  });
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => {
    gesture.fail();
    change(false);
  });
  expect(props.onConfirm).not.toHaveBeenCalled();
  await act(async () => {
    gesture.begin({ numberOfPointers: 1 });
    gesture.activate({ numberOfPointers: 1, duration: 1200 });
  });
  expect(props.onConfirm).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
  spy.mockRestore();
});

it('announces discrete statuses without continuous holding announcements', async () => {
  const announce = jest
    .spyOn(AccessibilityInfo, 'announceForAccessibility')
    .mockImplementation(() => {});
  const { tree, props, gesture } = await mount({
    labels: { processing: 'Working locally' },
  });
  announce.mockClear();
  await act(async () => gesture.begin({ numberOfPointers: 1 }));
  expect(announce).not.toHaveBeenCalled();
  await act(async () =>
    gesture.activate({ numberOfPointers: 1, duration: 1200 })
  );
  expect(announce).toHaveBeenCalledWith('Confirmed');
  await act(async () =>
    tree.update(render({ ...props, status: 'processing' }))
  );
  expect(announce).toHaveBeenCalledWith('Working locally');
  await act(async () => tree.update(render({ ...props, status: 'success' })));
  expect(announce).toHaveBeenCalledWith('Completed');
  const count = announce.mock.calls.length;
  await act(async () => tree.update(render({ ...props, status: 'success' })));
  expect(announce).toHaveBeenCalledTimes(count);
  await act(async () => tree.unmount());
  announce.mockRestore();
});

it.each([0, 499, 10001, NaN, Infinity, 1200.5])(
  'rejects invalid duration %s',
  async (holdDuration) => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(mount({ holdDuration })).rejects.toThrow('holdDuration');
    spy.mockRestore();
  }
);

it('iOS subscribes only to supported AppState change events', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  const { tree } = await mount();
  expect(AppState.addEventListener).toHaveBeenCalledWith(
    'change',
    expect.any(Function)
  );
  expect(AppState.addEventListener).not.toHaveBeenCalledWith(
    'focus',
    expect.any(Function)
  );
  expect(AppState.addEventListener).not.toHaveBeenCalledWith(
    'blur',
    expect.any(Function)
  );
  await act(async () => tree.unmount());
});
