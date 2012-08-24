openstoryboards.ui.DOMElement = openstoryboards.ui.Widget.extend({
	constructor: function(dom) {
		this.base();
		this.containerElement = dom;
		this.contentElement = dom;
	},
});