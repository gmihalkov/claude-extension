// The non-blank lines of command output.
export function lines(text: string): string[] {
  return text.split('\n').filter((line) => line.trim() !== '');
}
