openstoryboards.editor.model.MinMaxValue = Base.extend({
	/* EVENTS
	 * - change(value)
	 */
	value: null,
	constructor: function(min, max, step) {
		_.extend(this, Backbone.Events);
		this.min = min;
		this.max = max;
		this.step = step;
	},
	round: function(value) {
		if(value > this.max) return this.max;
		if(value < this.min) return this.min;
		return Math.floor((value - this.min)/this.step) * this.step + this.min;
	},
	get: function() {
		return this.value;
	},
	set: function(value) {
		var newValue = this.round(value);
		if(this.value != value) {
			this.value = newValue;
			this.trigger("change", newValue);
		}
	}
});