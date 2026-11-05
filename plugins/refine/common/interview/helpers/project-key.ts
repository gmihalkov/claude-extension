export function projectKey(root: string): string {
  return root.replaceAll('/', '-');
}
