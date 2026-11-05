import type { EngineInterface } from 'claude-code';

// The real path a write lands on: the file's if it exists, else its nearest existing folder's real
// path plus the rest; undefined when the path is relative or the rest climbs with "..".
export async function queryRealPath($: EngineInterface, path: string): Promise<string | undefined> {
  if (!path.startsWith('/')) {
    return undefined;
  }

  const parts = path.split('/');
  const rest: string[] = [];

  while (parts.length > 1) {
    const stat = await $.fs.stat(parts.join('/') || '/', { resolve: true }).catch(() => undefined);

    if (stat?.realPath !== undefined) {
      if (rest.includes('..')) {
        return undefined;
      }

      return [stat.realPath.replace(/\/$/, ''), ...rest].join('/');
    }

    rest.unshift(parts.pop() ?? '');
  }

  return undefined;
}
