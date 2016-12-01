var http = require('http');
//var json=require('json');
var express=require('express');
var redis=require('redis');
var async=require('async');
var geo = require('geolib')
var keyloc = require('./keygeoloc')
var Promise = require('promise');

getKeyFromString = keyloc.getKeyFromString
validateGeoLocation = keyloc.validateGeoLocation

var exports = module.exports = {};

var client = redis.createClient(); //11111,'127.0.0.1'
client.on('connect', function(){
	//console.log('connected');
});
var read = redis.createClient(6399,'127.0.0.1'); //11111,'127.0.0.1'
read.on('connect', function(){
	//console.log('connected');
});


var app = express();
app.put('/drivers/:driverid/locations', function(request, response)
{
  //console.time('processed');
  var headers = request.headers;
  var url = request.url;
  var body = [];
  var driverid = request.params.driverid;
  var lower;
  var upper;
  var data;
  
  upper = (Number(driverid) <= Number(50000));
  lower = (Number(driverid) > "0");
 
  if( upper === false || lower === false )
  {
	response.statusCode = 404;
	response.end('{}');	
	return;
  }
  request.on('data', function(chunk) {
		body.push(chunk);
  }).on('end', function() {
		body=  Buffer.concat(body).toString() ;
		data = JSON.parse( body );
		key=''
		longitude = data['longitude'];
		latitude = data['latitude'];
		
		if( longitude == undefined || longitude == null ||
			latitude == undefined || latitude == null ||
			validateGeoLocation( latitude.toString() +',' +longitude.toString()) == false )
		{
			response.statusCode = 422;
			response.end('{ "errors" : ["Invalid geo location"] }');
			return;
		}		
		

		read.get(Number(driverid), function(err,reply){
			if( err || reply == null ){ /*console.log('err : ' + err ); console.log( ' set : ' + reply);*/}
			else
			{	
				key=getKeyFromString( reply, false );
				client.lrem(key, 0,Number(driverid), function(err, reply){
					//console.log('reply lrem : ' + reply);
				});
				
			}
		});	
		data['id'] = Number(driverid);
		client.set(Number(driverid), JSON.stringify(data) , function(err,reply){
				//console.log( ' set : ' + reply);
				if( err || reply == null) { console.log('err : ' + err ); }
				else {
					response.statusCode = 200;
					response.end();
					//console.timeEnd('processed');
					key = getKeyFromString( data, true );
					client.lpush(key, Number(driverid), function(err,reply){
						if( err || reply == null ) { console.log( 'err: ' + err + ' for key ' + key ); }
					});
				}
		});
			
 
	});
});

app.get('/drivers', function(request, response){
  //console.time("fetch");
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
		response.statusCode = 400;
		response.end('{ "errors" : ["Invalid geo location"] }');
		//console.timeEnd("fetch");
		return;
  }	
  {
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
						{ latitude : qloc['latitude'] -0.1 , longitude: qloc['longitude']   }/*,
						{ latitude : qloc['latitude'] +0.1 , longitude: qloc['longitude']+0.1},
						{ latitude : qloc['latitude'] -0.1 , longitude: qloc['longitude']-0.1},
						{ latitude : qloc['latitude'] -0.1 , longitude: qloc['longitude']+0.1},
						{ latitude : qloc['latitude'] +0.1 , longitude: qloc['longitude']-0.1}*/
					];
		var Keys=[];
		for ( loc in nearbylocations )
		{
			Keys.push( getKeyFromString( nearbylocations[loc], true ) );
			
		}
		doasync( Keys, qloc, limit, radius ).then( function(values){
			
			response.statusCode = 200;
			response.end('[' + values.substring(0, values.length - 2) + ']');
		});
		
  }
});

function doasync( allkeys , qloc, limits, radius )
{
	return new Promise( function (resolve,reject) {
		var promises = [];
		json=''
		len = allkeys.length;
		
		for( i=0; i < allkeys.length ; i++ )
		{
			//console.log('promise begin 2 : ' + allkeys[i])
			var locations = getAllLocationsWithKey( allkeys[i],qloc, limits,radius);
			promises.push( locations );
		}
	
		Promise.all(promises).then( function(values){
			for( j=0; j < values.length; j++ )
			{
				len--;
				locations = values[j];
				//console.log( ' items : ' + locations[0] )
				if( locations[0] >= limits )
				{
					for(i=0; i < limits ; i++ )
					{
						json += JSON.stringify(locations[1][i]) + ',\n'
					}
					resolve( json );
					allkeys=[]; 
				}
				else if( locations[0] > limits )
				{
					limits -= locations[0]
					for(i=0; i < locations[0] ; i++ )
					{
						json += JSON.stringify(locations[1][i]) + ',\n'
					}
				}
					
			}
			resolve(json);
		});
	});
}

function getAllLocationsWithKey( key,qloc,limits,radius )
{
	return new Promise(function (resolve,reject ) {
		read.lrange(key, 0, -1, function(err, replies){
			total  = replies.length ;
			var keys=[]
			outs=[]
			if( total === 0 )
			{
				resolve( [outs.length, outs]  );
			}
			//console.log('total : ' + total)
			
			replies.forEach(function (item, index){
				keys.push(item);
				if( --total === 0 )
				{
					read.mget(keys, function(err, replieskeys){
				
						var recs = replieskeys.length;
						replieskeys.forEach(function(reply, index){
								
							var loc = JSON.parse(reply); 
							var distance = geo.getDistanceSimple(loc, qloc, loc['accuracy']);
							if ( distance <= radius )
							{
								delete loc.accuracy;
								loc['distance'] = distance;
								outs.push( loc );
								if( --limits == 0 )
								{
									//console.log('all search done')
									resolve([outs.length ,outs] );
								}
							
							}	
							if( --recs == 0 )
							{
								keys=[];
								resolve( [outs.length , outs] );
							}
						});
					});
				}
			});
		});
	});
	
}

function callback(request, response )
{
	return;
}
app.listen(8080);
