import { createContext, Reducer, useReducer, useState } from "react";
import data from "../data.json";
import { TaskList, Data as DataOld } from "../types";

type Data = typeof data;

const initialState = {
  data: data,
};
type InitialState = typeof initialState;

// const initialState: { data: Data; dispatch?: any } = {
//     data: info,
//   };

// type Var = DataOld;

// const context: React.Context<Data> = createContext(info);

// const { Provider } = context;

// const initialState: { data: DataOld; dispatch?: any } = {
//   data: data,
// };

export const stateContext: React.Context<InitialState> =
  createContext(initialState);

// const { Provider } = stateContext;

const { Provider, Consumer } = stateContext;

export const StateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer<Reducer<InitialState, {}>>(() => {
    return { data };
  }, initialState);

  return <Provider value={state}>{children}</Provider>;
};
