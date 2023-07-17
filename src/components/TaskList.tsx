import React, { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Task as TaskType } from '../types';
import Task from './Task';
import './taskList.css';

import { globalState } from '../context/GlobalState';

type Props = {
  id?: number;
  name: string;
  tasks: TaskType[];
  setTaskDragged: Dispatch<SetStateAction<number | null>>;
  setToPosition: Dispatch<SetStateAction<number | null>>;
  setFromList: Dispatch<SetStateAction<number | null>>;
  setFromPosition: Dispatch<SetStateAction<number | null>>;
};

const TaskList = ({ id, name, tasks, setTaskDragged, setToPosition, setFromList, setFromPosition }: Props) => {
  const [dropdownShown, setDropdownShown] = useState(false);
  const [addTask, setAddTask] = useState(false);
  const [addTaskInput, setAddTaskInput] = useState('');
  const context = useContext(globalState);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutsideWrapper = (e: MouseEvent) => {
      handleClickOutside(e);
    };

    function handleClickOutside(e: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownShown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutsideWrapper);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideWrapper);
    };
  }, [dropdownRef]);

  tasks.sort((a, b) => a.position - b.position);

  const completeTasks = () => {
    context.dispatch('COMPLETE', { listId: id });
  };
  const moveToTrash = () => {
    context.dispatch('MOVE_TO_TRASH', { listId: id });
  };

  const handleAddTask = () => {
    if (!addTaskInput) {
      return;
    }
    context.dispatch('ADD_TASK', { input: addTaskInput, listId: id });
    setAddTask(false);
  };

  return (
    <div className="task-list-container">
      <div className="task-list-header-container">
        <div className="d-flex">
          <h1>{name}</h1>
          <p>{`(${tasks.length})`}</p>
        </div>

        <div>
          {name !== 'Completed Tasks' && (
            <div ref={dropdownRef} onClick={() => setDropdownShown(!dropdownShown)} className="dots-container">
              {/* <img src={dots} /> */}
              {dropdownShown && (
                <div className="dots-dropdown">
                  <ul>
                    <li onClick={completeTasks}>Complete</li>
                    <li onClick={moveToTrash}>Move to trash</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="task-list">
        {tasks.map((task, index) => {
          return (
            <div
              key={task.id}
              draggable
              onDragStart={(e: React.DragEvent) => {
                setTaskDragged(task.id);
                setFromList(task.task_list_id);
                setFromPosition(task.position);
              }}
              onDragOver={(e: React.DragEvent) => setToPosition(task.position)}
            >
              <Task key={task.id} task={task} />
            </div>
          );
        })}
      </div>
      <div className="add-task">
        {!addTask ? (
          <p onClick={() => setAddTask(!addTask)}>+ Add a Task</p>
        ) : (
          <>
            <textarea value={addTaskInput} onChange={(e) => setAddTaskInput(e.target.value)}></textarea>
            <button onClick={handleAddTask}>Add</button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskList;
