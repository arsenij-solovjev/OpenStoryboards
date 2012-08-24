openstoryboards.editor.Version = Base.extend({
	constructor: function(version, url, actionSettings, openConnections) {
		_.extend(this, Backbone.Events);
		this.version = version;
		this.actionSettings = actionSettings;
		this.openConnections = openConnections;
		var that = this;
		this.image = new Image();
		this.image.onload = function() {
			that.trigger("load");
		};
		this.image.onerror = function() {
			that.trigger("error");
		};
		this.image.src = url;
	},
	getImage: function() {
		return this.image;
	},
	getActionSettings: function() {
		return this.actionSettings;
	},
	getOpenConnections: function() {
		return this.openConnections;
	},
});