/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../config",
	"when"
], function (config, when) {
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";
	var SIG_RENDER = "sig/" + config.signal.render;

	/**
	 * @class dom.signal.render
	 * @implement core.component.signal
	 * @mixin dom.config
	 * @static
	 * @alias feature.signal
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Signals that the component has rendered something
	 */

	return function render() {
		var me = this;
		var args = arguments;

		return when(me[PHASE], function (phase) {
			var _args;

			// Let `_args` be `[ SIG_RENDER ]`
			// Push `args` on `_args`
			ARRAY_PUSH.apply(_args = [ SIG_RENDER ], args);

			return me
				.emit.apply(me, _args)
				.yield(phase);
		});
	}
});