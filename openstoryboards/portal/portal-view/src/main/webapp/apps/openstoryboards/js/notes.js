//this file is for idea development purpose
/**************/
/*SYNCHRONIZING PROCESS*/
this.ackedActionQueue = new Sketch.Queue();
this.unackedActionQueue = new Sketch.Queue();
this.ackedImageProcessor = new Sketch.ImageProcessor(this.ackedCanvas, this.ackedActionQueue);	
this.unackedImageProcessor = new Sketch.ImageProcessor(this.unackedCanvas, this.unackedActionQueue);
//give unacked actions an id
this.unackedActionQueue.on("beforeEnqueue", function(action) {
	action.id = ++actionId;
});
//transmit new unacked actions
this.unackedActionQueue.on("afterEnqueue", function(action) {
	that.connection.send(action);
});
//session input
this.connection.on("message", function(action) {
	that.ackedActionQueue.enqueue(action);
});
//dequeue acked action from unacked queue
this.ackedActionQueue.on("afterEnqueue", function(action) {
	that.unackedActionQueue.dequeue(function(a) {
		return a.id==action.id; 
	});
});
//redraw unacked image when a action was dequeued
this.unackedActionQueue.on("afterDequeue", function(action) {
	var it = that.unackedActionQueue.iterator();
	that.unackedImageProcessor.clear();
	while(it.hasNext()) {
		that.unackedImageProcessor.applyAction(it.next());
	}
});
/**************/

Step = Base.extend({
	- step-id
	- connection-id --> connection-object
	- undone
});

Connection = Base.extend({
	- connection-id
	- user-id --> user-object
	- pad-id --> pad-object
	- online-status
	
	- setUser(user)
	- setPad(pad)
});

Tool = Base.extend({})
PointerTool = Tool.extend({})
BrushTool = Tool.extend({})
PencilTool = Tool.extend({})
EraserTool = Tool.extend({})
RectMarqueeTool = Tool.extend({})
EllipseMarqueeTool = Tool.extend({})
LassoTool = Tool.extend({})
PolygonMarqueeTool = Tool.extend({})

ColorPicker???
		
		
Canvas = Base.extend({});

/*ImageProcessor = Base.extend({
	- begin(tool)
		- session.sendAction(
			new UnacknowledgedAction("BEGIN", {
				type: "BEGIN",
				tool: tool.name,
				options: tool.options
			}));
	- end()
		- session.sendAction(new UnacknowledgedAction("END"))
	- stroke(from, to)
		- session.sendAction(new UnacknowledgedAction("STROKE", {from: from, to: to}))
	- undo ...
	- redo ...
});*/
		
- merke immer letzte ungeschlossene BEGIN-Action

- Online/Offline-Liste