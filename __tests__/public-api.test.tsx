import TestRenderer, { act } from 'react-test-renderer';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  fireGestureHandler,
  getByGestureTestId,
} from 'react-native-gesture-handler/jest-utils';
import { ExpandableTransactionCard } from '../src';

const summary = <Text>Summary</Text>;
const details = <Text>Detail action</Text>;

function cardProps(root: TestRenderer.ReactTestInstance) {
  const toggle = root.findByProps({ testID: 'card-toggle' });
  const reveal = root.findByProps({ testID: 'card-details' });
  return { toggle, reveal };
}

test('public component starts collapsed and toggles by gesture without duplicate callbacks', async () => {
  const changes = jest.fn();
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(
      <GestureHandlerRootView>
        <ExpandableTransactionCard
          testID="card"
          collapsedContent={summary}
          expandedContent={details}
          onExpandedChange={changes}
        />
      </GestureHandlerRootView>
    );
  });
  expect(cardProps(renderer.root).toggle.props.accessibilityState).toEqual({
    expanded: false,
  });
  expect(cardProps(renderer.root).reveal.props.pointerEvents).toBe('none');
  expect(cardProps(renderer.root).reveal.props.importantForAccessibility).toBe(
    'no-hide-descendants'
  );
  await act(async () => {
    fireGestureHandler(getByGestureTestId('card-gesture'), []);
  });
  expect(changes).toHaveBeenCalledTimes(1);
  expect(changes).toHaveBeenLastCalledWith(true);
  expect(cardProps(renderer.root).toggle.props.accessibilityState).toEqual({
    expanded: true,
  });
  expect(cardProps(renderer.root).reveal.props.pointerEvents).toBe('auto');
  await act(async () => {
    fireGestureHandler(getByGestureTestId('card-gesture'), []);
  });
  expect(changes).toHaveBeenLastCalledWith(false);
  expect(changes).toHaveBeenCalledTimes(2);
  expect(cardProps(renderer.root).toggle.props.accessibilityState).toEqual({
    expanded: false,
  });
  await act(async () => renderer.unmount());
});

test('default expanded, custom nodes and style, and accessible activation', async () => {
  const changes = jest.fn();
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(
      <GestureHandlerRootView>
        <ExpandableTransactionCard
          testID="card"
          defaultExpanded
          collapsedContent={<Text>Custom compact</Text>}
          expandedContent={
            <View>
              <Text>Custom detail</Text>
            </View>
          }
          style={{ backgroundColor: 'navy' }}
          accessibilityLabel="Transfer details"
          onExpandedChange={changes}
        />
      </GestureHandlerRootView>
    );
  });
  expect(cardProps(renderer.root).toggle.props.accessibilityRole).toBe(
    'button'
  );
  expect(cardProps(renderer.root).toggle.props.accessibilityLabel).toBe(
    'Transfer details'
  );
  expect(cardProps(renderer.root).toggle.props.accessibilityState).toEqual({
    expanded: true,
  });
  expect(
    renderer.root.findAllByType(Text).map((node) => node.props.children)
  ).toEqual(['Custom compact', 'Custom detail']);
  expect(renderer.root.findByProps({ testID: 'card' }).props.style).toEqual({
    backgroundColor: 'navy',
  });
  await act(async () => {
    cardProps(renderer.root).toggle.props.onAccessibilityAction({
      nativeEvent: { actionName: 'activate' },
    });
  });
  expect(changes).toHaveBeenCalledWith(false);
  expect(cardProps(renderer.root).toggle.props.accessibilityState).toEqual({
    expanded: false,
  });
  await act(async () => renderer.unmount());
});

test('controlled prop owns state while rapid requests alternate and external updates do not call back', async () => {
  const changes = jest.fn();
  const render = (expanded: boolean) => (
    <GestureHandlerRootView>
      <ExpandableTransactionCard
        testID="card"
        expanded={expanded}
        collapsedContent={summary}
        expandedContent={details}
        onExpandedChange={changes}
      />
    </GestureHandlerRootView>
  );
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(render(false));
  });
  await act(async () => {
    fireGestureHandler(getByGestureTestId('card-gesture'), []);
    fireGestureHandler(getByGestureTestId('card-gesture'), []);
    fireGestureHandler(getByGestureTestId('card-gesture'), []);
  });
  expect(changes.mock.calls).toEqual([[true], [false], [true]]);
  expect(cardProps(renderer.root).toggle.props.accessibilityState).toEqual({
    expanded: false,
  });
  await act(async () => {
    renderer.update(render(true));
  });
  expect(cardProps(renderer.root).toggle.props.accessibilityState).toEqual({
    expanded: true,
  });
  expect(changes).toHaveBeenCalledTimes(3);
  await act(async () => renderer.unmount());
});

test.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
  'rejects an invalid disclosure spring before starting native motion: %s',
  async (mass) => {
    await expect(
      (async () => {
        await act(async () => {
          TestRenderer.create(
            <ExpandableTransactionCard
              collapsedContent={summary}
              expandedContent={details}
              springConfig={{ mass }}
            />
          );
        });
      })()
    ).rejects.toThrow('spring parameters must be finite and positive');
  }
);
