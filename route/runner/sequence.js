/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "poly/array" ], function SequenceModule() {
	"use strict";

	/**
	 * @class browser.route.runner.sequence
	 * @implement core.event.emitter.runner
	 * @protected
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var NULL = null;
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var DATA = "data";
	var HEAD = "head";
	var NEXT = "next";
	var TYPE = "type";

	var RE_GROUP = /[\(\)]/g;
	var RE_GROUP_START = /\(/g;
	var RE_GROUP_END = /\)/g;
	var RE_TOKEN = /\:(\w+)/g;
	var RE_TAIL = /\([^\(]?\:.*$/;
	var RE_ANY = /.*/;

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Runner that executes ROUTE candidates in sequence without overlap
	 * @return {*} Result from last handler
	 */
	return function sequence(event, handlers, args) {
		var path;
		var route;
		var candidate;
		var tokens;
		var re;
		var data;

		// Shift path and route of args
		path = route = args.shift();

		// If this is a set we need to pre-process the path
		if (event[TYPE] === "route/set") {
			// Data should be provided as the second arg, but we're already shifted
			data = args[0];

			// Populate path with data
			path = path
				// Replace tokens
				.replace(RE_TOKEN, function ($0, $1) {
					return data[$1] || ":" + $1;
				})
				// Remove tail where tokens were not replaced
				.replace(RE_TAIL, "")
				// Remove remaining grouping
				.replace(RE_GROUP, "");
		}

		// Iterate handlers
		for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
			tokens = [];

			re = candidate[DATA]
				// Translate pattern to regexp syntax
				? new RegExp(candidate[DATA]
					// Translate grouping to non capturing regexp groups
					.replace(RE_GROUP_START, "(?:")
					.replace(RE_GROUP_END, ")?")
					// Capture tokens
					.replace(RE_TOKEN, function ($0, token) {
						// Add token
						tokens.push(token);
						// Return replacement
						return "(\\w+)";
					}))
				// No DATA. Just match anything
				: RE_ANY;

			// Match path
			if ((data = re.exec(path)) !== NULL) {
				// Capture tokens in data
				tokens.forEach(function (token, index) {
					data[token] = data[index + 1];
				});

				// Apply CALLBACK
				candidate[CALLBACK].apply(candidate[CONTEXT], [ route, data ].concat(args));
			}
		}
	}
});