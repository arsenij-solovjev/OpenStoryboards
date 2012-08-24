openstoryboards.editor.RemoteImageProcessor = openstoryboards.editor.ImageProcessor.extend({
	/* EVENTS
	 * - send(action)
	 */
	constructor: function(canvas) {
		this.base(canvas);
	},
	
	receiveAction: function(action) {
		this.actionProcessor.receiveAction(action);
		this.trigger("send", action);
	},
});