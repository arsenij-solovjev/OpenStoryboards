openstoryboards.ui.Slider = openstoryboards.ui.Widget.extend({
	constructor: function(title, min, max, step) {
		var that = this,
			label = DOMBuilder.dom.LABEL({}, title),
			slider = DOMBuilder.dom.DIV();
		this.base();
		this.caption = title;
		this.slider = slider;
		this.label = label;
		$(this.contentElement).append(label);
		$(this.contentElement).append(slider);
		$(slider).slider({
			min: min,
			max: max,
			step: step,
			slide: function(event, ui) {
				//$(label).html(title+" ("+ui.value+")");
				that.trigger("change", ui.value);
			}
		});
	},
	
	getValue: function() {
		return $(this.slider).slider("option", "value");
	},
	
	setValue: function(value) {
		//$(this.label).html(this.caption+" ("+value+")");
		$(this.slider).slider("option", "value", value);
		this.trigger("change", value);
	}
});