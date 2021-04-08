const inspect = Symbol.for('nodejs.util.inspect.custom');

const Situation = require('./situation.js');
//const util = require('util');

//[util.inspect.custom]

//console.log(inspect === util.inspect.custom);

/**
 * Преобразует ситуацию в виде строки или экземпляра в пару ключ-значение
 * @param item : (String|Situation)
 * @return [String, Situation]
 */
function convertPair(item){
	let key;
	if(typeof item === 'string'){
		key = item;
		item = parseRule(item);
	}
	else if(item instanceof Situation){
		key = '' + item;
	}
	else if(Array.isArray(item)){
		if(item[1] instanceof Situation){
			return convertPair(item[1]);
		}
		else{
			throw new TypeError('Incorrect type '+item);
		}
	}
	return [key, item];
}

/**
 * Представляет ситуационное множество
 */
class SituationsSet extends Map{
	
	/**
	 * @param itr : Iterable<(string|Situation)>? - набор правил языка
	 */
	constructor(itr){
		itr = itr ? [...itr] : [];
		itr = itr.map((s)=>(convertPair(s)));
		super(itr);
	}
	add(item){
		const key = ''+item;
		if(super.has(key)){
			return super.get(key);
		}
		this.set(key, item);
		return item;
	}
	get(item){
		return super.get('' + item);
	}
	has(item){
		return super.get('' + item);
	}
	[Symbol.iterator](){
		return super.values();
	}
	toString(){
		return [...this].join(';\n');
	}
	toJSON(){
		return [...this];
	}
	[inspect](depth, options){
		return this.toJSON();
	}
	
	get key(){
		return [...this].sort().join(';\n');
	}
	
	/**
	 * Возвращает множество всех символов, которые могут быть следующими
	 */
	next(){
		let arr = [...this].map(s=>(s.next)).filter((a)=>(!!a));
		
		return new Set(arr);
	}
	
	hasConflict(){
		const reduce = [...this.itrFinal()];
		
		return reduce.length>1 || reduce.length === 1 && this.size > 1;
	}
	
	*itrFinal(){
		for(let item of this){
			if(item.isFinal){
				yield item;
			}
		}
	}
	
	/**
	 * Возвращает итератор всех правил, которые сворачиваются к переданному нетерминалу
	 * @param name : String - имя нетерминала
	 * @param Iterator<Situation>
	 */
	*itrForLeft(name){
		for(let item of this){
			if(item.left === name){
				yield item;
			}
		}
	}

	/**
	 * Возвращает итератор всех правил, у которых следующим символом является переданный
	 * @param name : String - имя символа
	 * @param Iterator<Situation>
	 */
	*itrForNext(name){
		for(let item of this){
			if(item.next === name){
				yield item;
			}
		}
	}
	
	allLeft(){
		const result = new Set()
		for(let item of this){
			result.add(item.left);
		}
		return result;
	}
	
	allWithoutLeft(){
		const net = new Set()
		let arr = [];
		for(let item of this){
			arr.push(...item.right);
			net.add(item.left);
		}
		arr = [...new Set(arr)];
		
		arr = arr.filter((sym)=>(!net.has(sym)));
		
		return arr;
	}
	
	getFirst(){
		return this.values().next().value;
	}
	
}

/**
 * Парсит строковое представление ситуации
 * Синтаксис:
 *   знак ":=" - разделитель левой и правой части
 *   знак "*" - позиция точки распознавания
 *   одиночные кавычки "'" - обозначают имя, содержащее пробелы и сами являются его частью
 *   имя символа - строка без пробелов или произвольная строка в одиночных кавычках
 *   пробелы вне одинарных кавычек - служат разделителями имён, если не стоят между именами - то игнорируются
 *   если точка "*" не задана, то позиция будет поставлена на начало правила
 *
 * @param code : string
 */
function parseRule(code){
	let [left, right] = code.split(':=');
	left = left.trim();
	right = right.trim();
	let items = right.split(/\s+|('[^']+')/g).filter((a)=>(!!a));
	
	let pos = items.indexOf('*');
	
	if(pos>-1){
		items.splice(pos, 1);
	}
	else{
		pos = 0;
	}
	
	return new Situation(left, items, pos);
}


module.exports = SituationsSet;