import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(rootDir, 'dist')
const indexPath = resolve(distDir, 'index.html')

const readDistAsset = (assetPath) => {
  const normalizedPath = assetPath.replace(/^\.\//, '')
  return readFileSync(resolve(distDir, normalizedPath), 'utf8')
}

let html = readFileSync(indexPath, 'utf8')

html = html.replace(
  /<link rel="stylesheet" crossorigin href="(\.\/assets\/[^"]+\.css)">/,
  (_match, href) => `<style>\n${readDistAsset(href)}\n</style>`
)

html = html.replace(
  /<script type="module" crossorigin src="(\.\/assets\/[^"]+\.js)"><\/script>/,
  (_match, src) => `<script type="module">\n${readDistAsset(src)}\n</script>`
)

writeFileSync(indexPath, html, 'utf8')
