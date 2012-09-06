openstoryboards.editor.ActionProcessor = Base.extend({
	constructor: function() {
		this.patterns = {};
	},
	receiveAction: function(action) {
		var callback = this.patterns[action.type];
		if(callback!=undefined)
			callback(action);
	},
	addListener: function(patterns, callback) {
		var that = this;
		if(typeof(patterns)==="string")
			patterns = [patterns];
		_.each(patterns, function(pattern) {
			that.patterns[pattern] = callback;
		});
	}
});