import { useContext, useEffect, useState } from "react";
import "./App.css";
import { globalState } from "./context/GlobalState";

import TaskList from "./components/TaskList";

import { Task, TaskList as TaskListType } from "./types";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [newTaskListInput, setNewTaskListInput] = useState("");
  const [taskDragged, setTaskDragged] = useState<number | null>(null);
  const [dragginOverTask, setDraggingOverTask] = useState<number | null>(null);
  const [draggingOverList, setDraggingOverList] = useState<number | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<number | null>(null);
  const context = useContext(globalState);

  const taskLists = context.data.task_lists.filter(
    (tl) => tl.is_trashed === false && tl.is_completed === false
  );

  useEffect(() => {
    console.log(taskDragged, "taskDragged");
  }, [taskDragged]);

  const tasks: Task[] = context.data.tasks;
  const completedTasks: Task[] = context.data.tasks.filter(
    (t: Task) => t.is_completed === true
  );

  const newTaskListHandler = () => {
    context.dispatch("CREATE_TASK_LIST", { name: newTaskListInput });
    setIsOpen(false);
  };

  const handleDragEnd = (listId: number, dragEndPosition: number | null) => {
    console.log(
      `dragging ${taskDragged} into list ${draggingOverList}, position: ${dragEndPosition}`
    );

    context.dispatch("ON_DRAG", {
      listId: draggingOverList,
      taskId: taskDragged,
      dragEndPosition,
    });
  };

  return (
    <>
      <div className="App">
        {taskLists.map((item: TaskListType, index: number) => {
          return (
            <div
              key={item.id}
              onDragOver={(e: any) => setDraggingOverList(item.id)}
              onDragEnd={(e: any) => handleDragEnd(item.id, dragginOverTask)}
            >
              <TaskList
                key={item.id}
                id={item.id}
                name={item.name}
                tasks={tasks.filter(
                  (task) =>
                    task.task_list_id === item.id && task.is_completed === false
                )}
                setTaskDragged={setTaskDragged}
                setDraggingOverTask={setDraggingOverTask}
                setDraggingFrom={setDraggingFrom}
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
        <TaskList
          setDraggingOverTask={setDraggingOverTask}
          setTaskDragged={setTaskDragged}
          setDraggingFrom={setDraggingFrom}
          name={"Completed Tasks"}
          tasks={completedTasks}
        />
      </div>
      <div className="hr"></div>
    </>
  );
}

export default App;
