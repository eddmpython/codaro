export type TerminalLaunchIntent = {
  command: string;
  id: number;
  submit?: boolean;
};

export function terminalLaunchInput(intent: TerminalLaunchIntent): string {
  if (!intent.submit) return intent.command;
  if (intent.command.endsWith("\r") || intent.command.endsWith("\n")) return intent.command;
  return `${intent.command}\r`;
}
