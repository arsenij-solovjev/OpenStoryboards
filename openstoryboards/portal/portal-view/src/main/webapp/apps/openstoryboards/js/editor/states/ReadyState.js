openstoryboards.editor.states.ReadyState = openstoryboards.editor.states.State.extend({
	constructor: function() {},
	onenter: function(session) {},
	onmessage: function(session, message) {
		session.trigger("action", message);
	},
	onleave: function(session) {},
});