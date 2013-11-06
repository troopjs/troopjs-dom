/**
 * TroopJS browser/mvc/controller/widget module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"../../component/widget",
	"poly/object",
	"poly/array"
], function (Widget) {
	"use strict";

	var UNDEFINED;
	var CACHE = "_cache";
	var ROUTE = "_route";
	var DISPLAYNAME = "displayName";

	function request(requests) {
		var me = this;
		var cache = me[CACHE];
		var displayName = me[DISPLAYNAME];

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

								return updated
									? me.publish(displayName + "/updates", updates)
										.then(function () {
											me.$element.trigger("hashset", me.data2uri(cache, updates));
										})
										.yield(updates)
									: [ updates ];
							});
					});
			});
	}

	return Widget.extend(function () {
		this[CACHE] = {};
	}, {
		"displayName": "browser/mvc/controller/widget",

		"sig/initialize": function () {
			var me = this;

			me.subscribe(me[DISPLAYNAME], request);
		},

		"sig/finalize": function () {
			var me = this;

			me.unsubscribe(me[DISPLAYNAME], request);
		},

		"dom/urichange": function ($event, uri) {
			var me = this;

			me.publish(me[DISPLAYNAME], me.uri2data(me[ROUTE] = uri));
		}
	});
});