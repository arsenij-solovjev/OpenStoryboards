openstoryboards.browser = new openstoryboards.Browser();

openstoryboards.log = new openstoryboards.Logger("openstoryboards");

openstoryboards.editor.users = new openstoryboards.utils.Pool(openstoryboards.editor.model.User);
openstoryboards.editor.connections = new openstoryboards.utils.Pool(openstoryboards.editor.model.Connection);