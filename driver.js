
var express=require('express');
var redis=require('redis');
var geo = require('geolib')
var keyloc = require('./keygeoloc')
var Promise = require('promise');

getKeyFromString = keyloc.getKeyFromString
validateGeoLocation = keyloc.validateGeoLocation
var config = require('./config/config');

//var exports = module.exports = {};
var cluster = require('cluster');




if (cluster.isMaster) {
	var cpuCount = require('os').cpus().length;
	for (var i = 0; i < cpuCount; i += 1) 
	{
        cluster.fork();
    }
}
else {
	var client = redis.createClient(); //11111,'127.0.0.1'
client.on('connect', function(){
	//console.log('connected');
});
var read = redis.createClient(config.redis.readport,config.redis.host); //11111,'127.0.0.1'
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
  
  upper = (Number(driverid) <= Number(config.app.driverMaxid));
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
  console.time("fetch");
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
			limit = config.app.defaultLimit;
		}
		var radius = request.query.radius;
		if( radius == undefined || radius == null )
		{
			radius = config.app.defaultRadius;
		}
		var qloc = { latitude: request.query.latitude , longitude: request.query.longitude };
		var nearbylocations = [ 
						{ latitude : qloc.latitude , longitude: qloc.longitude 		 },
						{ latitude : qloc['latitude'], longitude: qloc['longitude']  + 0.1 },
						{ latitude : qloc['latitude'] , longitude: qloc['longitude']  - 0.1 },
						{ latitude : qloc['latitude'] +0.1 , longitude: qloc['longitude']   },
						{ latitude : qloc['latitude'] -0.1 , longitude: qloc['longitude']   },
						{ latitude : qloc['latitude'] +0.1 , longitude: qloc['longitude']+0.1},
						{ latitude : qloc['latitude'] -0.1 , longitude: qloc['longitude']-0.1},
						{ latitude : qloc['latitude'] -0.1 , longitude: qloc['longitude']+0.1},
						{ latitude : qloc['latitude'] +0.1 , longitude: qloc['longitude']-0.1}
					];
		var Keys=[];
		for ( loc in nearbylocations )
		{
			Keys.push( getKeyFromString( nearbylocations[loc], true ) );
		}
		doasync( Keys, qloc, limit, radius ).then( function(values){
			
			response.statusCode = 200;
			response.end('[' + values.substring(0, values.length - 2) + ']');
			console.timeEnd('fetch');
		});
		
  }
});
app.listen(config.web.port); // defaulted to 8080
}



function doasync( allkeys , qloc, limits, radius )
{
	return new Promise( function (resolve,reject) {
		var promises = [];
		json=''
		len = allkeys.length;
		//console.log('len : ' + len)
		for( i=0; i < allkeys.length ; i++ )
		{
			var locations = getAllLocationsWithKey( allkeys[i],qloc, limits,radius);
	
			locations.then( function(values){
				{
					locs = values;
					//console.log('locations : ' + locs[0])
					if( locs[0] >= limits )
					{
						for(i=0; i < limits ; i++ )
						{
							json += JSON.stringify(locs[1][i]) + ',\n'
						}
						resolve( json );
						allkeys=[]; 
					}
					else if( locs[0] > 0 )
					{
						limits -= locs[0]
						for(i=0; i < locs[0] ; i++ )
						{
							json += JSON.stringify(locs[1][i]) + ',\n'
						}
					}
					
				}
				//console.log('len : ' + len)
				if( --len == 0 )
					resolve(json);
			});
		}
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
				resolve( [outs.length, outs]  ); // callback
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
								//console.log('done')
								resolve( [outs.length , outs] );
							}
						});
					});
				}
			});
		});
	});
	
}


