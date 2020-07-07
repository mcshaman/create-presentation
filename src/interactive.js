const inquirer = require('inquirer')
const dashify = require('dashify')

module.exports = async pTemplates => {
	try {
		const answers = await inquirer.prompt([
			{
				type: 'input',
				name: 'projectTitle',
				message: 'What\'s the title of your project?',
			},
			{
				type: 'list',
				name: 'template',
				message: 'Which template?',
				choices: pTemplates,
			},
		])

		return {
			...answers,
			packageName: dashify(answers.projectTitle),
		}
	} catch (pError) {
		throw pError
	}
}