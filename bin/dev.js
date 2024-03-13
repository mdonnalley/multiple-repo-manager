#!/usr/bin/env -S tsx
// eslint-disable-next-line n/shebang
async function main() {
  const {execute} = await import('@oclif/core')
  await execute({development: true, dir: import.meta.url})
}

await main()
