openstoryboards.editor.model.Connection = Base.extend({
	/**
	 * EVENTS
	 * - active(activeState)
	 */
	constructor: function(id, user) {
		_.extend(this, Backbone.Events);
		this.id = id;
		this.user = user;
		this.active = true;
	},
	getId: function() {
		return this.id;
	},
	getUser: function() {
		return this.user;
	},
	equals: function(user) {
		return this.getId()==user.getId();
	},
	isActive: function() {
		return this.active;
	},
	setActive: function(state) {
		if(this.active==state)
			return;
		this.active = state;
		this.trigger("active", state);
	}
});