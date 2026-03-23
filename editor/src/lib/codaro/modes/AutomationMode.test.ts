import { cleanup, fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AutomationMode from "./AutomationMode.svelte";

const automationMocks = vi.hoisted(() => {
  const state = {
    selectedTaskId: null as string | null,
    tasks: [{ id: "task-1", name: "Daily report" }],
    error: null as string | null,
    activeTab: "activity" as "activity" | "safety" | "plan" | "integrations",
  };

  return {
    state,
    initAutomationStore: vi.fn(async () => {}),
    clearAutomationError: vi.fn(),
    setAgentPanelTab: vi.fn((tab: typeof state.activeTab) => {
      state.activeTab = tab;
    }),
    createWorkflow: vi.fn(async () => ({ ok: true })),
  };
});

vi.mock("../stores/automationStore.svelte", () => ({
  getSelectedTaskId: () => automationMocks.state.selectedTaskId,
  getTasks: () => automationMocks.state.tasks,
  initAutomationStore: automationMocks.initAutomationStore,
  getAutomationError: () => automationMocks.state.error,
  clearAutomationError: automationMocks.clearAutomationError,
  getAgentPanelTab: () => automationMocks.state.activeTab,
  setAgentPanelTab: automationMocks.setAgentPanelTab,
}));

vi.mock("../automationApi", () => ({
  createWorkflow: automationMocks.createWorkflow,
}));

vi.mock("../automation/EStopButton.svelte", async () => ({
  default: (await import("../testing/StaticPanelStub.svelte")).default,
}));
vi.mock("../automation/TaskListPanel.svelte", async () => ({
  default: (await import("../testing/TaskListPanelStub.svelte")).default,
}));
vi.mock("../automation/TaskDetailView.svelte", async () => ({
  default: (await import("../testing/TaskDetailViewStub.svelte")).default,
}));
vi.mock("../automation/TaskCreateDialog.svelte", async () => ({
  default: (await import("../testing/TaskCreateDialogStub.svelte")).default,
}));
vi.mock("../automation/RecordingControls.svelte", async () => ({
  default: (await import("../testing/RecordingControlsStub.svelte")).default,
}));
vi.mock("../automation/SchedulerStatus.svelte", async () => ({
  default: (await import("../testing/StaticPanelStub.svelte")).default,
}));
vi.mock("../automation/WorkflowList.svelte", async () => ({
  default: (await import("../testing/WorkflowListStub.svelte")).default,
}));
vi.mock("../automation/WorkflowBuilder.svelte", async () => ({
  default: (await import("../testing/WorkflowBuilderStub.svelte")).default,
}));
vi.mock("../automation/ChannelConfig.svelte", async () => ({
  default: (await import("../testing/StaticPanelStub.svelte")).default,
}));
vi.mock("../automation/AgentActivityPanel.svelte", async () => ({
  default: (await import("../testing/AgentActivityPanelStub.svelte")).default,
}));
vi.mock("../automation/SafetyDashboard.svelte", async () => ({
  default: (await import("../testing/SafetyDashboardStub.svelte")).default,
}));
vi.mock("../automation/PlanExecutionView.svelte", async () => ({
  default: (await import("../testing/PlanExecutionViewStub.svelte")).default,
}));
vi.mock("../panels/IntegrationPanel.svelte", async () => ({
  default: (await import("../testing/IntegrationPanelStub.svelte")).default,
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  automationMocks.state.selectedTaskId = null;
  automationMocks.state.tasks = [{ id: "task-1", name: "Daily report" }];
  automationMocks.state.error = null;
  automationMocks.state.activeTab = "activity";
  automationMocks.initAutomationStore.mockClear();
  automationMocks.clearAutomationError.mockClear();
  automationMocks.setAgentPanelTab.mockClear();
  automationMocks.createWorkflow.mockClear();
});

describe("AutomationMode", () => {
  it("기본 대시보드와 task list를 렌더한다", async () => {
    render(AutomationMode, { documentPath: "demo.py" });

    expect(await screen.findByTestId("agent-activity")).toBeTruthy();
    expect(screen.getByTestId("task-list")).toBeTruthy();
    expect(screen.getByTestId("workflow-list")).toBeTruthy();
    expect(screen.getByTestId("recording-controls")).toBeTruthy();
    expect(screen.getByTestId("task-create-dialog-path").textContent).toContain("demo.py");
    expect(automationMocks.initAutomationStore).toHaveBeenCalledTimes(1);
  });

  it("선택된 task가 있으면 detail view를 보여준다", () => {
    automationMocks.state.selectedTaskId = "task-1";

    render(AutomationMode);

    expect(screen.getByTestId("task-detail")).toBeTruthy();
  });

  it("에러 배너 dismiss를 처리한다", async () => {
    automationMocks.state.error = "loop failed";

    render(AutomationMode);

    expect(screen.getByText("loop failed")).toBeTruthy();
    await fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(automationMocks.clearAutomationError).toHaveBeenCalledTimes(1);
  });

  it("탭 클릭 시 store setter를 호출한다", async () => {
    render(AutomationMode);

    await fireEvent.click(screen.getByRole("button", { name: "Safety" }));
    expect(automationMocks.setAgentPanelTab).toHaveBeenCalledWith("safety");
  });

  it("workflow 선택 후 builder로 전환되고 save/back이 동작한다", async () => {
    render(AutomationMode);

    await fireEvent.click(screen.getByTestId("workflow-list-select"));
    expect(await screen.findByTestId("workflow-builder")).toBeTruthy();
    expect(screen.getByTestId("workflow-builder-workflow").textContent).toContain("Workflow Alpha");
    expect(screen.getByTestId("workflow-builder-tasks").textContent).toBe("1");

    await fireEvent.click(screen.getByTestId("workflow-builder-save"));
    expect(automationMocks.createWorkflow).toHaveBeenCalledWith({
      name: "Workflow Alpha",
      steps: [{ id: "step-1", name: "First step" }],
    });

    await fireEvent.click(screen.getByTestId("workflow-builder-back"));
    expect(await screen.findByTestId("workflow-list")).toBeTruthy();
  });
});
