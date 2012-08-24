openstoryboards.editor.tools.EraserTool = openstoryboards.editor.tools.StrokeTool.extend({
	constructor: function(model) {	
		this.base(
			"Eraser", 
			"openstoryboards-editor-tool-eraser-icon", 
			"openstoryboards-editor-tool-eraser-cursor",
			model
		);
	},
	
	generateBegin: function() {
		return {
			type: "BEGIN",
			tool: "ERASER",
			size: this.model.size.get(),
			opacity: this.model.opacity.get(),
			edge: this.model.edge.get(),
		};
	},	

	showOptions: function(view) {

	},
});