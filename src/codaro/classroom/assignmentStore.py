from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Iterable

from pydantic import ValidationError

from .assignmentModel import (
    AssignmentEvent,
    AssignmentMaterial,
    AssignmentParticipant,
    AssignmentRoom,
    AssignmentSettings,
    newJoinCode,
    utcNow,
)


class AssignmentStore:
    def __init__(self, storageRoot: str | Path | None = None) -> None:
        if storageRoot is None:
            configured = os.environ.get("CODARO_CLASSROOM_STORE")
            if configured:
                storageRoot = Path(configured).expanduser()
            else:
                base = Path(os.environ.get("CODARO_HOME", Path.home() / ".codaro")).expanduser()
                storageRoot = base / "classroom"
        self.storageRoot = Path(storageRoot).resolve()
        self.assignmentRoot = self.storageRoot / "assignments"
        self.eventRoot = self.storageRoot / "events"

    def listAssignments(self) -> list[AssignmentRoom]:
        if not self.assignmentRoot.exists():
            return []
        assignments: list[AssignmentRoom] = []
        for path in sorted(self.assignmentRoot.glob("*.json")):
            try:
                assignments.append(AssignmentRoom(**json.loads(path.read_text(encoding="utf-8"))))
            except (OSError, json.JSONDecodeError, ValidationError):
                continue
        return assignments

    def getAssignment(self, assignmentId: str) -> AssignmentRoom | None:
        path = self._assignmentPath(assignmentId)
        if not path.exists():
            return None
        try:
            return AssignmentRoom(**json.loads(path.read_text(encoding="utf-8")))
        except (OSError, json.JSONDecodeError, ValidationError):
            return None

    def saveAssignment(self, assignment: AssignmentRoom) -> AssignmentRoom:
        assignment.updatedAt = utcNow()
        self.assignmentRoot.mkdir(parents=True, exist_ok=True)
        self._assignmentPath(assignment.assignmentId).write_text(
            assignment.model_dump_json(indent=2),
            encoding="utf-8",
        )
        return assignment

    def createAssignment(
        self,
        *,
        title: str,
        description: str,
        material: AssignmentMaterial,
        dueAt: str | None = None,
        settings: AssignmentSettings | None = None,
    ) -> AssignmentRoom:
        assignment = AssignmentRoom(
            title=title,
            description=description,
            material=material,
            settings=settings or AssignmentSettings(),
            dueAt=dueAt,
        )
        return self.saveAssignment(assignment)

    def publishAssignment(self, assignmentId: str) -> AssignmentRoom | None:
        assignment = self.getAssignment(assignmentId)
        if assignment is None:
            return None
        assignment.status = "published"
        if not assignment.joinCode:
            assignment.joinCode = self._uniqueJoinCode()
        return self.saveAssignment(assignment)

    def archiveAssignment(self, assignmentId: str) -> AssignmentRoom | None:
        assignment = self.getAssignment(assignmentId)
        if assignment is None:
            return None
        assignment.status = "archived"
        return self.saveAssignment(assignment)

    def findByJoinCode(self, joinCode: str) -> AssignmentRoom | None:
        normalized = joinCode.strip().upper()
        if not normalized:
            return None
        for assignment in self.listAssignments():
            if assignment.joinCode.upper() == normalized and assignment.status == "published":
                return assignment
        return None

    def joinAssignment(
        self,
        *,
        joinCode: str,
        studentTag: str,
        displayName: str = "",
    ) -> tuple[AssignmentRoom, AssignmentParticipant] | None:
        assignment = self.findByJoinCode(joinCode)
        if assignment is None:
            return None
        participant = AssignmentParticipant(
            studentTag=studentTag,
            displayName=displayName,
        )
        assignment.participants[participant.participantId] = participant
        self.saveAssignment(assignment)
        return assignment, participant

    def touchParticipant(self, assignmentId: str, participantId: str) -> AssignmentParticipant | None:
        assignment = self.getAssignment(assignmentId)
        if assignment is None:
            return None
        participant = assignment.participants.get(participantId)
        if participant is None:
            return None
        participant.lastSeenAt = utcNow()
        self.saveAssignment(assignment)
        return participant

    def appendEvent(self, event: AssignmentEvent) -> tuple[AssignmentEvent, bool]:
        existing = self.eventById(event.assignmentId, event.eventId)
        if existing is not None:
            return existing, False
        events = self.listEvents(event.assignmentId)
        nextSequence = events[-1].sequence + 1 if events else 1
        event.sequence = nextSequence
        self.eventRoot.mkdir(parents=True, exist_ok=True)
        with self._eventPath(event.assignmentId).open("a", encoding="utf-8") as file:
            file.write(event.model_dump_json() + "\n")
        self.touchParticipant(event.assignmentId, event.participantId)
        return event, True

    def eventById(self, assignmentId: str, eventId: str) -> AssignmentEvent | None:
        for event in self.listEvents(assignmentId):
            if event.eventId == eventId:
                return event
        return None

    def listEvents(self, assignmentId: str, *, afterSequence: int = 0) -> list[AssignmentEvent]:
        path = self._eventPath(assignmentId)
        if not path.exists():
            return []
        events: list[AssignmentEvent] = []
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                event = AssignmentEvent(**json.loads(line))
            except (json.JSONDecodeError, ValidationError):
                continue
            if event.sequence > afterSequence:
                events.append(event)
        return events

    def _uniqueJoinCode(self) -> str:
        existing = {assignment.joinCode for assignment in self.listAssignments() if assignment.joinCode}
        for _ in range(100):
            candidate = newJoinCode()
            if candidate not in existing:
                return candidate
        raise RuntimeError("could not allocate unique join code")

    def _assignmentPath(self, assignmentId: str) -> Path:
        return self.assignmentRoot / f"{assignmentId}.json"

    def _eventPath(self, assignmentId: str) -> Path:
        return self.eventRoot / f"{assignmentId}.jsonl"


def eventsByParticipant(events: Iterable[AssignmentEvent]) -> dict[str, list[AssignmentEvent]]:
    grouped: dict[str, list[AssignmentEvent]] = {}
    for event in events:
        grouped.setdefault(event.participantId, []).append(event)
    return grouped
