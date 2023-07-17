import { createContext, ReactNode, useReducer } from 'react';
import originalData from '../data.json';

import {
  TaskList,
  Data,
  Task,
  DragPayload,
  Payload,
  CompletePayload,
  TrashPayload,
  AddTaskPayload,
  AddListPayload,
} from '../types';

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

const reducer = (state: { data: Data }, action: { type: string; payload: Payload }) => {
  const currentState = { ...state };
  switch (action.type) {
    case 'COMPLETE':
      return handleComplete(currentState.data, action.payload as CompletePayload);
    case 'MOVE_TO_TRASH':
      return handleTrash(currentState.data, action.payload as TrashPayload);
    case 'CREATE_TASK_LIST':
      return handleCreateList(currentState.data, action.payload as AddListPayload);
    case 'ADD_TASK':
      return handleCreateTask(currentState.data, action.payload as AddTaskPayload);
    case 'ON_DRAG':
      return handleDrag(currentState.data, action.payload as DragPayload);
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
  const tasksCopy = originalTasks.filter((t) => t.task_list_id === taskListId && !t.is_completed);

  return tasksCopy.sort((a, b) => a.position - b.position);
};

const positionAndSave = (tasksCopy: Task[], tasks: Task[], payload: DragPayload, taskDragged: Task) => {
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

const handleComplete = (data: Data, payload: Payload): { data: Data } => {
  const taskListToComplete = data.task_lists.find((tl: TaskList) => tl.id === payload.listId);
  if (taskListToComplete) {
    taskListToComplete.is_completed = true;
  }

  for (const task of data.tasks) {
    if (task.task_list_id === payload.listId) {
      task.is_completed = true;
    }
  }

  return { data };
};

const handleTrash = (data: Data, payload: Payload): { data: Data } => {
  const taskListToDelete = data.task_lists.find((tl: TaskList) => tl.id === payload.listId);

  if (taskListToDelete) {
    taskListToDelete.is_trashed = true;
  }

  return { data };
};

const handleCreateList = (data: Data, payload: Payload): { data: Data } => {
  const taskListToCreate = {
    id: data.task_lists.length + 1,
    name: payload.name,
    open_tasks: 0,
    completed_tasks: 0,
    position: data.task_lists.length + 1,
    is_completed: false,
    is_trashed: false,
  };

  return {
    data: {
      ...data,
      task_lists: [...data.task_lists, taskListToCreate],
    },
  };
};

const handleCreateTask = (data: Data, payload: Payload): { data: Data } => {
  const taskList = data.task_lists.find((tl: TaskList) => tl.id === payload.listId);

  if (!taskList) {
    return { data };
  }

  const task = {
    id: Math.random(),
    name: payload.input,
    is_completed: false,
    task_list_id: payload.listId,
    position: taskList.open_tasks + 1,
    start_on: null,
    due_on: null,
    labels: [],
    open_subtasks: 0,
    comments_count: 0,
    assignee: [],
    is_important: false,
  };

  taskList.open_tasks++;

  return {
    data: {
      ...data,
      tasks: [...data.tasks, task],
    },
  };
};

const handleDrag = (data: Data, payload: DragPayload): { data: Data } => {
  const tasks = data.tasks;

  const { taskId, fromList, fromPosition, toList, toPosition } = payload;

  let index = data.tasks.findIndex((item) => item.id === taskId);
  let taskDragged = tasks[index];

  if (!taskDragged) return { data };

  if (fromList === toList) {
    const tasksCopy = filterAndSort(fromList, tasks);

    [tasksCopy[fromPosition - 1], tasksCopy[toPosition - 1]] = [tasksCopy[toPosition - 1], tasksCopy[fromPosition - 1]];

    positionAndSave(tasksCopy, tasks, payload, taskDragged);
  } else {
    const toListTasksCopy = filterAndSort(toList, tasks);

    toListTasksCopy.splice(toPosition - 1, 0, taskDragged);

    positionAndSave(toListTasksCopy, tasks, payload, taskDragged);

    const fromListsTasksCopy = filterAndSort(fromList, tasks);

    positionAndSave(fromListsTasksCopy, tasks, payload, taskDragged);
  }

  return { data };
};
