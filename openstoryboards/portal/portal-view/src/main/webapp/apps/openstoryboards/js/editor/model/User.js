openstoryboards.editor.model.User = Base.extend({
	constructor: function(id, name) {
		this.id = id;
		this.name = name;
	},
	getId: function() {
		return this.id;
	},
	getName: function() {
		return this.name;
	},
	equals: function(user) {
		return this.getId()==user.getId();
	}
});