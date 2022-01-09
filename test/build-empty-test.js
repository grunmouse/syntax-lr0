const fs = require('fs');
const Path = require('path');
const assert = require('assert');

const {buildEMPTY} = require('../build-sets.js');
const parseNotation = require('../parse-notation.js');

function itEMPTY(filepath, ctrl){
	it('EMPTY(' + filepath + ')', ()=>{
		const code = fs.readFileSync(Path.join(__dirname, filepath), {encoding:'utf8'});
		const lang = parseNotation(code);
		let set = buildEMPTY(lang.all);
		let message = [...set].toString();

		assert.ok(set.size === ctrl.length && ctrl.every((el)=>set.has(el)), message);
	});
}

describe('EMPTY', ()=>{
	it('exists', ()=>{
		assert(buildEMPTY);
	});
	
	itEMPTY('task4-7-1.txt', ['D','B']);
	itEMPTY('task4-7-2.txt', ['S','B']);
	itEMPTY('task4-7-3.txt', ['B']);
	itEMPTY('samp2-10.txt', ['S']);

})