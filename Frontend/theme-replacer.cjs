const fs = require('fs');
const path = require('path');

const targetDir = 'c:\\Users\\Aniket\\OneDrive\\Desktop\\Coding\\PlacementPortal\\Placement-Portal\\Frontend\\src\\pages';

function replaceColorsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let original = content;

  // Dark mode backgrounds
  content = content.replace(/dark:bg-slate-950/g, 'dark:bg-[#1A0F08]');
  content = content.replace(/dark:bg-slate-900/g, 'dark:bg-[#1A0F08]');
  content = content.replace(/dark:from-slate-900/g, 'dark:from-[#1A0F08]');
  content = content.replace(/dark:to-slate-900/g, 'dark:to-[#1A0F08]');
  content = content.replace(/dark:via-slate-900/g, 'dark:via-[#1A0F08]');
  content = content.replace(/dark:bg-slate-800\/50/g, 'dark:bg-[#2A1810]/50');
  content = content.replace(/dark:bg-slate-800/g, 'dark:bg-[#2A1810]');
  content = content.replace(/dark:to-slate-800/g, 'dark:to-[#2A1810]');

  // Dark mode texts
  content = content.replace(/dark:text-slate-200/g, 'dark:text-brand-beige-200');
  content = content.replace(/dark:text-slate-300/g, 'dark:text-brand-beige-300');
  content = content.replace(/dark:text-slate-400/g, 'dark:text-brand-beige-400');
  content = content.replace(/dark:text-slate-500/g, 'dark:text-brand-beige-500');

  // Dark mode borders
  content = content.replace(/dark:border-slate-800/g, 'dark:border-[#3E2315]');
  content = content.replace(/dark:border-slate-700/g, 'dark:border-[#5A3D2B]');
  content = content.replace(/dark:border-slate-600/g, 'dark:border-[#7A543A]');
  
  // Indigo / Blue to Amber
  content = content.replace(/indigo-50/g, 'brand-amber-500/10');
  content = content.replace(/indigo-100/g, 'brand-amber-500/20');
  content = content.replace(/indigo-200/g, 'brand-amber-500/30');
  content = content.replace(/indigo-300/g, 'brand-amber-500/40');
  content = content.replace(/indigo-400/g, 'brand-amber-500');
  content = content.replace(/indigo-500/g, 'brand-amber-500');
  content = content.replace(/indigo-600/g, 'brand-amber-500');
  content = content.replace(/indigo-700/g, 'brand-amber-600');
  content = content.replace(/indigo-800/g, 'brand-amber-700');
  content = content.replace(/indigo-900/g, 'brand-amber-800');
  content = content.replace(/indigo-950/g, 'brand-amber-900');

  content = content.replace(/blue-50/g, 'brand-amber-500/10');
  content = content.replace(/blue-100/g, 'brand-amber-500/20');
  content = content.replace(/blue-500/g, 'brand-amber-500');
  content = content.replace(/blue-600/g, 'brand-amber-500');
  content = content.replace(/blue-700/g, 'brand-amber-600');

  // Slate matching
  content = content.replace(/slate-50/g, 'brand-cream-50');
  content = content.replace(/slate-100/g, 'brand-beige-100');
  content = content.replace(/slate-200/g, 'brand-beige-200');
  content = content.replace(/slate-300/g, 'brand-beige-300');
  content = content.replace(/slate-400/g, 'brand-brown-400');
  content = content.replace(/slate-500/g, 'brand-brown-500');
  content = content.replace(/slate-600/g, 'brand-brown-600');
  content = content.replace(/slate-700/g, 'brand-brown-700');
  content = content.replace(/slate-800/g, 'brand-brown-800');
  content = content.replace(/slate-900/g, 'brand-brown-900');
  content = content.replace(/slate-950/g, 'brand-brown-950');

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      replaceColorsInFile(fullPath);
    }
  }
}

walkDir(targetDir);
console.log('✅ Done replacing colors in pages directory.');
