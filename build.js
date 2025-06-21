const esbuild = require('esbuild');
   const postcss = require('postcss');
   const tailwindcss = require('tailwindcss');
   const autoprefixer = require('autoprefixer');
   const fs = require('fs').promises;
   const path = require('path');

   async function build() {
     try {
       // Ensure docs directory exists
       await fs.mkdir('./docs', { recursive: true });

       // Process Tailwind CSS
       const css = `
         @tailwind base;
         @tailwind components;
         @tailwind utilities;
       `;
       const result = await postcss([tailwindcss, autoprefixer]).process(css, {
         from: undefined,
         to: './docs/tailwind.css',
       });

       // Write processed CSS
       await fs.writeFile('./docs/tailwind.css', result.css, 'utf8');
       console.log('Generated tailwind.css');

       // Copy index.html and styles.css
       await fs.copyFile('./docs/index.html', './docs/index.html');
       await fs.copyFile('./docs/styles.css', './docs/styles.css');
       console.log('Copied index.html and styles.css');

       console.log('Build completed successfully.');
     } catch (err) {
       console.error('Build failed:', err.message, err.stack);
       process.exit(1);
     }
   }

   build();