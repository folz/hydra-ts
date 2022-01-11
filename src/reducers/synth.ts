import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SynthState {
  bpm: number;
  fps?: number;
  resolution: [number, number];
  speed: number;
  stats: {
    fps: number;
  };
  time: number;
}

const initialState = {
  bpm: 30,
  fps: undefined,
  resolution: [0, 0],
  speed: 1,
  stats: {
    fps: 0,
  },
  time: 0,
} as const;

export const synthSlice = createSlice({
  name: 'synth',
  initialState,
  reducers: {
    tick: (state, action: PayloadAction<number>) => {
      state.time += action.payload * 0.001 * state.speed;
    },
  },
});

export const { tick } = synthSlice.actions;
export const { reducer } = synthSlice;
