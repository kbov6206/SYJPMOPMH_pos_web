const esbuild = require('esbuild');
   const postcss = require('postcss');
   const tailwindcss = require('tailwindcss');
   const autoprefixer = require('autoprefixer');
   const fs = require('fs').promises;

   async function build() {
     // Process Tailwind CSS
     const css = `
       @tailwind base;
       @tailwind components;
       @tailwind utilities;
     `;
     const result = await postcss([tailwindcss, autoprefixer]).process(css, {
       from: undefined,
     });

     // Write processed CSS to docs/
     await fs.mkdir('./docs', { recursive: true });
     await fs.writeFile('./docs/tailwind.css', result.css);

     // Copy other files
     await fs.copyFile('./docs/index.html', './docs/index.html');
     await fs.copyFile('./docs/styles.css', './docs/styles.css');

     console.log('Build completed successfully.');
   }

   build().catch(err => {
     console.error('Build failed:', err);
     process.exit(1);
   });