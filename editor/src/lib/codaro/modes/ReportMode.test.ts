import { cleanup, fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import ReportMode from "./ReportMode.svelte";

afterEach(() => {
  cleanup();
});

describe("ReportMode", () => {
  it("report header 메타데이터를 렌더한다", () => {
    render(ReportMode, {
      title: "Daily Summary",
      taskName: "daily-report",
      lastRunAt: "2026-03-23T10:00:00Z",
    });

    expect(screen.getByText("Report")).toBeTruthy();
    expect(screen.getByText("Daily Summary")).toBeTruthy();
    expect(screen.getByText("daily-report")).toBeTruthy();
  });

  it("layout 전환과 print action을 처리한다", async () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    const { container } = render(ReportMode, {
      title: "Daily Summary",
    });

    const chrome = container.querySelector(".report-chrome");
    expect(chrome?.getAttribute("data-layout")).toBe("full");

    const buttons = screen.getAllByRole("button");
    await fireEvent.click(buttons[1]);
    expect(chrome?.getAttribute("data-layout")).toBe("two-column");

    await fireEvent.click(buttons[2]);
    expect(chrome?.getAttribute("data-layout")).toBe("presentation");

    await fireEvent.click(buttons[3]);
    expect(printSpy).toHaveBeenCalledTimes(1);

    printSpy.mockRestore();
  });
});
