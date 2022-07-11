const SituationsSet = require('./situations-set.js');
const Situation = require('./situation.js');
const {
	MapOfSet,
	MapOfSpecialSet,
	SetWithKey,
	SetWithKeyFunction
} = require('@grunmouse/special-map');


const SEP = String.fromCharCode(0xE0000);

const SetOfArray = SetWithKeyFunction((arr)=>(arr.join(SEP)));

const MapOfSetOfArray = MapOfSpecialSet(SetOfArray, []);

/**
 * Множество символов, раскрывающихся в пустую строку
 */
function buildEMPTY(all){
	let result = new Set();
	let count = 0;
	for(let rule of all){
		if(rule.isEmpty){
			result.add(rule.left);
		}
	}
	
	while(result.size > count){
		count = result.size;
		let rules = [];
		for(let {left, right} of all){
			right = right.filter((A)=>(!result.has(A)));
			let rule = new Situation(left, right);
			if(rule.isEmpty){
				result.add(rule.left);
			}
			rules.push(rule);
		}
		all = new SituationsSet(rules);
	}
	
	return result;
}

/**
 * Строит множество полезных символов языка
 */
function buildPRODUCTIVE(all){
	//Все терминальные символы - полезные
	let result = new Set(all.allWithoutLeft());
	let count = 0;
	let queue = [...result];
	while(result.size > count){
		count = result.size;
		let rules = [];
		for(let sym of
		for(let {left, right} of all){
			right = right.filter((A)=>(!result.has(A))); //Находим символы правой части, не входящие в result
			//Полезным считаем символ, который раскрывается в строку полезных символов или в пустую строку
			let rule = new Situation(left, right);
			if(rule.isEmpty){
				result.add(rule.left);
			}
			else{
				rules.push(rule);
			}
		}
		all = new SituationsSet(rules);
	}
	
	return result;
}

/**
 * Строит множество достижимых символов языка
 */
function buildREACHABLE(all, start){
	let result = new Set(start);
	let count = 0;
	let queue = [...result], index = 0;
	for(;index<queue.length;++index){
		let sym = queue[index];
		for(let {left, right} of all.itrForLeft(sym)){
			for(let sym of right){
				if(!result.has(sym)){
					result.add(sym);
					queue.push(sym);
				}
			}
		}
	}
	
	return result;
}

/**
 * Строит множества FIRST для символов языка
 */ 
function buildFIRST(all, EMPTY){
	const net = all.allLeft();
	const term = all.allWithoutLeft();
	let count = 0;
	
	const map = new MapOfSet();
	for(let t of term){
		map.add(t, t);
	}
	
	for(let N of EMPTY){
		map.add(N, undefined);
	}
	
	function copy(A, to){
		for(let t of map.get(A)){
			if(typeof t !== 'undefined'){
				map.add(to, t);
			}
		}
	}
	
	while(count < map.sumsize()){
		count = map.sumsize();
		for(let {left, right} of all){
			if(right.length>1){
				let j=0;
				let A = right[j];
				copy(A, left);
				while(EMPTY.has(A)){
					++j;
					A = right[j];
					copy(A, left);
				}
			}
		}		
	}
	
	return map;
}

function calcFIRST(arr, FIRST){
	let A = arr[0], last = arr.slice(1);
	let result = new Set(FIRST.get(A));
	if(result.has(undefined)){
		result.delete(undefined);
		let nres = calcFIRST(last, FIRST);
		for(let el of nres){
			result.add(el);
		}
	}
	return result;
}

function buildFOLLOW(all, FIRST, TERMINATOR){
	const map = new MapOfSet();
	const net = all.allLeft();
	const term = all.allWithoutLeft();
	const main = all.allWithoutRight();	
	
	let count = 0;
	
	function copy(set, to){
		for(let t of set){
			if(typeof t !== 'undefined'){
				map.add(to, t);
			}
		}
	}
	
	if(TERMINATOR){
		for(let S of main){
			map.add(S, TERMINATOR);
		}
	}
	
	while(count < map.sumsize()){
		count = map.sumsize();
		for(let {left, right} of all){
			for(let i=0; i<right.length; ++i){
				let N = right[i];
				if(net.has(N)){
					let beta = right.slice(i+1);
					let set1 = calcFIRST(beta, FIRST);
					copy(set1, N);
					if(set1.has(undefined)){
						copy(map.get(left), N);
					}
				}
			}
		}		
	}
	
	return map;
}

/**
 * Обрезанная до k символов конкатенация языков L1 и L2
 */
function OPLUSK(k, L1, L2){
	let result = new SetOfArray();
	let prefix = new SetOfArray();
	
	for(let x of L1){
		if(x.length >= k){
			result.add(x.slice(0, k));
		}
		else{
			prefix.add(x);
		}
	}
	
	for(let x of L1){
		for(let y of L2){
			let u = x.concat(y);
			lwt w = u.slice(0,k);
			result.add(w);
		}
	}
	
	return w;
}


/**
 * Возвращает цепочки в виде массивов. Пустая строка - массив нулевой длины
 */
function buildFIRSTK(k, all, EMPTY){
	const net = all.allLeft();
	const term = all.allWithoutLeft();

	let count = 0;
	
	const map = new MapOfSetOfArray();
	for(let t of term){
		map.add(t, [t]);
	}
	
	for(let rule of all){
		let xk = rule.right.findIndex((a)=>(net.has(a)));
		if(xk===-1){
			xk = rule.right.length;
		}
		let yk = rule.right.length - xk;
		let x= rule.right.slice(0, xk);
		let y = rule.right.slice(xk);
		
		if(xk>=k){
			map.add(rule.left, x.slice(0,k));
		}
		else{
			if(yk === 0){
				map.add(rule.left, x);
			}
		}
	}	
	
	while(count < map.sumsize()){
		count = map.sumsize();
		for(let {left, right} of all){
			let F = right.map((a)=>map.get(a));
			let set = F.slice(1).reduce((akk, a)=>OPLUSK(k, akk, a), F[0]);
			for(let t of set){
				if(t.length > 0){
					map.add(left, t);
				}
			}
		}	
	}
	
	return map;
}


module.exports = {
	buildEMPTY,
	buildFIRST,
	buildFOLLOW,
	buildFIRSTK
};