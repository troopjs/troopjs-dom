/**
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

	var UNDEFINED;
	var CACHE = "_cache";
	var ROUTE = "_route";
	var OPT_SILENT = "silent";
	var DISPLAYNAME = "displayName";

	function handleRequest(requests, options) {
		var me = this;
		var cache = me[CACHE];
		var displayName = me[DISPLAYNAME];

		options = options || {};

		return me.publish(displayName + "/requests", requests)
			.spread(function (_requests) {
				if (_requests === UNDEFINED) {
					_requests = requests;
				}

				return me.request(_requests, {})
					.then(function (results) {
						return me.publish(displayName + "/results", results)
							.spread(function (_results) {
								if (_results === UNDEFINED) {
									_results = results;
								}

								var updates = {};
								var updated = Object.keys(_results).reduce(function (update, key) {
									if (cache[key] !== _results[key]) {
										cache[key] = updates[key] = _results[key];
										update = true;
									}

									return update;
								}, false);

								return updated ? me.publish(displayName + "/updates", updates)
									.then(function () {
										// Trigger `hashset` but silently
										me.$element.trigger("hashset", [ me.data2uri(cache, updates), options[OPT_SILENT] === true ]);

									})
									.yield(updates)
									: [ updates ];
							});
					});
			});
	}

	return Widget.extend(Hash, function () {
		this[CACHE] = {};
	}, {
		"displayName": "browser/mvc/controller/widget",

		"sig/initialize": function () {
			var me = this;

			me.subscribe(me[DISPLAYNAME], handleRequest);
		},

		"sig/finalize": function () {
			var me = this;

			me.unsubscribe(me[DISPLAYNAME], handleRequest);
		},

		/**
		 * Requests for route changes, eventually updates the browser hash.
		 * @param {Object} changes Hash of route segments to change.
		 * @param {Object} [options] option Various route options.
		 */
		"update": function(changes, options) {
			var me = this;

			me.publish(me[DISPLAYNAME], changes, options);
		},

		"dom/urichange": function ($event, uri) {
			var me = this;

			me.publish(me[DISPLAYNAME], me.uri2data(me[ROUTE] = uri));
		}
	});
});