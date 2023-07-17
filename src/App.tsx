import React, { useContext, useState } from 'react';
import './App.css';
import { globalState } from './context/GlobalState';

import TaskList from './components/TaskList';

import { DragPayload, Task, TaskList as TaskListType } from './types';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [newTaskListInput, setNewTaskListInput] = useState('');
  const [taskDragged, setTaskDragged] = useState<number | null>(null);
  const [toPosition, setToPosition] = useState<number | null>(null);
  const [toList, setToList] = useState<number | null>(null);
  const [fromList, setFromList] = useState<number | null>(null);
  const [fromPosition, setFromPosition] = useState<number | null>(null);
  const context = useContext(globalState);

  const taskLists = context.data.task_lists.filter((tl) => tl.is_trashed === false && tl.is_completed === false);

  const tasks: Task[] = context.data.tasks;
  const completedTasks: Task[] = context.data.tasks.filter((t: Task) => t.is_completed === true);

  const newListHandler = () => {
    context.dispatch('CREATE_TASK_LIST', { name: newTaskListInput });
    setIsOpen(false);
  };

  const handleDragEnd = (
    toList: number | null,
    toPosition: number | null,
    fromList: number | null,
    fromPosition: number | null
  ) => {
    if (!taskDragged || !fromList || !fromPosition || !toList || !toPosition) {
      return;
    }

    const payload: DragPayload = {
      taskId: taskDragged,
      fromList,
      fromPosition,
      toList,
      toPosition,
    };

    context.dispatch('ON_DRAG', payload);
  };

  return (
    <>
      <div className="app">
        {taskLists.map((item: TaskListType, index: number) => {
          return (
            <div
              key={item.id}
              onDragOver={(e: React.DragEvent) => {
                setToList(item.id);
              }}
              onDragEnd={(e: React.DragEvent) => handleDragEnd(toList, toPosition, fromList!, fromPosition)}
            >
              <TaskList
                key={item.id}
                id={item.id}
                name={item.name}
                tasks={tasks.filter((task) => task.task_list_id === item.id && task.is_completed === false)}
                setTaskDragged={setTaskDragged}
                setToPosition={setToPosition}
                setFromList={setFromList}
                setFromPosition={setFromPosition}
              />
            </div>
          );
        })}
        <div className="plus-btn-container">
          {!isOpen ? (
            <div onClick={() => setIsOpen(!isOpen)} className="plus-btn">
              <div className="vertical-line"></div>
              <div className="horizontal-line"></div>
            </div>
          ) : (
            <div className="add-list-dropdown">
              <input value={newTaskListInput} onChange={(e) => setNewTaskListInput(e.target.value)} type="text" />
              <button onClick={newListHandler}>Add</button>
              <button onClick={() => setIsOpen(false)}>Cancel</button>
            </div>
          )}
        </div>
        <TaskList
          setFromPosition={setFromPosition}
          setToPosition={setToPosition}
          setTaskDragged={setTaskDragged}
          setFromList={setFromList}
          name={'Completed Tasks'}
          tasks={completedTasks}
        />
      </div>
    </>
  );
}

export default App;

//dom js inheritance
