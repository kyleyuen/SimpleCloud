exports.wsinteractive = function(message, flags, ws){
	console.log("received data from client: %s", message);
	try{
		var data = JSON.parse(message);
		var buffsize = data.buffsize;
		var buffer = generate_string(buffsize);
		return ws.send(buffer);
	}
	catch(err){
		console.log("exception happened while interacting with websocket client:");
		console.dir(err);
		return ws.close();
	}
}

exports.wsclosed = function(code, message, ws){
	console.log("websocket connection has been closed!");
}

function generate_string(length){
	if(typeof length !== "number" || length <= 0){
		throw new Error("invalid buffer length");
	}
	var buffer = new Array(length+1);
	return buffer.toString();
}