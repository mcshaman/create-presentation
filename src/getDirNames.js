const fs = require('fs')

module.exports = async (pDirPath) => {
	const dir = await fs.promises.opendir(pDirPath)

	const dirNames = []
	for await (const pEntry of dir) {
		if (pEntry.isDirectory()) {
			dirNames.push(pEntry.name)
		}
	}

	return dirNames
}