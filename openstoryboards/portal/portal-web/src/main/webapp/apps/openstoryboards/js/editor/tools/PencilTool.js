openstoryboards.editor.tools.PencilTool = openstoryboards.editor.tools.StrokeTool.extend({
	constructor: function(model) {	
		this.base(
			"Pencil", 
			"openstoryboards-editor-tool-pencil-icon", 
			"openstoryboards-editor-tool-pencil-cursor",
			model
		);
	},
	
	generateBegin: function() {
		return {
			type: "BEGIN",
			tool: "PENCIL",
			color: this.model.strokeColor.get(),
			antiAliased: this.model.antiAliased.get(),
			opacity: this.model.opacity.get()
		};
	},
	
	showOptions: function(view) {

	},
});