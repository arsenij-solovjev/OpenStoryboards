var baseUrl = "apps/openstoryboards/js/";

/*try {  
    netscape.security.PrivilegeManager.enablePrivilege("CapabilityPreferencesAccess");
    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
    netscape.security.PrivilegeManager.enablePrivilege("UniversalFileRead");
} catch (e) {  
    alert("file read access failed");  
} */

function ModuleLoader(baseUrl) {
	this.lines = 0;
	//setup element for the whole script
	this.allElement = document.createElement('script');
    this.allElement.setAttribute('type', 'text/whole-javascript');
    this.allElement.setAttribute('base', baseUrl);
    document.getElementsByTagName('head')[0].appendChild(this.allElement);
	
    //data url for retrieving the whole script via a redirect
    this.dataURL = function() {
    	return "data:text/javascript;base64,"+Base64.encode($(this.allElement).html());
    };
    
    //module loader...
	this.loading = false;
	this.modules = [];
	this.callbacks = [];
	this.ready = function(callback) {
		this.callbacks.push(callback);
	};
	this.callback = function() {
		for(var i=0; i<this.callbacks.length; i++)
			this.callbacks[i]();
	};
	this.load = function(module) {
		var that = this,
		    loadScript = function() {
				var mod = that.modules.shift();
				if(mod==null) {
					that.loading = false;
					$(that.allElement).prepend("// number of lines: "+that.lines+"\n\n");
					that.callback();
					return;
				}
				that.loading = true;
				
				var url = baseUrl + mod;
				
				//download script for big concat
			    $.ajax({
			    	url: url,
			    	async: false,
			    	dataType: "text",
			    	success: function(e) {
			    		$(that.allElement).append("\n\n//--- module '"+mod+"' ---\n\n"+e);
			    		var count = e.split(/\r\n|\r|\n/).length;
			    		that.lines += count;
			    	}
			    });
				
				//create new script
				var element = document.createElement('script');
			    element.onload = function(x) {
			    	loadScript();
			    }
			    element.setAttribute('type', 'text/javascript');
			    element.setAttribute('src', url);
			    document.getElementsByTagName('head')[0].appendChild(element);
			};
			
		this.modules.push(module);
		if(!this.loading) 
			loadScript();
	}
};

var modules = new ModuleLoader(baseUrl);

modules.load("modules.js");

modules.load("base.js");

modules.load("Logger.js");
modules.load("Browser.js");
modules.load("Config.js");

modules.load("utils/Line.js");
modules.load("utils/Rect.js");
modules.load("utils/List.js");
modules.load("utils/Queue.js");
modules.load("utils/Pool.js");
modules.load("utils/Map.js");

modules.load("ui/Widget.js");
modules.load("ui/DOMElement.js");
modules.load("ui/Toolsbar.js");
modules.load("ui/ToolsbarButton.js");
modules.load("ui/Container.js");
modules.load("ui/Accordion.js");
modules.load("ui/Root.js");
modules.load("ui/MouseEvent.js");
modules.load("ui/KeyEvent.js");
modules.load("ui/CheckBox.js");
modules.load("ui/ColorPicker.js");
modules.load("ui/Slider.js");
modules.load("ui/SpinEdit.js");


modules.load("editor/model/User.js");
modules.load("editor/model/Connection.js");
modules.load("editor/model/Value.js");
modules.load("editor/model/MinMaxValue.js");
modules.load("editor/model/Layer.js");
//modules.load("editor/model/Image.js");
//modules.load("editor/model/Canvas.js");
modules.load("editor/model/EditorModel.js");

modules.load("editor/states/State.js");
modules.load("editor/states/SessionUnknownState.js");
modules.load("editor/states/SynchronizingState.js");
modules.load("editor/states/ReadyState.js");

modules.load("editor/Version.js");
modules.load("editor/Session.js");
modules.load("editor/ActionProcessor.js");
modules.load("editor/ImageProcessor.js");
modules.load("editor/LocalImageProcessor.js");
modules.load("editor/RemoteImageProcessor.js");


modules.load("editor/tools/Tool.js");
modules.load("editor/tools/StrokeTool.js");
modules.load("editor/tools/PencilTool.js");
modules.load("editor/tools/BrushTool.js");
modules.load("editor/tools/EraserTool.js");
modules.load("editor/tools/EyeDropperTool.js");

modules.load("editor/view/EditorView.js");

modules.load("Editor.js");

modules.load("singletons.js");