var request = require("request");
var driver=require('../driver.js')

describe("where is my driver", function() {
	
  describe("GET /drivers", function() {
	
	var base_url = "http://localhost:8080/drivers?longitude=12.22&latitude=23.3&radius=600&limit=10" ;
    it("returns status code 200", function(done) {
		request.get(base_url, function(error, response, body) {
			//console.log( response.statusCode);
			expect(response.statusCode).toBe(200);
			done();
        });

    });
	
	it("invalid longitude return 400", function(done) {
	  var base_url = "http://localhost:8080/drivers?longitude=180.1&latitude=23.3&radius=600&limit=10";
	  
      request.get(base_url, function(error, response, body) {

			expect(response.statusCode).toBe(400);
			done();
      });

    });
	
	it("invalid latitude return 400", function(done) {
	  var base_url = "http://localhost:8080/drivers?longitude=12&latitude=90.1&radius=600&limit=10";
	  
      request.get(base_url, function(error, response, body) {

			expect(response.statusCode).toBe(400);
			done();
      });
	});
	
	it("invalid latitude return 400", function(done) {
	  var base_url = "http://localhost:8080/drivers?longitude=12&latitude=&radius=600&limit=10";
	  
      request.get(base_url, function(error, response, body) {

			expect(response.statusCode).toBe(400);
			done();
      });
	});
	
	it("invalid longitude return 400", function(done) {
	  var base_url = "http://localhost:8080/drivers?longitude=&latitude=23&radius=600&limit=10";
	  
      request.get(base_url, function(error, response, body) {

			expect(response.statusCode).toBe(400);
			expect(body).toBe('{ "errors" : ["Invalid geo location"] }');
			
			done();
      });
	});
	
	
  });
});

