import test from 'ava'
import { Nuxt, Builder } from 'nuxt'
import request from 'request-promise-native'
import { resolve } from 'path'
import { promisify } from 'util';
import { exec } from 'child_process'
import config from '../example/nuxt.config'
const execAsync = promisify(exec);
const url = path => `http://localhost:3000${path}`
const get = path => request(url(path))
const dotNuxt = [resolve(__dirname, '../.nuxt'), resolve(__dirname, '../dist')]
let nuxt;
test.before('Init SSR Nuxt.js', async () => {
  config.mode = 'universal';
  nuxt = new Nuxt(config)
  await nuxt.ready()
  await new Builder(nuxt).build()
  await nuxt.listen(3000)
  console.log('Compile done')
})
test('Module', async t => {
  const html = await get('/')
  t.true(html.includes('Works!'))
})
test.after('Closing server', async t => {
  await execAsync('rm -rf ' + dotNuxt.join(' '))
  nuxt.close()
})

