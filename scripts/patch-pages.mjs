import fs from 'fs';
import path from 'path';

const filesToPatch = [
  'AIOverviews.tsx',
  'ClassicSEO.tsx',
  'CoreUpdates.tsx',
  'GenerativeEngine.tsx',
  'GmbTools.tsx',
  'PageSpeedTest.tsx'
];

const dir = path.join(process.cwd(), 'src/pages');

for (const file of filesToPatch) {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');

  // 1. Add import
  if (!content.includes('@storyblok/react')) {
    content = content.replace(
      /(import .* from ["']lucide-react["'];?\r?\n)/,
      `$1import { storyblokEditable } from "@storyblok/react";\n`
    );
  }

  // 2. Change signature
  const componentName = file.replace('.tsx', '');
  const regex = new RegExp(`export default function ${componentName}\\(\\) {`);
  content = content.replace(regex, `export default function ${componentName}({ content }: { content?: any }) {`);

  // 3. Find the main return div and wrap it. This is usually after `return (`
  const returnRegex = /(return\s*\(\s*<div)( className=")/;
  content = content.replace(returnRegex, `$1 {...(content ? storyblokEditable(content) : {})}$2`);

  // 4. Find h1 and p. 
  // We'll just replace the inner text with {content?.headline || "Original Text"}
  const h1Regex = /(<h1[^>]*>)\s*(.+?)\s*(<\/h1>)/;
  const h1Match = content.match(h1Regex);
  if (h1Match && !h1Match[2].includes('content?.headline')) {
    content = content.replace(h1Regex, `$1\n            {content?.headline || "${h1Match[2].trim()}"}\n          $3`);
  }

  const pRegex = /(<p[^>]*>)\s*(.+?)\s*(<\/p>)/;
  // GmbTools and others have multiple <p>s. The first <p> after <h1> is usually the description.
  // Let's do a simple replace by finding the first <p> after the <h1>
  const pMatch = content.substring(content.indexOf('</h1')).match(/(<p[^>]*>)\s*([\s\S]+?)\s*(<\/p>)/);
  if (pMatch && !pMatch[2].includes('content?.description')) {
    const originalText = pMatch[2].trim().replace(/\s+/g, ' ').replace(/"/g, '\\"');
    const pStringToReplace = pMatch[0];
    content = content.replace(pStringToReplace, `${pMatch[1]}\n            {content?.description || "${originalText}"}\n          ${pMatch[3]}`);
  }

  // Add whitespace-pre-line to h1 and p classes if missing
  content = content.replace(/(<h1[^>]*className="[^"]+)(")/, `$1 whitespace-pre-line"`);
  content = content.replace(/(<p[^>]*className="[^"]+)(")/, `$1 whitespace-pre-line"`);

  fs.writeFileSync(filepath, content);
  console.log(`Patched ${file}`);
}
