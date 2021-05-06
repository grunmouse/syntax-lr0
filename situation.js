const inspect = Symbol.for('nodejs.util.inspect.custom');

/**
 * Ситуацию, возникающую при разборе правила грамматики
 */
class Situation{
	/**
	 * @param left : String - левая часть правила - имя нетерминала
	 * @param right : Array<String> - правая часть правила - сворачиваемая последовательность
	 * @param pos : Number - позиция точки обхода на правой части
	 */
	constructor(left, right, pos=0){
		this.left = left;
		this.right = right;
		this.pos = pos;
	}
	
	get isFinal(){
		return this.pos>=this.right.length;
	}
	
	get next(){
		return this.right[this.pos];
	}
	
	findInRight(symbol){
		const result = [];
		let index = this.right.indexOf(symbol);
		while(index>-1){
			result.push(index);
			index = this.right.indexOf(symbol, index+1);
		}
		
		return result;
	}
	
	toString(){
		const {left, right, pos} = this;
		const prev = right.slice(0, pos).join(" "), next = right.slice(pos).join(" ");
		
		return `${left} := ${prev} * ${next}`;
	}
	
	toJSON(){
		return ''+this;
	}
	
	[inspect](depth, options){
		return ''+this.toString();
	}
	
	/**
	 * Создать новую ситуацию, введя очередной символ symbol
	 * symbol используется для контроля, если он определён, то он должен быть равен this.next
	 * @param symbol : String?
	 * @return Situation
	 */
	move(symbol){
		if(symbol && this.next !== symbol){
			throw new Error(`Incorrect symbol "${symbol}" for "${this}"`);
		}
		if(this.isFinal){
			throw new Error(`Situation is final: "${this}"`);
		}
		
		return new Situation(this.left, this.right, this.pos+1);
	}
	
	/**
	 * Создать новую ситуацию, передвинув позицию разбора на начало
	 */
	restart(){
		return new Situation(this.left, this.right, 0);
	}
}

module.exports = Situation;