#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const walk = require('./src/walk')

const [template, dest] = process.argv.slice(2)
const templatePath = path.join('templates', template)

const main = async (pSource, pDest) => {
	console.log(pDest)

	// await fs.promise.mkdir()
	for await (const pFilePath of walk(pSource)) {
		console.log(pFilePath)
	}
}

main(templatePath, dest)
	.catch(() => {
		console.error(`No such template ${template}`)
	})