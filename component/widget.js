/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"./gadget",
	"../loom/config",
	"../loom/weave",
	"../loom/unweave"
], function (Component, LOOM_CONF, loom_weave, loom_unweave) {
	"use strict";

	/**
	 * Component that attaches to an DOM element, considerably delegates all DOM manipulations.
	 * @class dom.component.widget
	 * @extend dom.component.gadget
	 * @alias widget.component
	 */

	var $ELEMENT = "$element";
	var SELECTOR_WEAVE = "[" + LOOM_CONF["weave"] + "]";
	var SELECTOR_WOVEN = "[" + LOOM_CONF["woven"] + "]";

	/**
	 * @ignore
	 * @inheritdoc #weave
	 */
	function weave() {
		return loom_weave.apply(this[$ELEMENT].find(SELECTOR_WEAVE), arguments);
	}

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Component.extend({
		"displayName" : "dom/component/widget",

		/**
		 * Handles component render
		 * @handler
		 * @inheritdoc #event-sig/render
		 * @localdoc Calls {@link #weave} to ensure newly rendered html is woven
		 * @return {Promise}
		 */
		"sig/render": weave,

		/**
		 * @handler
		 * @inheritdoc #event-dom/destroy
		 * @localdoc Unweaves this element
		 */
		"dom/destroy" : function () {
			if (this.phase !== "finalize") {
				loom_unweave.call(this[$ELEMENT]);
			}
		},

		/**
		 * @method
		 * @inheritdoc dom.loom.weave#constructor
		 */
		"weave" : weave,

		/**
		 * @inheritdoc dom.loom.unweave#constructor
		 */
		"unweave" : function () {
			return loom_unweave.apply(this[$ELEMENT].find(SELECTOR_WOVEN), arguments);
		}
	});
});
