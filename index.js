const MakeSyntax = require('./make-syntax.js');
const makeTranslator = require('./make-translator.js');
const parseNotation = require('./parse-notation.js');


const  {
	buildGraph
} = MakeSyntax;

function makeSyntax(code, start){
	start = start || '<MAIN>';
	const {all} = parseNotation(code);
	const graph = buildGraph(start, all);

	//console.log(graph.statedoc);
	//console.log(graph.edges);
	//console.log(graph.reduce);
	//console.log(toDot(graph.edges, graph.reduce));

	if(graph.docs.conflict.lenght > 0){
		console.log(graph.conflict);
		throw new Error('Grammatic conflict!');
	}

	return graph.config;
}


module.exports = {
	dev:{
		parseNotation,
		...MakeSyntax
	},
	makeSyntax,
	makeTranslator
};