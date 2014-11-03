/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"mu-selector-set",
	"jquery",
	"poly/array"
], function (SelectorSet, $) {
	"use strict";

	/**
	 * @class dom.runner.sequence
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
		var selector;
		var candidate;
		var root = $event.delegateTarget;
		var current = $event.target;
		var elements;
		var isClick;

		// Try get SELECTOR from handlers and check if MODIFIED
		if ((selector = handlers[SELECTOR]) === UNDEFINED || selector[MODIFIED] !== modified) {
			// Create and cache SELECTOR
			selector = handlers[SELECTOR] = new SelectorSet();

			// Set MODIFIED on selector
			selector[MODIFIED] = modified;

			// Iterate handlers
			for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
				// Add candidate with selector or default selector '*'
				selector.add(candidate[DATA] || "*", candidate);
			}
		}

		// If the event target is the same as the delegateTarget we can just match against current ...
		if (root === current) {
			elements = current;
		}
		// ... otherwise we have to build a delegate tree of elements
		//
		// Black-hole SVG <use> instance trees (jQuery #13180)
		// Avoid non-left-click bubbling in Firefox (jQuery #3861)
		else if(current.nodeType !== UNDEFINED && ($event.button !== 0 || !(isClick = $event.type === "click"))) {
			// Let `elements` be `[]`
			elements = [];

			do {
				// Don't process clicks on disabled elements (jQuery #6911, #8165, #11382, #11764)
				if (current.disabled !== true || !isClick) {
					elements.push(current);
				}
			} while (current !== root && (current = current.parentNode) !== null);
		}
		else {
			return UNDEFINED;
		}

		return selector
			// Filter to only selectors that match target
			.matches(MATCHES_SELECTOR, elements)
			// Reduce so we can catch the end value
			.reduce(function (result, selector) {
				// If immediate propagation is stopped we should just return last result
				if ($event.isImmediatePropagationStopped()) {
					return result;
				}

				// If the previous candidate return false we should stopPropagation and preventDefault
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