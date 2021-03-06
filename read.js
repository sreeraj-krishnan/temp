var http = require('http');
var express = require('express');
var math=require('url');
var redis=require('redis');
var async=require('async');
var geo = require('geolib')

var keyloc = require('./keygeoloc')
getKeyFromString = keyloc.getKeyFromString
validateGeoLocation = keyloc.validateGeoLocation

var app = express();

var read = redis.createClient(6399,'127.0.0.1'); 

read.on('connect', function(){
	console.log('connected');
});


app.get('/drivers', function(request, response){
  console.time("fetch");
  var headers = request.headers;
  var method = request.method;
  var url = request.url;
  var body = [];
  var driverid;
  var lower;
  var upper;
  var data;
  //console.log(request.query.latitude + ' : ' + request.query.longitude + ' : ' + request.query.radius + ' : ' + request.query.limit);
  if( request.query.longitude == undefined || request.query.longitude == null ||
	  request.query.latitude == undefined  || request.query.latitude  == null ||
	  validateGeoLocation( request.query.latitude.toString() +',' +request.query.longitude.toString()) == false 
	)
  {
		response.statusCode = 422;
		response.end('{ "errors" : ["Invalid geo location"] }');
		console.timeEnd("fetch");
		return;
  }	
  {
	    
		var out=''
		var done = false;
		var limit = request.query.limit;
		if( limit == undefined || limit == null )
		{
			limit = 10;
		}
		var radius = request.query.radius;
		if( radius == undefined || radius == null )
		{
			radius = 500;
		}
		
		var qloc = { latitude: request.query.latitude , longitude: request.query.longitude };
		var nearbylocations = [ 
						{ latitude : qloc.latitude , longitude: qloc.longitude 		 },
						{ latitude : qloc['latitude'], longitude: qloc['longitude']  + 0.1 },
						{ latitude : qloc['latitude'] , longitude: qloc['longitude']  - 0.1 },
						{ latitude : qloc['latitude'] +0.1 , longitude: qloc['longitude']   },
						{ latitude : qloc['latitude'] -0.1 , longitude: qloc['longitude']   },
						{ latitude : qloc['latitude'] +0.1 , longitude: qloc['longitude']-0.1},
						{ latitude : qloc['latitude'] +0.1 , longitude: qloc['longitude']+0.1},
						{ latitude : qloc['latitude'] -0.1 , longitude: qloc['longitude']+0.1},
						{ latitude : qloc['latitude'] -0.1 , longitude: qloc['longitude']-0.1}
					];
		var Keys=[]
		for ( loc in nearbylocations )
		{
			Keys.push( getKeyFromString( nearbylocations[loc], true ) );
		}
		keylength = Keys.length;
		Keys.forEach(function(key, ind ) {
			if( done ) {
				request=null;Keys=[];
				replies = [];
				return;
			}
			//console.log('key len : ' + keylength);
			keylength--;
			read.lrange(key, 0, -1, function(err, replies){
				if( done ) {
					request=null;Keys=[];
					replies = []
					return;
				}
			
				total = replies.length ;
				//console.log( ' total per key : ' + total)
				var keys=[]
				replies.forEach(function (item, index){
					if( done ) {
						request=null;
						replies = [];
						return;
					}
					keys.push(item);
					total--;
					if( total == 0 )
					{
						read.mget(keys, function(err, replies){
							if( done ) return;
							var recs = replies.length;
							//console.log('recs per total  : ' + recs)
							replies.forEach(function(reply, index){
								if( done ) return;
								var loc = JSON.parse(reply); 
								var distance = geo.getDistanceSimple(loc, qloc, loc['accuracy']);
								//console.log( 'distance : ' + distance);
								if ( distance <= radius )
								{
									delete loc.accuracy;
									loc['distance'] = distance;
									out += JSON.stringify( loc ) + ',\n';
									//console.log( 'limit : ' + limit);
									if ( --limit == 0 )
									{
										done=true;
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
										done=true;
										//console.log('in  total == 0 && keylength == 0')
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

