openstoryboards.ui.Root = openstoryboards.ui.Container.extend({
	constructor: function(domNode) {
		var that = this;
		this.base();
		this.containerElement = domNode;
		$(this.containerElement).append(this.contentElement);
	}
});