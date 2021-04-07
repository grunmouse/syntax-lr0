const {
	SituationsSet,
	buildGraph,
	makeStates,
	transpose,
	toDot
} = require('./make-syntax.js');

/**
 * Генерирует таблицу автомата состояний
 */

const all = new SituationsSet(
`
	MAIN := text;
	MAIN := MAIN CALL text;
	MAIN := MAIN INCORRECT;
	CALL := macro;
	CALL := generic ARGLIST text 'end generic';
	CALL := generic text 'end generic';
	ARGLIST := ARG;
	ARGLIST := ARGLIST ARG;
	ARG := text arg ARGTEXT 'end arg';
	ARGTEXT := text;
	ARGTEXT := ARGTEXT CALL text;



	INCORRECT := generic IARGLIST;
	IARGLIST := IARG;
	IARGLIST := ARGLIST IARG;
	IARG := text arg IARGTEXT;
	IARG := error;
	IARGTEXT := ARGTEXT CALL error;
	IARGTEXT := error;
	IARGTEXT := ARGTEXT INCORRECT;
`.split(';').filter((a)=>(!!a.trim()))
);

//console.log(all);

const graph = buildGraph('MAIN', all);

//console.log(graph.statedoc);
//console.log(graph.edges);
//console.log(graph.reduce);
//console.log(toDot(graph.edges, graph.reduce));

if(graph.conflict.lenght > 0){
	console.log(graph.conflict);
	throw new Error('Grammatic conflict!');
}

const State = makeStates(graph.edges, graph.reduce);

module.exports = State;