// The interview folder minus the mod's own control files: rollback acts on what they say.
export function isWriteAllowed(real: string, dir: string, journaled: readonly string[]): boolean {
  const isControl =
    real === `${dir}/journal.json` ||
    real === `${dir}/originals` ||
    real.startsWith(`${dir}/originals/`);

  return (real.startsWith(`${dir}/`) && !isControl) || journaled.includes(real);
}
