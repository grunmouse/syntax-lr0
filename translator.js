const Stack = require('@grunmouse/stack');

/**
 * @interface Tocken
 * @property type : String - имя символа для разбора
 */



const makeGo = number => (stack, read, tocken)=>{
					stack.push(tocken);
					stack.push(number);
					return read();
				};

const makeReduce = (rule) => (stack, read, tocken, Special)=>{
				let [ntype, count] = rule;
				let data = [];
				for(let i=1; i<count; ++i){
					stack.pop();
					data.push(stack.pop());
				}
				data.reverse();
				data.push(tocken);
				let fun = Special && Special[ntype];
				if(fun){
					data = fun(ntype, data);
				}
				return {type:ntype, data};
			}

function makeHandler(type, param){
	return {'Q':makeGo, 'R':makeReduce}[type](param);
}

/**
 * @param State - таблица переключения состояний
 * @param Special - карта функций постобработки распрознанных нетерминалов
 *
 * @return Function<Iterator<Tocken> => AST> - функция, принимающая итератор токенов и возвращающая AST
 */
function makeTranslator(State, Special){
	
	Special = Special || {};
	
	/**
	 * 
	 * @param tockens:Iterator - итератор токенов, полученный из лексического анализатора
	 * Строит абстрактное дерево трансляции
	 * @returned Object - возвращает корневой нетерминал, в данных которого иерархически вложено всё остальное
	 */
	return function translator(tockens){
		/**
		 * Стек пар символов [дно, 0,  символ, состояние,  символ, состояние, ... символ, состояние]
		 */
		const stack = new Stack();
		
		/**
		 * Читает очередной токен или генерирует токен <EOF>
		 */
		const read = ()=>{
			let item = tockens.next();
			return item.done ? {type:'<EOF>'} : item.value;
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
		
		let tocken = read();
		
		stack.push(0);
		while(true){
			let state = stack.top;
			let type = tocken.type;
			
			let handler = State[state][type];
			if(handler){
				tocken = makeHandler(...handler)(stack, read, tocken, Special);
			}
			else if(type === '<EOF>'){
				let [MAIN] = pop(1);
				return MAIN;
			}
			else{
				throw new Error(`Unknown pair state=${state} tocken=${type}`);
			}
		}
	}


}


module.exports = makeTranslator;
