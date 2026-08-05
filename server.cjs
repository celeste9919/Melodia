/**
 * 静态文件服务器 — 将 dist/ 目录作为桌面客户端提供，同时暴露为本地 HTTP 服务
 * 用法: node server.js
 * 打开浏览器访问 http://localhost:4173
 */
const http = require('http')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const PORT = 4173
const DIST = path.join(__dirname, 'dist')

// MIME types
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mid': 'audio/midi',
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0].split('#')[0]
  if (urlPath === '/') urlPath = '/index.html'

  const filePath = path.join(DIST, urlPath)
  const ext = path.extname(filePath).toLowerCase()

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback: serve index.html for unknown routes
      fs.readFile(path.join(DIST, 'index.html'), (err2, data2) => {
        if (err2) {
          res.writeHead(500)
          res.end('Internal Server Error')
          return
        }
        res.writeHead(200, { 'Content-Type': MIME['.html'] })
        res.end(data2)
      })
      return
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
  })
})

server.listen(PORT, () => {
  const localUrl = `http://localhost:${PORT}`

  // 自动打开浏览器
  let cmd
  switch (process.platform) {
    case 'win32': cmd = `start ${localUrl}`; break
    case 'darwin': cmd = `open ${localUrl}`; break
    default: cmd = `xdg-open ${localUrl}`; break
  }
  exec(cmd)

  console.log(`Melodia is running at: ${localUrl}`)
  console.log('Press Ctrl+C to stop.')
})
