import { codaroApi } from "@/lib/api";
import {
  loadActiveAssignmentSession,
  saveActiveAssignmentSession,
  type ActiveAssignmentSession,
} from "@/lib/classroomSession";
import type {
  AssignmentCreatePayload,
  AssignmentDashboardPayload,
  AssignmentEventPayload,
  AssignmentJoinPayload,
  AssignmentMaterialResponse,
  AssignmentPublishPayload,
  ClassroomStatusPayload,
  CodaroDocument,
} from "@/types";

export async function loadClassroomStatus(): Promise<ClassroomStatusPayload> {
  return codaroApi.classroomStatus();
}

export async function createAssignmentRoomFromDocument(args: {
  document: CodaroDocument;
  category: string;
  contentId: string;
  title?: string;
  description?: string;
}): Promise<AssignmentCreatePayload> {
  const payload = await codaroApi.createAssignment({
    title: args.title?.trim() || args.document.title,
    description: args.description ?? "",
    material: {
      sourceKind: "document",
      title: args.document.title,
      category: args.category,
      contentId: args.contentId,
      document: args.document,
      packages: args.document.runtime?.packages ?? [],
    },
    settings: {
      shareCode: "never",
      syncMode: "local",
    },
  });
  saveActiveAssignmentSession({
    assignmentId: payload.assignment.assignmentId,
    role: "tutor",
    title: payload.assignment.title,
    joinCode: payload.assignment.joinCode,
    tutorToken: payload.tutorToken,
  });
  return payload;
}

export async function publishAssignmentRoom(session: ActiveAssignmentSession): Promise<AssignmentPublishPayload> {
  if (!session.tutorToken) {
    throw new Error("tutor token is required");
  }
  const payload = await codaroApi.publishAssignment(session.assignmentId, session.tutorToken);
  saveActiveAssignmentSession({
    ...session,
    title: payload.assignment.title,
    joinCode: payload.joinCode,
  });
  return payload;
}

export async function joinAssignmentRoom(args: {
  joinCode: string;
  studentTag: string;
  displayName?: string;
}): Promise<AssignmentJoinPayload> {
  const payload = await codaroApi.joinAssignment(args);
  saveActiveAssignmentSession({
    assignmentId: payload.assignment.assignmentId,
    role: "student",
    title: payload.assignment.title,
    joinCode: payload.assignment.joinCode,
    participantId: payload.participant.participantId,
    participantToken: payload.participantToken,
  });
  return payload;
}

export async function loadAssignmentMaterialForSession(session: ActiveAssignmentSession): Promise<AssignmentMaterialResponse> {
  return codaroApi.assignmentMaterial(session.assignmentId, {
    participantId: session.participantId,
    participantToken: session.participantToken,
    tutorToken: session.tutorToken,
  });
}

export async function loadAssignmentDashboard(session: ActiveAssignmentSession): Promise<AssignmentDashboardPayload> {
  if (!session.tutorToken) {
    throw new Error("tutor token is required");
  }
  return codaroApi.assignmentDashboard(session.assignmentId, session.tutorToken);
}

export async function recordAssignmentEvent(payload: {
  assignmentId: string;
  participantId: string;
  participantToken: string;
  eventType: string;
  eventId?: string;
  sectionId?: string;
  category?: string;
  contentId?: string;
  payload?: Record<string, unknown>;
}): Promise<{ event: AssignmentEventPayload; accepted: boolean }> {
  return codaroApi.recordAssignmentEvent(payload);
}

export function currentAssignmentSession(): ActiveAssignmentSession | null {
  return loadActiveAssignmentSession();
}
