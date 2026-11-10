import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

type SheetSlot = { owner: object; node: ReactNode };
type HostAPI = {
  present: (owner: object, node: ReactNode) => void;
  remove: (owner: object) => void;
};
const HostContext = createContext<HostAPI | null>(null);
export type PurchaseSheetHostProps = { children: ReactNode };
/** Screen-root host for one controlled purchase sheet. Not a general portal API. */
export function PurchaseSheetHost({ children }: PurchaseSheetHostProps) {
  const [slot, setSlot] = useState<SheetSlot | null>(null);
  const owner = useRef<object | null>(null);
  const alive = useRef(true);
  useLayoutEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      owner.current = null;
    };
  }, []);
  const present = useCallback((nextOwner: object, node: ReactNode) => {
    if (!alive.current) return;
    if (owner.current && owner.current !== nextOwner)
      throw new Error('PurchaseSheetHost supports one active sheet at a time');
    owner.current = nextOwner;
    setSlot({ owner: nextOwner, node });
  }, []);
  const remove = useCallback((currentOwner: object) => {
    if (owner.current !== currentOwner) return;
    owner.current = null;
    if (alive.current) setSlot(null);
  }, []);
  const api = useMemo(() => ({ present, remove }), [present, remove]);
  return (
    <HostContext.Provider value={api}>
      <View style={styles.fill}>
        <View
          style={styles.fill}
          testID="purchase-sheet-background"
          pointerEvents={slot ? 'none' : 'auto'}
          accessibilityElementsHidden={!!slot}
          importantForAccessibility={slot ? 'no-hide-descendants' : 'auto'}
        >
          {children}
        </View>
        <View
          style={StyleSheet.absoluteFill}
          testID="purchase-sheet-overlay"
          pointerEvents={slot ? 'box-none' : 'none'}
        >
          {slot?.node}
        </View>
      </View>
    </HostContext.Provider>
  );
}
export function usePurchaseSheetHost() {
  const api = useContext(HostContext);
  if (!api)
    throw new Error(
      'InteractivePurchaseSheet must be inside PurchaseSheetHost'
    );
  return api;
}
const styles = StyleSheet.create({ fill: { flex: 1 } });
