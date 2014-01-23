/*
 * TroopJS browser/mvc/controller/widget module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"../../component/widget",
	"../../hash/widget",
	"poly/object",
	"poly/array"
], function (Widget, Hash) {
	"use strict";

	var CACHE = "_cache";
	var DISPLAYNAME = "displayName";
	var ARRAY_SLICE = Array.prototype.slice;
	var currTaskNo = 0;

	function extend() {
		var me = this;

		ARRAY_SLICE.call(arguments).forEach(function (arg) {
			Object.keys(arg).forEach(function (key) {
				me[key] = arg[key];
			});
		});

		return me;
	}

	var indexes = {};
	// Check if the object has changed since the last retrieval.
	function checkChanged(key, val) {
		var curr = this[CACHE][key], hash = this.hash(val);
		var ischanged = !(curr === val && indexes[key] === hash );
		ischanged && (indexes[key] = hash);
		return ischanged;
	}

	function handleRequests(requests) {
		var me = this;
		var displayName = me[DISPLAYNAME];

		return me.task(function (resolve, reject) {
			// Track this task.
			var taskNo = ++currTaskNo;

			me.request(extend.call({}, me[CACHE], requests))
				.then(function (results) {
					// Reject if this promise is not the current pending task.
					if (taskNo == currTaskNo) {
						// Calculate updates
						var updates = {};
						var updated = Object.keys(results).reduce(function (update, key) {
							if (checkChanged.apply(me, [key, results[key]])) {
								updates[key] = results[key];
								update = true;
							}

							return update;
						}, false);

						// Update cache
						me[CACHE] = results;

						resolve(me.publish(displayName + "/results", results)
							.then(function () {
								return updated && me.publish(displayName + "/updates", updates);
							})
							.then(function () {
								// Trigger `hashset`
								me.$element.trigger("hashset", [me.data2uri(results), true]);
							})
							.yield(results));
					}
				});
		});
	}

	/**
	 * Abstracted URL based router used for single-page application page flow control. Extend this widget with the following
	 * methods implemented:
	 *
	 *  - {@link #uri2data} This method is to parse the requested URL.
	 *  - {@link #request} This method is to do whatever you like with the request object, potentially load any server data.
	 *  - {@link #data2uri} This method is to serialize the new URL afterward.
	 *
	 * Implementation can subscribe to the following topics for data retrieval:
	 *
	 *  - [display name]/results Subscribe to this topic for list of all data from the resolved request.
	 *  - [display name]/updates Subscribe to this topic for only updated resolved data that changes from the last request.
	 *
	 * @class browser.mvc.controller
	 */
	return Widget.extend(function () {
		this[CACHE] = {};
	}, {
		"displayName": "browser/mvc/controller/widget",

		"sig/initialize": function () {
			var me = this;

			me.subscribe(me[DISPLAYNAME] + "/requests", handleRequests);
		},

		"sig/finalize": function () {
			var me = this;

			me.unsubscribe(me[DISPLAYNAME]+ "/requests", handleRequests);
		},

		"dom/urichange": function ($event, uri) {
			var me = this;

			me.publish(me[DISPLAYNAME] + "/requests", me.uri2data(uri));
		},

		/**
		 * Implement this method to load application data requested by the page, e.g. query the server for each of the request key.
		 *
		 * @param {Object} spec The value returned from {@link #uri2data} as the page routing request.
		 * @return {Promise} data The promise that resolved to the page data fulfilled by the application logic.
		 */
		"request" : function (spec) {
			throw new Error("request is not implemented");
		},

		/**
		 * Implement this method to convert a {@link core.net.uri} that reflects the current page URL into a hash with key
		 * values presenting each segment of the URL.
		 *
		 * Suppose we load the page with this URL: `http://example.org/foo/#page1/section2/3`, the implementation would look
		 * like:
		 *
		 * 	"uri2data": function (uri){
		 * 		var data = {};
		 * 		var path = uri.path;
		 * 	 	// Let the first path segment (page1) presents the "page".
		 * 		data["page"] = path[0];
		 * 		// Let the second path segment (section2) presents the "section"
		 * 		data["section"] = path[1];
		 * 		// Let the third path segment (3) be the item no. default to be zero.
		 * 		data["item"] = path[2] || 0;
		 * 	}
		 *
		 * @return {Object} the hash that represents the current URL.
		 * @method
		 */
		"uri2data" : function (uri) {
			throw new Error("uri2data is not implemented");
		},

		/**
		 * Implement this method to convert a hash back to {@link core.net.uri} that reflects the new page URL to change to.
		 *
		 * Suppose that we'd like to structure the following application data on page URL:
		 *
		 * 	{
		 * 		"page": {
		 * 			title: "page1"
		 * 			...
		 * 		}
		 *
		 * 		"section": {
		 * 			"name": "section3"
		 * 			...
		 * 		}
		 *
		 * 		"item": {
		 * 			"id": 4
		 * 			...
		 * 		}
		 * 	}
		 *
		 * The implementation of this method would look like:
		 *
		 * 	var URI = require('troopjs-core/net/uri');
		 * 	"data2uri": function (data){
		 * 		var uri = URI();
		 * 		var paths = [data.page.title, data.section.name];
		 * 		if(data.item)
		 * 			paths.push(data.item.id);
		 * 		uri.path = URI.Path(paths);
		 * 		return uri;
		 * 	}
		 *
		 */
		"data2uri" : function (data) {
			throw new Error("data2uri is not implemented");
		},

		// Override me to compute the data hash.
		"hash" : function (data) { return ""; }
	}, Hash);
});
