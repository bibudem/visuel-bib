import { readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'
import pkg from '../package.json' assert { type: 'json'}

const fileUrl = new URL('../build/LibCal/custom-js-css-code.html', import.meta.url)
const html = await readFile(fileUrl, { encoding: 'utf8' })

const frag = await JSDOM.fragment(`<div>${html}</div>`)

const jsNomoduleFilePath = new URL(`../build${frag.querySelector('script[nomodule]').getAttribute('src')}`, import.meta.url)
const jsModuleFilePath = new URL(`../build${frag.querySelector('script[type="module"]').getAttribute('src')}`, import.meta.url)
const jsFilePath = new URL('../build/LibCal/custom-js.js', import.meta.url)
const cssFilePath = new URL('../build/LibCal/custom-css.css', import.meta.url)

frag.querySelector('script[type="module"]').remove()

frag.querySelector('script[nomodule]').setAttribute('src', `https://bib.umontreal.ca/public/bib/LibCal/custom-js.${pkg.version}.js`)
frag.querySelector('script[nomodule]').removeAttribute('nomodule')

frag.querySelector('link').setAttribute('href', `https://bib.umontreal.ca/public/bib/LibCal/custom-css.${pkg.version}.css`)

const childNodes = [...frag.firstChild.childNodes]
childNodes.forEach((node, i) => i < childNodes.length && node.after('\n'))

await unlink(jsModuleFilePath)
await writeFile(fileUrl, frag.firstChild.innerHTML)
await rename(jsNomoduleFilePath, jsFilePath)
await writeFile(cssFilePath, `/*!
 * visuel-bib v${pkg.version}
 */
${await readFile(cssFilePath)}`)