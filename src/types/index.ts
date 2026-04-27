// // ─── User ─────────────────────────────────────────────
// export type UserRole = 'admin' | 'member' | 'viewer'

// export interface IUser {
//   _id:       string
//   name:      string
//   email:     string
//   avatar?:   string
//   role:      UserRole
//   isActive:  boolean
//   lastSeen:  string
//   createdAt: string
//   updatedAt: string
// }

// // ─── Project ──────────────────────────────────────────
// export type ProjectStatus =
//   | 'planning'
//   | 'active'
//   | 'on-hold'
//   | 'completed'
//   | 'archived'

// export type Priority =
//   | 'low'
//   | 'medium'
//   | 'high'
//   | 'critical'

// export interface IProject {
//   _id:                 string
//   title:               string
//   description?:        string
//   status:              ProjectStatus
//   priority:            Priority
//   color:               string
//   owner:               IUser
//   members:             IUser[]
//   tags:                string[]
//   dueDate?:            string
//   progress:            number
//   budget?:             number
//   spent:               number
//   budgetUtilization?:  number
//   isOverdue?:          boolean
//   createdAt:           string
//   updatedAt:           string
// }

// // ─── Task ─────────────────────────────────────────────
// export type TaskStatus =
//   | 'todo'
//   | 'in-progress'
//   | 'in-review'
//   | 'done'

// export interface IComment {
//   _id:       string
//   author:    IUser
//   body:      string
//   createdAt: string
// }

// export interface ITask {
//   _id:             string
//   title:           string
//   description?:    string
//   status:          TaskStatus
//   priority:        Priority
//   project:         IProject | string
//   assignee?:       IUser
//   reporter:        IUser
//   tags:            string[]
//   dueDate?:        string
//   estimatedHours?: number
//   loggedHours:     number
//   comments:        IComment[]
//   position:        number
//   isOverdue?:      boolean
//   commentCount?:   number
//   createdAt:       string
//   updatedAt:       string
// }

// // ─── Notification ─────────────────────────────────────
// export type NotificationType =
//   | 'task_assigned'
//   | 'task_updated'
//   | 'task_commented'
//   | 'project_invite'
//   | 'project_updated'
//   | 'member_added'
//   | 'member_removed'
//   | 'deadline_reminder'

// export interface INotification {
//   _id:       string
//   recipient: string
//   sender?:   IUser
//   type:      NotificationType
//   title:     string
//   message:   string
//   read:      boolean
//   link?:     string
//   createdAt: string
// }

// // ─── API Response ─────────────────────────────────────
// export interface ApiResponse<T = unknown> {
//   status:   'success' | 'fail' | 'error'
//   message?: string
//   data?:    T
//   meta?:    PaginationMeta
// }

// export interface PaginationMeta {
//   page:       number
//   limit:      number
//   total:      number
//   totalPages: number
// }

// // ─── Auth ─────────────────────────────────────────────
// export interface AuthResponse {
//   user:  IUser
//   token: string
// }

// // ─── Kanban ───────────────────────────────────────────
// export type KanbanGrouped = Record<TaskStatus, ITask[]>

// // ─── Forms ────────────────────────────────────────────
// export interface LoginForm {
//   email:    string
//   password: string
// }

// export interface RegisterForm {
//   name:     string
//   email:    string
//   password: string
// }

// export interface ProjectForm {
//   title:        string
//   description?: string
//   status?:      ProjectStatus
//   priority?:    Priority
//   color?:       string
//   dueDate?:     string
//   budget?:      number
//   members?:     string[]
//   tags?:        string[]
// }

// export interface TaskForm {
//   title:           string
//   description?:    string
//   status?:         TaskStatus
//   priority?:       Priority
//   project:         string
//   assignee?:       string
//   dueDate?:        string
//   estimatedHours?: number
//   tags?:           string[]
// }

// export interface CommentForm {
//   body: string
// }
// ─── User ─────────────────────────────────────────────
export type UserRole = 'admin' | 'member' | 'viewer'

export interface IUser {
  _id:       string
  name:      string
  email:     string
  avatar?:   string
  role:      UserRole
  isActive:  boolean
  lastSeen:  string
  createdAt: string
  updatedAt: string
}

// ─── Project ──────────────────────────────────────────
export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'on-hold'
  | 'completed'
  | 'archived'

export type Priority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export interface IProject {
  _id:                string
  title:              string
  description?:       string
  status:             ProjectStatus
  priority:           Priority
  color:              string
  owner:              IUser
  members:            IUser[]
  tags:               string[]
  dueDate?:           string
  progress:           number
  budget?:            number
  spent:              number
  budgetUtilization?: number
  isOverdue?:         boolean
  createdAt:          string
  updatedAt:          string
}

// ─── Task ─────────────────────────────────────────────
export type TaskStatus =
  | 'todo'
  | 'in-progress'
  | 'in-review'
  | 'done'

export interface IComment {
  _id:       string
  author:    IUser
  body:      string
  createdAt: string
}

export interface ITask {
  _id:             string
  title:           string
  description?:    string
  status:          TaskStatus
  priority:        Priority
  project:         IProject | string
  assignee?:       IUser
  reporter:        IUser
  tags:            string[]
  dueDate?:        string
  estimatedHours?: number
  loggedHours:     number
  comments:        IComment[]
  position:        number
  isOverdue?:      boolean
  commentCount?:   number
  createdAt:       string
  updatedAt:       string
}

// ─── Notification ─────────────────────────────────────
export type NotificationType =
  | 'task_assigned'
  | 'task_updated'
  | 'task_commented'
  | 'project_invite'
  | 'project_updated'
  | 'member_added'
  | 'member_removed'
  | 'deadline_reminder'
  | 'PROJECT_CREATED'
  | 'PROJECT_DELETED'
  | 'PROJECT_MEMBER_ADDED'
  | 'PROJECT_MEMBER_REMOVED'

export interface INotification {
  _id:       string
  user:      string
  sender?:   IUser
  type:      string
  message:   string
  isRead:    boolean        // ← was: read
  project?:  string
  task?:     string
  createdAt: string
}

// ─── API Response ─────────────────────────────────────
export interface ApiResponse<T = unknown> {
  status:   'success' | 'fail' | 'error'
  message?: string
  data?:    T
  meta?:    PaginationMeta
}

export interface PaginationMeta {
  page:       number
  limit:      number
  total:      number
  totalPages: number
}

// ─── Auth ─────────────────────────────────────────────
export interface AuthResponse {
  user:  IUser
  token: string
}

// ─── Kanban ───────────────────────────────────────────
export type KanbanGrouped = Record<TaskStatus, ITask[]>

// ─── Forms ────────────────────────────────────────────
export interface LoginForm {
  email:    string
  password: string
}

export interface RegisterForm {
  name:     string
  email:    string
  password: string
}

export interface ProjectForm {
  title:        string
  description?: string
  status?:      ProjectStatus
  priority?:    Priority
  color?:       string
  dueDate?:     string
  budget?:      number
  members?:     string[]
  tags?:        string[]
}

export interface TaskForm {
  title:           string
  description?:    string
  status?:         TaskStatus
  priority?:       Priority
  project:         string
  assignee?:       string
  dueDate?:        string
  estimatedHours?: number
  tags?:           string[]
}

export interface CommentForm {
  body: string
}