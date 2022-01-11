import { configureStore } from '@reduxjs/toolkit';
import { reducer as synthReducer } from './reducers/synth';

export const store = configureStore({
  reducer: {
    loop: {} as any,
    synth: synthReducer,
    output: {} as any,
    precision: {} as any,
    regl: {} as any,
    renderFbo: {} as any,
    timeSinceLastUpdate: 0 as any,
    outputs: {} as any,
    sources: {} as any,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
