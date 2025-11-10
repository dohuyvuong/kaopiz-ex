import createWebStorage from 'redux-persist/es/storage/createWebStorage';

const createNoopStorage = () => {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
};

// Create localStorage wrapper that works in both server and client
export const localStorage =
  typeof window !== 'undefined'
    ? createWebStorage('local')
    : createNoopStorage();
