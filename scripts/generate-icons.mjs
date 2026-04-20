#!/usr/bin/env node
/* Generate simple BondGame PWA icons (192, 512, 512-maskable) as PNGs using pure Node. */
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";
import path from "node:path";

const outDir = path.resolve(process.cwd(), "public/icons");
mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c;
  const tab = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    tab[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (tab[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)) >>> 0;
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width, height, rgba) {
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Filter byte + row
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // no filter
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw);

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function renderIcon(size, { padding = 0.16, ringColor = "#0F0F0E", bgColor = "#D8FF3D", innerColor = "#1A1F00" } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const bg = hexToRgb(bgColor);
  const ring = hexToRgb(ringColor);
  const inner = hexToRgb(innerColor);
  const cx = size / 2;
  const cy = size / 2;
  const corner = size * 0.22; // rounded corner radius
  const pad = size * padding;
  const ringR = size * 0.32;
  const ringW = size * 0.07;
  const dotR = size * 0.07;
  const dotDx = size * 0.13;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // rounded square mask
      const rx = Math.max(0, Math.max(pad - x, x - (size - pad)));
      const ry = Math.max(0, Math.max(pad - y, y - (size - pad)));
      const outside = (rx > 0 && ry > 0) ? Math.sqrt(rx * rx + ry * ry) > corner : false;
      if (x < pad - corner || x > size - pad + corner || y < pad - corner || y > size - pad + corner || outside) {
        // transparent for non-maskable; white for maskable handled below
        rgba[i] = 244; rgba[i+1] = 242; rgba[i+2] = 236; rgba[i+3] = 0;
        continue;
      }
      // default: lime bg
      let R = bg.r, G = bg.g, B = bg.b;

      // ring
      const dx = x - cx, dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < ringR && d > ringR - ringW) {
        R = ring.r; G = ring.g; B = ring.b;
      }
      // two dot eyes
      const eyeY = cy - size * 0.02;
      const dxL = x - (cx - dotDx), dyL = y - eyeY;
      const dxR = x - (cx + dotDx), dyR = y - eyeY;
      if (dxL * dxL + dyL * dyL < dotR * dotR) { R = inner.r; G = inner.g; B = inner.b; }
      if (dxR * dxR + dyR * dyR < dotR * dotR) { R = inner.r; G = inner.g; B = inner.b; }

      rgba[i] = R; rgba[i+1] = G; rgba[i+2] = B; rgba[i+3] = 255;
    }
  }
  return rgba;
}

function renderMaskable(size) {
  // Full-bleed lime bg, smaller inner motif so OS can crop safely
  const rgba = Buffer.alloc(size * size * 4);
  const bg = hexToRgb("#D8FF3D");
  const ring = hexToRgb("#0F0F0E");
  const inner = hexToRgb("#1A1F00");
  const cx = size / 2;
  const cy = size / 2;
  const ringR = size * 0.22;
  const ringW = size * 0.05;
  const dotR = size * 0.05;
  const dotDx = size * 0.09;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let R = bg.r, G = bg.g, B = bg.b;
      const dx = x - cx, dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < ringR && d > ringR - ringW) {
        R = ring.r; G = ring.g; B = ring.b;
      }
      const dxL = x - (cx - dotDx), dyL = y - cy;
      const dxR = x - (cx + dotDx), dyR = y - cy;
      if (dxL * dxL + dyL * dyL < dotR * dotR) { R = inner.r; G = inner.g; B = inner.b; }
      if (dxR * dxR + dyR * dyR < dotR * dotR) { R = inner.r; G = inner.g; B = inner.b; }

      rgba[i] = R; rgba[i+1] = G; rgba[i+2] = B; rgba[i+3] = 255;
    }
  }
  return rgba;
}

function save(name, size, rgba) {
  const buf = encodePng(size, size, rgba);
  writeFileSync(path.join(outDir, name), buf);
  console.log(`✓ ${name} (${size}x${size}) — ${buf.length} bytes`);
}

save("icon-192.png", 192, renderIcon(192));
save("icon-512.png", 512, renderIcon(512));
save("icon-maskable.png", 512, renderMaskable(512));
