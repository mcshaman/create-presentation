const walk = require('./src/walk')

async function main() {
	for await (const p of walk("/tmp/")) console.log(p)
}
