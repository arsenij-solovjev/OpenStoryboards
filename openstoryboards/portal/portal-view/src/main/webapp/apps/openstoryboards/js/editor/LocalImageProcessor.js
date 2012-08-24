openstoryboards.editor.LocalImageProcessor = openstoryboards.editor.ImageProcessor.extend({
	/* EVENTS
	 * - send(action)
	 * - error(message)
	 */
	constructor: function(canvas) {
		this.base(canvas);
		this.localActionId = 0;
		this.lastBeginAction = null;
	},
	
	receiveAction: function(action) {
		action.localId = this.localActionId++;
		this.actionProcessor.receiveAction(action);
		this.trigger("send", action);
	},
	
	remove: function(remoteAction) {
		
	},
	
	_begin: function(action) {
		this.lastBeginAction = action;
	},
	_end: function(action) {
		this.lastBeginAction = null;
	},
	_stroke: function(action) {
		if(this.lastBeginAction==null) {
			this.trigger("error", "No BEGIN action found.");
			return;
		}
		this._receiveToolStroke(this.lastBeginAction.tool, this.lastBeginAction, action);
	},
});