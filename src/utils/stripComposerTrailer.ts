/** Remove Composer protocol lines that were accidentally embedded in source text. */
const COMPOSER_TRAILER_LINE = /^\s*(?:SUMMARY|DEPENDENCIES|INTENTS|ROUTE_OPS):\s*.*$/;

export function stripComposerTrailer(source: string): string {
  const lines = source.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    if (!COMPOSER_TRAILER_LINE.test(lines[index])) continue;
    const trailer = lines.slice(index);
    if (trailer.every((line) => !line.trim() || COMPOSER_TRAILER_LINE.test(line))) {
      return lines.slice(0, index).join('\n').trimEnd();
    }
  }
  return source;
}
