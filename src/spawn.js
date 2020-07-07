const { spawn } = require('child_process')

module.exports = (pFile, pArgs, pOptions) => {
	return new Promise(pResolve => {
		const spawned = spawn(pFile, pArgs, pOptions)

		spawned.on('close', pResolve)
	})
}