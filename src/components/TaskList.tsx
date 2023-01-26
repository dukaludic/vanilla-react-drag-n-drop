import { createRef, useContext, useEffect, useRef, useState } from "react";
import { dots } from "../assets";
import { Task as TaskType } from "../types";
import Task from "./Task";
import "./taskList.css";

import { globalState } from "../context/GlobalState";

type Props = {
  id?: number;
  name: string;
  listIndex?: number;
  tasks: TaskType[];
};

const TaskList = ({ id, name, listIndex, tasks }: Props) => {
  const [dropdownShown, setDropdownShown] = useState(false);
  const [addTask, setAddTask] = useState(false);
  const [addTaskInput, setAddTaskInput] = useState("");
  const context = useContext(globalState);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownShown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  tasks.sort((a, b) => a.position - b.position);

  const completeTasks = () => {
    console.log("COMPLETE");
    console.log(context, "Context");
    context.dispatch({ type: "COMPLETE", payload: { listId: id } });
  };
  const moveToTrash = () => {
    console.log(id, "id");
    context.dispatch({ type: "MOVE_TO_TRASH", payload: { listId: id } });
  };

  const handleAddTask = () => {
    if (!addTaskInput) {
      return;
    }
    context.dispatch({
      type: "ADD_TASK",
      payload: { input: addTaskInput, listId: id },
    });
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
          {name !== "Completed Tasks" && (
            <div
              ref={dropdownRef}
              onClick={() => setDropdownShown(!dropdownShown)}
              className="dots-container"
            >
              <img src={dots} />
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
        {tasks.map((task) => {
          return <Task key={task.id} task={task} />;
        })}
      </div>
      <div className="add-task">
        {!addTask ? (
          <p onClick={() => setAddTask(!addTask)}>+ Add a Task</p>
        ) : (
          <>
            <textarea
              value={addTaskInput}
              onChange={(e) => setAddTaskInput(e.target.value)}
            ></textarea>
            <button onClick={handleAddTask}>Add</button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskList;
