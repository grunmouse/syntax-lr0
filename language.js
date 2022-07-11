const {
	buildEMPTY,
	buildFIRST,
	buildFOLLOW,
	buildFIRSTK
} = require('./build-sets.js');

class Language{
	constructor(rules){
		this.rules = rules;
	}
	
	build1(){
		const all = this.rules;
		this._EMPTY = buildEMPTY(all);
		this._FIRST = buildFIRST(all, this._EMPTY);
		this._FOLLOW = buildFOLLOW(all, this._FIRST, TERMINATOR);
	}
	
}

module.exports = Language;