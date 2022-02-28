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
		this._EMPTY = buildEMPTY(this.rules);
		this._FIRST = buildFIRST(this.rules, this._EMPTY);
	}
	
}

module.exports = Language;