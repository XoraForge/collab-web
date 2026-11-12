// Shapes returned by collab-api (see collab-api/.../dto).

export type ProjectVisibility = "PUBLIC" | "PRIVATE" | "ORGANIZATION";
export type ProjectRole = "PROJECT_MANAGER" | "TEAM_MEMBER";
export type Plan = "FREE" | "PREMIUM";

export type UserSummary = {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
};

export type CurrentUser = {
  user: UserSummary;
  plan: Plan;
  ownedProjects: number;
  /** null = unlimited (Premium) */
  projectLimit: number | null;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  visibility: ProjectVisibility;
  /** ISO date, e.g. "2026-12-19" */
  dueDate: string | null;
  startDate: string | null;
  /** ISO timestamp */
  createdAt: string | null;
  lastUpdatedAt: string | null;
  imageUrl: string | null;
  owner: UserSummary;
  /** null when the user can view the project but isn't a member */
  role: ProjectRole | null;
  memberCount: number;
};

export type CreateProjectRequest = {
  name: string;
  description?: string;
  visibility: ProjectVisibility;
  /** ISO date; defaults to today */
  startDate?: string;
  /** ISO date, e.g. "2026-12-19" */
  dueDate?: string;
  imageUrl?: string;
};

export type ApiErrorBody = { code?: string; message?: string };

// ---------- Documents & sections ----------

export type DocumentType = "WORD" | "EXCEL" | "POWERPOINT" | "UML" | "GRAPH";

/** DONE = approved by the team leader and locked. */
export type SectionStatus = "NOT_STARTED" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

/** TABLE_OF_CONTENTS is generated from the headings of the sections after it. */
export type SectionKind = "CONTENT" | "TABLE_OF_CONTENTS";

export type DocumentSummary = {
  id: string;
  title: string;
  type: DocumentType;
  sectionCount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type Section = {
  id: string;
  title: string;
  position: number;
  kind: SectionKind;
  /** Starts on a new page in the preview and the .docx export. */
  pageBreakBefore: boolean;
  status: SectionStatus;
  dueDate: string | null;
  wordTargetMin: number | null;
  wordTargetMax: number | null;
  requirements: string | null;
  assignees: UserSummary[];
  /** Can open the live draft and publish (assignee or team leader, not approved). */
  canEdit: boolean;
  /** Latest published version number, 0 = never published. */
  publishedVersion: number;
  publishedAt: string | null;
  /** Only sent to editors. */
  draftWordCount: number | null;
  draftUpdatedAt: string | null;
};

export type DocumentDetail = {
  id: string;
  title: string;
  type: DocumentType;
  projectId: string;
  projectName: string;
  /** Team leader: can add, rename, reorder, assign and approve sections. */
  canManage: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  sections: Section[];
};

export type UpdateSectionRequest = {
  title: string;
  dueDate: string | null;
  wordTargetMin: number | null;
  wordTargetMax: number | null;
  requirements: string | null;
  assigneeIds: string[];
  kind?: SectionKind;
  pageBreakBefore?: boolean;
};

export type VersionSummary = {
  id: string;
  number: number;
  message: string | null;
  author: UserSummary | null;
  createdAt: string;
  wordCount: number;
};

export type VersionDetail = VersionSummary & { contentJson: string };

export type PublishedSection = {
  sectionId: string;
  title: string;
  position: number;
  kind: SectionKind;
  pageBreakBefore: boolean;
  publishedVersion: number;
  contentJson: string | null;
};

export type Member = {
  user: UserSummary;
  role: ProjectRole;
  joinedDate: string;
};

// ---------- Invites ----------

export type Invite = {
  id: string;
  /** null for the shareable invite link */
  email: string | null;
  /** Web route to share, e.g. /invite/abc123 */
  path: string;
  createdAt: string;
  expiresAt: string;
};

/** Adding by email: existing users become members; others get a pending invite. */
export type AddMemberResult = { member: Member | null; invite: Invite | null };

export type InvitePreview = {
  projectId: string;
  projectName: string;
  invitedBy: string | null;
  email: string | null;
  state: "VALID" | "EXPIRED" | "REVOKED" | "USED";
  /** The signed-in viewer is already in the project (e.g. joined automatically on sign-up). */
  alreadyMember: boolean;
};

// ---------- Tasks & timeline ----------

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

/** A task, or a document section shown as a task. */
export type WorkItem = {
  id: string;
  kind: "TASK" | "SECTION";
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignees: UserSummary[];
  /** ISO dates */
  startDate: string | null;
  dueDate: string | null;
  milestone: boolean;
  position: number;
  /** Ids this item waits for (finish-to-start). */
  dependsOn: string[];
  /** Sections only */
  documentId: string | null;
  documentTitle: string | null;
  canEdit: boolean;
  canSchedule: boolean;
  canChangeStatus: boolean;
  canDelete: boolean;
  createdAt: string | null;
  completedAt: string | null;
};

export type CreateTaskRequest = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeIds?: string[];
  startDate?: string | null;
  dueDate?: string | null;
  milestone?: boolean;
  dependsOn?: string[];
};

export type UpdateTaskRequest = {
  title: string;
  description: string | null;
  priority: TaskPriority;
  assigneeIds: string[];
  milestone: boolean;
};

export type UpdateProjectRequest = {
  name?: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  /** An uploaded image URL; "" removes the image. */
  imageUrl?: string;
};

// ---------- Activity & notifications ----------

export type ActivityType =
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "MEMBER_JOINED"
  | "DOCUMENT_CREATED"
  | "DOCUMENT_DELETED"
  | "SECTION_ASSIGNED"
  | "SECTION_PUBLISHED"
  | "SECTION_SUBMITTED"
  | "SECTION_APPROVED"
  | "SECTION_REOPENED"
  | "TASK_CREATED"
  | "TASK_STATUS_CHANGED"
  | "TASK_DELETED"
  | "NOTE_CREATED";

export type Activity = {
  id: string;
  projectId: string;
  projectName: string | null;
  actor: UserSummary | null;
  type: ActivityType;
  documentId: string | null;
  sectionId: string | null;
  taskId: string | null;
  noteId: string | null;
  /** The task/section/document/note title when it happened. */
  targetTitle: string | null;
  /** e.g. "v3 · message", a task status, or the names of new assignees. */
  detail: string | null;
  createdAt: string;
};

export type NotificationType =
  | "SECTION_ASSIGNED"
  | "TASK_ASSIGNED"
  | "SECTION_SUBMITTED"
  | "SECTION_APPROVED"
  | "SECTION_REOPENED"
  | "MEMBER_JOINED"
  | "DUE_SOON";

export type AppNotification = {
  id: string;
  projectId: string | null;
  projectName: string | null;
  actor: UserSummary | null;
  type: NotificationType;
  targetTitle: string | null;
  detail: string | null;
  /** Path in this app to open. */
  link: string | null;
  read: boolean;
  createdAt: string;
};

export type NotificationList = { items: AppNotification[]; unreadCount: number };

// ---------- Chat ----------

export type ReplyPreview = { id: string; authorName: string | null; body: string | null; deleted: boolean };

export type ChatMessage = {
  id: string;
  channelId: string;
  author: UserSummary;
  /** Markdown; null when deleted. */
  body: string | null;
  replyTo: ReplyPreview | null;
  createdAt: string;
  editedAt: string | null;
  deleted: boolean;
};

export type ChatChannel = {
  id: string;
  projectId: string;
  projectName: string;
  projectImageUrl: string | null;
  name: string;
  lastMessage: ChatMessage | null;
  unreadCount: number;
};

// ---------- Notes ----------

export type Note = {
  id: string;
  projectId: string;
  projectName: string | null;
  title: string;
  preview: string | null;
  wordCount: number;
  createdBy: UserSummary | null;
  updatedBy: UserSummary | null;
  createdAt: string;
  updatedAt: string | null;
  /** The creator or the team leader. */
  canDelete: boolean;
};

export type NoteDetail = { note: Note; contentJson: string | null };

// ---------- Files ----------

export type UploadedFile = { id: string; url: string; filename: string; contentType: string; size: number };

// ---------- Calls ----------

export type CallToken = { url: string; token: string; room: string };

export type CallParticipant = { user: UserSummary; joinedAt: string | null };

/** Who is in a project's call (empty = no call). */
export type CallInfo = { projectId: string; participants: CallParticipant[] };

export type ActiveCall = { projectId: string; participantCount: number };
