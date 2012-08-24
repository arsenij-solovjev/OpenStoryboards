openstoryboards.editor.tools.Tool = Base.extend({
	/* EVENTS
	 * - action(action)
	 */
	constructor: function(name, iconClass, cursorClass, model) {
		_.extend(this, Backbone.Events);
		
		this.model = model;
		this.name = name;
		this.iconClass = iconClass;
		this.cursorClass = cursorClass;
	
		this.buttonDown = false;
		this.lastPosition = null;
	},
	
	showOptions: function(view) {

	},
	
	getName: function() {
		return this.name;
	},
	
	getIconClass: function() {
		return this.iconClass;
	},
	
	getCursorClass: function() {
		return this.cursorClass;
	},
	
	mouseDown: function(event) {
		
	},
	
	mouseUp: function(event) {
		
	},
	
	mouseMove: function(event) {
	
	},
	
	mouseEnter: function(event) {
		
	},
	
	mouseLeave: function(event) {
		
	},
	
	keyDown: function(event) {
		
	},
	
	keyUp: function(event) {
		
	},
	
	keyPress: function(event) {
		
	},
	/*
 * onBegin(from)
 * onEnd(to)
 * onMoveTo(from, to)
 */
});