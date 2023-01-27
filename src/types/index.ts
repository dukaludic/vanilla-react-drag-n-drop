export interface Data {
  task_lists: TaskList[];
  tasks: Task[];
  labels: Label[];
  users: User[];
}

export interface Task {
  id: number;
  name: string;
  is_completed: boolean;
  task_list_id: number;
  position: number;
  start_on: string | null;
  due_on: string | null;
  labels: number[];
  open_subtasks: number;
  comments_count: number;
  assignee: number[];
  is_important: boolean;
}

export interface Label {
  id: number;
  color: string;
}

export interface TaskList {
  id: number;
  name: string;
  open_tasks: number;
  completed_tasks: number;
  position: number;
  is_completed: boolean;
  is_trashed: boolean;
}

export interface User {
  id: number;
  name: string;
  avatar_url: string;
}

export type DragPayload = {
  taskId: number;
  fromList: number;
  fromPosition: number;
  toList: number;
  toPosition: number;
};

export type Payload = Record<string, any>;
