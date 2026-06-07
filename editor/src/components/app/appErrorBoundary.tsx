import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

// 최후의 방어선 — 렌더 트리 어디서든 throw 가 올라와도 백스크린 대신 복구 안내를 보여준다.
// LocaleProvider 바깥에서 동작하므로 한국어 고정 문구를 쓴다(기본 UI 언어).
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Codaro UI 렌더 오류", error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="grid min-h-svh place-items-center bg-background px-6 text-center">
          <div className="max-w-md space-y-3">
            <div className="text-lg font-semibold">화면을 표시하는 중 문제가 발생했어요</div>
            <p className="text-sm leading-6 text-muted-foreground">
              일시적인 오류일 수 있어요. 새로고침하면 대부분 복구됩니다. 작업 내용은 자동 저장된 항목을 제외하고 사라질 수 있습니다.
            </p>
            <pre className="max-h-40 overflow-auto rounded-md bg-muted/40 px-3 py-2 text-left font-mono text-xs leading-5 text-muted-foreground">
              {this.state.error.message}
            </pre>
            <button
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              type="button"
              onClick={() => window.location.reload()}
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
