openstoryboards.Editor = Base.extend({
	constructor: function(domNode, padId) {
		var that = this;
		this.setupModel();
		this.setupTools();
		this.setupView(domNode);
		this.view.lock("loading...");
		this.setupImageProcessors();
		this.setupActionProcessors();
		this.setupSession(padId);
		this.setupConnectionListener();
		this.setupToolListeners();
		this.configureModel();
	},

	setupModel: function() {
		this.model = new openstoryboards.editor.model.EditorModel();
	},
	
	configureModel: function() {
		//owner       --> set by Session
		//connections --> set by Session
		//users       --> set by Session
		this.model.currentTool.set(this.tools[0]);
		
		this.model.strokeColor.set("#000000");
		this.model.fillColor.set("#FFFFFF");
		
		this.model.size.set(10);
		this.model.edge.set(1.0);
		this.model.opacity.set(1.0);
		this.model.antiAliased.set(false);
		
		//width  --> set by Session
		//height --> set by Session
	},
	
	setupConnectionListener: function() {
		var that  = this;
		this.model.connections.on("put", function(connectionId, connection) {
			//add new user
			var user = connection.getUser();
			if(!that.model.users.containsKey(user.getId())) {
				that.model.users.put(user.getId(), user);
			}
			//add connection state listener
			connection.on("active", function(state) {
				that.view.setUserState(user, state);
			});
			//update online status
			that.view.setUserState(user, connection.isActive());
		});
	},
	
	setupToolListeners: function() {
		var that = this,
			toolCallback = function(action) { that.localActionProcessor.receiveAction(action); },
			callback = function(tool) { tool.on("action", toolCallback); };
		_.each(this.tools, callback);
	},
	
	setupImageProcessors: function() {
		var that = this;
		//=== LOCAL ===
		this.localImageProcessor = new openstoryboards.editor.LocalImageProcessor(this.unackedCanvas);
		this.localImageProcessor.on("error", function(message) {
			openstoryboards.log.error(message);
			that.view.lock(message);
		});
		this.localImageProcessor.on("send", function(action) {
			that.session.send(action);
		});
		//=== REMOTE ===
		this.remoteImageProcessor = new openstoryboards.editor.RemoteImageProcessor(this.ackedCanvas);
		this.remoteImageProcessor.on("error", function(message) {
			openstoryboards.log.error(message);
			that.view.lock(message);
		});
		this.remoteImageProcessor.on("send", function(action) {
			that.localImageProcessor.remove(action);
		}); 
	},
	
	setupActionProcessors: function() {
		var that = this;
		
		//=== REMOTE ===
		this.remoteActionProcessor = new openstoryboards.editor.ActionProcessor();
		this.remoteActionProcessor.addListener("LOGIN", function(action) {
			//{"type":"LOGIN","connectionId":23,"userId":6,"username":"fry","rights":["WRITE","READ"]}
			var user = openstoryboards.editor.users.get(action.userId, action.username, action.rights),
				connection = openstoryboards.editor.connections.get(action.connectionId, user);
			that.model.connections.put(connection.getId(), connection);
			openstoryboards.log.info("user '"+user.getName()+"' ("+user.getId()+") logged in");
		});
		this.remoteActionProcessor.addListener("LOGOUT", function(action) {
			//{"type":"LOGOUT","connectionId":115,"userId":6}
			var connection = that.model.connections.get(action.connectionId),
				user = connection.getUser();
			connection.setActive(false);
			openstoryboards.log.info("user '"+user.getName()+"' ("+user.getId()+") logged out");
		});
		this.remoteActionProcessor.addListener("ERROR", function(action) {
			//{"type":"ERROR","message":"This is an error."}
			that.view.lock("[Error] "+action.message);
		});
		this.remoteActionProcessor.addListener(["BEGIN", "STROKE", "END", "UNDO", "REDO"], function(action) {
			that.remoteImageProcessor.receiveAction(action);
		});
		
		//=== LOCAL ===
		this.localActionProcessor = new openstoryboards.editor.ActionProcessor();
		this.localActionProcessor.addListener(["BEGIN", "STROKE", "END", "UNDO", "REDO"], function(action) {
			that.localImageProcessor.receiveAction(action);
		});
	},
	
	setupSession: function(padId) {
		var that = this;
		this.session = new openstoryboards.editor.Session(padId);
		//if session is ready for editing
		this.session.on("ready", function() {
			openstoryboards.log.info("synchronizing finished, ready");
			that.view.unlock();
		});
		//if session produces ann error
		this.session.on("error", function(message) {
			openstoryboards.log.error(message);
			that.view.lock("[Error] "+message);
		});
		//if user successfully logged in
		this.session.on("login", function(connection) {
			openstoryboards.log.info("login success (user: '"+connection.user.name+"', userId: "+connection.user.id+")");
			that.model.owner.set(connection);
			that.model.connections.put(connection.getId(), connection);
		});
		//if last hard version is loaded
		this.session.on("version", function(version) {
			var image = version.image,
			    width = image.width,
			    height = image.height;
			//load image
			that.unackedCanvas.width = width;
			that.unackedCanvas.height = height;
			that.ackedCanvas.width = width;
			that.ackedCanvas.height = height;
			that.ackedCanvas.getContext("2d").drawImage(image, 0, 0);
			
			//process connections
			_.each(version.getOpenConnections(), function(conn) {
				var user = openstoryboards.editor.users.get(conn.userId, conn.username)
					connection = openstoryboards.editor.connections.get(conn.connectionId, user);
				that.model.connections.put(connection.getId(), connection);
				//TODO muss das sein?
				connection.setActive(false);
			});
			
			//procces action settings
			_.each(version.getActionSettings(), function(action) {
				that.remoteActionProcessor.receiveAction(action);
			});
			
			//update dimensions
			that.model.width.set(width);
			that.model.height.set(height);
		});
		//if action was sent
		this.session.on("action", function(action) {
			that.remoteActionProcessor.receiveAction(action);
		});
	},
	
	setupTools: function() {
		this.tools = [
			    new openstoryboards.editor.tools.PencilTool(this.model),
			    new openstoryboards.editor.tools.BrushTool(this.model),
			    new openstoryboards.editor.tools.EraserTool(this.model),
			    new openstoryboards.editor.tools.EyeDropperTool(this.model)
		];
	},
	
	setupView: function(domNode) {
		var that = this;
		this.view = new openstoryboards.editor.view.EditorView(domNode, this.model, this.tools);
		
		this.ackedCanvas = this.view.getAckedCanvas();
		this.unackedCanvas = this.view.getUnackedCanvas();
		
		//event handling
		this.view.on("mouseMove", function(event) { 
			that.model.currentTool.get().mouseMove(event); });
		this.view.on("mouseDown", function(event) { 
			that.model.currentTool.get().mouseDown(event); });
		this.view.on("mouseUp", function(event) { 
			that.model.currentTool.get().mouseUp(event); });
		this.view.on("mouseEnter", function(event) { 
			that.model.currentTool.get().mouseEnter(event); });
		this.view.on("mouseLeave", function(event) { 
			that.model.currentTool.get().mouseLeave(event); });
		this.view.on("keyDown", function(event) { 
			that.model.currentTool.get().keyDown(event); });
		this.view.on("keyUp", function(event) { 
			that.model.currentTool.get().keyUp(event); });
		this.view.on("keyPress", function(event) { 
			that.model.currentTool.get().keyPress(event); });
	}
	
});