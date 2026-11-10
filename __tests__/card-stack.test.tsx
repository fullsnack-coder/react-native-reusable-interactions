import { Text } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import { CardStackSelector } from '../src';
const items = ['a', 'b', 'c'];
const base = {
  items,
  keyExtractor: (item: string) => item,
  getAccessibilityLabel: (item: string) => item,
  renderCard: ({ item }: { item: string }) => <Text>{item}</Text>,
  cardHeight: 100,
};
async function mount(props = {}) {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<CardStackSelector {...base} {...props} />);
  });
  return tree;
}
test.each([0, 1, 3, 5, 10])('renders %i cards safely', async (count) => {
  const tree = await mount({
    items: Array.from({ length: count }, (_, i) => String(i)),
  });
  if (count)
    expect(tree.root.findByProps({ accessibilityLabel: '0' })).toBeTruthy();
  else expect(tree.toJSON()).toBeNull();
  await act(async () => tree.unmount());
});
test('uncontrolled expansion, selection, duplicate prevention, and collapse', async () => {
  const selection = jest.fn();
  const expansion = jest.fn();
  const tree = await mount({
    onSelectedChange: selection,
    onExpandedChange: expansion,
    collapseOnSelect: false,
  });
  await act(async () =>
    tree.root
      .findByProps({ accessibilityLabel: 'Expand cards' })
      .props.onPress()
  );
  await act(async () =>
    tree.root.findByProps({ accessibilityLabel: 'b' }).props.onPress()
  );
  await act(async () =>
    tree.root.findByProps({ accessibilityLabel: 'b' }).props.onPress()
  );
  expect(selection.mock.calls).toEqual([['b']]);
  expect(
    tree.root.findByProps({ accessibilityLabel: 'b' }).props.accessibilityState
      .selected
  ).toBe(true);
  await act(async () =>
    tree.root
      .findByProps({ accessibilityLabel: 'Collapse cards' })
      .props.onPress()
  );
  expect(expansion.mock.calls).toEqual([[true], [false]]);
  await act(async () => tree.unmount());
});
test('controlled requests do not mutate props; removal and reorder fall back deterministically', async () => {
  const selection = jest.fn();
  const tree = await mount({
    selectedId: 'b',
    expanded: true,
    onSelectedChange: selection,
  });
  await act(async () =>
    tree.root.findByProps({ accessibilityLabel: 'c' }).props.onPress()
  );
  expect(selection).toHaveBeenCalledWith('c');
  expect(
    tree.root.findByProps({ accessibilityLabel: 'b' }).props.accessibilityState
      .selected
  ).toBe(true);
  await act(async () =>
    tree.update(
      <CardStackSelector {...base} items={['c', 'a']} selectedId="b" expanded />
    )
  );
  expect(
    tree.root.findByProps({ accessibilityLabel: 'c' }).props.accessibilityState
      .selected
  ).toBe(true);
  await act(async () => tree.unmount());
});

test('controlled expansion emits alternating requests without changing rendered ownership', async () => {
  const changed = jest.fn();
  const tree = await mount({
    expanded: false,
    onExpandedChange: changed,
    defaultSelectedId: 'c',
  });
  const toggle = tree.root.findByProps({ accessibilityLabel: 'Expand cards' });
  await act(async () => {
    toggle.props.onPress();
    toggle.props.onPress();
    toggle.props.onPress();
  });
  expect(changed.mock.calls).toEqual([[true], [false], [true]]);
  expect(toggle.props.accessibilityState.expanded).toBe(false);
  expect(
    tree.root.findByProps({ accessibilityLabel: 'c' }).props.accessibilityState
      .selected
  ).toBe(true);
  await act(async () => tree.unmount());
});

test('rapid requests and collection replacement preserve identity without synthetic callbacks', async () => {
  const selected = jest.fn();
  const expanded = jest.fn();
  const props = {
    ...base,
    defaultSelectedId: 'b',
    defaultExpanded: true,
    collapseOnSelect: false,
    onSelectedChange: selected,
    onExpandedChange: expanded,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<CardStackSelector {...props} />);
  });
  await act(async () => {
    tree.root.findByProps({ accessibilityLabel: 'c' }).props.onPress();
    tree.root.findByProps({ accessibilityLabel: 'a' }).props.onPress();
  });
  expect(selected.mock.calls).toEqual([['c'], ['a']]);
  await act(async () =>
    tree.update(<CardStackSelector {...props} items={['c', 'a', 'b']} />)
  );
  expect(
    tree.root.findByProps({ accessibilityLabel: 'a' }).props.accessibilityState
      .selected
  ).toBe(true);
  await act(async () =>
    tree.update(<CardStackSelector {...props} items={['c', 'b']} />)
  );
  expect(
    tree.root.findByProps({ accessibilityLabel: 'c' }).props.accessibilityState
      .selected
  ).toBe(true);
  await act(async () =>
    tree.update(<CardStackSelector {...props} items={[]} />)
  );
  expect(tree.toJSON()).toBeNull();
  await act(async () =>
    tree.update(<CardStackSelector {...props} items={['b']} />)
  );
  expect(
    tree.root.findByProps({ accessibilityLabel: 'b' }).props.accessibilityState
      .selected
  ).toBe(true);
  expect(selected).toHaveBeenCalledTimes(2);
  expect(expanded).not.toHaveBeenCalled();
  await act(async () => tree.unmount());
});

test('collapsed secondary cards are excluded from touch and accessibility at their native container', async () => {
  const tree = await mount();
  const hidden = tree.root.findByProps({ accessibilityLabel: 'b' }).parent!;
  expect(hidden.props.pointerEvents).toBe('none');
  expect(hidden.props.importantForAccessibility).toBe('no-hide-descendants');
  expect(hidden.props.accessibilityElementsHidden).toBe(true);
  await act(async () =>
    tree.root
      .findByProps({ accessibilityLabel: 'Expand cards' })
      .props.onPress()
  );
  const visible = tree.root.findByProps({ accessibilityLabel: 'b' }).parent!;
  expect(visible.props.pointerEvents).toBe('auto');
  expect(visible.props.accessibilityElementsHidden).toBe(false);
  await act(async () => tree.unmount());
});

test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
  'rejects invalid card-stack spring values before native animation: %s',
  async (stiffness) => {
    await expect(mount({ springConfig: { stiffness } })).rejects.toThrow(
      'spring parameters must be finite and positive'
    );
  }
);
