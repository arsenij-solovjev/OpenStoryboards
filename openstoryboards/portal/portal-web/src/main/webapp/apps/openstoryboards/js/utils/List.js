openstoryboards.utils.List = Base.extend({
	/* EVENTS
	 * - add(element, index)
	 * - remove(element, index)
	 */
	constructor: function(array) {
		this.elements = [];
		_.extend(this, Backbone.Events);
		if(array==undefined)
			return;
		var that = this;
		_.each(array, function(element) {
			that.add(element);
		});
	},
	
	add: function(element) {
		this.insert(element, this.elementCount-1);
	},
	
	insert: function(element, index) {
		this.elements.splice(index, 0, element);
		this.trigger("add", element, index);
	},
	
	remove: function(index_or_element) {
		if(typeof(index_or_element) === "number") {
			//is index
			var index = index_or_element
				element = this.elements[index];
			this.elements.splice(index, 1);
			this.trigger("remove", element, index);
		} else {
			//is element
			var element = index_or_element;
			for(var index = 0; index < this.elements.length; ) {
				if(this.elements[index] === element) {
					this.remove(index);
				} else
					index++;
			}
		}
	},
	
	size: function() {
		return this.elements.length;
	},
	
	contains: function(element) {
		var rslt = _.find(this.elements, function(e) {
			return e===element; 
		});
		return rslt!=undefined;
	},
});