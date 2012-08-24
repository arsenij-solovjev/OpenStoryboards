openstoryboards.ui.Accordion = openstoryboards.ui.Widget.extend({
	constructor: function() {
		var that = this;
		this.base();
		this.addClass("openstoryboards-widget-accordion");
	},
	
	elements: [],
	
	add: function(title) {
		var that = this,
			h3 = DOMBuilder.dom.H3({"class" : "openstoryboards-widget-accordion-header"}, title),
			body = new openstoryboards.ui.Container();
		body.addClass("openstoryboards-widget-accordion-body");
		this.elements.push(body);
		
		$(this.contentElement).append(h3);
		if(this.elements.length==1) {
			$(this.contentElement).append(body.containerElement);
		}
		
		$(h3).click(function() {
			$(that.contentElement).find(".openstoryboards-widget-accordion-body").remove();
			$(body.containerElement).insertAfter(h3);
			that.updateHeight();
		});
		
		this.updateHeight();
		
		return body;
	},
	
	updateHeight: function() {
		var height = this.getInnerHeight(),
			body = null;
		$(this.contentElement).children().each(function(index, element) {
			if($(element).hasClass("openstoryboards-widget-accordion-body")) {
				body = element;
			} else {
				height -= $(element).height();
			}
		});
		$(body).height(height);
	}
});