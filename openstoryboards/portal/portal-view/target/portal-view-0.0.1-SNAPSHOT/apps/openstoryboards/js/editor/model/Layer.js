openstoryboards.editor.model.Layer = Base.extend({
	constructor: function(width, height) {
		_.extend(this, Backbone.Events);
		this.unackedCanvas = this._buildCanvas("openstoryboards-editor-layer-unacked-canvas", width, height);
		this.ackedCanvas = this._buildCanvas("openstoryboards-editor-layer-acked-canvas", width, height);
	},
	_buildCanvas: function(cssClass, width, height) {
		var canvas = DOMBuilder.dom.CANVAS({"class": cssClass});
		_.extend(canvas, Backbone.Events);
		canvas.width = width;
		canvas.height = height;
		return canvas;
	},
	//TODO set bounds, copy old canvas to new canvas
	getAckedCanvas: function() { return this.ackedCanvas; },
	getUnackedCanvas: function() { return this.unackedCanvas; }
});