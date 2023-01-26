import { createContext, ReactNode, useReducer } from "react";
import data from "../data.json";

import { TaskList, Data } from "../types";

const initialState: { data: Data; dispatch?: any } = {
  data: data,
};

export const globalState = createContext(initialState);

const { Provider } = globalState;

export const StateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    (state: { data: Data }, action: { type: string; payload: any }) => {
      const currentState = { ...state };
      switch (action.type) {
        case "COMPLETE":
          const taskListToComplete = currentState.data.task_lists.find(
            (tl: TaskList) => tl.id === action.payload.listId
          );
          if (taskListToComplete) {
            taskListToComplete.is_completed = true;
          }

          for (const task of currentState.data.tasks) {
            if (task.task_list_id === action.payload.listId) {
              task.is_completed = true;
            }
          }

          return currentState;
        case "MOVE_TO_TRASH":
          const taskListToDelete = currentState.data.task_lists.find(
            (tl: TaskList) => tl.id === action.payload.listId
          );

          if (taskListToDelete) {
            taskListToDelete.is_trashed = true;
          }

          return currentState;

        case "CREATE_TASK_LIST":
          const taskListToCreate = {
            id: currentState.data.task_lists.length + 1,
            name: action.payload.name,
            open_tasks: 0,
            completed_tasks: 0,
            position: currentState.data.task_lists.length + 1,
            is_completed: false,
            is_trashed: false,
          };
          currentState.data.task_lists.push(taskListToCreate);

          return currentState;

        case "ADD_TASK":
          const taskList = currentState.data.task_lists.find(
            (tl: TaskList) => tl.id === action.payload.listId
          );

          if (!taskList) {
            return currentState;
          }

          const task = {
            id: currentState.data.tasks.length + 1,
            name: action.payload.input,
            is_completed: false,
            task_list_id: action.payload.listId,
            position: taskList.open_tasks + 1,
            start_on: null,
            due_on: null,
            labels: [],
            open_subtasks: taskList.open_tasks + 1,
            comments_count: 0,
            assignee: [],
            is_important: false,
          };

          currentState.data.tasks.push(task);
          return currentState;

        default:
          throw new Error();
      }
    },
    initialState
  );

  return <Provider value={{ data, dispatch }}>{children}</Provider>;
};
