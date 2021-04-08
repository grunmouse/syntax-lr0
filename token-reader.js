
/**
 * Создаёт функции чтения и заглядывания для итератора токенов
 *
 * @param tokens : Iterator<Token>
 */
function tokenReader(tokens){

	const queue = []; //Очередь чтения
	
	/**
	 * Читает очередной токен или генерирует токен <EOF>
	 */
	const doread = ()=>{
		let item = tokens.next();
		return item.done ? {type:'<EOF>'} : item.value;
	};
	
	const read = ()=>{
		if(queue.length){
			return queue.shift();
		}
		else{
			return doread();
		}
	}
	
	const view = (count)=>{
		while(queue.length<count){
			queue.push(doread());
		}
		return queue.slice(0, count);
	}
	
	return {read, view};
}

module.exports = tokenReader;