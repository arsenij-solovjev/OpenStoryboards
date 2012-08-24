openstoryboards.editor.ImageProcessor = Base.extend({
	/* EVENTS
	 * - error(message)
	 * https://developer.mozilla.org/en-US/docs/HTML/Canvas/Pixel_manipulation_with_canvas
	 */
	constructor: function(canvas) {
		var that = this;
		_.extend(this, Backbone.Events);
		this.toolListeners = {};
		this.canvas = canvas;

		this.actionProcessor = new openstoryboards.editor.ActionProcessor();
		this.actionProcessor.addListener("BEGIN",  function(action) { that._begin(action); });
		this.actionProcessor.addListener("STROKE", function(action) { that._stroke(action); });
		this.actionProcessor.addListener("END",    function(action) { that._end(action); });
		//TODO undo, redo
		
		this._addToolListener("PENCIL", function(settings, action) { that._pencil(settings, action); });
		this._addToolListener("BRUSH",  function(settings, action) { that._brush(settings, action); });
		this._addToolListener("ERASER", function(settings, action) { that._eraser(settings, action); });
		//TODO eye dropper?
	},
	receiveAction: function(action) {
		this.actionProcessor.receiveAction(action);
	},
	
	_addToolListener: function(toolName, callback) {
		this.toolListeners[toolName] = callback;
	},
	_receiveToolStroke: function(toolName, settings, action) {
		if(this.toolListeners[toolName]!=null)
			this.toolListeners[toolName](settings, action);
		else
			this.trigger("error", "Tool '"+toolName+"' not registered.");
	},
	
	_begin: function(action) {},
	_end: function(action) {},
	_stroke: function(action) {},
	
	_getColor: function(colorStr, opacity) {
		var reg = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/,
			components = reg.exec(colorStr),
			red = parseInt(components[1], 16),
			green = parseInt(components[2], 16),
			blue = parseInt(components[3], 16),
			alpha = opacity;
		return [red, green, blue, Math.round(255 * alpha)];
	},
	
	_pencil: function(settings, strokeAction) { 
		//http://en.wikipedia.org/wiki/Xiaolin_Wu%27s_line_algorithm
		//http://rosettacode.org/wiki/Xiaolin_Wu%27s_line_algorithm
		//http://elynxsdk.free.fr/ext-docs/Rasterization/Antialiasing/Gupta%20sproull%20antialiased%20lines.htm
		
		//http://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
		
		/* PARAMETERS:
		 * - color
		 * - antiAliased
		 * - opacity
		 */
		var context = this.canvas.getContext("2d"),
			from = strokeAction.from,
			to = strokeAction.to, 
			color = this._getColor(settings.color, settings.opacity);
		if(settings.antiAliased) {
			context.strokeStyle = "rgba("+color[0]+","+color[1]+","+color[2]+","+settings.opacity+")";
			context.beginPath();
			context.moveTo(from.x, from.y);
			context.lineTo(to.x, to.y);
			context.stroke();
		} else {
			var left = Math.max(0, Math.min(from.x, to.x)),
				top  = Math.max(0, Math.min(from.y, to.y)),
				right = Math.min(this.canvas.width, Math.max(from.x, to.x)),
				bottom = Math.min(this.canvas.height, Math.max(from.y, to.y)),
				width = right - left + 1,
				height = bottom - top + 1,
				data = context.getImageData(left, top, width, height);
				setPixel = function(x, y) {
					if(x < left || x > right || y < top || y > bottom)
						return;
					var xx = x - left,
						yy = y - top,
						index = 4*(yy * width + xx),
						i;
					for(i=0; i<4; i++)
						data.data[index + i] = color[i];
				},
				line = function(x0, y0, x1, y1) {
					var dx = Math.abs(x1 - x0),
						dy = Math.abs(y1 - y0),
						sx = x0 < x1 ? 1 : -1,
						sy = y0 < y1 ? 1 : -1,
						err = dx - dy, e2;
					while(true) {
						setPixel(x0, y0);
						if(x0 == x1 && y0 == y1)
							break;
						e2 = 2*err;
						if(e2 > -dy) { 
							err = err - dy;
							x0 = x0 + sx;
						}
						if(e2 <  dx) { 
							err = err + dx;
							y0 = y0 + sy;
						}
					}
				};
			line(from.x, from.y, to.x, to.y);
			context.putImageData(data, left, top);
		}
	},
	_brush: function(settings, strokeAction) { 
		var context = this.canvas.getContext("2d"),
			from = strokeAction.from,
			to = strokeAction.to, 
			color = this._getColor(settings.color, settings.opacity),
			radius = Math.round(settings.size / 2),
			left = Math.max(0, Math.min(from.x, to.x) - radius),
			top  = Math.max(0, Math.min(from.y, to.y) - radius),
			right = Math.min(this.canvas.width, Math.max(from.x, to.x) + radius),
			bottom = Math.min(this.canvas.height, Math.max(from.y, to.y) + radius),
			width = right - left + 1,
			height = bottom - top + 1,
			size = settings.size,
			edge = settings.edge,
			brush = new Array(size*size),
			data = context.getImageData(left, top, width, height);
			doStamp = function(x, y) {
				if(x < left || x > right || y < top || y > bottom)
					return;
				var xx = x - left,
					yy = y - top,
					i, j, c, indexFrom, indexTo, xxx, yyy, alpha, antiAlpha;
				for(j = 0; j < size; j++) {
					for(i = 0; i < size; i++) {
						xxx = xx - radius + i;
						yyy = yy - radius + j;
						if(xxx < 0 || xxx > width || yyy < 0 || yyy > height)
							continue;
						indexFrom = j*size + i;
						indexTo = 4*(yyy * width + xxx);
						alpha = brush[indexFrom];
						antiAlpha = 1 - brush[indexFrom];
						for(c = 0; c < 4; c++) {
							data.data[indexTo + c] = alpha * color[c] + antiAlpha * data.data[indexTo + c];
						}
					}
				}
			},
			line = function(x0, y0, x1, y1) {
				var dx = Math.abs(x1 - x0),
					dy = Math.abs(y1 - y0),
					sx = x0 < x1 ? 1 : -1,
					sy = y0 < y1 ? 1 : -1,
					err = dx - dy, e2;
				while(true) {
					doStamp(x0, y0);
					if(x0 == x1 && y0 == y1)
						break;
					e2 = 2*err;
					if(e2 > -dy) { 
						err = err - dy;
						x0 = x0 + sx;
					}
					if(e2 <  dx) { 
						err = err + dx;
						y0 = y0 + sy;
					}
				}
			};
		//calculate brush
		for(var y = 0; y < size; y++)
			for(var x = 0; x < size; x++) {
				var index = y * size + x,
					dx = (x - radius)/radius,
					dy = (y - radius)/radius;
				//TODO edge...
				brush[index] = Math.max(0, 1-Math.sqrt(dx*dx + dy*dy));
			}
		//draw line
		line(from.x, from.y, to.x, to.y);
		//write back
		context.putImageData(data, left, top);
	},
	_eraser: function(settings, strokeAction) { openstoryboards.log.debug("eraser"); },
});