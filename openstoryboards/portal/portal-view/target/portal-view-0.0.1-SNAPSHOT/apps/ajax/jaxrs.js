var imageService = "http://" + window.location.host + "/portal/rest/images/create";

function createPad() {
	$.ajax({
		url : imageService,
		beforeSend : function(xhr) {
			xhr.overrideMimeType("application/json; charset=utf-8");
		}
	}).done(function(data) {
		console.info(data);
		if (console && console.log) {
			console.log("Sample of data:", data.slice(0, 100));
		}
	});
}