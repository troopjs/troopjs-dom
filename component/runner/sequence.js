/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../../css/selector",
	"jquery",
	"poly/array"
], function (Selector, $) {
	"use strict";

	/**
	 * @class dom.component.runner.sequence
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var DATA = "data";
	var HEAD = "head";
	var NEXT = "next";
	var SELECTOR = "selector";
	var MODIFIED = "modified";
	var MATCHES_SELECTOR = $.find.matchesSelector;

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Runner that executes DOM candidates in sequence without overlap
	 * @return {*} Result from last handler
	 */
	return function sequence(event, handlers, args) {
		var modified = handlers[MODIFIED];
		var $event = args[0];
		var $scope = event[CONTEXT].$element.get(0) || document.documentElement;
		var selector;
		var candidate;

		// Try get SELECTOR from handlers and check if MODIFIED
		if ((selector = handlers[SELECTOR]) === UNDEFINED || selector[MODIFIED] !== modified) {
			// Create and cache SELECTOR
			selector = handlers[SELECTOR] = Selector();

			// Set MODIFIED on selector
			selector[MODIFIED] = modified;

			// Iterate handlers
			for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
				// Add candidate with selector or default selector '*'
				selector.add(candidate[DATA] || "*", candidate);
			}
		}

		return selector
			// Filter to only selectors that match target
			.matches(MATCHES_SELECTOR, $event, $scope)
			// Reduce so we can catch the end value
			.reduce(function (result, selector) {
				// If immediate propagation is stopped we should just return last result
				if ($event.isImmediatePropagationStopped()) {
					return result;
				}

				// Did the previous candidate return false we should stopPropagation and preventDefault
				if (result === false) {
					$event.stopPropagation();
					$event.preventDefault();
				}

				// Get candidate from selector
				var candidate = selector[1];

				// Run candidate, provide result to next run
				return candidate[CALLBACK].apply(candidate[CONTEXT], args);
			}, UNDEFINED);
	}
});