openstoryboards.Browser = Base.extend({
	getParameter: function(name) {
	    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
	    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
	},
	getCookie: function(name) {
		return $.cookie(name);
	},
	setCookie: function(name, value) {
		$.cookie(name, value);
	},
	getLocalVariable: function(name) {
		try {
	        return localStorage.getItem(name);
	    } catch (e) {}
	    return undefined;
	},
	setLocalVariable: function(name, value) {
		try {
	        localStorage.removeItem(name);
	        localStorage.setItem(name, value)
	    } catch (e) {
	        openstoryboards.log.error("Error setting local storage");
	    }
	}
});