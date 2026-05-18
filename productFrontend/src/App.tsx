import {
  BookOpen,
  Braces,
  CheckCircle2,
  ChevronRight,
  FileCode2,
  GraduationCap,
  PanelLeft,
  Play,
  Save,
  Search,
  Settings2,
  Sparkles,
  TerminalSquare,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const files = ["main.py", "lesson_01.py", "notes.md", "report.py"];

const lessonSteps = [
  { label: "Read the goal", state: "done" },
  { label: "Predict the output", state: "active" },
  { label: "Run the cell", state: "idle" },
  { label: "Fix one bug", state: "idle" },
];

function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-[264px_1fr]">
        <aside className="flex min-h-screen flex-col border-r bg-sidebar">
          <div className="flex h-14 items-center gap-3 px-4">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Braces className="size-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">Codaro Studio</div>
              <div className="truncate text-xs text-muted-foreground">Editor and learning runtime</div>
            </div>
          </div>
          <Separator />
          <nav className="flex-1 space-y-1 p-3">
            <Button className="w-full justify-start" variant="secondary">
              <FileCode2 />
              Workspace
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <GraduationCap />
              Learning path
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <TerminalSquare />
              Runtime
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <Sparkles />
              Teacher
            </Button>
          </nav>
          <div className="border-t p-3">
            <Button className="w-full justify-start" variant="ghost">
              <Settings2 />
              Settings
            </Button>
          </div>
        </aside>

        <section className="grid min-h-screen grid-rows-[56px_1fr]">
          <header className="flex items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" aria-label="Toggle sidebar">
                <PanelLeft />
              </Button>
              <div className="h-7 w-px bg-border" />
              <div>
                <div className="text-sm font-semibold">Python Basics / Day 01</div>
                <div className="text-xs text-muted-foreground">main.py · saved 2 minutes ago</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Search />
                Command
              </Button>
              <Button variant="outline">
                <Save />
                Save
              </Button>
              <Button>
                <Play />
                Run
              </Button>
            </div>
          </header>

          <Tabs defaultValue="editor" className="min-h-0">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <TabsList>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="learning">Learning</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Reactive</Badge>
                <Badge variant="outline">Pyodide first</Badge>
              </div>
            </div>

            <TabsContent value="editor" className="min-h-0 flex-1">
              <div className="grid h-[calc(100vh-106px)] grid-cols-[220px_minmax(0,1fr)_320px]">
                <FileRail />
                <EditorCanvas />
                <RuntimePanel />
              </div>
            </TabsContent>

            <TabsContent value="learning" className="min-h-0 flex-1">
              <div className="grid h-[calc(100vh-106px)] grid-cols-[minmax(0,1fr)_360px]">
                <LearningCanvas />
                <LearningPanel />
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </main>
  );
}

function FileRail() {
  return (
    <aside className="border-r bg-muted/20 p-3">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Files</div>
      <div className="space-y-1">
        {files.map((file) => (
          <button
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-accent"
            key={file}
            type="button"
          >
            <FileCode2 className="size-4 text-muted-foreground" />
            <span className="truncate">{file}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function EditorCanvas() {
  return (
    <section className="min-w-0 overflow-auto bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Cell 1</CardTitle>
              <CardDescription>Start with a small, runnable idea.</CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Play />
              Run cell
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-md border bg-code p-4 font-mono text-sm leading-6 text-code-foreground">
              <code>{'name = "Codaro"\nmessage = f"Hello, {name}"\nprint(message)'}</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>Execution results stay directly under the cell that produced them.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-mono text-sm text-emerald-200">
              Hello, Codaro
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function RuntimePanel() {
  return (
    <aside className="border-l bg-muted/20 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Runtime</div>
          <div className="text-xs text-muted-foreground">Dependency-aware execution</div>
        </div>
        <Badge variant="secondary">Ready</Badge>
      </div>
      <div className="space-y-3">
        {["Variables", "Packages", "Logs"].map((item) => (
          <div className="rounded-md border bg-card p-3" key={item}>
            <div className="flex items-center justify-between text-sm">
              <span>{item}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function LearningCanvas() {
  return (
    <section className="overflow-auto p-5">
      <div className="mx-auto max-w-3xl space-y-4">
        <div>
          <Badge variant="outline">Day 01</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal">Make your first value visible</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Write one clear value, run it, and connect the visible result back to the code that produced it.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Practice cell</CardTitle>
            <CardDescription>Change the name, predict the result, then run the cell.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-md border bg-code p-4 font-mono text-sm leading-6 text-code-foreground">
              <code>{'learner = "Codaro"\nprint("Hello,", learner)'}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function LearningPanel() {
  return (
    <aside className="border-l bg-muted/20 p-4">
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <BookOpen className="size-4" />
          Learning flow
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">One concept, one prediction, one visible result.</p>
      </div>
      <div className="space-y-2">
        {lessonSteps.map((step) => (
          <div className="flex items-center gap-3 rounded-md border bg-card p-3" key={step.label}>
            <CheckCircle2 className={step.state === "done" ? "size-4 text-emerald-400" : "size-4 text-muted-foreground"} />
            <span className="text-sm">{step.label}</span>
            {step.state === "active" ? (
              <Badge className="ml-auto" variant="secondary">
                Now
              </Badge>
            ) : null}
          </div>
        ))}
      </div>
    </aside>
  );
}

export default App;
