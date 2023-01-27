import { createContext, ReactNode, useReducer } from "react";
import originalData from "../data.json";

import { TaskList, Data, Task, DragPayload, Payload } from "../types";

const data = { ...originalData };

const initialState: {
  data: Data;
  dispatch: (type: string, payload: Payload) => void;
} = {
  data: data,
  dispatch: () => {},
};

export const globalState = createContext(initialState);

const { Provider } = globalState;

const reducer = (
  state: { data: Data },
  action: { type: string; payload: Payload }
) => {
  const currentState = { ...state };
  switch (action.type) {
    case "COMPLETE":
      const handleComplete = (state: Data, payload: Payload) => {};

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
        open_subtasks: 0,
        comments_count: 0,
        assignee: [],
        is_important: false,
      };

      currentState.data.tasks.push(task);

      taskList.open_tasks++;
      return currentState;
    case "ON_DRAG":
      const tasks = currentState.data.tasks;
      const payload: DragPayload = action.payload as DragPayload;

      const { taskId, fromList, fromPosition, toList, toPosition } = payload;

      const taskDragged = tasks.find((t) => t.id === taskId);

      if (!taskDragged) return currentState;

      if (fromList === toList) {
        const tasksCopy = filterAndSort(fromList, tasks);

        [tasksCopy[fromPosition - 1], tasksCopy[toPosition - 1]] = [
          tasksCopy[toPosition - 1],
          tasksCopy[fromPosition - 1],
        ];

        positionAndSave(tasksCopy, tasks, payload, taskDragged);
      } else {
        const toListTasksCopy = filterAndSort(toList, tasks);

        toListTasksCopy.splice(toPosition - 1, 0, taskDragged);

        positionAndSave(toListTasksCopy, tasks, payload, taskDragged);

        const fromListsTasksCopy = filterAndSort(fromList, tasks);

        positionAndSave(fromListsTasksCopy, tasks, payload, taskDragged);
      }

      return currentState;

    default:
      throw new Error();
  }
};

export const StateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <Provider
      value={{
        data: state.data,
        dispatch: (type, payload) => dispatch({ type, payload }),
      }}
    >
      {children}
    </Provider>
  );
};

const filterAndSort = (taskListId: number, originalTasks: Task[]): Task[] => {
  const tasksCopy = originalTasks.filter(
    (t) => t.task_list_id === taskListId && !t.is_completed
  );

  return tasksCopy.sort((a, b) => a.position - b.position);
};

const positionAndSave = (
  tasksCopy: Task[],
  tasks: Task[],
  payload: DragPayload,
  taskDragged: Task
) => {
  const { toPosition, toList } = payload;

  if (taskDragged) {
    tasksCopy.forEach((t, index) => {
      if (t.id === taskDragged.id) {
        taskDragged.position = toPosition;
        taskDragged.task_list_id = toList;
      } else {
        t.position = index + 1;
        let original = tasks.find((o) => o.id === t.id);
        original = t;
      }
    });
  }
};
