openstoryboards.ui.KeyEvent = Base.extend({
	constructor: function(event) {
		//test unixpapa.com/js/testkey.html
		this.code = event.keyCode || event.which;
	}
});