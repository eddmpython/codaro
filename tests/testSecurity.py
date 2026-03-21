from __future__ import annotations

import time
from pathlib import Path

import pytest

from codaro.system.fileOps import WorkspacePathError, resolvePath
from codaro.system.packageOps import PackageEnvironmentError, validatePackageName
from codaro.kernel.manager import SessionManager
from codaro.ai.conversation import ConversationManager, MAX_CONVERSATIONS


class TestPathTraversal:

    def testResolveInsideWorkspace(self, tmp_path: Path) -> None:
        (tmp_path / "doc.py").write_text("# ok")
        result = resolvePath("doc.py", tmp_path)
        assert result == (tmp_path / "doc.py").resolve()

    def testResolveOutsideWorkspaceRaises(self, tmp_path: Path) -> None:
        with pytest.raises(WorkspacePathError):
            resolvePath("../../etc/passwd", tmp_path)

    def testResolveAbsoluteOutsideRaises(self, tmp_path: Path) -> None:
        with pytest.raises(WorkspacePathError):
            resolvePath("/etc/passwd", tmp_path)

    def testResolveSymlinkEscape(self, tmp_path: Path) -> None:
        outside = tmp_path.parent / "outside"
        outside.mkdir(exist_ok=True)
        (outside / "secret.txt").write_text("secret")
        link = tmp_path / "escape"
        try:
            link.symlink_to(outside)
        except OSError:
            pytest.skip("symlinks not supported")
        with pytest.raises(WorkspacePathError):
            resolvePath("escape/secret.txt", tmp_path)


class TestPackageNameValidation:

    def testValidNames(self) -> None:
        for name in ["numpy", "scikit-learn", "Pillow", "my_pkg", "torch>=2.0", "pandas[sql]"]:
            validatePackageName(name)

    def testEmptyNameRaises(self) -> None:
        with pytest.raises(PackageEnvironmentError):
            validatePackageName("")

    def testTraversalInNameRaises(self) -> None:
        with pytest.raises(PackageEnvironmentError):
            validatePackageName("../../evil")

    def testSlashInNameRaises(self) -> None:
        with pytest.raises(PackageEnvironmentError):
            validatePackageName("package/evil")

    def testBackslashInNameRaises(self) -> None:
        with pytest.raises(PackageEnvironmentError):
            validatePackageName("package\\evil")

    def testSpecialCharsRaise(self) -> None:
        with pytest.raises(PackageEnvironmentError):
            validatePackageName("pkg; rm -rf /")


class TestSessionExpiry:

    def testReapExpiredSessions(self) -> None:
        manager = SessionManager()
        session = manager.createSession()
        sid = session.sessionId
        assert manager.getSession(sid) is not None

        manager._lastActivity[sid] = time.monotonic() - 7200
        reaped = manager.reapExpired(maxIdleSeconds=3600)

        assert reaped == 1
        assert manager.getSession(sid) is None

    def testActiveSessionNotReaped(self) -> None:
        manager = SessionManager()
        session = manager.createSession()
        sid = session.sessionId

        reaped = manager.reapExpired(maxIdleSeconds=3600)
        assert reaped == 0
        assert manager.getSession(sid) is not None

    def testTouchResetsTimer(self) -> None:
        manager = SessionManager()
        session = manager.createSession()
        sid = session.sessionId

        manager._lastActivity[sid] = time.monotonic() - 7200
        manager.touchSession(sid)
        reaped = manager.reapExpired(maxIdleSeconds=3600)

        assert reaped == 0
        assert manager.getSession(sid) is not None

    def testDestroySessionCleansActivity(self) -> None:
        manager = SessionManager()
        session = manager.createSession()
        sid = session.sessionId

        manager.destroySession(sid)
        assert sid not in manager._lastActivity

    def testSessionLimitEvictsOldest(self) -> None:
        manager = SessionManager()
        sessions = []
        for _ in range(10):
            sessions.append(manager.createSession())
        assert manager.sessionCount == 10

        newest = manager.createSession()
        assert manager.sessionCount == 10
        assert manager.getSession(newest.sessionId) is not None


class TestConversationExpiry:

    def testReapExpiredConversations(self) -> None:
        manager = ConversationManager()
        conv = manager.create()
        cid = conv.conversationId
        assert manager.get(cid) is not None

        manager._lastAccessed[cid] = time.monotonic() - 7200
        reaped = manager.reapExpired(maxIdleSeconds=3600)

        assert reaped == 1
        assert manager.get(cid) is None

    def testActiveConversationNotReaped(self) -> None:
        manager = ConversationManager()
        conv = manager.create()
        cid = conv.conversationId

        reaped = manager.reapExpired(maxIdleSeconds=3600)
        assert reaped == 0
        assert manager.get(cid) is not None

    def testLruEviction(self) -> None:
        manager = ConversationManager()
        firstConv = manager.create()
        for _ in range(MAX_CONVERSATIONS - 1):
            manager.create()
        assert manager.conversationCount == MAX_CONVERSATIONS

        manager.create()
        assert manager.conversationCount == MAX_CONVERSATIONS
        assert manager.get(firstConv.conversationId) is None

    def testGetUpdatesLastAccessed(self) -> None:
        manager = ConversationManager()
        conv = manager.create()
        cid = conv.conversationId

        manager._lastAccessed[cid] = time.monotonic() - 7200
        manager.get(cid)
        reaped = manager.reapExpired(maxIdleSeconds=3600)

        assert reaped == 0

    def testDeleteCleansLastAccessed(self) -> None:
        manager = ConversationManager()
        conv = manager.create()
        cid = conv.conversationId

        manager.delete(cid)
        assert cid not in manager._lastAccessed
