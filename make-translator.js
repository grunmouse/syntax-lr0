const Stack = require('@grunmouse/stack');

/**
 * @interface token
 * @property type : String - имя символа для разбора
 */

const tokenReader = require('./token-reader.js');


/**
 * @function makeHandler - создаёт функцию, выполняющую действие автомата
 */
function makeHandler(rule){
	let [type, param] = rule;
	let map = {
		'Q': makeGo,
		'R': makeReduce,
		'H': makeSubselector
	};
	
	return map[type](param);
}

/**
 * @deftype Handler : Function(Token, lib)=>Token
 */

const makeGo = (number) => (token, lib)=>{
	const {stack, read} = lib;
	stack.push(token);
	stack.push(number);
	//console.log('GO ' + number);
	return read();
};

const makeReduce = (rule) => (token, lib)=>{
	const {stack, Special} = lib;
	let [ntype, count] = rule;
	let data = [];
	for(let i=1; i<count; ++i){
		stack.pop();
		data.push(stack.pop());
	}
	data.reverse();
	data.push(token);
	let fun = Special && Special[ntype];
	if(fun){
		data = fun(ntype, data);
	}
	//console.log('REDUCE ' + ntype);
	return {type:ntype, data};
}

/**
 * Делает из конфига функцию поиска
 */
const reduceFinder = (map)=>(view)=>{
	const sym = view(1)[0];
	//console.log('VIEW ' + sym.type);
	return map[sym.type];
};

const makeSubselector = (config) => (token, lib)=>{
	const [map, number] = config;
	const {stack, view} = lib;
	let reduce = reduceFinder(map)(view);
	if(reduce){
		return makeReduce(reduce)(token, lib);
	}
	else{
		return makeGo(number)(token, lib);
	}
}


function makeTranslator({nodes, table}, Special){
	
	Special = Special || {};
	
	/**
	 * 
	 * @param tokens:Iterator - итератор токенов, полученный из лексического анализатора
	 * Строит абстрактное дерево трансляции
	 * @returned Object - возвращает корневой нетерминал, в данных которого иерархически вложено всё остальное
	 */
	return function translator(tokens){
		/**
		 * Стек пар символов [дно, 0,  символ, состояние,  символ, состояние, ... символ, состояние]
		 */
		const stack = new Stack();
		
		/**
		 * Функции чтения и заглядывания
		 */
		const {read, view} = tokenReader(tokens);
		
		const lib = {
			read, view, stack, Special
		};
		
		/**
		 * выталкивает несколько символов из стека и возвращает их в порядке добавления
		 */
		const pop = (count)=>{
			let result = [];
			for(let i=0; i<count; ++i){
				stack.pop();
				result.push(stack.pop());
			}
			return result.reverse();
		};
		
		let token = read();
		
		stack.push(0);
		while(true){
			let state = stack.top;
			let type = token.type;
			
			let q = table[state];
			if(!q){
				throw new Error('Not Exists state #'+state);
			}
			let index = q[type];
			
			let node = nodes[index];
			
			if(node){
				let handler = node.rule;
				token = makeHandler(handler)(token, lib);
				if(!table[stack.top]){
					throw new Error(`Invalid state after state=${state} token=${type}`);
				}
			}
			else if(type === '<MAIN>'){
				return token;
			}
			else if(type === '<EOF>'){
				let [MAIN] = pop(1);
				return MAIN;
			}
			else{
				throw new Error(`Unknown pair state=${state} token=${type}`);
			}
		}
	}


}

module.exports = makeTranslator;