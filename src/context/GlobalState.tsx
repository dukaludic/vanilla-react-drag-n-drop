import { createContext, ReactNode, useReducer } from "react";
import data from "../data.json";

import { TaskList, Data, Task } from "../types";

const initialState: {
  data: Data;
  dispatch: (type: string, payload: Payload) => void;
} = {
  data: data,
  dispatch: () => {},
};

type Payload = Record<string, any>;

export const globalState = createContext(initialState);

const { Provider } = globalState;

const reducer = (
  state: { data: Data },
  action: { type: string; payload: Payload }
) => {
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
    case "ON_DRAG":
      console.log("drag position:", action.payload.dragEndPosition);
      const tasks = currentState.data.tasks;
      const taskDragged = tasks.find((t) => t.id === action.payload.taskId);

      // if (taskDragged?.position === action.payload.dragEndPosition) {
      //   console.log("same place");
      //   return currentState;
      // }

      if (!taskDragged) {
        return currentState;
      }

      const tasksInList = tasks.filter(
        (t: Task) => t.task_list_id === action.payload.listId
      );

      const taskAtDragEndPosition = tasksInList.find(
        (t) => t.position === action.payload.dragEndPosition
      );

      if (!taskAtDragEndPosition) {
        return currentState;
      }

      // console.log(action.payload.dragEndPosition, "dragEndPosition");
      // console.log(
      //   `atDragEnd: ${taskAtDragEndPosition.position} next:${nextTaskToBubble?.position}`
      // );
      // console.log("nextTaskToBubble", nextTaskToBubble?.name);

      //reduce positions of list that is dragged from

      // draggingFromList,
      // draggingFromPosition,

      const tasksToReducePositions = tasks.filter(
        (t) => t.task_list_id === action.payload.draggingFromList
      );

      console.log("tasksToReducePositions", tasksToReducePositions);

      // const list = currentState.data.task_lists.find(
      //   (l) => l.id === action.payload.draggingFromList
      // );

      const taskMoved = tasksToReducePositions.find(
        (t) => t.position === action.payload.draggingFromPosition
      );

      console.log(taskMoved, "taskMoved");

      const reducePositions = (taskMoved: Task) => {
        console.log(taskMoved, "taskMoved");
        const nextTaskToBubble = tasksToReducePositions.find(
          (t) => t.position === taskMoved.position + 1
        );
        if (nextTaskToBubble) {
          nextTaskToBubble.position = taskMoved.position - 1;
          console.log("has more");

          bubbleTask(nextTaskToBubble);
        } else {
          // nextTaskToBubble.position = taskMoved.position - 1;
          return;
        }
      };

      // if (taskMoved) reducePositions(taskMoved);

      const bubbleTask = (taskToMove: Task): void => {
        const nextTaskToBubble = tasks.find(
          (t) => t.position === taskToMove.position + 1
        );
        if (nextTaskToBubble) {
          taskToMove.position = taskToMove.position + 1;
          console.log("has more");

          bubbleTask(nextTaskToBubble);
        } else {
          taskToMove.position = taskToMove.position + 1;
          return;
        }
      };

      bubbleTask(taskAtDragEndPosition);

      taskDragged.task_list_id = action.payload.listId;
      taskDragged.position = action.payload.dragEndPosition;

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
