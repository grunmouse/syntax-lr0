
const {
	MapOfMap
} = require('@grunmouse/special-map');

/**
 * @param all - набнор всех правил языка
 * @param FIRST : MapOfSet
 * @param FOLLOW : MapOfSet
 */
function makeLL1(all, FIRST, FOLLOW, TERMINATOR){
	const M = new MapOfMap();
	const net = all.getAllLeft();
	
	for(let rule of all){
		let {left:A, right} = rule;
		let first = FIRST.get(A);
		for(let a of first){
			if(typeof a !== undefined){
				M.set(A, a, rule);
			}
		}
		if(first.has(undefined)){
			let follow = FOLLOW.get(A);
			for(let b of follow){
				if(typeof b !== undefined){
					M.set(A, b, rule);
				}
			}
			if(follow.has(TERMINATOR)){
				M.set(A, b, TERMINATOR);
			}
		}
	}
	
	return M;
}

module.exports = makeLL1;