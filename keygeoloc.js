'use strict';

module.exports.getKeyFromString = function ( reply )
{
  var json = JSON.parse(reply);
  //console.log( reply + ' ' + json['latitude'] );
  var key=''
  var longitude = json['longitude'];
  if( longitude != undefined && longitude != null)
  {
     longitude = longitude.toString();
	 longitude = getKey(longitude);
	 key = key.concat( longitude );
	 //console.log( longitude);
  }
  var latitude = json['latitude'];
  if( latitude != undefined && latitude != null )
  {
  	latitude = latitude.toString();
	latitude = getKey(latitude);
	key = key.concat( latitude);
	//console.log( latitude );
  }
  if(latitude != undefined && latitude != null && longitude != undefined && longitude != null )
  {
  	//key=longitude.concat(latitude);
  }
  console.log( 'key : ' + key );
  return key; 
}

function getKey( input )
{
	input = input.trim();
	if( input.startsWith('-.'))
	{
		input = '-0.' + input.substring(input.indexOf('.')+1, input.length);
	}
	else if( input.startsWith('.') )
	{
		input = '0' + input;
	}
	//console.log(input );
	var index = input.indexOf('.');
	//console.log( index );
	if( index == -1 )
	{
		input = input.concat('.0');
		index = input.indexOf('.');
	}
	//console.log(input.substring(0, index + 2))
	return  input.substring(0, index + 2);
}

//console.log( getKey(' -.12 ') );
