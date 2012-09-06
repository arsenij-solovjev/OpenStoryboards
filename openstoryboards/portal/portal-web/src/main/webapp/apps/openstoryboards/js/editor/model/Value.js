openstoryboards.editor.model.Value = Base.extend({
	/* EVENTS
	 * - change(value)
	 */
	value: null,
	constructor: function() {
		_.extend(this, Backbone.Events);
	},
	get: function() {
		return this.value;
	},
	set: function(value) {
		if(this.value != value) {
			this.value = value;
			this.trigger("change", value);
		}
	}
});