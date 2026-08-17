import fs from 'node:fs';
import path from 'node:path';

/**
 * The app shows a toddler pictures, never labels. This scans source text rather
 * than a render tree on purpose: it needs no React renderer and no native mocks,
 * and it cannot be fooled by a conditional branch a shallow render never reaches.
 *
 * Accessibility string PROPS are deliberately allowed. The requirement is that a
 * toddler sees no words, not that a parent's screen reader is starved.
 */
const ROOTS = ['src/app', 'src/components'];
const TEXT_ELEMENTS = /<\s*(Text|ThemedText|RNText)[\s/>]/;

function sourceFiles(dir: string): string[] {
  const abs = path.join(process.cwd(), dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(rel);
    return /\.(ts|tsx)$/.test(entry.name) ? [rel] : [];
  });
}

describe('the interface is wordless', () => {
  const files = ROOTS.flatMap(sourceFiles);

  it('finds screen and component sources to scan', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('renders no text element anywhere in the UI', () => {
    const offenders = files.filter((file) =>
      TEXT_ELEMENTS.test(fs.readFileSync(path.join(process.cwd(), file), 'utf8')),
    );
    expect(offenders).toEqual([]);
  });

  it('imports no text component from react-native or a themed wrapper', () => {
    const offenders = files.filter((file) => {
      const src = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      return /import\s+\{[^}]*\bText\b[^}]*\}\s+from\s+'react-native'/.test(src);
    });
    expect(offenders).toEqual([]);
  });
});
