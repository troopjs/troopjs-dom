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
	var LEFT_BUTTON = 0;

	// Use `$.find.matchesSelector` for wider browser support
	SelectorSet.prototype.matchesSelector = $.find.matchesSelector;

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Runner that executes DOM candidates in sequence without overlap
	 * @return {*} Result from last handler
	 */
	return function sequence(event, handlers, args) {
		var $reduce = function (result, handler) {
			// If immediate propagation is stopped we should just return last result
			if ($event.isImmediatePropagationStopped()) {
				return result;
			}

			// If the previous handler return false we should stopPropagation and preventDefault
			if (result === false) {
				$event.stopPropagation();
				$event.preventDefault();
			}

			return handler.apply(handler.context, args);
		};

		var $event = args[0];
		var $delegate = $event.delegateTarget;
		var $target = $event.target;
		var $notClick = $event.type !== "click";
		var $result = UNDEFINED;
		var direct = handlers.direct;
		var delegated = handlers.delegated;
		// we bubble the event up the dom if:
		// 1. this is not a black-holed element (jQuery #13180)
		// 2. and: this is the left button or it's a not a click event (jQuery #3861)
		var bubbleUp = $target.nodeType !== UNDEFINED && ($event.button === LEFT_BUTTON || $notClick);

		do {
			// Don't process clicks on disabled elements (jQuery #6911, #8165, #11382, #11764)
			if ($target.disabled !== true || $notClick) {
				// run delegated handlers which match this element
				$result = delegated // selector set of delegated selector-handler pairs
					.matches($event.currentTarget = $target)
					.map(function(match){
						// we only need the handler function
						return match[1]; // match[0] is the selector. match[1] is the handler
					})
					.reduce($reduce, $result);
			}
		}
		while (
			bubbleUp &&
			!$event.isPropagationStopped() &&
			$target !== $delegate && // stop bubbling up at the root element
			($target = $target.parentNode) !== null // bubble up until nowhere to go
		);

		// run all the direct (non-delegated) handlers of the root element
		if ($result !== false) {
			$result = direct.reduce($reduce, $result);
		}

		return $result;
	}
});