openstoryboards.utils.Pool = Base.extend({
	/**
	 * @param constr the constructor function of the object 
	 *        type that should be holded in the pool
	 *        the object must have a function "equals(obj)"
	 */
	constructor: function(constr) {
		this.objectConstructor = constr;
		this.pool = [];
	},
	size: function() {
		return this.pool.length;
	},
	get: function() {
		var that = this,
			//define apply function
			applyDX = function(){
			    function tempCtor() {};
			    return function(ctor, args){
			        tempCtor.prototype = ctor.prototype;
			        var instance = new tempCtor();
			        ctor.apply(instance,args);
			        return instance;
			    }
			}(),	
			//create object
			object = applyDX(this.objectConstructor, arguments),
		    //find element
		    item = _.find(this.pool, function(element) {
		    	return element.equals(object);
		    });
		if(item!=undefined)
			return item;
		this.pool.push(object);
		return object;		
	}
});