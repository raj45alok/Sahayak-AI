// fix-imports.js
// Run with: node fix-imports.js

const fs = require('fs');
const path = require('path');

// Mapping of incorrect imports to correct ones
const importFixes = {
  "'lucide-react@0.487.0'": "'lucide-react'",
  '"lucide-react@0.487.0"': '"lucide-react"',
  "'sonner@2.0.3'": "'sonner'",
  '"sonner@2.0.3"': '"sonner"',
  "'@radix-ui/react-accordion@1.2.3'": "'@radix-ui/react-accordion'",
  '"@radix-ui/react-accordion@1.2.3"': '"@radix-ui/react-accordion"',
  "'@radix-ui/react-alert-dialog@1.1.6'": "'@radix-ui/react-alert-dialog'",
  '"@radix-ui/react-alert-dialog@1.1.6"': '"@radix-ui/react-alert-dialog"',
  "'class-variance-authority@0.7.1'": "'class-variance-authority'",
  '"class-variance-authority@0.7.1"': '"class-variance-authority"',
  "'@radix-ui/react-aspect-ratio@1.1.2'": "'@radix-ui/react-aspect-ratio'",
  '"@radix-ui/react-aspect-ratio@1.1.2"': '"@radix-ui/react-aspect-ratio"',
  "'@radix-ui/react-avatar@1.1.3'": "'@radix-ui/react-avatar'",
  '"@radix-ui/react-avatar@1.1.3"': '"@radix-ui/react-avatar"',
  "'@radix-ui/react-slot@1.1.2'": "'@radix-ui/react-slot'",
  '"@radix-ui/react-slot@1.1.2"': '"@radix-ui/react-slot"',
  "'@radix-ui/react-checkbox@1.1.4'": "'@radix-ui/react-checkbox'",
  '"@radix-ui/react-checkbox@1.1.4"': '"@radix-ui/react-checkbox"',
  "'@radix-ui/react-collapsible@1.1.3'": "'@radix-ui/react-collapsible'",
  '"@radix-ui/react-collapsible@1.1.3"': '"@radix-ui/react-collapsible"',
  "'cmdk@1.1.1'": "'cmdk'",
  '"cmdk@1.1.1"': '"cmdk"',
  "'@radix-ui/react-context-menu@2.2.6'": "'@radix-ui/react-context-menu'",
  '"@radix-ui/react-context-menu@2.2.6"': '"@radix-ui/react-context-menu"',
  "'@radix-ui/react-dialog@1.1.6'": "'@radix-ui/react-dialog'",
  '"@radix-ui/react-dialog@1.1.6"': '"@radix-ui/react-dialog"',
  "'vaul@1.1.2'": "'vaul'",
  '"vaul@1.1.2"': '"vaul"',
  "'@radix-ui/react-dropdown-menu@2.1.6'": "'@radix-ui/react-dropdown-menu'",
  '"@radix-ui/react-dropdown-menu@2.1.6"': '"@radix-ui/react-dropdown-menu"',
  "'@radix-ui/react-label@2.1.2'": "'@radix-ui/react-label'",
  '"@radix-ui/react-label@2.1.2"': '"@radix-ui/react-label"',
  "'react-hook-form@7.55.0'": "'react-hook-form'",
  '"react-hook-form@7.55.0"': '"react-hook-form"',
  "'@radix-ui/react-hover-card@1.1.6'": "'@radix-ui/react-hover-card'",
  '"@radix-ui/react-hover-card@1.1.6"': '"@radix-ui/react-hover-card"',
  "'input-otp@1.4.2'": "'input-otp'",
  '"input-otp@1.4.2"': '"input-otp"',
  "'@radix-ui/react-menubar@1.1.6'": "'@radix-ui/react-menubar'",
  '"@radix-ui/react-menubar@1.1.6"': '"@radix-ui/react-menubar"',
  "'@radix-ui/react-navigation-menu@1.2.5'": "'@radix-ui/react-navigation-menu'",
  '"@radix-ui/react-navigation-menu@1.2.5"': '"@radix-ui/react-navigation-menu"',
  "'@radix-ui/react-popover@1.1.6'": "'@radix-ui/react-popover'",
  '"@radix-ui/react-popover@1.1.6"': '"@radix-ui/react-popover"',
  "'@radix-ui/react-progress@1.1.2'": "'@radix-ui/react-progress'",
  '"@radix-ui/react-progress@1.1.2"': '"@radix-ui/react-progress"',
  "'@radix-ui/react-radio-group@1.2.3'": "'@radix-ui/react-radio-group'",
  '"@radix-ui/react-radio-group@1.2.3"': '"@radix-ui/react-radio-group"',
  "'react-resizable-panels@2.1.7'": "'react-resizable-panels'",
  '"react-resizable-panels@2.1.7"': '"react-resizable-panels"',
  "'@radix-ui/react-scroll-area@1.2.3'": "'@radix-ui/react-scroll-area'",
  '"@radix-ui/react-scroll-area@1.2.3"': '"@radix-ui/react-scroll-area"',
  "'@radix-ui/react-select@2.1.6'": "'@radix-ui/react-select'",
  '"@radix-ui/react-select@2.1.6"': '"@radix-ui/react-select"',
  "'@radix-ui/react-separator@1.1.2'": "'@radix-ui/react-separator'",
  '"@radix-ui/react-separator@1.1.2"': '"@radix-ui/react-separator"',
  "'@radix-ui/react-slider@1.2.3'": "'@radix-ui/react-slider'",
  '"@radix-ui/react-slider@1.2.3"': '"@radix-ui/react-slider"',
  "'next-themes@0.4.6'": "'next-themes'",
  '"next-themes@0.4.6"': '"next-themes"',
  "'@radix-ui/react-switch@1.1.3'": "'@radix-ui/react-switch'",
  '"@radix-ui/react-switch@1.1.3"': '"@radix-ui/react-switch"',
  "'@radix-ui/react-tabs@1.1.3'": "'@radix-ui/react-tabs'",
  '"@radix-ui/react-tabs@1.1.3"': '"@radix-ui/react-tabs"',
  "'@radix-ui/react-toggle-group@1.1.2'": "'@radix-ui/react-toggle-group'",
  '"@radix-ui/react-toggle-group@1.1.2"': '"@radix-ui/react-toggle-group"',
  "'@radix-ui/react-toggle@1.1.2'": "'@radix-ui/react-toggle'",
  '"@radix-ui/react-toggle@1.1.2"': '"@radix-ui/react-toggle"',
  "'@radix-ui/react-tooltip@1.1.8'": "'@radix-ui/react-tooltip'",
  '"@radix-ui/react-tooltip@1.1.8"': '"@radix-ui/react-tooltip"',
  "'react-day-picker@8.10.1'": "'react-day-picker'",
  '"react-day-picker@8.10.1"': '"react-day-picker"',
  "'embla-carousel-react@8.6.0'": "'embla-carousel-react'",
  '"embla-carousel-react@8.6.0"': '"embla-carousel-react"',
  "'recharts@2.15.2'": "'recharts'",
  '"recharts@2.15.2"': '"recharts"',
  // Fix figma imports
  "from 'figma:asset/": "from './assets/",
  'from "figma:asset/': 'from "./assets/',
  "'../src/assets/ee34849bbf5032b758a6d0077d24954519944451.png'": "'../../assets/sahayak-logo.png'",
  '"../src/assets/ee34849bbf5032b758a6d0077d24954519944451.png"': '"../../assets/sahayak-logo.png"'
};

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const [wrong, correct] of Object.entries(importFixes)) {
      if (content.includes(wrong)) {
        content = content.replaceAll(wrong, correct);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'build' && file !== 'dist') {
        walkDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      fixImportsInFile(filePath);
    }
  }
}

console.log('Starting import fixes...\n');
walkDirectory('./src');
console.log('\n✓ All imports fixed!');