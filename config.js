/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"troopjs-core/component/config",
	"module",
	"mu-merge"
], function (config, module, merge) {
	"use strict";

	/**
	 * DOM component configuration
	 * @class dom.config
	 * @extends core.component.config
	 * @protected
	 * @alias feature.config
	 */

	return merge.call(config, {
		/**
		 * @cfg signal
		 * @cfg {String} signal.render=signal.render Signal emitted when component has rendered.
		 * @inheritdoc
		 */
		"signal": {
			"render": "render"
		}
	}, module.config());
});