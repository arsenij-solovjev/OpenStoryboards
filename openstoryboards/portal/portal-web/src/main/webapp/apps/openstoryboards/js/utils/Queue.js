openstoryboards.utils.Queue = Base.extend({
	/* EVENTS
	 * - enqueue(element)
	 * - dequeue(element)
	 */
	constructor: function(array) {
		this.elements = [];
		_.extend(this, Backbone.Events);
		if(array==undefined)
			return;
		var that = this;
		_.each(array, function(element) {
			that.enqueue(element);
		});
	},
	
	enqueue: function(element) {
		this.elements.push(element);
		this.trigger("enqueue", element);
	},
	
	dequeue: function() {
		var element = this.elements.shift();
		this.trigger("remove", element);
		return element;
	},
	
	size: function() {
		return this.elements.length;
	},
	
	contains: function(element) {
		var rslt = _.find(this.elements, function(e) {
			return e===element; 
		});
		return rslt!=undefined;
	}
});