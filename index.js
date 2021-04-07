const MakeSyntax = require('./make-syntax.js');
const makeTranslator = require('./translator.js');
const parseNotation = require('./parse-notation.js');


const  {
	parseRule,
	SituationsSet,
	CLOSURE,
	GOTO,
	buildGraph,
	makeStates,
	toDot
} = MakeSyntax;

function makeSyntax(code, start){
	start = start || 'MAIN';
	const {all} = parseNotation(code);
	const graph = buildGraph(start, all);

	//console.log(graph.statedoc);
	//console.log(graph.edges);
	//console.log(graph.reduce);
	//console.log(toDot(graph.edges, graph.reduce));

	if(graph.conflict.lenght > 0){
		console.log(graph.conflict);
		throw new Error('Grammatic conflict!');
	}

	const State = makeStates(graph.edges, graph.reduce);

	
}


module.exports = {
	dev:{
		parseNotation,
		...MakeSyntax
	}
	makeSyntax,
	makeTranslator
};