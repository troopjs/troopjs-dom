/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../component/widget",
	"./runner/sequence",
	"when"
], function (Widget, sequence, when) {
	"use strict";

	/**
	 * @class browser.route.widget
	 * @extend browser.component.widget
	 * @alias widget.route
	 */

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ROUTE = "route";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var FEATURES = "features";
	var RUNNER = "runner";

	/**
	 * Route set event
	 * @localdoc Triggered when a route set is requested
	 * @event route/set
	 * @param {String} route Route
	 * @param {Object} data Data
	 * @param {...*} [args] Additional arguments
	 * @preventable
	 */

	/**
	 * Route change event
	 * @localdoc Triggered when a route change is requested
	 * @event route/change
	 * @param {String} route Route
	 * @param {String[]} data Data
	 * @param {...*} [args] Additional arguments
	 * @preventable
	 */

	/**
	 * Route change handler
	 * @handler route/change
	 * @inheritdoc #event-route/change
	 * @localdoc Matches and executes route stored in data
	 * @template
	 * @return {*}
	 */

	/**
	 * Runs routes
	 * @ignore
	 * @param {String} op Operation
	 * @param {...*} [args] Additional arguments
	 * @return {*} Result from last handler
	 */
	function runRoute(op) {
		var me = this;

		// Prepare event object
		var event = {};
		event[TYPE] = ROUTE + "/" + op;
		event[RUNNER] = sequence;

		// Modify first argument
		arguments[0] = event;

		// Delegate the actual emitting to emit
		return me.emit.apply(me, arguments);
	}

	return Widget.extend({
		"displayName" : "browser/route/widget",

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc Registers event handlers declared ROUTE specials
		 */
		"sig/initialize": function onInitialize() {
			var me = this;

			return when.map(me.constructor.specials[ROUTE] || ARRAY_PROTO, function (special) {
				return me.on(special[NAME], special[VALUE], special[FEATURES]);
			});
		},

		/**
		 * @handler hub/hash/change
		 * @inheritdoc browser.hash.widget
		 * @localdoc Translates {@link browser.hash.widget#event-hub/hash/change} to a `route/change` task
		 * @fires route/change
		 */
		"hub:memory/hash/change": function onHashChange(hash) {
			var me = this;
			var args = [ "change" ];

			ARRAY_PUSH.apply(args, arguments);

			return me.task(function (resolve) {
				resolve(runRoute.apply(me, args));
			}, ROUTE + "/change");
		},

		/**
		 * Handles route set
		 * @handler
		 * @inheritdoc #event-route/set
		 * @localdoc Translates {@link #event-route/set} to {@link browser.hash.widget#event-hub/hash/set}
		 * @fires browser.hash.widget#event-hub/hash/set
		 */
		"route/set": function onRouteSet(route, data) {
			return this.publish("hash/set", data["input"]);
		},

		/**
		 * Changes the current route
		 * @inheritdoc #handler-route/set
		 * @return {Promise}
		 * @fires route/set
		 */
		"route": function route(route, data) {
			var me = this;
			var args = [ "set" ];

			ARRAY_PUSH.apply(args, arguments);

			return me.task(function (resolve) {
				resolve(runRoute.apply(me, args));
			}, ROUTE + "/set");
		}
	});
});