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

	function lastValue(values) {
		return values[values.length - 1];
	}

	/**
	 * An abstracted routing widget for single-page application page-flow control. It basically processes the page URI
	 * through a list of following methods in sequence, most of which are to be implemented by subclassing this widget.
	 *
	 *  1. {@link #uri2data} Implement this method to parse the requested URL into a route hash object which is basically a
	 *  hash composed of URI segments.
	 *  1. {@link #event-requests on/requests} Implement this method to fulfill the requested route hash value with actual application
	 *  states, potentially loaded from server side.
	 *  1. {@link #data2uri} Implement this method to serialize the application states to a new URL afterwards.
	 *  1. {@link #event-updates on/updates} (Optional) Event to notify about the only application states that has changed.
	 *  1. {@link #event-results on/results} (Optional) Event to notify about the all application states.
	 *
	 * Application subscribes to {@link #event-updates} and {@link #event-results} for consuming the processed data.
	 * @class browser.mvc.controller
	 */
	return Widget.extend(function () {
		this[CACHE] = {};
	}, {
		"displayName": "browser/mvc/controller/widget",

		/*
		 * The "urichange" event is triggered by {@link browser.hash.widget} on application start or page hash changes.
		 */
		"dom/urichange": function ($event, uri) {
			this.request(this.uri2data(uri));
		},

		/**
		 * Request for route changes to the current URI.
		 * @param {Object} requests The hash of segments and values to be changed.
		 */
		"request": function requestRouteChanges(requests) {
			var me = this;
			return me.task(function(resolve) {
				// Track this task.
				var taskNo = ++currTaskNo;
				// Emit the requested route hash.
				return me.emit("request", extend.call({}, me[CACHE], requests))
				 .then(lastValue)
				 .then(function(results) {
						// Reject if this promise is not the current pending task.
					if (taskNo == currTaskNo) {
						// Calculate updates
						var updates = {};
						var updated = Object.keys(results).reduce(function(update, key) {
							if (checkChanged.apply(me, [key, results[key]])) {
								updates[key] = results[key];
								update = true;
							}

							return update;
						}, false);

						// Update cache
						me[CACHE] = results;

						// Emit all cached properties.
						resolve(me.emit("results", results).then(function() {
								// Emit only the changed properties.
								return updated && me.emit("updates", updates).then(lastValue);
						}).then(function() {
							// Change the hash to new URI.
							me.$element.trigger("hashset", [me.data2uri(results), true]);
						}).yield(results));
					}
				});
			});
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
		 * @param {core.net.uri} uri URI that reflects the requested URI.
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
		 * @param {Object} data Arbitrary data object that reflects the current states of the page.
		 * @return {String|core.net.uri} The new URI to update the current location with.
		 */
		"data2uri" : function (data) {
			throw new Error("data2uri is not implemented");
		},

		/**
		 * Implement this method to return a "timestamp" alike value that determinate whether one data object has ever changed since the last route.
		 *
		 * @param {Object} data Arbitrary data object.
		 * @return {String} The index string that indicates the freshness of the data.
		 */
		"hash" : function (data) { return ""; }

		/**
		 * Listen to this event for requested route hash, to resolve it with actual values that are probably loaded from server side.
		 * @event requests
		 * @param {Object} requests A hash of URI segments to be changed.
		 * @return {Object} The fulfilled data object.
		 */

		/**
		 * Listen to this event for data changes that are triggered by routing, reflects only the segments that has changed on the URI.
		 * @event updates
		 * @param {Object} data Arbitrary data object.
		 */

		/**
		 * Listen to this event for all application data triggered by routing.
		 * @event results
		 * @param {Object} data Arbitrary data object.
		 */

	}, Hash);
});
