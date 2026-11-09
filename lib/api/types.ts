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
};
