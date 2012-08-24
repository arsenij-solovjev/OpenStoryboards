openstoryboards.ui.SpinEdit = openstoryboards.ui.Widget.extend({
	constructor: function(caption, from, to, step) {
		var that = this;
		this.base();
		this.addClass("openstoryboards-widget-spinedit");
		this.textElement = DOMBuilder.dom.INPUT({type: "text"});
		this.labelElement = DOMBuilder.dom.LABEL({}, caption);
		$(this.contentElement).append(this.labelElement, this.textElement);
		/*$(this.textElement).spinner({
			step: step, 
			largeStep: step*10,
			min: from, 
			max: to
		});*/
		$(this.textElement).change(function() {
			var value = $(that.textElement).val();
			that.trigger("change", value);
		});
	},
	
	setText: function(text) {
		$(this.textElement).val(text);
		this.trigger("change", text);
	},
	
	getText: function() {
		return $(this.textElement).val();
	}
});