openstoryboards.ui.ToolsbarButton = openstoryboards.ui.Widget.extend({
	constructor: function() {
		var that = this;
		this.base();
		this.addClass("toolsbarButton");
		$(this.containerElement).click(function() {
			that.trigger("click", that);
		});
	},
});