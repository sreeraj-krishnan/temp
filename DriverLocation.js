var http = require('http');
//var json=require('json');
var math=require('mathjs');

http.createServer(function(request, response) {
  var headers = request.headers;
  var method = request.method;
  var url = request.url;
  var body = [];
  var driverid;
  var lower;
  var upper;
  var data;
  console.log(request.url);
  
  if (method === 'PUT' )
  {
	 var reg = new RegExp('\/drivers\/[0-9]{1,5}\/locations');
     var id = url.split('/');
     if ( (id.length - 2) > 0 )
     {
		driverid= id[id.length-2];
		console.log( ' driver id : ' + driverid );
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
		body.push(chunk);
	    }).on('end', function() {
			body=  Buffer.concat(body).toString() ;
			data = JSON.parse( body );
			for( var key in data )
			{
				console.log( key + ' is ' + data[key] );
			}
	 	`// async write data memcache oe redis
		response.statusCode = 200;
		response.end('correct!');
	  })
	 }
  }
  else if( method === 'GET' && url.endsWith('/drivers'))
  {
		response.statusCode = 200;
		response.end('correct!');
  }
  else 
  {
    response.statusCode = 404;
    response.end();
  }
 
	
}).listen(8080);
