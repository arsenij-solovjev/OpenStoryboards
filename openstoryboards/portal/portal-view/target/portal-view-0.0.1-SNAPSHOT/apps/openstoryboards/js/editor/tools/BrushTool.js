openstoryboards.editor.tools.BrushTool = openstoryboards.editor.tools.StrokeTool.extend({
	constructor: function(model) {
		this.base(
			"Brush", 
			"openstoryboards-editor-tool-brush-icon", 
			"openstoryboards-editor-tool-brush-cursor",
			model
		);
	},

	generateBegin: function() {
		return {
			type: "BEGIN",
			tool: "BRUSH",
			color: this.model.strokeColor.get(),
			size: this.model.size.get(),
			opacity: this.model.opacity.get(),
			edge: this.model.edge.get(),
		};
	},
	
	showOptions: function(view) {

	},
});