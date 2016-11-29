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

function validate( loc )
{
	var re = new RegExp('^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$');
	return  re.test( loc );
}

/*
console.log( validate('77,-70') );
console.log( validate('90.0,-180')) ;
console.log( validate('12.43,12.12')) ;
console.log( validate('1.343,34.887') );
*/
