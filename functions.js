const SituationsSet = require('./situations-set.js');
const Situation = require('./situation.js');

/**
 * Расширяет ситуационное множество I правилами разбора всех нетерминалов, которые могут быть следующими
 * @param I : Iterable<Situation>
 * @param all : SituationsSet - набор правил грамматики
 * @return SituationsSet
 */
function CLOSURE(I, all){
	
	const arr = [...I];
	const net = new Set();
	for(let i=0; i<arr.length; ++i){
		let item = arr[i];
		if(!item.isFinal){
			let next = item.next;
			if(!net.has(next)){
				arr.push(...all.itrForLeft(next));
				net.add(next);
			}
		}
	}
	
	return new SituationsSet(arr);
}

/**
 * Содзаёт ситуационное множество, которое получается из множества I вводом очередного символа X
 * @param I : SituationsSet - исходное множество
 * @param X : string - имя символа
 * @param all : SituationsSet - набор правил грамматики
 * @return SituationsSet
 */
function GOTO(I, X, all){
	let arr = [];
	for(let item of I.itrForNext(X)){
		arr.push(item.move(X));
	}
	return CLOSURE(arr, all);
}

function firstA(A, all){
	let s = CLOSURE(all.itrForLeft(A), all);
	let symbols = new Set([...s].map(s=>s.right[0]));
	symbols.add(A);
	return symbols;
}

/**
 * Множество всех терминальных символов, которые могут быть первыми в разложении A
 */
function FIRST(arr, all, net, black){
	net = net || all.allLeft();
	black = black || new Set();
	let A = arr[0];
	let symbols;
	
	if(net.has(A)){
		if(!black.has(A)){
			black.add(A);
			let s = CLOSURE(all.itrForLeft(A), all);
			let symbs = [];
			for(let B of s){
				if(B.right.length > 0){
					symbs.push(...FIRST(B.right, all, net, black));
				}
				else{
					symbs.push(undefined);
				}
			}
			symbols = new Set(symbs);
		}
		else{
			if(all.existsEmptyFor(A)){
				symbols = new Set([undefined]);
			}
			else{
				symbols = new Set();
			}
		}
	}
	else{
		symbols = new Set([A]);
	}
	
	if(symbols.has(undefined)){
		let last = arr.slice(1);
		if(last.length === 0){
			
		}
		else{
			symbols.delete(undefined);
			symbols = new Set([
				...symbols,
				...FIRST(last, all, net, black)
			]);
		}
	}
	
	return symbols;
}

/**
 * Множество всех терминальных символов, которые могут стоять после A
 */
function FOLLOW(A, all){
	const arr = [A];
	
	const result = [];
	
	const net = all.allLeft();
	
	for(let i=0; i<arr.length; ++i){ 
		for(let sit of all){
			let pos = sit.findInRight(arr[i]);
			if(pos.length>0){
				let {left, right} = sit;
				pos.forEach((index)=>{
					index++;
					if(index>=right.length){
						if(!arr.includes(left)){
							arr.push(left);
						}
					}
					else{
						let sym = right[index];
						if(!result.includes(sym)){
							result.push(sym);
						}
					}
				});
			}
		}
	}
	
	for(let i=0; i<result.length; ++i){
		for(let sym of FIRST(result[i], all)){
			if(!result.includes(sym)){
				result.push(sym);
			}
		}
	}
	
	return result.filter((sym)=>(!net.has(sym)));
}

function APPEND(I, left, right){
	
	const arr = [...I, new Situation(left, right)];
	
	return new SituationsSet(arr);
}


module.exports = {
	CLOSURE,
	GOTO,
	FIRST,
	FOLLOW
};