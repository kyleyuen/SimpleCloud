/*mongodb.js*/
var MongoClient = require("mongodb").MongoClient;


function MongoDB(){
	this.db = null;
	this.queue = [];
}

MongoDB.prototype.__init__ = function(){
	var rawthis = this;
	MongoClient.connct("mongodb://127.0.0.1:27017/rttbench", function(err, db){
		if(err)
			throw err;
		rawthis.db = db;
		rawthis.pickout();
	});
};
/*pickout the stored request in queue and deal with then*/
MongoDB.prototype.pickout = function(){
	var rawthis = this;
	rawthis.queue.forEach(function(query, index){
		if(query.operate == "save")
			rawthis.save(query.colle, query.params[0], callback);
	});
};

MongoDB.prototype.save = function(collection, criteria, callback){
	var rawthis = this;
	if(rawthis.db == null){
		rawthis.queue.push({
			operate: "save",
			colle: collection,
			params: [criteria,]
		});
		return;
	}
	var colle  = rawthis.db.collection(collection);
	colle.insert(criteria, callback);
}

MongoDB.prototype.getall = function(collection, criteria,callback){
	var rawthis = this;
	if(rawthis == null){
		return rawthis.queue.push({
			operate: "getall",
			colle: collection,
			params: [criteria,]
		});
	}
	var colle = rawthis.db.collection(collection);
	return colle.find(criteria,callback);
}