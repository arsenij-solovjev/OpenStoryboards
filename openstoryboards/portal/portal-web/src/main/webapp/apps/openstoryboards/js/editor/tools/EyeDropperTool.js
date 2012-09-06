openstoryboards.editor.tools.EyeDropperTool = openstoryboards.editor.tools.Tool.extend({
	constructor: function(model) {	
		this.base(
			"Eye dropper", 
			"openstoryboards-editor-tool-eyedropper-icon", 
			"openstoryboards-editor-tool-eyedropper-cursor",
			model
		);
	},
	
	showOptions: function(view) {

	},
});