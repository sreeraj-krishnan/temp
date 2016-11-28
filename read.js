var http = require('http');
//var json=require('json');
var math=require('mathjs');
var redis=require('redis');
var async=require('async');
var geo = require('geolib')
locations={};
longitude={};
latitude={};
map = {}

var read = redis.createClient(6399,'127.0.0.1'); //11111,'127.0.0.1'
read.on('connect', function(){
	console.log('connected');
});

/*
	longitude = {}
	latitude = {}
	*/
function fetchLocations()
{
	var i=0;
   	map={}
		read.keys('*', function ( err, replies){
			//console.log( ' length : ' + replies.length )
			
			replies.forEach(function (reply, index){
				//console.log( 'reply : ' + reply);
				read.get(reply, function(err,data){
					if( err )
					{
						console.log( 'err : ' + err.toString());
					}
					//var fulldata=[];
					//console.log( data );
					var json = JSON.parse( data );
					var lat = json['longitude'].toString();
					var lon = json['latitude'].toString();
					//console.log( 'lat : ' + lat);
					//console.log( 'lon : ' + lan);
					
					var l=[]
					if (((lat.substring( 0,4)) in latitude))
					{
						l = latitude[ lon.substring(0,4) ];
					}
					l.push(reply);
					//console.log( 'leng : ' + l.length );
					latitude[ lon.substring(0,4) ] = l;
					l=[]
					if ((lon.substring( 0,4) in longitude))
					{
						l = longitude[ lon.substring(0,4) ];
					}
					l.push(reply);
					//console.log( 'leng : ' + l.length );
					//console.log('***')
					longitude[ lon.substring( 0,4)] = l;
					
					locations[ reply ] = data ;
					m=[]
					if( ((lon.substring( 0,4) + lat.substring( 0,4)) in map))
					{
						m = map[lon.substring( 0,4) + lat.substring( 0,4)];
					}
					m.push( reply );
					//console.log( ' len : ' + m.length );
					map[ lon.substring( 0,4) + lat.substring( 0,4) ] = m;
				});
			});
		});
		//console.log( 'len : ' + Object.keys(locations).length);
		
}
function callInfinite( time, fn) {
  function callFn() {
    fn();
    setTimeout(callFn, time);
  }
  fn();
  setTimeout(callFn, time);
}


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
  callInfinite( 60000,  fetchLocations );
  if (method === 'PUT' )
  {
	
  }
  else if( method === 'GET' && url.endsWith('/drivers'))
  {
	    console.time("fetch");
		var out=''
		var p = { latitude: 70.0232442 , longitude: 70.14554 };
		//var m = { latitude: 70.1032442 , longitude: 70.104554 };
		//var d = geo.getDistanceSimple(p,m,0.7)
		//console.log( 'dist : ' + d);
		latk=p.latitude.toString();
		lonk=p.longitude.toString();
		latk = latk.substring(0,4);
		lonk = lonk.substring(0,4);
		/*
		console.log( lonk + ' ' + latk );
		if ( !(latk in latitude) && !(lonk in longitude) )
		{
			response.statusCode = 200;
			response.end();
			return;
		}
		var possiblelist = [];
		if( (lonk in longitude) )
		{
			possiblelist =  longitude[lonk] ;
		}
		if( (latk in latitude) )
		{
			possiblelist.concat( latitude[latk] );
		}*/
		var possiblelist=[]
		if( !((lonk + latk) in map ))
		{
			response.statusCode = 200;
			response.end();
			return;
		}
		possiblelist = map[ lonk + latk];
		for ( loc in possiblelist)
		{
				//console.log( 'loc : ' +loc );
				if( !(loc in locations))
				{
					continue;
				}
				var j = JSON.parse(locations[loc]); 
				//console.log( );
				var mp = { latitude: j['lattitude']  , longitude: j['longitude'] }
				
				var d = geo.getDistanceSimple(mp, p, j['accuracy']);
				//console.log( 'dist : ' + d);
				
				if ( d < 500 )
				{
					delete j.accuracy;
					j['id'] = loc;
					j['distance'] = d;
					out += JSON.stringify(j) + ',\n';
				}
		}
		console.timeEnd("fetch");
		response.statusCode = 200;
		response.end('[' + out.substring(0,out.length-2) + ']');
		//console.log( 'len : ' + Object.keys(locations).length);
  }
  else 
  {
    response.statusCode = 404;
    response.end();
  }
 
	
}).listen(8081);
