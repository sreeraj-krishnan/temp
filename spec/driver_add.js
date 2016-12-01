var request = require("request");
var driver=require('../driver.js')

describe("where is my driver", function() {
	
  describe("PUT /drivers/:driverid/locations", function() {
	it("invalid driver id return 404", function(done) {
		var base_url = "http://localhost:8080/drivers/0/locations" ;
		request.put({
			url : base_url,
			method : 'PUT',
			headers : { 'content-type': 'application/json' },
			body : JSON.stringify( { 'latitude' : 54.4, 'longitude' : 12.1 , 'accuracy' : 0.7 })
		}, function(err,response,body){
		    expect(response.statusCode).toBe(404);
			done();
		});
	});
	
	it("invalid driver id return 404", function(done) {
		var base_url = "http://localhost:8080/drivers/a/locations" ;
		request.put({
			url : base_url,
			method : 'PUT',
			headers : { 'content-type': 'application/json' },
			body : JSON.stringify( { 'latitude' : 54.4, 'longitude' : 12.1 , 'accuracy' : 0.7 })
		}, function(err,response,body){
		    expect(response.statusCode).toBe(404);
			done();
		});
	});
	
	it("invalid driver id return 404", function(done) {
		var base_url = "http://localhost:8080/drivers/50001/locations" ;
		request.put({
			url : base_url,
			method : 'PUT',
			headers : { 'content-type': 'application/json' },
			body : JSON.stringify( { 'latitude' : 54.4, 'longitude' : 12.1 , 'accuracy' : 0.7 })
		}, function(err,response,body){
		    expect(response.statusCode).toBe(404);
			done();
		});
	});
	it("invalid driver id return 404", function(done) {
		var base_url = "http://localhost:8080/drivers/-1/locations" ;
		request.put({
			url : base_url,
			method : 'PUT',
			headers : { 'content-type': 'application/json' },
			body : JSON.stringify( { 'latitude' : 54.4, 'longitude' : 12.1 , 'accuracy' : 0.7 })
		}, function(err,response,body){
		    expect(response.statusCode).toBe(404);
			done();
		});
	});

	it("invalid driver location return 422", function(done) {
		var base_url = "http://localhost:8080/drivers/1/locations" ;
		request.put({
			url : base_url,
			method : 'PUT',
			headers : { 'content-type': 'application/json' },
			body : JSON.stringify( { 'latitude' : 90.1, 'longitude' : 180.1 , 'accuracy' : 0.7 })
		}, function(err,response,body){
		    expect(response.statusCode).toBe(422);
			done();
		});
	});
	it("invalid driver location return 422", function(done) {
		var base_url = "http://localhost:8080/drivers/50000/locations" ;
		request.put({
			url : base_url,
			method : 'PUT',
			headers : { 'content-type': 'application/json' },
			body : JSON.stringify( { 'latitude' : -90.1, 'longitude' : -180.1 , 'accuracy' : 0.7 })
		}, function(err,response,body){
		    expect(response.statusCode).toBe(422);
			done();
		});
	});
	it("valid driver location return 200 id = 50000", function(done) {
		var base_url = "http://localhost:8080/drivers/50000/locations" ;
		request.put({
			url : base_url,
			method : 'PUT',
			headers : { 'content-type': 'application/json' },
			body : JSON.stringify( { 'latitude' : 70.23, 'longitude' : 70.23 , 'accuracy' : 0.7 })
		}, function(err,response,body){
		    expect(response.statusCode).toBe(200);
			done();
		});
	});
	it("valid driver location return 200 id = 1", function(done) {
		var base_url = "http://localhost:8080/drivers/1/locations" ;
		request.put({
			url : base_url,
			method : 'PUT',
			headers : { 'content-type': 'application/json' },
			body : JSON.stringify( { 'latitude' : 70.23, 'longitude' : 70.23 , 'accuracy' : 0.7 })
		}, function(err,response,body){
		    expect(response.statusCode).toBe(200);
			done();
		});
	});
	it("valid driver location return 200", function(done) {
		var base_url = "http://localhost:8080/drivers?latitude=70.23&longitude=70.23";
		request.get({
			url : base_url,
			headers : { 'content-type': 'application/json' }
		
		}, function(err,response,body){
		    expect(response.statusCode).toBe(200);
			//console.log(response.body);
			done();
		});
	});
	
   });
 
 });
