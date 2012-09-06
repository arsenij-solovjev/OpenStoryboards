openstoryboards.Logger = Base.extend({
	constructor: function(title) {
		var that = this,
			cookie = title+"-logger",
			header = DOMBuilder.dom.DIV({"class" : "openstoryboards-logger-header"}, title),
			body   = DOMBuilder.dom.DIV({"class" : "openstoryboards-logger-body"}),
			window = DOMBuilder.dom.DIV({"class" : "openstoryboards-logger"}, header, body);
		$("body").append(window);
		this.title = title;
		this.id = 0;
		this.body = body;
		this.hidden = openstoryboards.browser.getLocalVariable(cookie) != "1";
		if(this.hidden)
			$(window).hide();
		else
			$(window).show();
		$(document).keydown(function(e) {
			if(e.keyCode!=220)
				return;
			if(that.hidden) {
				$(window).show();
				openstoryboards.browser.setLocalVariable(cookie, "1");
			} else {
				$(window).hide();
				openstoryboards.browser.setLocalVariable(cookie, "0");
			}
			that.hidden = !that.hidden;
		});
	},
	_format: function(str) {
		return "["+this.title+"] "+str;
	},
	_print: function(type, msg) {
		var div = DOMBuilder.dom.DIV({"class" : type}, "["+(this.id++)+"] "+msg);
		$(this.body).append(div);
		this.body.scrollTop = this.body.scrollHeight;
	},
	debug: function(msg) {
		this._print("openstoryboards-logger-debug", msg);
		if(console && console.debug)
			console.debug(this._format(msg));		
	},
	info: function(msg) {
		this._print("openstoryboards-logger-info", msg);
		if(console && console.info)
			console.info(this._format(msg));
	}, 
	error: function(msg) {
		this._print("openstoryboards-logger-error", msg);
		if(console && console.error)
			console.error(this._format(msg));
	}
});