openstoryboards.editor.view.EditorView = Base.extend({
	/* EVENTS
	 * - mouseMove(event)
	 * - mouseDown(event)
	 * - mouseUp(event)
	 * - mouseEnter(event)
	 * - mouseLeave(event)
	 * - keyDown(event)
	 * - keyUp(event)
	 * - keyPress(event)
	 */
	constructor: function(domNode, model, tools) {
		_.extend(this, Backbone.Events);
		this.model = model;
		this.tools = tools;
		this.el = domNode;
		this.locked = false;
		$(this.el).addClass("openstoryboards-editor");
        this.buildDOM();
        this.setupEvents();
    },
    
    lock: function(message) {
    	this.locked = true;
    	this.lockContainer.html(message==undefined ? "" : message);
    	this.lockContainer.show();
    },
    
    unlock: function() {
    	this.locked = false;
    	this.lockContainer.hide();
    },
    
    buildToolsbar: function() {
    	var that = this,
    		toolsbar = new openstoryboards.ui.Toolsbar(),
    		tools = this.tools,
    		current = this.model.currentTool.get();
    	
    	//add tool buttons
    	_.each(tools, function(tool) {
    		var button = new openstoryboards.ui.ToolsbarButton();
    		button.data("tool", tool);
    		button.addClass(tool.getIconClass());
    		button.addClass("openstoryboards-editor-tool");
    		button.on("click", function(btn) {
    			that.model.currentTool.set(tool);
    		});
    		toolsbar.add(button);
		});
    	
    	//current tool change event handling
    	this.model.currentTool.on("change", function() {
    		var tool = that.model.currentTool.get(),
				buttons = $(".openstoryboards-editor-tool");
			buttons.removeClass("openstoryboards-editor-tool-selected");
			_.each(buttons, function(button) {
				if($(button).data("tool")==tool)
					$(button).addClass("openstoryboards-editor-tool-selected");	
			});
		});
    	
    	return toolsbar;
    },
    
    buildOptions: function(area) {
    	var that = this,
    		colorPicker = new openstoryboards.ui.ColorPicker(),
    		chbAntialiased = new openstoryboards.ui.CheckBox("anti-aliased"),
    		slEdge = new openstoryboards.ui.Slider("edge", 0.0, 1.0, 0.001),
    		slOpacity = new openstoryboards.ui.Slider("opacity", 0.0, 1.0, 0.001),
    		slSize = new openstoryboards.ui.Slider("size", 1, 100, 1),
    		parseNumber = function(str) {
    			var num = parseFloat(str);
    			return isNaN(num) ? 0 : num;
    		};
    	//color
    	that.model.strokeColor.on("change", function(color) {
    		colorPicker.setColor(color);
    	});
    	colorPicker.on("change", function(color) {
    		that.model.strokeColor.set(color);
    	});
    	area.add(colorPicker);
    	colorPicker.setPosition(37, 11);
    	colorPicker.setWidth("400px");
    	
    	//anti-aliased
    	that.model.antiAliased.on("change", function(state) {
    		chbAntialiased.setState(state);
    	});
    	chbAntialiased.setWidth("200px");
    	chbAntialiased.on("change", function(state) {
    		that.model.antiAliased.set(state);
    	});
    	area.add(chbAntialiased);
    	chbAntialiased.setPosition(400, 10);
     	
    	//edge
    	that.model.edge.on("change", function(value) {
    		slEdge.setValue(value);
    	});
    	slEdge.on("change", function(value) {
    		that.model.edge.set(parseNumber(value));
    	});
    	area.add(slEdge);
    	slEdge.setPosition(400, 50);
    	slEdge.setWidth(200);
    	
    	//opacity
    	that.model.opacity.on("change", function(value) {
    		slOpacity.setValue(value);
    	});
    	slOpacity.on("change", function(value) {
    		that.model.opacity.set(parseNumber(value));
    	});
    	area.add(slOpacity);
    	slOpacity.setPosition(400, 90);
    	slOpacity.setWidth(200);
    	
    	//size
    	that.model.size.on("change", function(value) {
    		slSize.setValue(value);
    	});
    	slSize.on("change", function(value) {
    		that.model.size.set(parseNumber(value));
    	});
    	area.add(slSize);
    	slSize.setPosition(400, 130);
    	slSize.setWidth(200);
    	
    	this.model.currentTool.on("change", function(newTool) {
    		newTool.showOptions(that);
		});
    },
    
    buildCanvas: function() {
    	var that = this,
    	    container = new openstoryboards.ui.Container(),
    	    ackedCanvas = DOMBuilder.dom.CANVAS({"class" : "openstoryboards-editor-layer-acked-canvas"}),
    	    unackedCanvas = DOMBuilder.dom.CANVAS({"class" : "openstoryboards-editor-layer-unacked-canvas"});
    	this.unackedCanvas = unackedCanvas;
    	this.ackedCanvas = ackedCanvas;
    	container.addClass("openstoryboards-editor-canvas-container");
    	container.add(new openstoryboards.ui.DOMElement(ackedCanvas));
    	container.add(new openstoryboards.ui.DOMElement(unackedCanvas));
    	/*container.on("resize", function(sender) {
    		ackedCanvas.setWidth(sender.getWidth());
    		ackedCanvas.setHeight(sender.getHeight());
    		unackedCanvas.setWidth(sender.getWidth());
    		unackedCanvas.setHeight(sender.getHeight());
    	});*/
    	return container;
    },
    
    getUnackedCanvas: function() {
    	return this.unackedCanvas;
    },
    
    getAckedCanvas: function() {
    	return this.ackedCanvas;
    },
    
    buildSideMenu: function() {
    	var accordion = new openstoryboards.ui.Accordion(),
    		users = accordion.add("Users"),
    		blakeks = accordion.add("blakeks"),
    		blubber = accordion.add("blubber");
    	this.setupUserList(users);
    	return accordion;
    },
    
    setupUserList: function(dom) {
    	var ulOnline = DOMBuilder.dom.UL({"class" : "openstoryboards-editor-userlist"}),
    		ulOffline = DOMBuilder.dom.UL({"class" : "openstoryboards-editor-userlist"}),
    		users = new openstoryboards.utils.Map();
    	dom.add(new openstoryboards.ui.DOMElement(ulOnline));
    	dom.add(new openstoryboards.ui.DOMElement(ulOffline));
    	this.setUserState = function(user, state) {
    		var ul = state ? ulOnline : ulOffline,
    			li = null;
    		if(!users.containsKey(user.getId())) {
        		li = DOMBuilder.dom.LI({"class" : "openstoryboards-editor-userlist-item"}, user.getName());
        		$(li).data("user", user);
        		users.put(user.getId(), {
        			user: user,
        			item: li
        		});
        	} else {
        		li = users.get(user.getId()).item;
        		//$(li).remove();
        	}
    		if(state) {
    			$(li).removeClass("openstoryboards-editor-userlist-offline");
    			$(li).addClass("openstoryboards-editor-userlist-online");
    		} else {
    			$(li).removeClass("openstoryboards-editor-userlist-online");
    			$(li).addClass("openstoryboards-editor-userlist-offline");			
    		}
    		$(ul).append(li);
    		$(ul).children("li").sortElements(function(a, b){
    			var userA = $(a).data("user"),
    				userB = $(b).data("user");
    		    return userA.getName().toUpperCase() < userB.getName().toUpperCase() ? -1 : 1;
    		});
        };	
    },
    
    buildDOM: function() {
    	var that = this,
    		rootArea = new openstoryboards.ui.Root(this.el),
    	
    		topArea = new openstoryboards.ui.Container(),
    		middleArea = new openstoryboards.ui.Container(),
    		bottomArea = new openstoryboards.ui.Container(),
    		
    		sideAccordion = this.buildSideMenu(),
    		
    		toolsbar = this.buildToolsbar(),
    		sidebar = new openstoryboards.ui.Container(),
    		
    		canvas = this.buildCanvas();
    	
    	sidebar.add(sideAccordion);
    	
    	toolsbar.addClass("openstoryboards-editor-toolsbar");
    	sidebar.addClass("openstoryboards-editor-sidebar");
    	middleArea.add(toolsbar);
    	middleArea.add(canvas);
    	middleArea.add(sidebar);
    	
    	this.buildOptions(bottomArea);
    	
    	topArea.addClass("openstoryboards-editor-top-area");
    	middleArea.addClass("openstoryboards-editor-middle-area");
    	bottomArea.addClass("openstoryboards-editor-bottom-area");	
    
    	rootArea.add(topArea);
    	rootArea.add(middleArea);
    	rootArea.add(bottomArea);
    
    	this.lockContainer = new openstoryboards.ui.Container(); 
    	this.lockContainer.addClass("openstoryboards-editor-lock-screen");
    	rootArea.add(this.lockContainer);
    
    	var onResize = function() {
			var th = topArea.getOuterHeight(),
			    bh = bottomArea.getOuterHeight(),
			    wh = rootArea.getInnerHeight(),
			    tw = toolsbar.getOuterWidth(),
			    sw = sidebar.getOuterWidth(),
			    ww = rootArea.getInnerWidth();
			middleArea.setHeight((wh - th - bh)+"px");
			canvas.setWidth((ww - tw - sw)+"px");
		};
		$(window).resize(function() { 
			onResize(); 
		});
		onResize();
    },
    setupEvents: function() {
		var that = this;
		$(document).keydown(function(e) { 
			if(that.locked) 
				return;
			var event = new openstoryboards.ui.KeyEvent(e);
			that.trigger("keyDown", event); 
		});
		$(document).keyup(function(e) { 
			if(that.locked) 
				return;
			var event = new openstoryboards.ui.KeyEvent(e);
			that.trigger("keyUp", event); 
		});
		$(document).keypress(function(e) { 
			if(that.locked) 
				return;
			var event = new openstoryboards.ui.KeyEvent(e);
			that.trigger("keyPress", event); 
		});
		$(document).mousedown(function(e) { 
			if(that.locked) 
				return;
			var event = new openstoryboards.ui.MouseEvent(e, that.ackedCanvas);
			that.trigger("mouseDown", event); 
		});
		$(document).mouseup(function(e) { 
			if(that.locked) 
				return;
			var event = new openstoryboards.ui.MouseEvent(e, that.ackedCanvas);
			that.trigger("mouseUp", event); 
		});		
		$(document).mouseenter(function(e) { 
			if(that.locked) 
				return;
			var event = new openstoryboards.ui.MouseEvent(e, that.ackedCanvas);
			that.trigger("mouseEnter", event); 
		});
		$(document).mouseleave(function(e) { 
			if(that.locked) 
				return;
			var event = new openstoryboards.ui.MouseEvent(e, that.ackedCanvas);
			that.trigger("mouseLeave", event); 
		});
		$(document).mousemove(function(e) { 
			if(that.locked) 
				return;
			var event = new openstoryboards.ui.MouseEvent(e, that.ackedCanvas);
			that.trigger("mouseMove", event); 
		});
	},
});