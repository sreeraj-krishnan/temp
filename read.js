var http = require('http');
var express = require('express');
var math=require('url');
var redis=require('redis');
var async=require('async');
var geo = require('geolib')

var keyloc = require('./keygeoloc')
getKeyFromString = keyloc.getKeyFromString

var app = express();

var read = redis.createClient(6399,'127.0.0.1'); 

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

  {
	    console.time("fetch");
		var out=''
		var done = false;
		var limit = request.query.limit;
		if( limit == undefined || limit == null )
		{
			limit = 10;
		}
		var climit = limit;
		var radius = request.query.radius;
		if( radius == undefined || radius == null )
		{
			radius = 500;
		}
		
		var qloc = { latitude: request.query.latitude , longitude: request.query.longitude };
		var nearby = [ 
						{ latitude : qloc.latitude , longitude: qloc.longitude 		 },
						{ latitude : qloc['latitude'], longitude: qloc['longitude']  + 0.1 },
						{ latitude : qloc['latitude'] , longitude: qloc['longitude']  - 0.1 },
						{ latitude : qloc['latitude'] +0.1 , longitude: qloc['longitude']   },
						{ latitude : qloc['latitude'] -0.1 , longitude: qloc['longitude']   }
					];
						
		//key = getKeyFromString( qloc, true );
		var Keys=[]
		for ( loc in nearby )
		{
			//console.log( getKeyFromString( nearby[loc], true ) );
			Keys.push( getKeyFromString( nearby[loc], true ) );
		}
		//console.log( 'key : ' + key 
		keylength = Keys.length;
	Keys.forEach(function(key, ind ) {
		if( done ) {
						request=null;Keys=[];
						replies = [];
						//response.statusCode = 200;
						//response.end('[]');
						//console.timeEnd("fetch");
						return;
					}
		
		keylength--;
		read.lrange(key, 0, -1, function(err, replies){
			if( done ) {
						request=null;Keys=[];
						replies = []
						return;
					}
			if( replies.length == 0 && keylength == 0 )
			{
				//console.log('processed length = 0 for key : ' + key); 
				
			}
			climit = replies.length / 10;
			if( climit < 100 )
			{
				climit = 100;
			}
			//console.log( ' total available records : ' + replies.length  );
			total = replies.length ;
			//var allkeys=[]
			var keys=[]
			replies.forEach(function (item, index){
				     
					if( done ) {
						request=null;
						replies = [];
						return;
					}
					keys.push(item)
					if( --total == 0 )
					{
						read.mget(keys, function(err, replies){
							if( done ) return;
							var recs = replies.length;
							//console.log( 'recs : ' + recs);
							replies.forEach(function(reply, index){
								if( done ) return;
								var loc = JSON.parse(reply); 
								var distance = geo.getDistanceSimple(loc, qloc, loc['accuracy']);
								
								if ( distance <= radius )
								{
									delete loc.accuracy;
									loc['distance'] = distance;
									out += JSON.stringify( loc ) + ',\n';
									
									if ( --limit == 0 )
									{
										done=true;//replies=[]; keys=[];
										response.statusCode = 200;
										response.end('[' + out.substring(0,out.length-2) + ']');
										console.timeEnd("fetch");
										return;
									}
								}
								if( --recs == 0 )
								{
									keys=[];
									if( total == 0 && keylength == 0 )
									{
										done=true;//replies=[]; keys=[];
										response.statusCode = 200;
										response.end('[' + out.substring(0,out.length-2) + ']');
										console.timeEnd("fetch");
										return;
									}
								}
							});
						});
					}
										
			});
	    });
	});
  }
});

app.listen(8081);

