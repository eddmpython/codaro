import {
  learningVisualDomainForCategory,
  resolveLearningOutcomeVisual,
  resolveLearningVisual,
  resolveLearningVisualForLesson,
  type LearningVisualDomainId,
} from "@/lib/learningVisualAssets";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type LearningDomainVisualProps = {
  category?: string;
  children?: ReactNode;
  className?: string;
  contentId?: string;
  domainId?: LearningVisualDomainId;
  path?: readonly string[];
  track?: string;
  variant: "home" | "lesson";
};

export function LearningDomainVisual({
  category = "",
  children,
  className,
  contentId = "",
  domainId,
  path = [],
  track = "",
  variant,
}: LearningDomainVisualProps) {
  const resolvedDomainId = domainId
    ?? learningVisualDomainForCategory(category, track, path)?.id;
  const outcomeVisual = variant === "lesson"
    ? resolveLearningOutcomeVisual(category, contentId, 840)
    : null;
  const visual = outcomeVisual
    ?? (resolvedDomainId
      ? variant === "lesson"
        ? resolveLearningVisualForLesson(resolvedDomainId, category, contentId, 840)
        : resolveLearningVisual(resolvedDomainId, 480)
      : null);
  if (!visual) {
    return children ? <div className={cn("min-w-0", className)}>{children}</div> : null;
  }

  return (
    <figure
      className={cn(
        "min-w-0",
        variant === "lesson"
          && "grid gap-3 sm:grid-cols-[minmax(240px,0.95fr)_minmax(0,1.05fr)] sm:items-start sm:gap-4",
        className,
      )}
      data-learning-domain={resolvedDomainId}
      data-learning-domain-visual="true"
      data-learning-visual-asset={visual.id}
      data-learning-visual-kind={visual.kind}
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
          className={cn(
            "aspect-video h-auto w-full",
            visual.kind === "outcomeProof" ? "object-contain" : "object-cover",
          )}
          decoding="async"
          height={visual.height}
          loading={variant === "home" ? "lazy" : "eager"}
          src={visual.src}
          srcSet={visual.srcSet}
          width={visual.width}
        />
      </picture>

      <figcaption className={cn("min-w-0", variant === "home" && "mt-3")}>
        <div className="text-xs font-bold text-accent-brand">
          {"domainLabel" in visual ? visual.domainLabel : ""}
        </div>
        <p className="mt-1 text-sm font-normal leading-5 text-foreground sm:leading-6">{visual.caption}</p>
        <dl className="mt-2 space-y-2 sm:mt-3 sm:space-y-2.5">
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
        {children ? (
          <div className="mt-3 border-t border-border pt-3 sm:mt-4 sm:pt-4">
            {children}
          </div>
        ) : null}
      </figcaption>
    </figure>
  );
}
