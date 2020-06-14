#!/usr/bin/env node
const path = require('path')
const getDirNames = require('./src/getDirNames')
const interactive = require('./src/interactive')
const main = require('./src/main')

const TEMPLATES_PATH = 'templates'

;(async () => {
	const templatesPath = path.resolve(__dirname, TEMPLATES_PATH)
	try {
		const templateNames = await getDirNames(templatesPath)
		const { template, ...settings } = await interactive(templateNames)
		const templatePath = path.resolve(templatesPath, template)
		const dest = process.argv[2] || path.join(process.cwd(), settings.projectTitle)
		await main(templatePath, dest, settings)
	} catch (pError) {
		console.error(pError.toString())
	}
})()
