// Convert a PNG image to ICO format for Windows installer
const fs = require('fs')
const path = require('path')

const pngPath = path.join(__dirname, '..', 'public', 'icon.png')
const icoPath = path.join(__dirname, '..', 'public', 'icon.ico')

const pngData = fs.readFileSync(pngPath)
const pngSize = pngData.length

// ICO format: wraps PNG data
// Header: 6 bytes
//   reserved: 2 bytes (0)
//   type: 2 bytes (1 = ICO)
//   count: 2 bytes (1)
// Entry: 16 bytes per image
//   width: 1 byte (0 = 256px)
//   height: 1 byte (0 = 256px)
//   colors: 1 byte (0)
//   reserved: 1 byte (0)
//   planes: 2 bytes (1)
//   bpp: 2 bytes (32)
//   size: 4 bytes (png size)
//   offset: 4 bytes (22 = 6 + 16)

const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)  // reserved
header.writeUInt16LE(1, 2)  // type: ICO
header.writeUInt16LE(1, 4)  // count: 1 image

const entry = Buffer.alloc(16)
entry.writeUInt8(0, 0)      // width: 256px (0 = 256)
entry.writeUInt8(0, 1)      // height: 256px
entry.writeUInt8(0, 2)      // color palette: 0
entry.writeUInt8(0, 3)      // reserved
entry.writeUInt16LE(1, 4)   // planes
entry.writeUInt16LE(32, 6)  // bits per pixel
entry.writeUInt32LE(pngSize, 8)  // image size
entry.writeUInt32LE(22, 12)      // offset (6 header + 16 entry)

const icoData = Buffer.concat([header, entry, pngData])
fs.writeFileSync(icoPath, icoData)

console.log(`ICO generated: ${icoPath} (${icoData.length} bytes)`)
