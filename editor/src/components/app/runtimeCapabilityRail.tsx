import {
  Boxes,
  Clock3,
  FileCode2,
  Globe2,
  HardDrive,
  PackageCheck,
  ShieldCheck,
  TerminalSquare,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useLocale } from "@/lib/localeContext";

type RuntimeSurface = "automation" | "notebook";

type RuntimeCapabilityCopy = {
  aria: string;
  detail: string;
  eyebrow: string;
  items: ReadonlyArray<{ icon: LucideIcon; label: string }>;
  title: string;
};

export function RuntimeCapabilityRail({
  apiOnline,
  surface,
}: {
  apiOnline: boolean;
  surface: RuntimeSurface;
}) {
  const { locale } = useLocale();
  const tier = apiOnline ? "local" : "web";
  const copy = runtimeCapabilityCopy(locale, surface, tier);
  const RuntimeIcon = tier === "local" ? HardDrive : Globe2;

  return (
    <section
      aria-label={copy.aria}
      className="grid grid-cols-3 border-y border-border bg-muted/25 xl:grid-cols-[minmax(260px,1.55fr)_repeat(3,minmax(0,0.8fr))]"
      data-runtime-capability-rail={surface}
      data-runtime-tier={tier}
    >
      <div className="col-span-3 flex min-w-0 items-center gap-3 px-3 py-2.5 xl:col-span-1">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-surface text-accent-brand">
          <RuntimeIcon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase text-muted-foreground">{copy.eyebrow}</div>
          <div className="flex min-w-0 items-baseline gap-2">
            <strong className="shrink-0 text-sm">{copy.title}</strong>
            <span className="min-w-0 truncate text-xs text-muted-foreground">{copy.detail}</span>
          </div>
        </div>
      </div>
      {copy.items.map(({ icon: Icon, label }) => (
        <div
          className="flex min-w-0 items-center justify-center gap-1.5 border-t border-border px-2 py-2 text-center text-[11px] font-medium text-muted-foreground xl:border-l xl:border-t-0"
          key={label}
        >
          <Icon className="size-3.5 shrink-0 text-accent-brand" aria-hidden="true" />
          <span className="min-w-0 break-keep">{label}</span>
        </div>
      ))}
    </section>
  );
}

function runtimeCapabilityCopy(
  locale: "ko" | "en",
  surface: RuntimeSurface,
  tier: "local" | "web",
): RuntimeCapabilityCopy {
  const en = locale === "en";
  if (surface === "notebook" && tier === "web") {
    return {
      aria: en ? "Current Web Run capabilities" : "현재 Web Run 실행 범위",
      detail: en ? "Browser Python" : "브라우저 Python",
      eyebrow: en ? "CURRENT RUNTIME" : "현재 실행 환경",
      items: [
        { icon: FileCode2, label: en ? "Run cells" : "셀 실행" },
        { icon: HardDrive, label: en ? "Browser files" : "브라우저 파일" },
        { icon: PackageCheck, label: en ? "Supported packages" : "지원 패키지" },
      ],
      title: "Web Run",
    };
  }
  if (surface === "notebook") {
    return {
      aria: en ? "Current Local Studio capabilities" : "현재 Local Studio 실행 범위",
      detail: en ? "Device runtime connected" : "기기 런타임 연결됨",
      eyebrow: en ? "CURRENT RUNTIME" : "현재 실행 환경",
      items: [
        { icon: Boxes, label: en ? "System Python" : "시스템 Python" },
        { icon: HardDrive, label: en ? "Project files" : "프로젝트 파일" },
        { icon: TerminalSquare, label: en ? "Terminal" : "터미널" },
      ],
      title: "Local Studio",
    };
  }
  if (tier === "web") {
    return {
      aria: en ? "Current web automation capabilities" : "현재 웹 자동화 범위",
      detail: en ? "Recipe and dry run" : "레시피와 dry-run",
      eyebrow: en ? "AUTOMATION RUNTIME" : "자동화 실행 환경",
      items: [
        { icon: Workflow, label: en ? "Design flows" : "작업 설계" },
        { icon: Globe2, label: en ? "Browser scope" : "브라우저 범위" },
        { icon: ShieldCheck, label: en ? "Safe preview" : "안전 미리보기" },
      ],
      title: en ? "Web workspace" : "웹 작업 공간",
    };
  }
  return {
    aria: en ? "Current local automation capabilities" : "현재 로컬 자동화 범위",
    detail: en ? "Device control connected" : "기기 제어 연결됨",
    eyebrow: en ? "AUTOMATION RUNTIME" : "자동화 실행 환경",
    items: [
      { icon: HardDrive, label: en ? "Files and apps" : "파일·앱" },
      { icon: Clock3, label: en ? "Scheduled runs" : "예약 실행" },
      { icon: ShieldCheck, label: en ? "Emergency stop" : "긴급 정지" },
    ],
    title: en ? "Local automation" : "Local 자동화",
  };
}
