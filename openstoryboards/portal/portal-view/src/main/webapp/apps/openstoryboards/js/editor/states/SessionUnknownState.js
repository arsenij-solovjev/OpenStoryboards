openstoryboards.editor.states.SessionUnknownState = openstoryboards.editor.states.State.extend({
	constructor: function() {},
	onenter: function(session) {
		var padId = session.padId,
		    sessionId = openstoryboards.browser.getCookie(openstoryboards.Config.SESSION_COOKIE)
		    		//this line is for debugging purpose
		    		|| openstoryboards.browser.getParameter("sessionId");
		openstoryboards.log.info("logging in... (pad-id: '"+padId+"', session-id: '"+sessionId+"')");
		session.send({
			padId: padId,
			sessionId: sessionId
		});
	},
	onmessage: function(session, message) {
		/*
		 * {
		 * 	"user":{
		 * 		"id":6,
		 * 		"name":"fry",
		 * 		"rights":["READ","WRITE"]
		 * 	},
		 * 	"connection":{
		 * 		"id":8,
		 * 		"accessToken":"IjNMpgqHinyLemjozzwdIMlajAjkzwrkzEnxqKet"
		 * 	},
		 * 	"pad":{
		 * 		"title":"debug pad"
		 * 	},
		 * 	"version":{
		 * 		"version":0,
		 * 		"actionSettings":[ actions ... ],
		 * 		"openConnections":[
		 * 			{
		 * 				"connectionId" : 1,
		 * 				"userId": 2,
		 * 				"username": "Paul"
		 * 			}
		 * 		]
		 * 	},
		 * 	"status":"OK"
		 * }
		 */
		if(message.status == "OK") {
			var user = openstoryboards.editor.users.get(message.user.id, message.user.name)
			    connection = openstoryboards.editor.connections.get(message.connection.id, user),
			    url = openstoryboards.Config.IMAGE_VERSION_URL+"/"+message.version.version+"?accessToken="+message.connection.accessToken,
			    version = new openstoryboards.editor.Version(message.version.version, url, message.version.actionSettings, message.version.openConnections);
			session.trigger("login", connection);
			session.trigger("title", message.pad.title);
			version.on("load", function() {
				session.trigger("version", version);
				session.setState(new openstoryboards.editor.states.SynchronizingState());
			});
			version.on("error", function() {
				session.trigger("error", "Hard version could not be loaded.");
			});
		} else {
			openstoryboards.log.info("login failed: "+message.message);
			session.trigger("error", message.message);
		}
	},
	onleave: function(session) {},
});