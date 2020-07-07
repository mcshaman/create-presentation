#!/usr/bin/env node
const path = require('path')
const getDirNames = require('./src/getDirNames')
const interactive = require('./src/interactive')
const main = require('./src/main')

const TEMPLATES_PATH = 'templates'
const FEATURES_PATH = 'features'

;(async () => {
	const templatesPath = path.resolve(__dirname, TEMPLATES_PATH)
	const featuresPath = path.resolve(__dirname, FEATURES_PATH)

	try {
		const [templateNames, featureNames] = await Promise.all([
			getDirNames(templatesPath),
			getDirNames(featuresPath),
		])

		const { template, features, ...settings } = await interactive(templateNames, featureNames)
		const templatePath = path.resolve(templatesPath, template)
		const featurePaths = features.map(pFeature => path.resolve(featuresPath, pFeature))
		const dest = process.argv[2] || path.join(process.cwd(), settings.projectTitle)
		await main([templatePath, ...featurePaths], dest, settings)
	} catch (pError) {
		console.error(pError.toString())
	}
})()
