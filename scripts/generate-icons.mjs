// Generate opaque PWA icons from the supplied RGBA pixel art, with integer nearest-neighbor scaling.
import { Buffer } from "node:buffer";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { deflateSync, inflateSync } from "node:zlib";
import { URL } from "node:url";
const folder = new URL("../public/icons/", import.meta.url);
mkdirSync(folder, { recursive: true });
function crc(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) {
    c ^= b;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type),
    length = Buffer.alloc(4),
    checksum = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  checksum.writeUInt32BE(crc(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}
// The source exported by Aseprite is an 8-bit RGBA, non-interlaced PNG.
// Decode its standard PNG row filters using built-ins; no asset dependency needed.
const source = readFileSync(new URL("tree-logo.png", folder));
if (
  !source
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
  source[24] !== 8 ||
  source[25] !== 6 ||
  source[28] !== 0
)
  throw new Error(
    "Exporte tree-logo.png como PNG RGBA 8 bits sem entrelaçamento.",
  );
const width = source.readUInt32BE(16),
  height = source.readUInt32BE(20);
const chunks = [];
for (let p = 8; p < source.length; ) {
  const length = source.readUInt32BE(p);
  if (source.toString("ascii", p + 4, p + 8) === "IDAT")
    chunks.push(source.subarray(p + 8, p + 8 + length));
  p += length + 12;
}
const raw = inflateSync(Buffer.concat(chunks)),
  stride = width * 4;
if (raw.length !== (stride + 1) * height)
  throw new Error("Dimensões PNG inválidas.");
const rgba = Buffer.alloc(stride * height);
function paeth(a, b, c) {
  const p = a + b - c,
    da = Math.abs(p - a),
    db = Math.abs(p - b),
    dc = Math.abs(p - c);
  return da <= db && da <= dc ? a : db <= dc ? b : c;
}
for (let y = 0; y < height; y++) {
  const filter = raw[y * (stride + 1)];
  if (filter > 4) throw new Error("Filtro PNG inválido.");
  for (let x = 0; x < stride; x++) {
    const i = y * stride + x,
      left = x >= 4 ? rgba[i - 4] : 0,
      up = y ? rgba[i - stride] : 0,
      corner = y && x >= 4 ? rgba[i - stride - 4] : 0;
    const prediction = [
      0,
      left,
      up,
      Math.floor((left + up) / 2),
      paeth(left, up, corner),
    ][filter];
    rgba[i] = (raw[y * (stride + 1) + 1 + x] + prediction) & 255;
  }
}
for (const [name, size] of [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  const pixels = Buffer.alloc((size * 4 + 1) * size);
  const scale = Math.max(
    1,
    Math.floor((size * 0.65) / Math.max(width, height)),
  );
  const offsetX = Math.floor((size - width * scale) / 2),
    offsetY = Math.floor((size - height * scale) / 2);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const sx = Math.floor((x - offsetX) / scale),
        sy = Math.floor((y - offsetY) / scale);
      const within = sx >= 0 && sx < width && sy >= 0 && sy < height;
      const src = (sy * width + sx) * 4,
        alpha = within ? rgba[src + 3] / 255 : 0;
      const i = y * (size * 4 + 1) + 1 + x * 4;
      [16, 19, 27].forEach((background, channel) => {
        pixels[i + channel] = Math.round(
          background * (1 - alpha) + (within ? rgba[src + channel] : 0) * alpha,
        );
      });
      pixels[i + 3] = 255;
    }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  writeFileSync(
    new URL(name, folder),
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", header),
      chunk("IDAT", deflateSync(pixels)),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
}
