openstoryboards.editor.Session = Base.extend({
	/* EVENTS
	 * - login(connection)
	 * 		thrown if login was successfully
	 * - error(message)
	 * 		thrown if an error occurs
	 * - version(version)
	 * 		thrown if version is ready
	 * - title(title)
	 * 		thrown if pad title is known
	 * - action(action)
	 * 		thrown when action was sent
	 * - ready()
	 * 		thrown when pad is synchronized with server
	 */
	constructor: function(padId) {
		var that = this;
		_.extend(this, Backbone.Events);
		this.padId = padId;
		this.state = null;
		this.hadError = false;
		this.on("error", function(message) {
			that.hadError = true;
		});
		this.setupSocket();
	},
	getPadId: function() {
		return this.padId;
	},
	send: function(object) {
		//this method will be overwritten by "setupSocket"
		openstoryboards.log.error("lost message: "+JSON.stringify(object));
	},
	setState: function(newState) {
		if(this.state!=null)
			this.state.onleave(this);
		this.state = newState;
		if(this.state!=null)
			this.state.onenter(this);
	},
	setupSocket: function() {
		var that = this,
			emptySend = this.send;
		this.socket = new WebSocket(openstoryboards.Config.WEBSOCKET_URL);
		this.socket.onopen = function(e) {
			that.setState(new openstoryboards.editor.states.SessionUnknownState());
		};
		this.socket.onerror = function(e) { 
			that.trigger("error", "A connection error occurred.");
		};
		this.socket.onclose = function(e) {
			openstoryboards.log.info("connection closed");
			that.send = emptySend;
			if(!that.hadError)
				that.setupSocket(); //TODO uncomment
		};
		this.socket.onmessage = function(e) {
			if(that.state!=null)
				that.state.onmessage(that, JSON.parse(e.data));
		};	
		this.send = function(object) {
			that.socket.send(JSON.stringify(object));
		}
	}
	
});