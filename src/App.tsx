import { useContext, useState } from "react";
import "./App.css";
import { globalState } from "./context/GlobalState";

import TaskList from "./components/TaskList";

import { Task, TaskList as TaskListType } from "./types";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [newTaskListInput, setNewTaskListInput] = useState("");
  const context = useContext(globalState);

  const taskLists = context.data.task_lists.filter(
    (tl) => tl.is_trashed === false && tl.is_completed === false
  );

  const tasks: Task[] = context.data.tasks;
  const completedTasks: Task[] = context.data.tasks.filter(
    (t: Task) => t.is_completed === true
  );

  const newTaskListHandler = () => {
    context.dispatch({
      type: "CREATE_TASK_LIST",
      payload: { name: newTaskListInput },
    });
    setIsOpen(false);
  };

  return (
    <>
      <div className="App">
        {taskLists.map((item: TaskListType, index: number) => {
          return (
            <TaskList
              key={item.id}
              id={item.id}
              name={item.name}
              listIndex={index}
              tasks={tasks.filter(
                (task) =>
                  task.task_list_id === item.id && task.is_completed === false
              )}
            />
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
              <input
                value={newTaskListInput}
                onChange={(e) => setNewTaskListInput(e.target.value)}
                type="text"
              />
              <button onClick={newTaskListHandler}>Add</button>
              <button onClick={() => setIsOpen(false)}>Cancel</button>
            </div>
          )}
        </div>
        <TaskList name={"Completed Tasks"} tasks={completedTasks} />
      </div>
      <div className="hr"></div>
    </>
  );
}

export default App;
