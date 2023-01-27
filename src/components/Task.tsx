import React, { useContext } from 'react';
import './task.css';
import moment from 'moment';
import { Task as TaskType } from '../types';
import { globalState } from '../context/GlobalState';
import { comments, subtasks } from '../assets';

type Props = {
  task: TaskType;
};

function Task({ task }: Props) {
  const context = useContext(globalState);

  const availableLabels = context.data.labels;
  const remainingIds = task.labels.splice(5);

  const format = task.due_on?.split('-')[0] === moment().year().toString() ? 'MMM DD' : 'MMM DD, YYYY';

  const start = task.start_on ? moment(task.start_on).format(format) : undefined;
  const due = task.due_on ? moment(task.due_on).format(format) : undefined;
  const dates = `${start ? start + '-' : ''} ${due ? due : ''}`;

  return (
    <div className="task-container">
      {task.is_important && <div className="important-marker"></div>}
      <div className="task-content-container">
        <p>{task.name}</p>
        <div className="task-properties">
          {task.labels.length > 0 && (
            <div className="labels-container">
              {task.labels.map((id) => {
                const label = availableLabels.find((l) => l.id === id);

                return <div key={id} className="label" style={{ backgroundColor: label?.color }}></div>;
              })}
              {remainingIds.length > 0 && <p>{`+${remainingIds.length}`}</p>}
            </div>
          )}
          {task.open_subtasks > 0 && (
            <div className="subtasks">
              <img src={subtasks} />
              <p>{task.open_subtasks}</p>
            </div>
          )}
          {task.comments_count > 0 && (
            <div className="comments">
              <img src={comments} />
              <p>{task.comments_count}</p>
            </div>
          )}
        </div>
        <h3>{dates}</h3>
      </div>
    </div>
  );
}

export default Task;
