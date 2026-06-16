export type ClockBusGameOptions = {
  parent: HTMLElement;
  reducedMotion: boolean;
  largeText: boolean;
  initiallyCompleted: boolean;
  onEpisodeComplete: () => void;
};

type MountedClockBusGame = {
  destroy: (removeCanvas?: boolean) => void;
};

type RunState = "idle" | "short" | "overflow" | "success";

type RepairSlot = {
  slotId: string;
  label: string;
  tone: "target" | "overflow";
};

type RepairStage = {
  stageId: string;
  title: string;
  currentTime: string;
  targetTime: string;
  partCount: number;
  correctSlotCount: number;
  slots: RepairSlot[];
  shortLine: string;
  overflowLine: string;
  successLine: string;
  memoryLine: string;
};

type PartState = {
  partId: string;
  placedSlotId: string | null;
};

type HitLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type SlotLayout = RepairSlot & HitLayout;

type PartLayout = HitLayout & {
  partId: string;
};

type PaintStyle = string | CanvasGradient | CanvasPattern;

const repairStages: RepairStage[] = [
  {
    stageId: "clockBus-gap-01",
    title: "2:40 -> 3:00",
    currentTime: "2:40",
    targetTime: "3:00",
    partCount: 3,
    correctSlotCount: 2,
    slots: [
      { slotId: "slot-240-250", label: "2:40 -> 2:50", tone: "target" },
      { slotId: "slot-250-300", label: "2:50 -> 3:00", tone: "target" },
      { slotId: "slot-300-310", label: "3:00 -> 3:10", tone: "overflow" },
    ],
    shortLine: "아직 3시에 못 닿았어.",
    overflowLine: "3시를 지나쳤어.",
    successLine: "정확히 3시에 도착!",
    memoryLine: "10분 두 조각은 20분.",
  },
  {
    stageId: "clockBus-gap-02",
    title: "4:50 -> 5:00",
    currentTime: "4:50",
    targetTime: "5:00",
    partCount: 2,
    correctSlotCount: 1,
    slots: [
      { slotId: "slot-450-500", label: "4:50 -> 5:00", tone: "target" },
      { slotId: "slot-500-510", label: "5:00 -> 5:10", tone: "overflow" },
    ],
    shortLine: "시간 길이 비었어.",
    overflowLine: "한 조각만 필요해.",
    successLine: "5시 정류장에 멈췄어!",
    memoryLine: "한 칸은 10분.",
  },
  {
    stageId: "clockBus-gap-03",
    title: "1:30 -> 2:00",
    currentTime: "1:30",
    targetTime: "2:00",
    partCount: 4,
    correctSlotCount: 3,
    slots: [
      { slotId: "slot-130-140", label: "1:30 -> 1:40", tone: "target" },
      { slotId: "slot-140-150", label: "1:40 -> 1:50", tone: "target" },
      { slotId: "slot-150-200", label: "1:50 -> 2:00", tone: "target" },
      { slotId: "slot-200-210", label: "2:00 -> 2:10", tone: "overflow" },
    ],
    shortLine: "2시 전에 멈췄어.",
    overflowLine: "2시를 넘어갔어.",
    successLine: "세 칸을 모두 이었어!",
    memoryLine: "10분 세 조각은 30분.",
  },
  {
    stageId: "clockBus-transfer-01",
    title: "5:20 -> 5:40",
    currentTime: "5:20",
    targetTime: "5:40",
    partCount: 3,
    correctSlotCount: 2,
    slots: [
      { slotId: "slot-520-530", label: "5:20 -> 5:30", tone: "target" },
      { slotId: "slot-530-540", label: "5:30 -> 5:40", tone: "target" },
      { slotId: "slot-540-550", label: "5:40 -> 5:50", tone: "overflow" },
    ],
    shortLine: "전광판이 아직 어두워.",
    overflowLine: "목표 시간을 지나쳤어.",
    successLine: "시간 렌즈가 켜졌어!",
    memoryLine: "빈 시간 길을 세면 남은 시간이 보여.",
  },
];

export function mountClockBusGame(options: ClockBusGameOptions): MountedClockBusGame {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-label", "수상한 수학도시 시계버스 정비소");
  options.parent.appendChild(canvas);
  return new ClockBusCanvasGame(canvas, options);
}

class ClockBusCanvasGame implements MountedClockBusGame {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly options: ClockBusGameOptions;
  private readonly resizeObserver: ResizeObserver;
  private width = 1;
  private height = 1;
  private stageIndex = 0;
  private parts: PartState[] = [];
  private selectedPartId: string | null = null;
  private runState: RunState = "idle";
  private slotLayouts: SlotLayout[] = [];
  private partLayouts: PartLayout[] = [];
  private runLayout: HitLayout | null = null;
  private nextLayout: HitLayout | null = null;
  private completedReported = false;

  constructor(canvas: HTMLCanvasElement, options: ClockBusGameOptions) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context is not available.");
    this.canvas = canvas;
    this.ctx = ctx;
    this.options = options;
    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.options.parent);
    this.resetParts();
    this.resize();
  }

  destroy(removeCanvas = true): void {
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    this.resizeObserver.disconnect();
    if (removeCanvas) this.canvas.remove();
  }

  private get stage(): RepairStage {
    return repairStages[this.stageIndex];
  }

  private resize(): void {
    const rect = this.options.parent.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.floor(rect.width));
    const nextHeight = Math.max(1, Math.floor(rect.height));
    const ratio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    this.width = nextWidth;
    this.height = nextHeight;
    this.canvas.width = Math.floor(nextWidth * ratio);
    this.canvas.height = Math.floor(nextHeight * ratio);
    this.canvas.style.width = `${nextWidth}px`;
    this.canvas.style.height = `${nextHeight}px`;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.redraw();
  }

  private resetParts(): void {
    this.parts = Array.from({ length: this.stage.partCount }, (_, index) => ({
      partId: `part-${index + 1}`,
      placedSlotId: null,
    }));
    this.selectedPartId = null;
    this.runState = "idle";
  }

  private redraw(): void {
    this.slotLayouts = [];
    this.partLayouts = [];
    this.runLayout = null;
    this.nextLayout = null;

    const compact = this.width < 720;
    const fontScale = this.options.largeText ? 1.12 : 1;
    const safe = {
      x: compact ? 12 : 28,
      y: compact ? 10 : 20,
      width: this.width - (compact ? 24 : 56),
      height: this.height - (compact ? 20 : 40),
    };

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawPageBackdrop();

    this.drawHeader(safe.x, safe.y, safe.width, compact, fontScale);

    const headerHeight = compact ? 72 : 86;
    const trayHeight = compact ? 122 : 112;
    const boardGap = compact ? 10 : 14;
    const boardTop = safe.y + headerHeight;
    const boardHeight = safe.height - headerHeight - trayHeight - boardGap;
    this.drawDevice(safe.x, boardTop, safe.width, boardHeight, compact, fontScale);
    this.drawPartTray(safe.x, boardTop + boardHeight + boardGap, safe.width, safe.y + safe.height, compact, fontScale);
  }

  private drawHeader(x: number, y: number, width: number, compact: boolean, fontScale: number): void {
    const stage = this.stage;
    const titleSize = (compact ? 24 : 38) * fontScale;
    const captionSize = (compact ? 12 : 15) * fontScale;

    this.text("수상한 수학도시", x, y + 2, captionSize, 900, "#117c76", "left", "top");
    this.text("시계버스 정비소", x, y + (compact ? 25 : 32), titleSize, 900, "#15201c", "left", "top");

    const badgeWidth = compact ? 120 : 170;
    const toolRoom = compact ? 66 : 72;
    const badgeX = x + width - badgeWidth - toolRoom;
    this.roundBox(badgeX, y + 8, badgeWidth, compact ? 46 : 54, 12, "#ffffff", "rgba(21,32,28,0.18)", 2, 0.9);
    this.text(`${stage.currentTime}  ->  ${stage.targetTime}`, badgeX + 14, y + (compact ? 18 : 18), (compact ? 15 : 20) * fontScale, 900, "#15201c", "left", "top");
    this.text(`${this.stageIndex + 1}/${repairStages.length}`, badgeX + 14, y + (compact ? 37 : 43), (compact ? 11 : 13) * fontScale, 800, "#53625b", "left", "top");
  }

  private drawPageBackdrop(): void {
    const bg = this.ctx.createLinearGradient(0, 0, 0, this.height);
    bg.addColorStop(0, "#fff3ba");
    bg.addColorStop(0.46, "#f7eebc");
    bg.addColorStop(1, "#dff1df");
    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.save();
    this.ctx.globalAlpha = 0.22;
    const glow = this.ctx.createRadialGradient(this.width * 0.14, this.height * 0.12, 10, this.width * 0.14, this.height * 0.12, this.width * 0.72);
    glow.addColorStop(0, "#ffffff");
    glow.addColorStop(0.42, "#ffd56a");
    glow.addColorStop(1, "rgba(255,213,106,0)");
    this.ctx.fillStyle = glow;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();

    this.ctx.save();
    this.ctx.globalAlpha = 0.14;
    this.circle(this.width * 0.88, this.height * 0.08, Math.max(42, this.width * 0.12), "#52b6ad");
    this.circle(this.width * 0.16, this.height * 0.9, Math.max(72, this.width * 0.22), "#f0684f");
    this.ctx.restore();
  }

  private drawDevice(x: number, y: number, width: number, height: number, compact: boolean, fontScale: number): void {
    this.ctx.save();
    this.ctx.shadowColor = "rgba(21,32,28,0.14)";
    this.ctx.shadowBlur = 18;
    this.ctx.shadowOffsetY = 8;
    this.roundBox(x, y, width, height, 18, "#fff7c9", "rgba(21,32,28,0.16)", 3);
    this.ctx.restore();

    this.ctx.save();
    this.roundPath(x + 3, y + 3, width - 6, height - 6, 15);
    this.ctx.clip();
    this.drawWorldScene(x + 3, y + 3, width - 6, height - 6, compact);
    this.ctx.restore();

    this.strokeRoundBox(x, y, width, height, 18, "rgba(21,32,28,0.18)", 3);

    if (this.runState === "success" && !this.options.reducedMotion) {
      this.drawConfetti(x, y, width, height);
    }

    const trackStartX = x + width * 0.18;
    const trackY = y + height * (compact ? 0.58 : 0.62);
    const trackEndX = x + width * 0.82;
    const trackEndY = y + height * 0.39;
    this.cubicDots(
      "#7c6752",
      compact ? 8 : 14,
      trackStartX,
      trackY,
      x + width * 0.34,
      y + height * 0.7,
      x + width * 0.52,
      y + height * 0.47,
      trackEndX,
      trackEndY,
      1,
    );

    if (this.runState === "success") {
      this.cubicDots(
        "#4ab7d7",
        compact ? 4 : 7,
        trackStartX,
        trackY - 24,
        x + width * 0.34,
        y + height * 0.58,
        x + width * 0.56,
        y + height * 0.38,
        trackEndX,
        trackEndY - 20,
        0.48,
      );
    }

    this.drawClockTower(x + width * 0.09, y + height * 0.28, width * (compact ? 0.24 : 0.18), compact, fontScale);
    this.drawTargetSign(x + width * (compact ? 0.67 : 0.72), y + height * 0.14, width * (compact ? 0.26 : 0.2), compact, fontScale);
    this.drawBus(x, y, width, height, compact, fontScale);
    this.drawGuideBot(x + width * (compact ? 0.81 : 0.88), y + height * (compact ? 0.67 : 0.7), width * (compact ? 0.08 : 0.045));
    this.drawSlots(x, y, width, height, compact, fontScale);
    this.drawFeedback(x, y, width, height, compact, fontScale);
  }

  private drawWorldScene(x: number, y: number, width: number, height: number, compact: boolean): void {
    const sky = this.ctx.createLinearGradient(0, y, 0, y + height);
    sky.addColorStop(0, "#ffeaa3");
    sky.addColorStop(0.48, "#fff4c8");
    sky.addColorStop(1, "#dff3dc");
    this.ctx.fillStyle = sky;
    this.ctx.fillRect(x, y, width, height);

    const sun = this.ctx.createRadialGradient(x + width * 0.18, y + height * 0.18, 8, x + width * 0.18, y + height * 0.18, width * 0.42);
    sun.addColorStop(0, "rgba(255,255,255,0.9)");
    sun.addColorStop(0.35, "rgba(255,213,93,0.46)");
    sun.addColorStop(1, "rgba(255,213,93,0)");
    this.ctx.fillStyle = sun;
    this.ctx.fillRect(x, y, width, height);

    this.drawCloud(x + width * 0.6, y + height * 0.16, width * (compact ? 0.12 : 0.09), 0.52);
    this.drawCloud(x + width * 0.24, y + height * 0.2, width * (compact ? 0.1 : 0.075), 0.34);

    this.ctx.save();
    this.ctx.globalAlpha = 0.55;
    const buildingY = y + height * 0.18;
    const buildingH = height * 0.3;
    const buildingW = compact ? width * 0.13 : width * 0.085;
    for (let i = 0; i < 8; i += 1) {
      const bx = x + width * 0.08 + i * buildingW * 1.2;
      const bh = buildingH * (0.56 + ((i % 3) * 0.12));
      const fill = ["#92d1c4", "#f6c56d", "#f5a681", "#a6c7e8"][i % 4];
      this.roundBox(bx, buildingY + buildingH - bh, buildingW, bh, 8, fill, "rgba(21,32,28,0.14)", 1);
      for (let w = 0; w < 3; w += 1) {
        this.roundBox(bx + buildingW * (0.18 + w * 0.24), buildingY + buildingH - bh + 12, buildingW * 0.12, bh * 0.42, 4, "rgba(255,255,255,0.64)");
      }
    }
    this.ctx.restore();

    const plaza = this.ctx.createLinearGradient(0, y + height * 0.52, 0, y + height);
    plaza.addColorStop(0, "rgba(255,248,205,0.64)");
    plaza.addColorStop(1, "#f8e8a8");
    this.ctx.fillStyle = plaza;
    this.ctx.fillRect(x, y + height * 0.48, width, height * 0.52);

    this.ctx.save();
    this.ctx.globalAlpha = 0.23;
    this.ctx.strokeStyle = "#b99d61";
    this.ctx.lineWidth = 1;
    const cobble = compact ? 34 : 46;
    for (let row = 0; row < 7; row += 1) {
      const yy = y + height * 0.54 + row * cobble * 0.72;
      this.line(x + 18, yy, x + width - 18, yy + cobble * 0.25, "#b99d61", 1);
    }
    for (let col = 0; col < 14; col += 1) {
      const xx = x + 20 + col * cobble;
      this.line(xx, y + height * 0.52, xx - cobble * 0.38, y + height, "#b99d61", 1);
    }
    this.ctx.restore();

    this.ctx.save();
    this.ctx.globalAlpha = 0.18;
    ["+", "=", "?"].forEach((mark, index) => {
      this.text(mark, x + width * (0.18 + index * 0.27), y + height * (0.28 + index * 0.04), compact ? 22 : 34, 900, "#117c76", "center", "middle");
    });
    this.ctx.restore();
  }

  private cubicDots(
    color: string,
    radius: number,
    startX: number,
    startY: number,
    controlX1: number,
    controlY1: number,
    controlX2: number,
    controlY2: number,
    endX: number,
    endY: number,
    alpha: number,
  ): void {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = color;
    for (let step = 0; step <= 52; step += 1) {
      const t = step / 52;
      const inverse = 1 - t;
      const nextX = (inverse ** 3 * startX)
        + (3 * inverse ** 2 * t * controlX1)
        + (3 * inverse * t ** 2 * controlX2)
        + (t ** 3 * endX);
      const nextY = (inverse ** 3 * startY)
        + (3 * inverse ** 2 * t * controlY1)
        + (3 * inverse * t ** 2 * controlY2)
        + (t ** 3 * endY);
      this.circle(nextX, nextY, radius, color);
    }
    this.ctx.restore();
  }

  private drawClockTower(x: number, y: number, size: number, compact: boolean, fontScale: number): void {
    const bodyW = size * 0.72;
    const bodyH = size * 1.08;
    const cx = x + bodyW / 2;
    const clockY = y + size * 0.64;

    this.ctx.save();
    this.ctx.globalAlpha = 0.28;
    this.ellipse(cx, y + size * 1.52, bodyW * 0.68, size * 0.12, "#15201c");
    this.ctx.restore();

    const bodyGradient = this.ctx.createLinearGradient(x, y, x + bodyW, y + bodyH);
    bodyGradient.addColorStop(0, "#ffd878");
    bodyGradient.addColorStop(0.46, "#f4b84e");
    bodyGradient.addColorStop(1, "#d99133");
    this.roundBox(x, y + size * 0.42, bodyW, bodyH, 12, bodyGradient, "#15201c", compact ? 3 : 5);
    for (let row = 0; row < 4; row += 1) {
      this.line(x + bodyW * 0.16, y + size * (0.72 + row * 0.18), x + bodyW * 0.84, y + size * (0.72 + row * 0.18), "rgba(101,67,31,0.22)", 1);
    }
    const roofGradient = this.ctx.createLinearGradient(x, y, x + bodyW, y + size * 0.48);
    roofGradient.addColorStop(0, "#ff8064");
    roofGradient.addColorStop(1, "#e65343");
    this.triangle(x - size * 0.12, y + size * 0.48, cx, y, x + bodyW + size * 0.12, y + size * 0.48, roofGradient, "#15201c", compact ? 3 : 5);
    this.circle(cx, clockY, size * 0.34, "#fffefa", "#15201c", compact ? 3 : 5);
    this.circle(cx - size * 0.1, clockY - size * 0.1, size * 0.08, "rgba(255,255,255,0.76)");
    this.line(cx, clockY, cx, clockY - size * 0.25, "#15201c", compact ? 3 : 6);
    const minuteX = this.runState === "success" ? cx + size * 0.27 : cx - size * 0.14;
    const minuteY = this.runState === "success" ? clockY - size * 0.12 : clockY - size * 0.2;
    this.line(cx, clockY, minuteX, minuteY, "#2d67bd", compact ? 3 : 5);
    this.circle(cx, clockY, compact ? 4 : 6, "#c93a34");
    this.text(this.stage.currentTime, cx, y + size * 1.28, (compact ? 10 : 15) * fontScale, 900, "#15201c", "center", "middle");
  }

  private drawTargetSign(x: number, y: number, width: number, compact: boolean, fontScale: number): void {
    const height = compact ? 76 : 120;
    this.ctx.save();
    this.ctx.globalAlpha = 0.24;
    this.ellipse(x + width * 0.52, y + height * 1.02, width * 0.42, height * 0.12, "#15201c");
    this.ctx.restore();
    const signGradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
    signGradient.addColorStop(0, "#69d3bf");
    signGradient.addColorStop(1, "#32a99b");
    this.roundBox(x, y, width, height, compact ? 10 : 16, signGradient, "#15201c", compact ? 3 : 5);
    this.roundBox(x + width * 0.06, y + height * 0.08, width * 0.16, height * 0.18, 999, "rgba(255,255,255,0.26)");
    this.roundBox(x + width * 0.16, y + height * 0.2, width * 0.68, height * 0.34, 8, "#f6ffe3");
    this.text(`${this.stage.targetTime} 출발`, x + width / 2, y + height * 0.37, (compact ? 10 : 18) * fontScale, 900, "#15201c", "center", "middle");
    this.roundBox(x + width * 0.28, y + height * 0.65, width * 0.44, height * 0.2, 999, this.runState === "success" ? "#ffd447" : "#d7ddd0");
  }

  private drawBus(x: number, y: number, width: number, height: number, compact: boolean, fontScale: number): void {
    const targetFilled = this.stage.slots
      .filter((slot) => slot.tone === "target" && this.parts.some((part) => part.placedSlotId === slot.slotId))
      .length;
    const progress = this.runState === "success"
      ? 1
      : this.runState === "overflow"
        ? 1.16
        : Math.min(targetFilled / Math.max(this.stage.correctSlotCount, 1), 0.72);
    const busX = x + width * ((compact ? 0.25 : 0.31) + ((compact ? 0.45 : 0.38) * progress));
    const busY = y + height * (compact ? 0.58 : 0.61) - (height * 0.2 * progress);
    const busW = compact ? width * 0.2 : width * 0.125;
    const busH = busW * 0.54;

    this.ctx.save();
    this.ctx.globalAlpha = 0.26;
    this.ellipse(busX, busY + busH * 0.62, busW * 0.56, busH * 0.18, "#15201c");
    this.ctx.restore();
    const busGradient = this.ctx.createLinearGradient(busX - busW / 2, busY - busH / 2, busX + busW / 2, busY + busH / 2);
    busGradient.addColorStop(0, "#ffe56f");
    busGradient.addColorStop(0.58, "#ffd447");
    busGradient.addColorStop(1, "#f4a73b");
    this.roundBox(busX - busW / 2, busY - busH / 2, busW, busH, 12, busGradient, "#15201c", compact ? 3 : 5);
    this.roundBox(busX - busW * 0.37, busY - busH * 0.24, busW * 0.22, busH * 0.24, 5, "#dff5ff", "#15201c", 2);
    this.roundBox(busX - busW * 0.08, busY - busH * 0.24, busW * 0.22, busH * 0.24, 5, "#dff5ff", "#15201c", 2);
    this.roundBox(busX + busW * 0.2, busY - busH * 0.24, busW * 0.2, busH * 0.24, 5, "#dff5ff", "#15201c", 2);
    this.roundBox(busX - busW * 0.28, busY - busH * 0.78, busW * 0.56, busH * 0.34, 7, "#dff5ff", "#15201c", compact ? 3 : 5);
    this.circle(busX - busW * 0.28, busY + busH * 0.52, compact ? 5 : 10, "#15201c");
    this.circle(busX + busW * 0.28, busY + busH * 0.52, compact ? 5 : 10, "#15201c");
    this.circle(busX - busW * 0.28, busY + busH * 0.52, compact ? 2 : 4, "#f6efd1");
    this.circle(busX + busW * 0.28, busY + busH * 0.52, compact ? 2 : 4, "#f6efd1");
    this.circle(busX + busW * 0.45, busY + busH * 0.08, compact ? 2 : 4, "#fff6bf");
    this.text(this.runState === "overflow" ? "!" : "버스", busX, busY - busH * 0.61, (compact ? 8 : 14) * fontScale, 900, "#15201c", "center", "middle");
  }

  private drawGuideBot(x: number, y: number, size: number): void {
    this.ctx.save();
    this.ctx.globalAlpha = 0.18;
    this.ellipse(x, y + size * 0.72, size * 0.7, size * 0.18, "#15201c");
    this.ctx.restore();
    const body = this.ctx.createLinearGradient(x - size * 0.48, y - size * 0.18, x + size * 0.48, y + size * 0.7);
    body.addColorStop(0, "#f9ffff");
    body.addColorStop(1, "#8bd6cf");
    this.roundBox(x - size * 0.45, y - size * 0.18, size * 0.9, size * 0.72, size * 0.16, body, "#15201c", Math.max(2, size * 0.055));
    this.roundBox(x - size * 0.28, y - size * 0.46, size * 0.56, size * 0.32, size * 0.18, "#dff5ff", "#15201c", Math.max(2, size * 0.05));
    this.line(x, y - size * 0.46, x, y - size * 0.72, "#15201c", Math.max(2, size * 0.045));
    this.circle(x, y - size * 0.77, size * 0.08, "#ffd447", "#15201c", Math.max(1.5, size * 0.035));
    this.circle(x - size * 0.16, y - size * 0.02, size * 0.06, "#15201c");
    this.circle(x + size * 0.16, y - size * 0.02, size * 0.06, "#15201c");
    this.line(x - size * 0.62, y + size * 0.14, x - size * 0.9, y - size * 0.12, "#15201c", Math.max(2, size * 0.05));
    this.line(x + size * 0.62, y + size * 0.14, x + size * 0.9, y - size * 0.12, "#15201c", Math.max(2, size * 0.05));
    this.circle(x - size * 0.95, y - size * 0.16, size * 0.08, "#f0684f");
    this.circle(x + size * 0.95, y - size * 0.16, size * 0.08, "#ffd447");
  }

  private drawSlots(x: number, y: number, width: number, height: number, compact: boolean, fontScale: number): void {
    const slotCount = this.stage.slots.length;
    const gap = compact ? 6 : 14;
    const slotWidth = compact
      ? Math.min(122, (width - 28 - ((slotCount - 1) * gap)) / slotCount)
      : Math.min(170, (width - 80 - ((slotCount - 1) * gap)) / slotCount);
    const slotHeight = compact ? 42 : 62;
    const totalWidth = (slotWidth * slotCount) + (gap * (slotCount - 1));
    const startX = x + (width - totalWidth) / 2;
    const slotY = y + height - slotHeight - (compact ? 14 : 24);

    this.stage.slots.forEach((slot, index) => {
      const sx = startX + (index * (slotWidth + gap));
      const part = this.parts.find((item) => item.placedSlotId === slot.slotId);
      this.slotLayouts.push({ ...slot, x: sx, y: slotY, width: slotWidth, height: slotHeight });
      const fill = part ? "#ffd447" : slot.tone === "overflow" ? "#ffe4dc" : "#eafff6";
      const line = part ? "#15201c" : slot.tone === "overflow" ? "#f0684f" : "#5bc0ad";
      this.roundBox(sx, slotY, slotWidth, slotHeight, 9, fill, line, part ? 3 : 2);
      this.text(slot.label, sx + slotWidth / 2, slotY + slotHeight * 0.34, (compact ? 8 : 13) * fontScale, 900, "#15201c", "center", "middle");
      this.text(part ? "10분" : "빈칸", sx + slotWidth / 2, slotY + slotHeight * 0.72, (compact ? 8 : 12) * fontScale, 900, part ? "#15201c" : "#53625b", "center", "middle");
    });
  }

  private drawFeedback(x: number, y: number, width: number, _height: number, compact: boolean, fontScale: number): void {
    const stage = this.stage;
    const text = this.runState === "success"
      ? `${stage.successLine} ${stage.memoryLine}`
      : this.runState === "overflow"
        ? stage.overflowLine
        : this.runState === "short"
          ? stage.shortLine
          : "10분 부품을 시간 길에 끼워.";
    const boxW = compact ? width * 0.82 : width * 0.42;
    const boxH = compact ? 44 : 58;
    const boxX = compact ? x + width * 0.09 : x + width * 0.29;
    const boxY = y + (compact ? 10 : 18);
    const fill = this.runState === "success" ? "#ecfff2" : this.runState === "overflow" ? "#ffeee8" : "#ffffff";
    this.roundBox(boxX, boxY, boxW, boxH, 12, fill, "rgba(21,32,28,0.14)", 2, 0.96);
    this.fitText(text, boxX + boxW / 2, boxY + boxH / 2, boxW - 26, (compact ? 13 : 18) * fontScale, 900, "#15201c");
  }

  private drawPartTray(x: number, y: number, width: number, bottom: number, compact: boolean, fontScale: number): void {
    const trayHeight = Math.max(104, bottom - y);
    this.ctx.save();
    this.ctx.shadowColor = "rgba(21,32,28,0.14)";
    this.ctx.shadowBlur = 14;
    this.ctx.shadowOffsetY = 5;
    this.roundBox(x, y, width, trayHeight, 18, "rgba(255,255,255,0.94)", "rgba(21,32,28,0.18)", 2);
    this.ctx.restore();
    this.roundBox(x + 10, y + 8, Math.max(60, width - 20), Math.max(24, trayHeight - 16), 14, "rgba(255,251,228,0.62)");

    const runW = compact ? 94 : 146;
    const runH = compact ? 58 : 72;
    const runX = x + width - runW - (compact ? 12 : 20);
    const runY = y + (trayHeight - runH) / 2;
    this.drawRunButton(runX, runY, runW, runH, compact, fontScale);

    const trayX = x + (compact ? 12 : 22);
    const partSize = compact ? 56 : 72;
    const gap = compact ? 8 : 14;
    let partIndex = 0;
    this.parts.forEach((part) => {
      if (part.placedSlotId) return;
      const px = trayX + (partIndex * (partSize + gap)) + partSize / 2;
      const py = y + trayHeight / 2;
      this.drawPart(part, px, py, partSize, compact, fontScale);
      partIndex += 1;
    });

    if (this.parts.every((part) => part.placedSlotId)) {
      this.text("모든 부품 장착", trayX, y + trayHeight / 2, (compact ? 14 : 18) * fontScale, 900, "#117c76", "left", "middle");
    }

    if (this.runState === "success") {
      const nextLabel = this.stageIndex === repairStages.length - 1 ? "다음 단서" : "다음 고장";
      const nextW = compact ? 102 : 150;
      const nextX = runX - nextW - (compact ? 8 : 12);
      this.nextLayout = { x: nextX, y: runY, width: nextW, height: runH };
      this.roundBox(nextX, runY, nextW, runH, 12, "#3f9a5d", "#15201c", 3);
      this.text(nextLabel, nextX + nextW / 2, runY + runH / 2, (compact ? 14 : 18) * fontScale, 900, "#ffffff", "center", "middle");
    }
  }

  private drawPart(part: PartState, x: number, y: number, size: number, compact: boolean, fontScale: number): void {
    const selected = this.selectedPartId === part.partId;
    const partX = x - size / 2;
    const partY = y - size / 2;
    this.partLayouts.push({ partId: part.partId, x: partX, y: partY, width: size, height: size });
    this.ctx.save();
    this.ctx.globalAlpha = selected ? 0.28 : 0.16;
    this.ellipse(x, y + size * 0.45, size * 0.42, size * 0.13, "#15201c");
    this.ctx.restore();
    const partGradient = this.ctx.createRadialGradient(x - size * 0.16, y - size * 0.18, 2, x, y, size * 0.72);
    partGradient.addColorStop(0, "#fff8be");
    partGradient.addColorStop(0.7, selected ? "#ffd447" : "#ffef9a");
    partGradient.addColorStop(1, selected ? "#f7b840" : "#f1d96f");
    this.roundBox(partX, partY, size, size, 12, partGradient, "#15201c", selected ? 4 : 3);
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      this.line(
        x + Math.cos(angle) * size * 0.27,
        y + Math.sin(angle) * size * 0.27,
        x + Math.cos(angle) * size * 0.38,
        y + Math.sin(angle) * size * 0.38,
        "rgba(21,32,28,0.28)",
        2,
      );
    }
    this.text("10", x, y - size * 0.07, (compact ? 22 : 30) * fontScale, 900, "#15201c", "center", "middle");
    this.text("분", x, y + size * 0.28, (compact ? 10 : 12) * fontScale, 900, "#15201c", "center", "middle");
  }

  private drawRunButton(x: number, y: number, width: number, height: number, compact: boolean, fontScale: number): void {
    this.runLayout = { x, y, width, height };
    const runGradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
    runGradient.addColorStop(0, "#ff8064");
    runGradient.addColorStop(1, "#e64f3e");
    this.roundBox(x, y, width, height, 14, runGradient, "#15201c", 3);
    this.circle(x + width * 0.24, y + height * 0.5, compact ? 8 : 11, "#ffffff");
    this.line(x + width * 0.24, y + height * 0.5, x + width * 0.24, y + height * 0.33, "#f0684f", 3);
    this.text("작동", x + width * 0.62, y + height / 2, (compact ? 15 : 20) * fontScale, 900, "#ffffff", "center", "middle");
  }

  private drawConfetti(x: number, y: number, width: number, height: number): void {
    const colors = ["#ffd447", "#f0684f", "#5bc0ad", "#2d67bd"];
    for (let i = 0; i < 24; i += 1) {
      const pieceX = x + 24 + ((i * 73) % Math.max(24, width - 48));
      const pieceY = y + height * 0.13 + ((i * 37) % Math.max(22, height * 0.46));
      this.ctx.save();
      this.ctx.translate(pieceX, pieceY);
      this.ctx.rotate(((i % 7) - 3) * 0.28);
      this.ctx.globalAlpha = 0.86;
      this.ctx.fillStyle = colors[i % colors.length];
      this.ctx.fillRect(-4, -7, 8, 14);
      this.ctx.restore();
    }
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    const point = {
      x: ((event.clientX - rect.left) / rect.width) * this.width,
      y: ((event.clientY - rect.top) / rect.height) * this.height,
    };
    if (this.nextLayout && this.runState === "success" && this.contains(this.nextLayout, point.x, point.y)) {
      this.nextStage();
      return;
    }
    if (this.runLayout && this.contains(this.runLayout, point.x, point.y)) {
      this.runDevice();
      return;
    }
    const selectedPart = this.partLayouts.find((layout) => this.contains(layout, point.x, point.y));
    if (selectedPart) {
      this.selectedPartId = selectedPart.partId;
      this.runState = "idle";
      this.redraw();
      return;
    }
    const selectedSlot = this.slotLayouts.find((layout) => this.contains(layout, point.x, point.y));
    if (selectedSlot) {
      this.placeSelectedPart(selectedSlot.slotId);
    }
  };

  private contains(layout: HitLayout, x: number, y: number): boolean {
    return x >= layout.x
      && x <= layout.x + layout.width
      && y >= layout.y
      && y <= layout.y + layout.height;
  }

  private placeSelectedPart(slotId: string): void {
    if (!this.selectedPartId) return;
    this.placePart(this.selectedPartId, slotId);
  }

  private placePart(partId: string, slotId: string): void {
    this.parts = this.parts.map((part) => ({
      ...part,
      placedSlotId: part.partId === partId ? slotId : part.placedSlotId === slotId ? null : part.placedSlotId,
    }));
    this.selectedPartId = null;
    this.runState = "idle";
    this.redraw();
  }

  private runDevice(): void {
    const overflowFilled = this.stage.slots
      .filter((slot) => slot.tone === "overflow")
      .some((slot) => this.parts.some((part) => part.placedSlotId === slot.slotId));
    const targetFilledCount = this.stage.slots
      .filter((slot) => slot.tone === "target")
      .filter((slot) => this.parts.some((part) => part.placedSlotId === slot.slotId))
      .length;
    if (overflowFilled) {
      this.runState = "overflow";
    } else if (targetFilledCount < this.stage.correctSlotCount) {
      this.runState = "short";
    } else {
      this.runState = "success";
      if (this.stageIndex === repairStages.length - 1 && !this.completedReported && !this.options.initiallyCompleted) {
        this.completedReported = true;
        this.options.onEpisodeComplete();
      }
    }
    this.redraw();
  }

  private nextStage(): void {
    if (this.stageIndex < repairStages.length - 1) {
      this.stageIndex += 1;
      this.resetParts();
      this.redraw();
      return;
    }
    this.stageIndex = 0;
    this.resetParts();
    this.redraw();
  }

  private text(
    value: string,
    x: number,
    y: number,
    size: number,
    weight: number,
    color: string,
    align: CanvasTextAlign,
    baseline: CanvasTextBaseline,
  ): void {
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.font = `${weight} ${size}px Pretendard, system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    this.ctx.fillText(value, x, y);
    this.ctx.restore();
  }

  private fitText(value: string, x: number, y: number, maxWidth: number, size: number, weight: number, color: string): void {
    let nextSize = size;
    this.ctx.save();
    this.ctx.fillStyle = color;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    do {
      this.ctx.font = `${weight} ${nextSize}px Pretendard, system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
      if (this.ctx.measureText(value).width <= maxWidth || nextSize <= 11) break;
      nextSize -= 1;
    } while (nextSize > 10);
    this.ctx.fillText(value, x, y);
    this.ctx.restore();
  }

  private roundBox(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fill: PaintStyle,
    stroke?: string,
    lineWidth = 1,
    alpha = 1,
  ): void {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.roundPath(x, y, width, height, Math.min(radius, width / 2, height / 2));
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    if (stroke) {
      this.ctx.lineWidth = lineWidth;
      this.ctx.strokeStyle = stroke;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  private circle(x: number, y: number, radius: number, fill: string, stroke?: string, lineWidth = 1): void {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    if (stroke) {
      this.ctx.lineWidth = lineWidth;
      this.ctx.strokeStyle = stroke;
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  private ellipse(x: number, y: number, radiusX: number, radiusY: number, fill: string): void {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawCloud(x: number, y: number, size: number, alpha: number): void {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.circle(x, y, size * 0.42, "#ffffff");
    this.circle(x + size * 0.33, y - size * 0.12, size * 0.34, "#ffffff");
    this.circle(x + size * 0.68, y, size * 0.4, "#ffffff");
    this.roundBox(x - size * 0.2, y, size * 1.08, size * 0.34, 999, "#ffffff");
    this.ctx.restore();
  }

  private strokeRoundBox(x: number, y: number, width: number, height: number, radius: number, stroke: string, lineWidth: number): void {
    this.ctx.save();
    this.roundPath(x, y, width, height, Math.min(radius, width / 2, height / 2));
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = stroke;
    this.ctx.stroke();
    this.ctx.restore();
  }

  private line(startX: number, startY: number, endX: number, endY: number, color: string, lineWidth: number): void {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.lineCap = "round";
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
    this.ctx.restore();
  }

  private triangle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    fill: PaintStyle,
    stroke: string,
    lineWidth: number,
  ): void {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x3, y3);
    this.ctx.closePath();
    this.ctx.fillStyle = fill;
    this.ctx.fill();
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = stroke;
    this.ctx.stroke();
    this.ctx.restore();
  }

  private roundPath(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
}
