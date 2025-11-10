'use client';

import { useMemo } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import { makeStore } from '@/lib/store';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  // Use useMemo to initialize store and persistor only once
  // This avoids React 19 linter warnings about accessing refs during render
  const { store, persistor } = useMemo(() => {
    const storeInstance = makeStore();
    const persistorInstance = persistStore(storeInstance);
    return { store: storeInstance, persistor: persistorInstance };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
