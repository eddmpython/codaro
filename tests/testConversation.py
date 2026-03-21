from __future__ import annotations

import pytest

from codaro.ai.conversation import (
    ConversationManager,
    ConversationState,
    Message,
    buildSystemPrompt,
)
from codaro.ai.tools import toolSchemas


class TestConversationManager:
    def test_create(self):
        manager = ConversationManager()
        conv = manager.create(role="teacher")
        assert conv.role == "teacher"
        assert conv.turnCount == 0
        assert len(conv.messages) == 0

    def test_create_default_role(self):
        manager = ConversationManager()
        conv = manager.create()
        assert conv.role == "copilot"

    def test_get(self):
        manager = ConversationManager()
        conv = manager.create()
        retrieved = manager.get(conv.conversationId)
        assert retrieved is conv

    def test_get_nonexistent(self):
        manager = ConversationManager()
        assert manager.get("nonexistent") is None

    def test_add_user_message(self):
        manager = ConversationManager()
        conv = manager.create()
        result = manager.addUserMessage(conv.conversationId, "Hello")
        assert result is not None
        assert len(conv.messages) == 1
        assert conv.messages[0].role == "user"
        assert conv.messages[0].content == "Hello"
        assert conv.turnCount == 1

    def test_add_assistant_message(self):
        manager = ConversationManager()
        conv = manager.create()
        manager.addAssistantMessage(conv.conversationId, "Hi there!")
        assert len(conv.messages) == 1
        assert conv.messages[0].role == "assistant"

    def test_add_tool_result(self):
        manager = ConversationManager()
        conv = manager.create()
        manager.addToolResult(conv.conversationId, "call_123", '{"result": "ok"}')
        assert len(conv.messages) == 1
        assert conv.messages[0].role == "tool"
        assert conv.messages[0].toolCallId == "call_123"

    def test_delete(self):
        manager = ConversationManager()
        conv = manager.create()
        assert manager.delete(conv.conversationId) is True
        assert manager.get(conv.conversationId) is None

    def test_delete_nonexistent(self):
        manager = ConversationManager()
        assert manager.delete("nonexistent") is False

    def test_list_conversations(self):
        manager = ConversationManager()
        manager.create(role="teacher")
        manager.create(role="copilot")
        items = manager.listConversations()
        assert len(items) == 2
        roles = {item["role"] for item in items}
        assert roles == {"teacher", "copilot"}

    def test_build_messages(self):
        manager = ConversationManager()
        conv = manager.create(role="copilot")
        manager.addUserMessage(conv.conversationId, "Help me write code")
        manager.addAssistantMessage(conv.conversationId, "Sure!")

        messages = manager.buildMessages(conv.conversationId)
        assert len(messages) == 3
        assert messages[0]["role"] == "system"
        assert messages[1]["role"] == "user"
        assert messages[2]["role"] == "assistant"

    def test_build_messages_nonexistent(self):
        manager = ConversationManager()
        assert manager.buildMessages("nonexistent") == []

    def test_conversation_state_unique_ids(self):
        manager = ConversationManager()
        c1 = manager.create()
        c2 = manager.create()
        assert c1.conversationId != c2.conversationId


class TestBuildSystemPrompt:
    def test_copilot_prompt(self):
        prompt = buildSystemPrompt(role="copilot")
        assert "coding assistant" in prompt.lower()

    def test_teacher_prompt(self):
        prompt = buildSystemPrompt(role="teacher")
        assert "teacher" in prompt.lower()
        assert "fillBlank" in prompt or "hint" in prompt.lower()

    def test_automation_prompt(self):
        prompt = buildSystemPrompt(role="automation")
        assert "automation" in prompt.lower()

    def test_custom_prompt(self):
        prompt = buildSystemPrompt(role="copilot", customPrompt="Always use type hints")
        assert "type hints" in prompt

    def test_curriculum_context(self):
        prompt = buildSystemPrompt(role="teacher", curriculumContext="Lesson 3: Lists and Loops")
        assert "Lists and Loops" in prompt

    def test_document_context(self):
        prompt = buildSystemPrompt(role="copilot", documentContext="3 code blocks, 1 markdown")
        assert "3 code blocks" in prompt

    def test_learning_philosophy_injected(self):
        prompt = buildSystemPrompt(role="teacher", learningPhilosophy="Test philosophy")
        assert "Test philosophy" in prompt

    def test_tools_mentioned(self):
        prompt = buildSystemPrompt(role="copilot")
        assert "insert-block" in prompt
        assert "execute-reactive" in prompt

    def test_unknown_role_falls_back(self):
        prompt = buildSystemPrompt(role="unknown_role")
        assert "coding assistant" in prompt.lower()


class TestToolSchemas:
    def test_get_tool_schemas(self):
        manager = ConversationManager()
        schemas = manager.getToolSchemas()
        assert isinstance(schemas, list)
        assert len(schemas) >= 10
