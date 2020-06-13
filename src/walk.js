const fs = require('fs')
const path = require('path')

module.exports = async function* walk(pDirPath) {
	const dir = await fs.promises.opendir(pDirPath)

	for await (const pEntry of dir) {
		const itemPath = path.join(pDirPath, pEntry.name)
		if (pEntry.isDirectory()) {
			yield {
				isDir: true,
				path: itemPath,
			}
			yield* walk(itemPath)
		} else if (pEntry.isFile()) {
			yield {
				isDir: false,
				path: itemPath,
			}
		}
	}
}