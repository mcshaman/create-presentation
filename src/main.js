const fs = require('fs')
const walk = require('./walk')
const Mustache = require('mustache')
const { isBinaryFile } = require('isbinaryfile')

module.exports = async (pSource, pDest, pView) => {
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
				const destContents = await isBinaryFile(sourceContents) ? sourceContents : Mustache.render(sourceContents.toString(), pView, {}, ['<%', '%>'])
				await fs.promises.writeFile(destPath, destContents)
			}
		}
	} catch (pError) {
		throw new Error(`no such template ${pSource}`)
	}
}