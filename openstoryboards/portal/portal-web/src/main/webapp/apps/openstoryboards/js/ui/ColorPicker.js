openstoryboards.ui.ColorPicker = openstoryboards.ui.Widget.extend({
	constructor: function() {
		var that = this;
		this.base();
		$(this.contentElement).ColorPicker({
			flat: true,
			"onChange" : function(hsb, hex, rgb) {
				var r = rgb.r.toString(16),
					g = rgb.g.toString(16),
					b = rgb.b.toString(16);
				while(r.length<2) r = "0"+r;
				while(g.length<2) g = "0"+g;
				while(b.length<2) b = "0"+b;
				var color = "#"+r+g+b;
				that.trigger("change", color);
			} 
		});
	},
	
	setColor: function(color) {
		$(this.contentElement).ColorPickerSetColor(color);
		this.trigger("change", color);
	}
});