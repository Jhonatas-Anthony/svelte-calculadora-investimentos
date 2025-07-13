import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Substitua pelo NOME do seu repositório GitHub:
const repo = 'svelte-calculadora-investimentos'

// https://vite.dev/config/
export default defineConfig({
  base: `/${repo}/`,
  plugins: [svelte()],
})
