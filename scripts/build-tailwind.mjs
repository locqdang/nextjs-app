import fs from 'fs/promises';
import postcss from 'postcss';
import tailwind from 'tailwindcss';

const input = './src/styles/globals.css';
const output = './public/styles.css';

try {
  const css = await fs.readFile(input, 'utf8');
  const processor = postcss([tailwind('./tailwind.config.js')]);
  const result = await processor.process(css, { from: input, to: output });

  await fs.mkdir('./public', { recursive: true });
  await fs.writeFile(output, result.css, 'utf8');
  if (result.map) await fs.writeFile(output + '.map', result.map.toString(), 'utf8');

  console.log('Wrote', output);
} catch (err) {
  console.error('Error building Tailwind CSS:', err);
  process.exit(1);
}
