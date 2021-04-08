const inspect = Symbol.for('nodejs.util.inspect.custom');

const Situation = require('./situation.js');

const SituationsSet = require('./situations-set.js');

const {
	CLOSURE,
	GOTO,
	FIRST,
	FOLLOW
} = require('./functions.js');

/**
 * Представляет набор уникальных значений, сравниваемых по свойству key
 */
class SetWithKey extends Map{
	add(item){
		const key = item.key;
		if(super.has(key)){
			return super.get(key);
		}
		this.set(key, item);
		return item;
	}
	get(item){
		if(typeof item !== 'string'){
			item = item.key;
		}
		return super.get(item);
	}
	has(item){
		if(typeof item !== 'string'){
			item = item.key;
		}
		return super.get(item);
	}
	[Symbol.iterator](){
		return super.values();
	}
	toString(){
		return [...this].join(';\n');
	}
	
	get key(){
		return [...this].sort().join(';\n');
	}
	
	toJSON(){
		return [...this];
	}
}



/**
 * Состояние транслятора, соответствующее ситуационному множеству
 */
class State{
	/**
	 * @param I : SituationsSet
	 */
	constructor(I){
		this.I = I;
		this.edges = new Map();
	}
	
	get key(){
		return this.I.key;
	}
	
}

function *itrNotBlack(states){
	let itr = states.values();
	while(true){
		let s = itr.next();
		if(s.done){
			return;
		}
		
		let q = s.value;
		if(!q.black){
			yield q;
			
			itr = states.values();
		}
	}
}

/**
 * Строит граф распознающего автомата для набора правил all и корневого нетерминала start
 * @param start : string - имя корневого нетерминала
 * @param all : SituationsSet - набор правил грамматики
 *
 * @return Object
 * @property statedoc : Object<number,SituationsSet> - карта соответствия номеров состояний ситуационным множествам (для документации)
 * @property edges : Array<[Number, String, [String, Number]]> - рёбра графа, соответствующие переходам автомата
 * @property edges[*][0] - исходное состояние
 * @property edges[*][1] - имя символа
 * @property edges[*][2][0] - тип перехода
 * @property edges[*][2][1] - новое состояние или правило свёртки
 * @property reduce : Map<Number, ([String, Number])> - правила свёртки
 * @property reduce.get(*)[0] - новый нетерминал
 * @property reduce.get(*)[1] - количество символов в правой части правила
 */
function buildGraph(start, all){
	const nodes = new SetWithKey();
	
	let q0 = new State(CLOSURE(all.itrForLeft(start), all));
	
	nodes.add(q0);
	
	//Рёбра соответствуют символам из множества next
	
	for(const q of itrNotBlack(nodes)){
		const I = q.I;
		const next = I.next();
		for(const X of next){
			let J = GOTO(I, X, all);
			let q1 = new State(J);
			q1 = nodes.add(q1);
			q.edges.set(X,q1);
		}
		q.black = true;
	}
	
	[...nodes].forEach((q, i)=>{
		q.number = i;
	});
	
	const statedoc = {};
	const arrnodes = [];

	const conflict = [];
	
	const edges = [];
	
	for(let q of nodes){
		statedoc[q.number] = q.I;
		if(q.I.hasConflict()){
			let rules = [...q.I.itrFinal()];
			let next = q.I.next();
			let unhandled = false;
			let map = new Map();
			for(let rule of rules){
				let context = FOLLOW(rule.left, all);
				//console.log(rule.left, context);
				for(let sym of context){
					if(next.has(sym)){
						unhandled = true;
					}
					if(map.has(sym)){
						unhandled = true;
					}
					else{
						map.set(sym, [rule.left, rule.right.length]);
					}
				}
			}
			if(unhandled){
				conflict.push(q.I);
			}

			q.handler = map;
;
			if(q.edges.size > 0){
				//Если у состояния есть выходящие рёбра
				for(let [X,q1] of q.edges){
					edges.push([q.number, X, q1.number]);
				}
			}
			arrnodes[q.number] = {
				number:q.number,
				rule:['H', [Object.fromEntries(map), q.number]]
			};
			
		}
		else if(q.edges.size > 0){
			//Если у состояния есть выходящие рёбра
			for(let [X,q1] of q.edges){
				edges.push([q.number, X, q1.number]);
			}
			arrnodes[q.number] = {
				number:q.number,
				rule:['Q', q.number]
			};
		}
		else if(q.I.size === 1){
			//Если у состояния нет выходящих рёбер и есть только одно правило
			let rule = q.I.getFirst();
			
			rule = rule.restart();
			
			let config = [rule.left, rule.right.length];
			
		
			arrnodes[q.number] = {
				number:q.number,
				rule:['R', config]
			};
		}
	}
	
	arrnodes.sort((a,b)=>(a.number - b.number));
	
	const table = {}
	
	edges.forEach((edge)=>{
		if(edge[1][0] === "'"){
			edge[1] = edge[1].slice(1,-1);
		}
		let [q, x, q1] = edge;
		table[q] = table[q] || {};
		table[q][x] = q1;
	});
	

	
	return {
		docs:{
			statedoc, 
			edges,
			conflict
		},
		config:{
			nodes:arrnodes,
			table
		}
	};
}

/**
 * Создаёт представление автомата в формате DOT
 */
function toDot(edges, reduce){
	const result = [];
	for(let [r, rule] of reduce){
		let node = `R${r}[label="${rule[0]}";shape="rectangle"];`;
		result.push(node);
	}
	for(let [q, x, rule] of edges){
		let edge = `Q${q} -> ${rule.join('')} [label="${x}"];`;
		result.push(edge);
	}
	
	return result.join('\n');
}

module.exports = {
	SituationsSet,
	CLOSURE,
	GOTO,
	FIRST,
	FOLLOW,
	buildGraph,
	toDot
};
