import {
  learningVisualDomainForCategory,
  resolveLearningVisual,
  type LearningVisualDomainId,
} from "@/lib/learningVisualAssets";
import { cn } from "@/lib/utils";

type LearningDomainVisualProps = {
  category?: string;
  className?: string;
  domainId?: LearningVisualDomainId;
  path?: readonly string[];
  track?: string;
  variant: "home" | "lesson";
};

export function LearningDomainVisual({
  category = "",
  className,
  domainId,
  path = [],
  track = "",
  variant,
}: LearningDomainVisualProps) {
  const resolvedDomainId = domainId
    ?? learningVisualDomainForCategory(category, track, path)?.id;
  if (!resolvedDomainId) return null;

  const visual = resolveLearningVisual(resolvedDomainId, variant === "home" ? 480 : 840);
  if (!visual) return null;

  return (
    <figure
      className={cn(
        "min-w-0",
        variant === "lesson"
          && "grid gap-4 border-y border-border py-4 sm:grid-cols-[minmax(220px,0.8fr)_minmax(0,1fr)] sm:items-center",
        className,
      )}
      data-learning-domain={visual.domainId}
      data-learning-domain-visual="true"
      data-learning-visual-asset={visual.id}
      data-learning-visual-kind="instructional"
    >
      <picture className="block min-w-0">
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
          className="aspect-video h-auto w-full object-contain"
          decoding="async"
          height={visual.height}
          loading={variant === "home" ? "lazy" : "eager"}
          src={visual.src}
          srcSet={visual.srcSet}
          width={visual.width}
        />
      </picture>

      <figcaption className={cn("min-w-0", variant === "home" && "mt-3")}>
        <div className="text-xs font-semibold text-accent-brand">{visual.domainLabel}</div>
        <p className="mt-1 text-sm leading-6 text-foreground">{visual.caption}</p>
        <p
          className="mt-3 text-sm font-semibold leading-6 text-foreground"
          data-learning-visual-question="true"
        >
          <span className="mr-2 text-xs font-medium text-muted-foreground">살펴볼 질문</span>
          {visual.learning.learningQuestion}
        </p>
        <p
          className="mt-1 text-xs leading-5 text-foreground/80"
          data-learning-visual-decision="true"
        >
          <span className="mr-2 font-semibold text-foreground">그림의 판단 기준</span>
          {visual.learning.decisionShown}
        </p>
      </figcaption>
    </figure>
  );
}
