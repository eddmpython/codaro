import {
  learningVisualDomainForCategory,
  resolveLearningVisual,
  type LearningVisualDomainId,
} from "@/lib/learningVisualAssets";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type LearningDomainVisualProps = {
  category?: string;
  children?: ReactNode;
  className?: string;
  domainId?: LearningVisualDomainId;
  path?: readonly string[];
  track?: string;
  variant: "home" | "lesson";
};

export function LearningDomainVisual({
  category = "",
  children,
  className,
  domainId,
  path = [],
  track = "",
  variant,
}: LearningDomainVisualProps) {
  const resolvedDomainId = domainId
    ?? learningVisualDomainForCategory(category, track, path)?.id;
  if (!resolvedDomainId) return children ? <>{children}</> : null;

  const visual = resolveLearningVisual(resolvedDomainId, variant === "home" ? 480 : 840);
  if (!visual) return children ? <>{children}</> : null;

  return (
    <figure
      className={cn(
        "min-w-0",
        variant === "lesson"
          && "grid gap-4 sm:grid-cols-[minmax(240px,0.95fr)_minmax(0,1.05fr)] sm:items-start",
        className,
      )}
      data-learning-domain={visual.domainId}
      data-learning-domain-visual="true"
      data-learning-visual-asset={visual.id}
      data-learning-visual-kind="instructional"
    >
      <picture className="block min-w-0 overflow-hidden rounded-lg border border-border bg-card">
        {visual.sources.map((source) => (
          <source
            key={source.format}
            sizes={variant === "home" ? "(min-width: 768px) 240px, 100vw" : "(min-width: 640px) 420px, 100vw"}
            srcSet={source.srcSet}
            type={source.type}
          />
        ))}
        <img
          alt={visual.alt}
          className="aspect-video h-auto w-full object-cover"
          decoding="async"
          height={visual.height}
          loading={variant === "home" ? "lazy" : "eager"}
          src={visual.src}
          srcSet={visual.srcSet}
          width={visual.width}
        />
      </picture>

      <figcaption className={cn("min-w-0", variant === "home" && "mt-3")}>
        <div className="text-xs font-bold text-accent-brand">{visual.domainLabel}</div>
        <p className="mt-1 text-sm font-normal leading-6 text-foreground">{visual.caption}</p>
        <dl className="mt-3 space-y-2.5">
          <div
          data-learning-visual-question="true"
          >
            <dt className="text-xs font-medium text-muted-foreground">살펴볼 질문</dt>
            <dd className="mt-0.5 text-sm font-normal leading-6 text-foreground">
              {visual.learning.learningQuestion}
            </dd>
          </div>
          <div data-learning-visual-decision="true">
            <dt className="text-xs font-medium text-muted-foreground">그림의 판단 기준</dt>
            <dd className="mt-0.5 text-xs font-normal leading-5 text-foreground">
              {visual.learning.decisionShown}
            </dd>
          </div>
        </dl>
        {children}
      </figcaption>
    </figure>
  );
}
