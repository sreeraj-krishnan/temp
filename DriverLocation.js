var http = require('http');
//var json=require('json');
var express=require('express');
var redis=require('redis');

var keyloc = require('./keygeoloc')

getKeyFromString = keyloc.getKeyFromString
validateGeoLocation = keyloc.validateGeoLocation

var client = redis.createClient(); //11111,'127.0.0.1'
client.on('connect', function(){
	console.log('connected');
});
var read = redis.createClient(6399,'127.0.0.1'); //11111,'127.0.0.1'
read.on('connect', function(){
	console.log('connected');
});
;

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
		response.statusCode = 200;
		response.end();

		read.get(Number(driverid), function(err,reply){
			if( err || reply == null ){ /*console.log('err : ' + err ); console.log( ' set : ' + reply);*/}
			else
			{	
				//var json = JSON.parse(reply);
				//console.log( 'reply : ' + reply );
				key=getKeyFromString( reply, false );
				client.lrem(key, 0,Number(driverid), function(err, reply){
					//console.log('reply lrem : ' + reply);
				});
				
			}
		});	
		data['id'] = Number(driverid);
		client.set(Number(driverid), JSON.stringify(data) , function(err,reply){
				//console.log( ' set : ' + reply);
				if( err ) { console.log('err : ' + err ); }
				else {
					key = getKeyFromString( data, true );
					client.lpush(key, Number(driverid), function(err,reply){
					//console.log('reply lpush :' + reply);
					});
				}
		});
			
 
	});
 
 //console.timeEnd('processed');
});

app.listen(8080);
