const fsPromises = require('fs/promises')
const walk = require('./walk')
const Mustache = require('mustache')
const { isBinaryFile } = require('isbinaryfile')
const path = require('path')
const merge = require('lodash/merge')
const spawn = require('./spawn')

const PACKAGE_FILE = 'package.json'

const getFileContent = async pPath => {
	const sourceHandle = await fsPromises.open(pPath)
	const sourceContents = await sourceHandle.readFile()
	await sourceHandle.close()
	return sourceContents
}

const getJsonFileContent = async pPath => {
	const contents = await getFileContent(pPath)
	return JSON.parse(contents.toString())
}

const getFileExists = async pPath => {
	try {
		await fsPromises.access(pPath)
		return true
	} catch {
		return false
	}
}

const makeContent = async (pSourcePath, pDestPath, pView) => {
	if (path.basename(pSourcePath) === PACKAGE_FILE) {
		if (await getFileExists(pDestPath)) {
			const [jsonA, jsonB] = await Promise.all([
				getJsonFileContent(pDestPath),
				getJsonFileContent(pSourcePath),
			])

			const string = JSON.stringify(merge(jsonA, jsonB), null, 2)
			return Buffer.from(string)
		}
	}

	return await getFileContent(pSourcePath)
}

const makeDocument = async (pSourcePath, pDestPath, pView) => {
	const sourceContent = await makeContent(pSourcePath, pDestPath, pView)
	const isBinary = await isBinaryFile(sourceContent)
	return isBinary ? sourceContent : Mustache.render(sourceContent.toString(), pView, {}, ['<%', '%>'])
}

const makeFiles = async (pSource, pDest, pView) => {
	try {
		for await (const { isDir, path: sourcePath } of walk(pSource)) {
			const destPath = sourcePath.replace(pSource, pDest)

			if (isDir) {
				await fsPromises.mkdir(destPath)
			} else {
				const destContent = await makeDocument(sourcePath, destPath, pView)

				await fsPromises.writeFile(destPath, destContent)
			}
		}
	} catch (pError) {
		throw new Error(`no such template ${pSource}`)
	}
}

module.exports = async (pSources, pDest, pView) => {
	try {
		await fsPromises.mkdir(pDest)
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

	for (const pSource of pSources) {
		await makeFiles(pSource, pDest, pView)
	}

	const packagePath = path.resolve(pDest, PACKAGE_FILE)
	if (await getFileExists(packagePath)) {
		await spawn('npm', ['install'], {
			cwd: pDest,
			stdio: 'inherit',
		})
	}
}