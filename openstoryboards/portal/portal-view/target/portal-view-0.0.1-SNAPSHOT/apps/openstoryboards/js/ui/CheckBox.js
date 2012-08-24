openstoryboards.ui.CheckBox = openstoryboards.ui.Widget.extend({
	constructor: function(title) {
		var that = this;
		this.base();
		this.checkBoxElement = DOMBuilder.dom.INPUT({type: "checkbox"});
		this.labelElement = DOMBuilder.dom.LABEL({}, title);
		$(this.contentElement).append(this.checkBoxElement, this.labelElement);
		$(this.containerElement).click(function() {
			that.trigger("change", that.getState());
		});
	},
	
	getState: function() {
		return $(this.checkBoxElement).attr('checked')=="checked";
	},
	
	setState: function(state) {
		if(state != this.getState()) {
			$(this.checkBoxElement).attr('checked', state);
			this.trigger("change", this);
		}
	}
});