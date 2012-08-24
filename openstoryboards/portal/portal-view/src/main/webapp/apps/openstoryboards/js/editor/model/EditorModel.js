openstoryboards.editor.model.EditorModel = Base.extend({
	owner:        new openstoryboards.editor.model.Value(),
	connections:  new openstoryboards.utils.Map(),
	users:        new openstoryboards.utils.Map(),
	
	currentTool:  new openstoryboards.editor.model.Value(),
	
	fillColor:    new openstoryboards.editor.model.Value(),
	strokeColor:  new openstoryboards.editor.model.Value(),
	
	size:         new openstoryboards.editor.model.MinMaxValue(1, 100, 1),
	edge:         new openstoryboards.editor.model.MinMaxValue(0.0, 1.0, 0.001),
	opacity:      new openstoryboards.editor.model.MinMaxValue(0.0, 1.0, 0.001),
	antiAliased:  new openstoryboards.editor.model.Value(),
	
	width:        new openstoryboards.editor.model.Value(),
	height:       new openstoryboards.editor.model.Value(),
	
	//zoom:         new openstoryboards.editor.model.Value(),
	//layers:       new openstoryboards.utils.List(),
});
