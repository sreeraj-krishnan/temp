var http = require('http');
//var json=require('json');
var math=require('mathjs');
var redis=require('redis');

var keyloc = require('./keygeoloc')
getKeyFromString = keyloc.getKeyFromString

var client = redis.createClient(); //11111,'127.0.0.1'
client.on('connect', function(){
	console.log('connected');
});
var read = redis.createClient(6399,'127.0.0.1'); //11111,'127.0.0.1'
read.on('connect', function(){
	console.log('connected');
});
;


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
			if( err ){ console.log('err : ' + err ); }
			 else
			{	
				var json = JSON.parse(reply);
				//console.log( reply + ' ' + json['latitude'] );
				key=getKeyFromString( reply );
				client.lrem(key, 0,Number(driverid), function(err, reply){
					//console.log('reply lrem : ' + reply);
				});
				
			}
			data['id'] = Number(driverid);
			client.set(Number(driverid), JSON.stringify(data) , function(err,reply){
				//console.log( ' set : ' + reply);
				if( err ) { console.log('err : ' + err ); }
				else {
					key = getKeyFromString( body );
					client.lpush(key, Number(driverid), function(err,reply){
					//console.log('reply lpush :' + reply);
					});
				}
			});
		});
		
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
