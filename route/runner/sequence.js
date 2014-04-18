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
	var OBJECT_TOSTRING = Object.prototype.toString;
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
	 * @throws {Error} If `event.type` is an unknown type
	 */
	return function sequence(event, handlers, args) {
		var path;
		var type = event[TYPE];
		var route = path = args.shift(); // Shift path and route of args
		var data = args[0]; // Data is provided as the second arg, but we're already shifted
		var candidate;
		var candidates = [];

		// If this is a route/set we need to pre-process the path
		if (type === "route/set") {
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
		// If this is _not_ a route/change we should throw an error
		else if (type !== "route/change") {
			throw new Error("Unable to run type '" + type + "'");
		}

		// Copy handlers -> candidates
		for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
			candidates.push(candidate);
		}

		// Run candidates and return
		return candidates.reduce(function (result, candidate) {
			var tokens;
			var matches;
			var re;

			// Only run if the reduced result is not `false`
			if (result !== false) {
				// Reset tokens
				tokens = [];

				switch (OBJECT_TOSTRING.call(candidate[DATA])) {
					case "[object RegExp]":
						// Already compiled
						re = candidate[DATA];
						break;

					case "[object Undefined]":
						// Match anything
						re = RE_ANY;
						break;

					default:
						// Translate and cache pattern to regexp
						re = candidate[DATA] = new RegExp(candidate[DATA]
							// Translate grouping to non capturing regexp groups
							.replace(RE_GROUP_START, "(?:")
							.replace(RE_GROUP_END, ")?")
							// Capture tokens
							.replace(RE_TOKEN, function ($0, token) {
								// Add token
								tokens.push(token);
								// Return replacement
								return "(\\w+)";
							}));
				}

				// Match path
				if ((matches = re.exec(path)) !== NULL) {
					// Capture tokens in data
					tokens.forEach(function (token, index) {
						matches[token] = matches[index + 1];
					});

					// Apply CALLBACK and store in result
					result = candidate[CALLBACK].apply(candidate[CONTEXT], [ route, matches ].concat(args));
				}
			}

			return result;
		}, UNDEFINED);
	}
});