var request = require("request");
var driver=require('../DriverLocation.js')

describe("where is my driver", function() {
	
  describe("PUT /drivers/:driverid/locations", function() {
	it("invalid driver id return 404", function(done) {
		var base_url = "http://localhost:8080/drivers/12/locations" ;
		request.put({
			url : base_url,
			method : 'PUT',
			headers : { 'content-type': 'application/json' },
			body : { 'latitude' : 54.4, 'longitude' : 12.1 , 'accuracy' : 0.7 }
		}, function(err,body,response){
			//console.log( 'response.statusCode : '+response.statusCode);
			console.log(err);
			expect(response.statusCode).toBe(404);
			driver.closeServer();
			done();
		});
	});
  });
});