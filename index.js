#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const walk = require('./src/walk')
const Mustache = require('mustache')

const [template, dest] = process.argv.slice(2)
const templatePath = path.join('templates', template)

const main = async (pSource, pDest, pView) => {
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
		for await (const { isDir, path: filePath } of walk(pSource)) {
			const destPath = filePath.replace(pSource, pDest)

			if (isDir) {
				await fs.promises.mkdir(destPath)
			} else {
				const sourceHandle = await fs.promises.open(filePath)
				const sourceContents = await sourceHandle.readFile()
				await sourceHandle.close()
				await fs.promises.writeFile(destPath, Mustache.render(sourceContents.toString(), pView))
			}
		}
	} catch (pError) {
		throw new Error(`no such template ${template}`)
	}
}

// TODO add node version verification
main(templatePath, dest, {})
	.catch((pError) => {
		console.error(pError.toString())
	})