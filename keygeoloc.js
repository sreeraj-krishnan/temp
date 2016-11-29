'use strict';

module.exports.getKeyFromString = function ( reply ,_json=false)
{
  if( reply == null || reply == undefined )
  {
		return 'invalid';
  }
  var json;
  if( _json === true )
  {
	  json = reply;
  }
  else
  {
	json = JSON.parse(reply);
  }
  //console.log( reply + ' ' + json['latitude'] );
  var key=''
  var longitude = json['longitude'];
  if( longitude != undefined && longitude != null)
  {
     longitude = longitude.toString();
	 longitude = getKey(longitude);
	 key = key.concat( longitude ) + 'LO';
	 
  }
  var latitude = json['latitude'];
  if( latitude != undefined && latitude != null )
  {
  	latitude = latitude.toString();
	latitude = getKey(latitude);
	key = key.concat( latitude) + 'LA';
  }
  //console.log( key )
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

module.exports.validateGeoLocation =  function ( str )
{

	var match = /^\s*?(-?[0-9]+\.?[0-9]+?)\s*,\s*(-?[0-9]+\.?[0-9]+?)\s*$/.exec(str);
	
	if (match && match.length === 3) {
		var lat = parseFloat(match[1]);
		var lng = parseFloat(match[2]);

		if (  (lat >= -90)
				&& (lat <= 90)
				&& (lng >= -180)
				&& (lng <= 180)
			) {
				return true;
		}
		else {
			
			return false;
		}
    }
  return false;
	
}

/*
console.log( validateGeoLocation('12.34, 180.99999999') );
console.log( validateGeoLocation('91.1 ,-180')) ;
console.log( validateGeoLocation('12.43,12.12.')) ;
console.log( validateGeoLocation('0.0,0.0') );
*/

