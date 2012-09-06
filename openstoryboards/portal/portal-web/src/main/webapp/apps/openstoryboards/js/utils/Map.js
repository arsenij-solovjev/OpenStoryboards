openstoryboards.utils.Map = Base.extend({
	/* EVENTS
	 * - put(key, value)
	 * - remove(key, value)
	 */
	constructor: function() {
		_.extend(this, Backbone.Events);
		this.keys = [];
		this.values = [];
	},
	
	_find: function(key) {
		for(var index = 0; index < this.keys.length; index++)
			if(this.keys[index]===key)
				return index;
		return -1;
	},
	
	put: function(key, value) {
		var index = this._find(key);
		if(index==-1) {
			this.keys.push(key);
			this.values.push(value);
		} else {
			this.values[index] = value;
		}
		this.trigger("put", key, value);
	},
	
	get: function(key) {
		var index = this._find(key);
		return index==-1 ? null : this.values[index];
	},
	
	remove: function(key) {
		var index = this._find(key);
		if(index == -1)
			return;
		var value = this.values[index];
		this.keys.splice(index, 1);
		this.values.splice(index, 1);
		this.trigger("remove", key, value);
	},
	
	size: function() {
		return this.keys.length;
	},
	
	containsKey: function(key) {
		return this._find(key) != -1;
	},
	
	contains: function(value) {
		return undefined != _.find(this.values, function(element) {
			return element === value; 
		});
	},
});