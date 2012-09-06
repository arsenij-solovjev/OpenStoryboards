openstoryboards.editor.states.SynchronizingState = openstoryboards.editor.states.State.extend({
	messages: [],
	constructor: function() {},
	onenter: function(session) {
		session.send("READY-TO-SYNC");
	},
	onmessage: function(session, message) {
		//save all messages except for the SYNC packet
		if(message.type ==  "SYNC") {
			//TODO get connections
			_.each(message.actions, function(action) {
				session.trigger("action", action);
			});
			_.each(this.messages, function(action) {
				session.trigger("action", action);
			});
			this.messages = [];
			session.setState(new openstoryboards.editor.states.ReadyState());
			session.trigger("ready");
		} else {
			this.messages.push(message);
		}
	},
	onleave: function(session) {},
});