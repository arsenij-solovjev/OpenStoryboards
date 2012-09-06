openstoryboards.editor.model.Image = Base.extend({
	/* EVENTS
	 * - change(rect)
	 * - resize()
	 */
	constructor: function(width, height) {
		_.extend(this, Backbone.Events);
		this.width = width;
		this.height = height;
		this.data = [];
		for(var w = 0; w < width; w++)
			for(var h = 0; h < height; h++)
				for(var p = 0; p < 4; p++)
					this.data.push(255);
		this.lock = 0; //0=pass events, >0=collect all events
		this.updateRect = null;
	},
	beginUpdate: function() {
		this.lock++;
	},
	endUpdate: function() {
		this.lock--;
		if(this.lock < 0)
			this.lock = 0;
		if(this.lock != 0)
			return;
		if(this.updateRect == null)
			return;
		this.trigger("change", this.updateRect);
		this.updateRect = null;
	},
	triggerResize: function() {
		this.trigger("resize", new openstoryboards.utils.Rect(0, 0, this.width, this.height));
	},
	triggerChange: function(rect) {
		if(this.lock==0) {
			this.trigger("change", rect);
			return;
		}
		if(this.updateRect==null) {
			this.updateRect = new openstoryboards.utils.Rect(rect.getLeft(), rect.getTop(), rect.getWidth(), rect.getHeight());
			return;
		}
		var leftA = this.updateRect.getLeft(), 
		    topA = this.updateRect.getTop(),
		    rightA = leftA + this.updateRect.getWidth(), 
		    bottomA = topA + this.updateRect.getHeight(),
		    leftB = rect.getLeft(), 
		    topB = rect.getTop(),
		    rightB = leftB + rect.getWidth(), 
		    bottomB = topB + rect.getHeight(),
		    left = Math.min(leftA, leftB),
		    top = Math.min(topA, topB),
		    right = Math.max(rightA, rightB),
		    bottom = Math.max(bottomA, bottomB),
		    width = right - left,
		    height = bottom - top;
		this.updateRect = new openstoryboards.utils.Rect(left, top, width, height);	
	},
	load: function(image) {
		var width = image.width,
			height = image.height,
			canvas = DOMBuilder.dom.CANVAS(),
			context = canvas.getContext("2d"),
			index,
			data;
		this.width = canvas.width = width;
		this.height = canvas.height = height;
		context.drawImage(image, 0, 0);
		this.data = new Array(width*height*4);
		data = context.getImageData(0, 0, width, height).data;
		for(index = 0; index < this.data.length; index++)
			this.data[index] = data[index];
		this.triggerResize();
	},
	getWidth: function() {
		return this.width;
	},
	getHeight: function() {
		return this.height;
	},
	_index: function(x, y, width, height) {
		return y * width + x;
	},
	setBounds: function(width, height) {
		if(this.width==width && this.height==height)
			return;
		if(width < 0 || height < 0)
			return;
		var data = new Array(width*height*4),
			w, h, from, to,
			color = [0, 0, 0, 0];
		for(h = 0; h < height; h++) {
			for(w = 0; w < width; w++) {
				to = 4 * this._index(w, h, width, height);
				data[to + 0] = color[0];
				data[to + 1] = color[1];
				data[to + 2] = color[2];
				data[to + 3] = color[3];
			}
		}
		for(h = 0; h < this.height && h < height; h++) {
			for(w = 0; w < this.width && w < width; w++) {
				from = 4 * this._index(w, h, this.width, this.height);
				to   = 4 * this._index(w, h, width, height);
				data[to + 0] = this.data[from + 0];
				data[to + 1] = this.data[from + 1];
				data[to + 2] = this.data[from + 2];
				data[to + 3] = this.data[from + 3];
			}
		}
		/*//section 1
		for(h = 0; h < height; h++) {
			for(w = 0; w < width; w++) {
				from = 4 * this._index(w, h, this.width, this.height);
				to   = 4 * this._index(w, h, width, height);
				data[to + 0] = data[from + 0];
				data[to + 1] = data[from + 1];
				data[to + 2] = data[from + 2];
				data[to + 3] = data[from + 3];
			}
		}
		//section 2
		for(h = 0; h < height; h++) {
			for(w = width; w < this.width; w++) {
				to = 4 * this._index(w, h, width, height);
				data[to + 0] = color[0];
				data[to + 1] = color[1];
				data[to + 2] = color[2];
				data[to + 3] = color[3];
			}
		}
		//section 3
		for(h = height; h < this.height; h++) {
			for(w = 0; w < width; w++) {
				to = 4 * this._index(w, h, width, height);
				data[to + 0] = color[0];
				data[to + 1] = color[1];
				data[to + 2] = color[2];
				data[to + 3] = color[3];
			}
		}
		//section 4
		for(h = height; h < this.height; h++) {
			for(w = width; w < this.width; w++) {
				to = 4 * this._index(w, h, width, height);
				data[to + 0] = color[0];
				data[to + 1] = color[1];
				data[to + 2] = color[2];
				data[to + 3] = color[3];
			}
		}*/
		//updates
		this.width = width;
		this.height = height;
		this.data = data;
		this.triggerResize();
	},
	
	getData: function(x, y, width, height) {
		var data = new Array(width*height*4),
			wto = x + width,
			hto = y + height,
			w, h, index,
			i = 0;
		for(h = y; h < hto; h++) {
			for(w = x; w < wto; w++) {
				index = 4 * this._index(w, h, this.width, this.height);
				data[i] = this.data[index + 0]; i++;
				data[i] = this.data[index + 1]; i++;
				data[i] = this.data[index + 2]; i++;
				data[i] = this.data[index + 3]; i++;
			}
		}
		return data;		
	},
	setData: function(data, x, y, width, height) {
		var wto = x + width,
			hto = y + height,
			w, h, index,
			i = 0;
		for(h = y; h < hto; h++) {
			for(w = x; w < wto; w++) {
				index = 4 * this._index(w, h, this.width, this.height);
				this.data[index + 0] = data[i++];
				this.data[index + 1] = data[i++];
				this.data[index + 2] = data[i++];
				this.data[index + 3] = data[i++];
			}
		}
		this.triggerChange(new openstoryboards.utils.Rect(x, y, width, height));
	}
});