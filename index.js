#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const walk = require('./src/walk')

const [template, dest] = process.argv.slice(2)
const templatePath = path.join('templates', template)

const main = async (pSource, pDest) => {
	console.log(pDest)

	try {
		await fs.promises.mkdir(pDest)
	} catch (pError) {
		const { code } = pError
		if (code === 'EEXIST') {
			throw new Error(`file already exists ${pDest}`)
		}
		if (code === 'EACCES') {
			throw new Error(`permission denied creating dir in ${pDest}`)
		}

		throw pError
	}

	try {
		for await (const pFilePath of walk(pSource)) {
			console.log(pFilePath)
		}
	} catch {
		throw new Error(`no such template ${template}`)
	}
}

// TODO add node version verification
main(templatePath, dest)
	.catch((pError) => {
		console.error(pError.toString())
	})