var http = require('http');
var express = require('express');
var math=require('url');
var redis=require('redis');
var async=require('async');
var geo = require('geolib')

var keyloc = require('./keygeoloc')
getKeyFromString = keyloc.getKeyFromString

var app = express();

var read = redis.createClient(6399,'127.0.0.1'); //11111,'127.0.0.1'
read.on('connect', function(){
	console.log('connected');
});


app.get('/drivers', function(request, response){
  var headers = request.headers;
  var method = request.method;
  var url = request.url;
  var body = [];
  var driverid;
  var lower;
  var upper;
  var data;
  console.log(request.query.latitude + ' : ' + request.query.longitude + ' : ' + request.query.radius + ' : ' + request.query.limit);
  //var result = url.parse( );
  //callInfinite( 60000,  fetchLocations );
  //if( method === 'GET' )
  {
	    console.time("fetch");
		var out=''
		var limit = request.query.limit;
		var climit=request.query.limit;
		var radius = request.query.radius;
		var qloc = { latitude: request.query.latitude , longitude: request.query.longitude };
		key = getKeyFromString( JSON.stringify(qloc) );
		//console.log( key )
		var possiblelist=[]
		read.lrange(key, 0, -1, function(err, replies){
			
			if( replies.length == 0 )
			{
				response.statusCode = 200;
				response.end('[]');
				console.timeEnd("fetch");
				return;
			}
			//console.log( ' total available records : ' + replies.length  );
			total = replies.length ;
			//var allkeys=[]
			var keys=[]
			replies.forEach(function (item, index){
					
					keys.push(item)
					--total;
					if( total == 0  || (index % climit) == 0 )
					{
						read.mget(keys, function(err, replies){
							var recs = replies.length;
							console.log( 'recs : ' + recs);
							replies.forEach(function(reply, index){
								var loc = JSON.parse(reply); 
								var distance = geo.getDistanceSimple(loc, qloc, loc['accuracy']);
								//console.log( 'dist : ' + distance);
				
								if ( distance < radius )
								{
									delete loc.accuracy;
									//loc['id'] = index;
									loc['distance'] = distance;
									out += JSON.stringify( loc ) + ',\n';
									if ( --limit == 0 )
									{
										//console.log( index );
										response.statusCode = 200;
										response.end('[' + out.substring(0,out.length-2) + ']');
										console.timeEnd("fetch");
										return;
									}
								}
								if( --recs == 0 )
								{
									if( total == 0 )
									{
										//console.log('limit :  ', limit);
										console.timeEnd("fetch");
										response.statusCode = 200;
										response.end('[' + out.substring(0,out.length-2) + ']');
										return;
									}
									keys=[]
							
								}
							});
						});
					}
					
			});
		});
  }
  
  
});

app.listen(8081);

/*

var server = http.createServer(function(request, response) {
  var headers = request.headers;
  var method = request.method;
  var url = request.url;
  var body = [];
  var driverid;
  var lower;
  var upper;
  var data;
  console.log(request.url + ' : ' + );
  //var result = url.parse( );
  //callInfinite( 60000,  fetchLocations );
  if (method === 'PUT' )
  {
	
  }
  else if( method === 'GET' )
  {
	    console.time("fetch");
		var out=''
		var limit = 10, climit;
		var p = { latitude: 70.10932442 , longitude: 70.2155499 };
		key = getKeyFromString( JSON.stringify(p) );
		console.log( key )
		var possiblelist=[]
		read.lrange(key, 0, -1, function(err, replies){
			
			if( replies.length == 0 )
			{
				response.statusCode = 200;
				response.end('[]');
				console.timeEnd("fetch");
				return;
			}
			console.log( ' t : ' + replies.length  );
			total = replies.length ;
			var allkeys=[]
			var keys=[]
			replies.forEach(function (item, index){
					
					keys.push(item)
					--total;
					if( total == 0 || (index % climit) == 0 )
					{
						read.mget(keys, function(err, replies){
							var recs = replies.length;
							console.log( 'recs : ' + recs);
							replies.forEach(function(reply, index){
								var loc = JSON.parse(reply); 
								var distance = geo.getDistanceSimple(loc, p, loc['accuracy']);
								//console.log( 'dist : ' + distance);
				
								if ( distance < 500 )
								{
									delete loc.accuracy;
									loc['id'] = index;
									loc['distance'] = distance;
									out += JSON.stringify( loc ) + ',\n';
									if ( --limit == 0 )
									{
										console.log( index );
										response.statusCode = 200;
										response.end('[' + out.substring(0,out.length-2) + ']');
										console.timeEnd("fetch");
										return;
									}
								}
								if( --recs == 0 )
								{
									if( total == 0 )
									{
										console.log('limit :  ', limit);
										console.timeEnd("fetch");
										response.statusCode = 200;
										response.end('[' + out.substring(0,out.length-2) + ']');
									}
									keys=[]
									//console.log( index );
									//console.timeEnd("fetch");
									//response.statusCode = 200;
									//response.end('[' + out.substring(0,out.length-2) + ']');
									//return cb(null, response);
									
								}
							});
						});
					}
					
			});
		});
  }
  else 
  {
    response.statusCode = 404;
    response.end();
  }
 
	
}).listen(8081);

*/