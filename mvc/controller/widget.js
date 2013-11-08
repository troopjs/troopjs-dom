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
	var URI = "_uri";
	var OPT_SILENT = "silent";
	var DISPLAYNAME = "displayName";
	var ARRAY_SLICE = Array.prototype.slice;

	function extend() {
		var me = this;

		ARRAY_SLICE.call(arguments).forEach(function (arg) {
			Object.keys(arg).forEach(function (key) {
				me[key] = arg[key];
			});
		});

		return me;
	}

	function handleControl(requests, options) {
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
										updates[key] = _results[key];
										update = true;
									}

									return update;
								}, false);

								return updated ? me.publish(displayName + "/updates", updates)
									.then(function () {
										// Trigger `hashset` but silently
										me.$element.trigger("hashset",
											[ me[URI] = me.data2uri(me[CACHE] = _results), options[OPT_SILENT] === true ]
										);

									})
									.yield(updates)
									: [ updates ];
							});
					});
			});
	}

	function handleRequests(requests) {
		var me = this;

		return [ URI in me ? extend.call(me.uri2data(me[URI]), requests) : requests ];
	}

	return Widget.extend(Hash, function () {
		this[CACHE] = {};
	}, {
		"displayName": "browser/mvc/controller/widget",

		"sig/initialize": function () {
			var me = this;

			me.subscribe(me[DISPLAYNAME], handleControl);
			me.subscribe(me[DISPLAYNAME] + "/requests", handleRequests);
		},

		"sig/finalize": function () {
			var me = this;

			me.unsubscribe(me[DISPLAYNAME], handleControl);
			me.unsubscribe(me[DISPLAYNAME] + "/requests", handleRequests);
		},

		"dom/urichange": function ($event, uri) {
			var me = this;

			me.publish(me[DISPLAYNAME], me.uri2data(me[URI] = uri));
		}
	});
});