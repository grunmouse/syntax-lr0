const {
	SituationsSet,
	buildGraph,
	makeStates,
	transpose,
	toDot
} = require('./make-syntax.js');

/**
 * Каждое правило занимает отдельную строку и заканчивается ;
 */
function parseNotation(code){
	let rulescode = code.split(';').filter((a)=>(!!a.trim()));
	
	let all = new SituationsSet(rulescode);
	
	return {all};
}

module.exports = parseNotation;