openstoryboards.ui.Widget = Base.extend({
	constructor: function() {
		_.extend(this, Backbone.Events);
		this.parentElement = null;
		this.contentElement = DOMBuilder.dom.DIV({"class" : "openstoryboards-widget-content"});
    	this.containerElement = DOMBuilder.dom.DIV({"class" : "openstoryboards-widget-container"}, this.contentElement);
	},
	
	setPosition: function(left, top) {
		$(this.containerElement).offset({left: left, top: top});
	},
	
	offset: function() {
		return $(this.containerElement).offset();
	},
	
	html: function(content) {
		if(content==undefined)
			return $(this.contentElement).html();
		else
			$(this.contentElement).html(content);
	},
	
	addClass: function(className) {
		$(this.containerElement).addClass(className);
	},
	
	hide: function() {
		$(this.containerElement).hide();
	},
	
	show: function() {
		$(this.containerElement).show();
	},
	
	data: function(key, value) {
		if(value==undefined)
			return $(this.containerElement).data(key);
		else 
			$(this.containerElement).data(key, value);
	},
	
	getWidth: function() {
		return $(this.containerElement).width();
	},
	
	setWidth: function(width) {
		$(this.containerElement).width(width);
		this.trigger("resize", this);
	},
	
	getHeight: function() {
		return $(this.containerElement).height();
	},
	
	setHeight: function(height) {
		$(this.containerElement).height(height);
		this.trigger("resize", this);
	},
	
	setBounds: function(width, height) {
		$(this.containerElement).width(width);
		$(this.containerElement).height(height);
		this.trigger("resize", this);
	},
	
	getInnerWidth: function() {
		return $(this.containerElement).innerWidth();
	},
	
	getInnerHeight: function() {
		return $(this.containerElement).innerHeight();
	},
	
	getOuterWidth: function() {
		return $(this.containerElement).outerWidth();
	},
	
	getOuterHeight: function() {
		return $(this.containerElement).outerHeight();
	},
	
});