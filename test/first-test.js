const fs = require('fs');
const Path = require('path');
const assert = require('assert');

const {
	buildEMPTY,
	buildFIRST
} = require('../build-sets.js');

//const FIRST = require('../functions.js').FIRST;
const parseNotation = require('../parse-notation.js');

function itFIRST(N, ctrl, FIRST){
	it('FIRST(' + N + ')', ()=>{
		let set = FIRST.get(N);
		let message = [...set].toString();
		console.log(set);
		assert.ok(set.size === ctrl.length && ctrl.every((el)=>set.has(el)), message);
	});
}

describe('FIRST', ()=>{
	it('exists', ()=>{
		assert(buildFIRST);
	});
	
	describe('task4-7-1', ()=>{
		const code = fs.readFileSync(Path.join(__dirname, 'task4-7-1.txt'), {encoding:'utf8'});
		const lang = parseNotation(code);
		const all = lang.all;
		const EMPTY = buildEMPTY(all);
		const FIRST = buildFIRST(all, EMPTY);
		
		itFIRST('B', ['c', undefined], FIRST);
		itFIRST('D', ['c', 'a', undefined], FIRST);
		itFIRST('S', ['c', 'd'],FIRST);
		
	});
})