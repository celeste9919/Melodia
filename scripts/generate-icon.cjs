// Generate a simple 512x512 app icon PNG for Melodia
// Uses only Node.js built-in modules (zlib + buffer)
const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

const SIZE = 512

// Create raw RGBA pixel data
const pixels = Buffer.alloc(SIZE * SIZE * 4, 0)

// Background: dark gradient (deep purple to dark blue)
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const idx = (y * SIZE + x) * 4
    const t = y / SIZE
    // Gradient from #1a0533 (top) to #0d1b3e (bottom)
    const r = Math.round(26 + t * (13 - 26))
    const g = Math.round(5 + t * (27 - 5))
    const b = Math.round(51 + t * (62 - 51))
    pixels[idx] = r
    pixels[idx + 1] = g
    pixels[idx + 2] = b
    pixels[idx + 3] = 255
  }
}

// Draw a centered rounded rectangle (music player shape)
function drawRect(x1, y1, x2, y2, r, g, b, a) {
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
        const idx = (y * SIZE + x) * 4
        // Alpha blend
        const srcA = a / 255
        const dstA = pixels[idx + 3] / 255
        const outA = srcA + dstA * (1 - srcA)
        if (outA > 0) {
          pixels[idx] = Math.round((r * srcA + pixels[idx] * dstA * (1 - srcA)) / outA)
          pixels[idx + 1] = Math.round((g * srcA + pixels[idx + 1] * dstA * (1 - srcA)) / outA)
          pixels[idx + 2] = Math.round((b * srcA + pixels[idx + 2] * dstA * (1 - srcA)) / outA)
          pixels[idx + 3] = Math.round(outA * 255)
        }
      }
    }
  }
}

// Rounded rect: main body
const margin = 80
const rx = margin, ry = margin + 40, rw = SIZE - 2 * margin, rh = SIZE - 2 * margin - 80
// Fill with semi-transparent white
drawRect(rx, ry, rx + rw, ry + rh, 255, 255, 255, 30)

// Draw musical note (eighth note) in the center
const cx = SIZE / 2 - 40, cy = SIZE / 2

// Note head (filled oval)
function drawCircle(cx, cy, rad, r, g, b, a) {
  for (let y = Math.floor(cy - rad); y < Math.ceil(cy + rad); y++) {
    for (let x = Math.floor(cx - rad); x < Math.ceil(cx + rad); x++) {
      const dx = x - cx, dy = (y - cy) * 1.3 // slightly squished
      if (dx * dx + dy * dy <= rad * rad && x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
        const idx = (y * SIZE + x) * 4
        const srcA = a / 255
        const dstA = pixels[idx + 3] / 255
        const outA = srcA + dstA * (1 - srcA)
        if (outA > 0) {
          pixels[idx] = Math.round((r * srcA + pixels[idx] * dstA * (1 - srcA)) / outA)
          pixels[idx + 1] = Math.round((g * srcA + pixels[idx + 1] * dstA * (1 - srcA)) / outA)
          pixels[idx + 2] = Math.round((b * srcA + pixels[idx + 2] * dstA * (1 - srcA)) / outA)
          pixels[idx + 3] = Math.round(outA * 255)
        }
      }
    }
  }
}

// Note head
drawCircle(cx, cy + 30, 38, 96, 200, 255, 255)

// Stem (vertical line)
drawRect(cx + 32, cy - 160, cx + 40, cy + 30, 96, 200, 255, 255)

// Flag (curved line connecting at top of stem)
function drawTriangle(x1, y1, x2, y2, x3, y3, r, g, b, a) {
  const minX = Math.max(0, Math.min(x1, x2, x3))
  const maxX = Math.min(SIZE - 1, Math.max(x1, x2, x3))
  const minY = Math.max(0, Math.min(y1, y2, y3))
  const maxY = Math.min(SIZE - 1, Math.max(y1, y2, y3))
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      // Barycentric test
      const d1 = (x - x2) * (y1 - y2) - (x1 - x2) * (y - y2)
      const d2 = (x - x3) * (y2 - y3) - (x2 - x3) * (y - y3)
      const d3 = (x - x1) * (y3 - y1) - (x3 - x1) * (y - y1)
      const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0)
      const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0)
      if (!(hasNeg && hasPos)) {
        const idx = (y * SIZE + x) * 4
        const srcA = a / 255
        const dstA = pixels[idx + 3] / 255
        const outA = srcA + dstA * (1 - srcA)
        if (outA > 0) {
          pixels[idx] = Math.round((r * srcA + pixels[idx] * dstA * (1 - srcA)) / outA)
          pixels[idx + 1] = Math.round((g * srcA + pixels[idx + 1] * dstA * (1 - srcA)) / outA)
          pixels[idx + 2] = Math.round((b * srcA + pixels[idx + 2] * dstA * (1 - srcA)) / outA)
          pixels[idx + 3] = Math.round(outA * 255)
        }
      }
    }
  }
}

// Flag curve (approximated as a thick arc from stem top curving right and down)
drawTriangle(cx + 40, cy - 160, cx + 200, cy - 140, cx + 40, cy - 120, 96, 200, 255, 255)
drawTriangle(cx + 40, cy - 120, cx + 200, cy - 140, cx + 150, cy - 30, 96, 200, 255, 255)

// Second note (smaller, offset)
const cx2 = cx + 100, cy2 = cy + 60
drawCircle(cx2, cy2 + 30, 38, 180, 130, 255, 200)
drawRect(cx2 + 32, cy2 - 120, cx2 + 40, cy2 + 30, 180, 130, 255, 200)
drawTriangle(cx2 + 40, cy2 - 120, cx2 + 180, cy2 - 100, cx2 + 40, cy2 - 85, 180, 130, 255, 200)
drawTriangle(cx2 + 40, cy2 - 85, cx2 + 180, cy2 - 100, cx2 + 130, cy2, 180, 130, 255, 200)

// Connection beam between the two notes
drawRect(cx + 40, cy - 160, cx2 + 40, cy - 148, 96, 200, 255, 200)

// PNG encoding
function createPng(pixels, width, height) {
  // Filter each row (no filter = 0)
  const rawRows = []
  for (let y = 0; y < height; y++) {
    const rowStart = y * width * 4
    rawRows.push(Buffer.from([0])) // filter byte
    rawRows.push(pixels.slice(rowStart, rowStart + width * 4))
  }
  const raw = Buffer.concat(rawRows)

  // Deflate
  const compressed = zlib.deflateSync(raw)

  // Build PNG
  const chunks = []

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type: RGBA
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace
  chunks.push(createPngChunk('IHDR', ihdr))

  // IDAT
  chunks.push(createPngChunk('IDAT', compressed))

  // IEND
  chunks.push(createPngChunk('IEND', Buffer.alloc(0)))

  // Assemble
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([signature, ...chunks])
}

function createPngChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const typeBuffer = Buffer.from(type, 'ascii')
  const crc = crc32(Buffer.concat([typeBuffer, data]))
  const crcBuffer = Buffer.alloc(4)
  crcBuffer.writeUInt32BE(crc, 0)
  return Buffer.concat([length, typeBuffer, data, crcBuffer])
}

// CRC32 for PNG
const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
  }
  crcTable[n] = c
}

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

const png = createPng(pixels, SIZE, SIZE)
const outPath = path.join(__dirname, '..', 'public', 'icon.png')
fs.writeFileSync(outPath, png)
console.log(`Icon generated: ${outPath} (${png.length} bytes)`)
