const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const potrace = require('potrace');

const src = path.resolve(
  __dirname,
  '../../../.cursor/projects/c-Users-WellDone-Videos-test-main/assets/c__Users_WellDone_AppData_Roaming_Cursor_User_workspaceStorage_07f6566ceb6889f61fcf064567d1ad96_images_Anastelle_Immo_logo_v2-80aa7770-1d96-41f1-9f9b-c67045d30e3d.png'
);
const outSvg = path.resolve(__dirname, '../public/logo-anastelle-immo.svg');
const tmpPng = path.resolve(__dirname, '../public/.logo-trace-input.png');
const LOGO_COLOR = '#C8B89A';

async function buildTraceMask() {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const mask = Buffer.alloc(width * height);

  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    const max = Math.max(data[o], data[o + 1], data[o + 2]);
    mask[i] = max > 42 ? 0 : 255;
  }

  await sharp(mask, { raw: { width, height, channels: 1 } }).png().toFile(tmpPng);
  return { width, height };
}

function traceToSvg(inputPath) {
  return new Promise((resolve, reject) => {
    potrace.trace(
      inputPath,
      {
        color: LOGO_COLOR,
        background: 'transparent',
        turdSize: 2,
        optTolerance: 0.2,
      },
      (err, svg) => {
        if (err) reject(err);
        else resolve(svg);
      }
    );
  });
}

function normalizeSvg(svg, width, height) {
  return svg
    .replace(/<\?xml[^>]*\?>\s*/i, '')
    .replace(
      /<svg([^>]*)>/i,
      `<svg$1 xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Anastelle Immo" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">`
    )
    .replace(/fill="#000000"/gi, `fill="${LOGO_COLOR}"`)
    .replace(/fill="#000"/gi, `fill="${LOGO_COLOR}"`)
    .replace(/<rect[^>]*width="100%"[^>]*height="100%"[^>]*fill="white"[^>]*\/?>/gi, '');
}

async function main() {
  if (!fs.existsSync(src)) {
    throw new Error(`Source logo not found: ${src}`);
  }

  const { width, height } = await buildTraceMask();
  const rawSvg = await traceToSvg(tmpPng);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n${normalizeSvg(rawSvg, width, height)}`;

  fs.writeFileSync(outSvg, svg, 'utf8');
  fs.unlinkSync(tmpPng);

  console.log('SVG created:', outSvg);
  console.log('Dimensions:', `${width}x${height}`);
  console.log('Size bytes:', fs.statSync(outSvg).size);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
