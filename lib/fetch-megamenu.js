import { writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import axios from 'axios'

const basePath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'templates', 'partials', 'megamenu')

const template = `
  <div class="udem-mega-menu-item">
    <div class="udem-mega-menu-gapfiller"></div>
    <div class="udem-mega-menu-header"></div>
    <div class="udem-mega-menu-inner">
    %s
    </div>
  </div>
`

const sectionsUrls = [
  {
    name: 'chercher',
    url: 'https://bib.umontreal.ca/chercher?type=795'
  },
  {
    name: 'explorer',
    url: 'https://bib.umontreal.ca/explorer?type=795'
  },
  {
    name: 'utiliser',
    url: 'https://bib.umontreal.ca/utiliser?type=795'
  },
  {
    name: 'travailler',
    url: 'https://bib.umontreal.ca/travailler?type=795'
  },
  {
    name: 'a-propos',
    url: 'https://bib.umontreal.ca/a-propos?type=795'
  },
]

for (const section of sectionsUrls) {
  const filePath = `${basePath}/_${section.name}.hbs`
  let { data } = await axios({
    method: 'get',
    url: section.url,
  })

  // data = data.replace(/<script[^>]*>.*?<\/script>/gi, '')
  data = data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  data = template.replace('%s', data)

  await writeFile(filePath, data)
}
