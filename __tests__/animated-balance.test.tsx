import {
  AccessibilityInfo,
  Dimensions,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import * as Motion from 'react-native-reanimated';
import { AnimatedBalance } from '../src';
import type { AnimatedBalanceProps } from '../src';
import {
  compareAmounts,
  createBalanceFormatter,
  digitDestination,
  parseAmount,
} from '../src/components/animated-balance-model';

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated');
  return {
    __esModule: true,
    ...actual,
    withTiming: jest.fn(actual.withTiming),
    cancelAnimation: jest.fn(actual.cancelAnimation),
  };
});

const format = createBalanceFormatter('en-US', 'USD');
test.each([
  ['0', '$0.00'],
  ['-0.00', '$0.00'],
  ['1250.75', '$1,250.75'],
  ['-0.25', '-$0.25'],
  ['-1250.75', '-$1,250.75'],
  ['999999999999999.99', '$999,999,999,999,999.99'],
])('exact USD display %s', (value, expected) =>
  expect(format(value).formatted).toBe(expected)
);

test.each([
  '1\n',
  'NaN',
  'Infinity',
  '1e3',
  '+1',
  '01.25',
  ' 1',
  '1.',
  '1.1234567',
  '1000000000000000',
  '1,000',
])('rejects unsupported input %s', (value) =>
  expect(() => format(value)).toThrow()
);
test('numeric inputs and unsupported precision cannot silently lose information', () => {
  // @ts-expect-error Deliberately invalid runtime input.
  expect(() => format(1.25)).toThrow('decimal string');
  expect(() => format('1.001')).toThrow('rounding is not performed');
  expect(format('1.230000').formatted).toBe('$1.23');
  expect(
    createBalanceFormatter('en-US', undefined, 6)('999999999999999.123456')
      .formatted
  ).toBe('999,999,999,999,999.123456');
});
test.each([
  ['es-PE', 'PEN', '1250.75', 'S/\u00a01,250.75'],
  ['de-DE', 'EUR', '1250.75', '1.250,75\u00a0€'],
  ['ja-JP', 'JPY', '1250.00', '￥1,250'],
])('locale and currency %s %s', (locale, currency, value, expected) =>
  expect(createBalanceFormatter(locale, currency)(value).formatted).toBe(
    expected
  )
);
test('zero-decimal currency, localized subunit digits and bidi fallback', () => {
  expect(() => createBalanceFormatter('ja-JP', 'JPY')('1250.75')).toThrow(
    'precision'
  );
  const arabic = createBalanceFormatter('ar-EG', 'USD')('-1250.75');
  expect(arabic.formatted).toBe(
    new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'USD',
    }).format(-1250.75)
  );
  expect(arabic.rolling).toBe(false);
});
test('validates locale/currency/configuration', () => {
  expect(() => createBalanceFormatter('zz-ZZ', 'USD')).toThrow('locale');
  expect(() => createBalanceFormatter('en-US', 'usd')).toThrow('currency');
  for (const digits of [-1, 7, 1.5, NaN])
    expect(() => createBalanceFormatter('en-US', 'USD', digits)).toThrow(
      'fractionDigits'
    );
});
test.each([
  ['9', '10'],
  ['19', '20'],
  ['99', '100'],
  ['999', '1000'],
  ['109', '110'],
  ['1999.99', '2000.00'],
])('carry identity remains decimal-relative: %s to %s', (from, to) => {
  const a = format(from),
    b = format(to);
  for (const token of a.tokens.filter((t) => t.digit !== undefined))
    expect(b.tokens.some((t) => t.key === token.key)).toBe(true);
  expect(
    b.tokens
      .filter((t) => t.key.startsWith('integer:'))
      .map((t) => t.text)
      .join('')
  ).toBe(parseAmount(to).integer);
  expect(new Set(b.tokens.map((t) => t.key)).size).toBe(b.tokens.length);
  expect(
    b.tokens
      .filter((t) => t.digit === undefined)
      .every(
        (t) => !t.key.startsWith('integer:') && !t.key.startsWith('fraction:')
      )
  ).toBe(true);
});
test.each([
  ['-10', '-9', -1],
  ['-0.01', '0', -1],
  ['0', '0.000001', -1],
  ['999999999999999.000001', '999999999999999.000002', -1],
  ['1.0', '1.000000', 0],
  ['-0', '0', 0],
  ['10', '9', 1],
])('exact decimal ordering %s vs %s', (a, b, expected) =>
  expect(Math.sign(compareAmounts(parseAmount(a), parseAmount(b)))).toBe(
    expected
  )
);
test('cyclic retargeting preserves current progress and bounds travel', () => {
  expect(digitDestination(9.5, 0, 1)).toEqual({ current: 9.5, target: 10 });
  expect(digitDestination(-0.5, 8, -1)).toEqual({ current: 9.5, target: 8 });
  expect(digitDestination(0.5, 9, -1)).toEqual({ current: 0.5, target: -1 });
  for (const current of [-19.25, -0.25, 0, 1.7, 9.8, 41.5])
    for (let next = 0; next < 10; next++)
      for (const direction of [-1, 1]) {
        const d = digitDestination(current, next, direction);
        expect(Math.abs(d.target - d.current)).toBeLessThan(10);
        expect((d.target - d.current) * direction).toBeGreaterThanOrEqual(0);
        expect(((d.target % 10) + 10) % 10).toBe(next);
      }
});

async function mount(extra: Partial<AnimatedBalanceProps> = {}) {
  const props = { value: '19.99', currency: 'USD', testID: 'amount', ...extra };
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<AnimatedBalance {...props} />);
  });
  return { tree, props };
}
async function measure(tree: Renderer.ReactTestRenderer) {
  await act(async () => {
    for (let digit = 0; digit < 10; digit++)
      tree.root
        .findByProps({ testID: `amount-measure-${digit}` })
        .props.onLayout({
          nativeEvent: {
            layout: { width: digit === 8 ? 23.2 : 20, height: 45 },
          },
        });
  });
}
function label(tree: Renderer.ReactTestRenderer) {
  return tree.root.findByProps({ accessibilityRole: 'text' }).props
    .accessibilityLabel;
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(false);
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

test('initial static amount is complete; measurement yields bounded hidden digit rows without initial animation', async () => {
  const timing = jest.mocked(Motion.withTiming);
  const { tree } = await mount({ accessibilityLabel: 'Available' });
  expect(label(tree)).toBe('Available: $19.99');
  expect(
    tree.root.findByProps({ testID: 'amount-static' }).props.children
  ).toBe('$19.99');
  await measure(tree);
  expect(
    tree.root.findAll(
      (n) => typeof n.type === 'string' && n.props.accessible === true
    )
  ).toHaveLength(1);
  expect(tree.root.findByType(ScrollView).props.importantForAccessibility).toBe(
    'no-hide-descendants'
  );
  expect(
    StyleSheet.flatten(
      tree.root.findAll(
        (n) =>
          typeof n.type === 'string' && n.props.testID === 'amount-integer:0'
      )[0]!.props.style
    ).width
  ).toBe(24);
  const strip = tree.root
    .findByProps({ testID: 'amount-integer:0' })
    .findByType(Motion.default.View);
  expect(StyleSheet.flatten(strip.props.style).height).toBe(
    30 * 45 * Dimensions.get('window').fontScale
  );
  expect(timing).not.toHaveBeenCalled();
  expect(
    tree.root.findByProps({ accessibilityRole: 'text' }).props
      .accessibilityLiveRegion
  ).toBe('none');
  await act(async () => tree.unmount());
});
test('carry, reversal, rapid interruptions, no-change and final authoritative label', async () => {
  jest.useFakeTimers();
  const timing = jest.mocked(Motion.withTiming);
  const cancel = jest.mocked(Motion.cancelAnimation);
  const { tree, props } = await mount();
  await measure(tree);
  const ones = tree.root.findByProps({ testID: 'amount-integer:0' });
  await act(async () =>
    tree.update(<AnimatedBalance {...props} value="20.00" />)
  );
  expect(tree.root.findByProps({ testID: 'amount-integer:0' })).toBe(ones);
  await act(async () => jest.advanceTimersByTime(1));
  expect(timing).toHaveBeenCalled();
  const calls = timing.mock.calls.length;
  await act(async () =>
    tree.update(<AnimatedBalance {...props} value="20.000" />)
  );
  expect(timing).toHaveBeenCalledTimes(calls);
  for (const value of ['1350.25', '1100.10', '1875.75', '-1.50', '0.25'])
    await act(async () => {
      jest.advanceTimersByTime(60);
      tree.update(<AnimatedBalance {...props} value={value} />);
    });
  await act(async () => jest.advanceTimersByTime(2500));
  expect(label(tree)).toBe('$0.25');
  const before = cancel.mock.calls.length;
  await act(async () => tree.unmount());
  expect(cancel.mock.calls.length).toBeGreaterThan(before);
  jest.useRealTimers();
});
test('format and typography changes snap a new face and retain full precision and styling', async () => {
  const { tree, props } = await mount();
  await measure(tree);
  await act(async () =>
    tree.update(
      <AnimatedBalance
        {...props}
        value="1250.75"
        locale="de-DE"
        currency="EUR"
        textStyle={{ fontSize: 40, color: 'red' }}
      />
    )
  );
  expect(label(tree)).toBe('1.250,75\u00a0€');
  const text = tree.root.findByProps({ testID: 'amount-static' });
  expect(StyleSheet.flatten(text.props.style)).toMatchObject({
    fontSize: 40 * Dimensions.get('window').fontScale,
    color: 'red',
  });
  await act(async () =>
    tree.update(
      <AnimatedBalance {...props} value="1250" currency="JPY" locale="ja-JP" />
    )
  );
  expect(label(tree)).toBe('￥1,250');
  await act(async () => tree.unmount());
});
test('reduced motion, live preference changes, zero duration, listener cleanup', async () => {
  let change: (v: boolean) => void = () => {};
  const remove = jest.fn();
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation((_, fn) => {
      change = fn;
      return { remove };
    });
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(true);
  const timing = jest.mocked(Motion.withTiming);
  const { tree, props } = await mount();
  await measure(tree);
  await act(async () =>
    tree.update(<AnimatedBalance {...props} value="1000.00" />)
  );
  expect(timing).not.toHaveBeenCalled();
  await act(async () => change(false));
  await act(async () =>
    tree.update(<AnimatedBalance {...props} value="1001.00" />)
  );
  await act(async () => jest.advanceTimersByTime(1));
  expect(timing).toHaveBeenCalled();
  timing.mockClear();
  await act(async () => change(true));
  await act(async () =>
    tree.update(<AnimatedBalance {...props} value="0.00" />)
  );
  expect(timing).not.toHaveBeenCalled();
  await act(async () => change(false));
  await act(async () =>
    tree.update(<AnimatedBalance {...props} duration={0} value="999.00" />)
  );
  expect(timing).not.toHaveBeenCalled();
  expect(label(tree)).toBe('$999.00');
  await act(async () => tree.unmount());
  expect(remove).toHaveBeenCalledTimes(1);
});
test('non-Latin native text fallback preserves a single complete localized value', async () => {
  const { tree } = await mount({ value: '-0.75', locale: 'ar-EG' });
  expect(tree.root.findAllByProps({ testID: 'amount-row' })).toHaveLength(0);
  expect(label(tree)).toBe(
    createBalanceFormatter('ar-EG', 'USD')('-0.75').formatted
  );
  expect(
    tree.root.findAll(
      (n) => typeof n.type === 'string' && n.props.accessible === true
    )
  ).toHaveLength(1);
  await act(async () => tree.unmount());
});

test('Hermes-compatible exact formatting does not require formatToParts', () => {
  const descriptor = Object.getOwnPropertyDescriptor(
    Intl.NumberFormat.prototype,
    'formatToParts'
  )!;
  Object.defineProperty(Intl.NumberFormat.prototype, 'formatToParts', {
    value: undefined,
    configurable: true,
  });
  try {
    expect(createBalanceFormatter('es-PE', 'PEN')('1250.75').formatted).toBe(
      'S/\u00a01,250.75'
    );
    expect(createBalanceFormatter('en-US', 'USD')('-0.75').formatted).toBe(
      '-$0.75'
    );
    expect(
      createBalanceFormatter('en-US', undefined, 6)('999999999999999.123456')
        .formatted
    ).toBe('999,999,999,999,999.123456');
  } finally {
    Object.defineProperty(
      Intl.NumberFormat.prototype,
      'formatToParts',
      descriptor
    );
  }
});
