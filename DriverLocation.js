var http = require('http');
//var json=require('json');
var math=require('mathjs');
var redis=require('redis');
var client = redis.createClient(); //11111,'127.0.0.1'
client.on('connect', function(){
	console.log('connected');
});
var read = redis.createClient(6399,'127.0.0.1'); //11111,'127.0.0.1'
read.on('connect', function(){
	console.log('connected');
});
;

function getKeyFromString( reply )
{
  var json = JSON.parse(reply);
  //console.log( reply + ' ' + json['latitude'] );
  key=''
  var longitude = json['longitude'];
  if( longitude != undefined && longitude != null)
  {
     longitude = longitude.toString();
     longitude = longitude.substring(0,4);
  }
  var latitude = json['latitude'];
  if( latitude != undefined && latitude != null )
  {
  	latitude = latitude.toString();
	latitude = latitude.substring(0,4);
  }
  if(latitude != undefined && latitude != null && longitude != undefined && longitude != null )
  {
  	key=longitude+latitude;
  }
  return key; 
}


http.createServer(function(request, response) {
  var headers = request.headers;
  var method = request.method;
  var url = request.url;
  var body = [];
  var Body=[];
  var driverid;
  var lower;
  var upper;
  var data;
  //console.log(request.url);
  
  if (method === 'PUT' )
  {
	 var reg = new RegExp('\/drivers\/[0-9]{1,5}\/locations');
     var id = url.split('/');
     if ( (id.length - 2) > 0 )
     {
		driverid= id[id.length-2];
		//console.log( ' driver id : ' + driverid );
	 }
	 upper = (Number(driverid) <= Number(50000));
	 lower = (Number(driverid) > "0");
	 if( reg === false || upper === false || lower === false )
	 {
		response.statusCode = 404;
		response.end();	
	 }
	 else
	 {
		request.on('data', function(chunk) {
		Body.push(chunk);
	    }).on('end', function() {
			body=  Buffer.concat(Body).toString() ;
			data = JSON.parse( body );
			
			/*list=[]
			for( var key in data )
			{
				list.push(data[key])
				console.log( key + ' : ' + data[key] );
			}*/
	 	// async write data redis
		key=''
		read.get(Number(driverid), function(err,reply){
			if( reply != null )
			{	
				var json = JSON.parse(reply);
				//console.log( reply + ' ' + json['latitude'] );
				key=getKeyFromString( reply );
				client.lrem(key, 0,Number(driverid), function(err, reply){
					console.log('reply lrem : ' + reply);
				});
				
			}
		});
		client.set(Number(driverid), body, function(err,reply){
			console.log( ' set : ' + reply);
			key = getKeyFromString( body );
			client.lpush(key, Number(driverid), function(err,reply){
				console.log('reply lpush :' + reply);
			} );
		})
		response.statusCode = 200;
		response.end();
	  })
	 }
  }
  else if( method === 'GET' && url.endsWith('/drivers'))
  {
		response.statusCode = 200;
		response.end();
  }
  else 
  {
    response.statusCode = 404;
    response.end();
  }
 
	
}).listen(8080);
