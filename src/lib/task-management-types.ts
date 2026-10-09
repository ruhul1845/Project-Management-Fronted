export type OrgRole = "OWNER" | "MANAGER" | "MEMBER" | "GUEST";
export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE"
  | "CANCELLED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "ARCHIVED";
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: "ADMIN" | OrgRole;
  emailVerified?: boolean;
  status?: "ACTIVE" | "BLOCKED";
  createdAt?: string;
}
export interface Organization {
  id: string;
  name: string;
  description?: string | null;
  slug: string;
  subscriptionStatus?: string;
  memberships?: { role: OrgRole }[];
  _count?: { memberships: number; projects: number; teams?: number };
  owner?: User;
}
export interface Team {
  id: string;
  name: string;
  description?: string | null;
  _count?: { members: number; projects: number };
  members?: { id: string; role: string; user?: User }[];
  projects?: Project[];
}
export interface Project {
  id: string;
  organizationId: string;
  name: string;
  key: string;
  description?: string | null;
  status: ProjectStatus;
  startDate?: string | null;
  dueDate?: string | null;
  teamId?: string | null;
  team?: { id: string; name: string };
  _count?: { tasks: number; sprints: number };
}
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  assigneeId?: string | null;
  assignee?: Pick<User, "id" | "name" | "avatarUrl"> | null;
  reporter?: Pick<User, "id" | "name">;
  project?: Pick<Project, "id" | "name" | "key" | "organizationId">;
  subtasks?: Task[];
  comments?: Comment[];
  attachments?: Attachment[];
  labels?: { label: Label }[];
  activity?: AuditLog[];
  _count?: { comments: number; subtasks: number; attachments: number };
}
export interface Label {
  id: string;
  name: string;
  color: string;
}
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Pick<User, "id" | "name" | "avatarUrl">;
  mentions?: { user: Pick<User, "id" | "name"> }[];
}
export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
}
export interface Member {
  id: string;
  role: OrgRole;
  user: User;
  joinedAt: string;
}
export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED";
  startDate: string;
  endDate: string;
  _count?: { tasks: number };
}
export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  readAt?: string | null;
}
export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  createdAt: string;
  actor?: Pick<User, "id" | "name" | "email">;
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}
export interface Analytics {
  members: number;
  projects: number;
  tasks: number;
  tasksByStatus: Partial<Record<TaskStatus, number>>;
  paidRevenue: number;
}
export interface CalendarData {
  tasks: Task[];
  sprints: Sprint[];
  projects: Project[];
  range: { from: string; to: string };
}
export interface KanbanData {
  columns: Record<TaskStatus, Task[]>;
}
