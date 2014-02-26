/*globals buster:false*/
buster.testCase("troopjs-browser/mvc/controller/widget", function (run) {
	"use strict";

	var assert = buster.referee.assert;

	require( [
		"troopjs-browser/mvc/controller/widget",
		"jquery",
		"when/delay"
	],
		function (Controller, $, delay) {

			function getData(cityName, streetNo) {
				return {
					"country": "cn",
					"city": {
						name: cityName
					},
					"street": {
						no: streetNo
					}
				};
			}

			var TestController = Controller.extend({
				"uri2data": function(uri) {
					this.spy("uri2data");

					var path = uri.path;

					assert.equals(uri.toString(), path[0] === 'beijing' ?
						"beijing/" : "shanghai/street/1"
					);

					return {
						"city": path[0],
						"street": path[1] === "street" ? parseInt(path[2]) : 0
					};
				},
				"on/request": function(requests) {
					this.spy("on/request");

					var isBj = requests["city"] === "beijing";
					var expected = {
						"city": isBj ? "beijing" : "shanghai",
						"street": isBj ? 0 : 1
					};

					if(isBj){
						expected["country"] = "cn";
					}

					assert.equals(requests, expected);

					return getData(requests.city, requests.street);
				},
				"on/results": function(results) {
					this.spy("on/results");
					var isBj = results["city"]["name"] === "beijing";
					assert.equals(results, getData(
						isBj ? "beijing": "shanghai",
						isBj ? 0 : 1
					));
				},
				"on/updates": function(updates) {
					this.spy("on/updates");
					var isBj = updates["city"]["name"] === "beijing";
					// The second run
					if(isBj){
						assert.equals(updates, {
							"city": {
								name: "beijing"
							},
							"street": {
								no: 0
							}
						});
					}
					else {
						assert.equals(updates, getData("shanghai",1));
					}
				},
				"data2uri": function(results) {
					this.spy("data2uri");
					var isBj = results["city"]["name"] === "beijing";
					assert.equals(results,
						getData(
							isBj ? "beijing" : "shanghai",
							isBj ? 0 : 1
						)
					);
				},
				"hash": function(o) {
					return JSON.stringify(o);
				}
			});

			var controller = TestController($(window));
			var spy;

			function assertMethodCalls() {
				// Delay for the "urichange" event to be handled.
				assert.equals(spy.callCount, 5);
				assert.calledWith(spy, "uri2data");
				assert.calledWith(spy, "on/request");
				assert.calledWith(spy, "on/results");
				assert.calledWith(spy, "on/updates");
			}

			run({
				"setUp" : function() {
					spy = controller.spy = this.spy();
					this.timeout = 2000;
					(this.location = window.location).hash = "";
				},

				"route": function() {
					var me = this;
					var loc = me.location;

					// Test for uri.
					loc.hash = "shanghai/street/1";
					return controller.start().then(function() {
						return delay(0).then(function() {

							// Test for uri change.
							spy.reset();
							loc.hash = "beijing/";
							return delay(0).then(function() {
								assertMethodCalls();
								return controller.stop();
							});
						});
					});
				},

				"tearDown": function() {
					this.location.hash = "";
				}
			});
		});
});
