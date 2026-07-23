import { blockLabel, stripMarkdown } from "@/lib/cellModel";
import type { BlockConfig } from "@/types";
import { ImageIcon, MonitorPlay, PlayCircle } from "lucide-react";
import { SectionLead, blockTypeLabel } from "./curriculumMarkdownDataCells";
import { payloadItems, payloadText } from "./curriculumMarkdownHelpers";
import { InlineLink, MarkdownBlock } from "./curriculumMarkdownRichText";

export function MediaCell({ block, payload }: { block: BlockConfig; payload: Record<string, unknown> }) {
  const src = payloadText(payload, "src") || payloadText(payload, "url") || youtubeUrl(payloadText(payload, "youtube"));
  const sourceType = payloadText(payload, "sourceType") || block.sourceType || "media";
  const title = payloadText(payload, "title") || block.title || blockLabel(block);
  const description = payloadText(payload, "description") || payloadText(payload, "subtitle");
  const items = payloadItems(payload, "items");

  if ((sourceType === "image" || sourceType === "video" || sourceType === "youtube") && src) {
    return (
      <div className="space-y-3">
        <SectionLead subtitle={description} title={title} />
        <VisualAsset src={src} title={title} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <SectionLead subtitle={description} title={title} />
      <div className="grid gap-3 md:grid-cols-2">
        {src ? <MediaResourceCard item={{ title: blockTypeLabel(sourceType), url: src, sourceType }} /> : null}
        {items.map((item, index) => <MediaResourceCard item={item} key={`${payloadText(item, "title")}-${index}`} />)}
        {!src && !items.length ? <MarkdownBlock content={block.content} /> : null}
      </div>
    </div>
  );
}

export function MediaResourceCard({ item }: { item: Record<string, unknown> }) {
  const title = payloadText(item, "title") || payloadText(item, "label") || "자료";
  const description = payloadText(item, "description") || payloadText(item, "subtitle");
  const youtube = payloadText(item, "youtube") || payloadText(item, "youtubeId");
  const url = payloadText(item, "url") || payloadText(item, "href") || payloadText(item, "src") || youtubeUrl(youtube);
  const thumb = youtube ? `https://img.youtube.com/vi/${youtube}/hqdefault.jpg` : "";

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border">
      {thumb ? (
        <div className="relative aspect-video bg-muted/30">
          <img alt="" className="size-full object-cover" src={thumb} />
          <div className="absolute inset-0 grid place-items-center bg-black/20">
            <span className="grid size-10 place-items-center rounded-full bg-background/90 text-foreground">
              <PlayCircle className="size-5" />
            </span>
          </div>
        </div>
      ) : (
        <div className="flex aspect-video items-center justify-center bg-muted/30 text-muted-foreground">
          <PlayCircle className="size-8" />
        </div>
      )}
      <div className="p-3">
        <div className="truncate text-sm font-medium text-foreground">{stripMarkdown(title)}</div>
        {description ? <div className="mt-1 text-xs leading-5 text-muted-foreground">{stripMarkdown(description)}</div> : null}
        {url ? <InlineLink label="자료 열기" url={url} /> : null}
      </div>
    </div>
  );
}

export function VisualAsset({ src, title }: { src: string; title: string }) {
  if (isRenderableImageSrc(src)) {
    return (
      <div className="overflow-hidden rounded-lg border">
        <img alt={title} className="max-h-96 w-full object-contain" src={resolveAssetSrc(src)} />
      </div>
    );
  }

  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(src)) {
    return (
      <div className="overflow-hidden rounded-lg border">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video className="max-h-96 w-full" controls preload="metadata" src={resolveAssetSrc(src)} />
      </div>
    );
  }

  const youtubeId = extractYoutubeId(src);
  if (youtubeId) {
    return (
      <div className="overflow-hidden rounded-lg border">
        <iframe
          allow="encrypted-media; picture-in-picture"
          className="aspect-video w-full"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
          title={title || "YouTube"}
        />
      </div>
    );
  }

  const Icon = /\.(mp4|webm|mov)/i.test(src) ? MonitorPlay : ImageIcon;
  return (
    <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">자료</div>
        <div className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{src}</div>
      </div>
    </div>
  );
}

export function extractYoutubeId(src: string) {
  if (!src) return "";
  const match = src.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube-nocookie\.com\/embed\/)([A-Za-z0-9_-]{11})/,
  );
  if (match) return match[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(src)) return src;
  return "";
}

export function isRenderableImageSrc(src: string) {
  return (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) && /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(src);
}

export function resolveAssetSrc(src: string) {
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src;
  return `/${src.replace(/^\.?\//, "")}`;
}

export function youtubeUrl(id: string) {
  if (!id) return "";
  if (id.startsWith("http://") || id.startsWith("https://")) return id;
  return `https://www.youtube.com/watch?v=${id}`;
}
