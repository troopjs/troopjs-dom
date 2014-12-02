/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"troopjs-core/pubsub/config",
	"when"
], function (when, config) {
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";
	var SKIP = config.skip;

	/**
	 * @class dom.signal.render
	 * @implement core.component.signal
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

			if (!SKIP.test(phase)) {
				// Let `_args` be `[ "sig/render" ]`
				// Push `args` on `_args`
				ARRAY_PUSH.apply(_args = [ "sig/render" ], args);

				return me
					.emit.apply(me, _args)
					.yield(phase);
			}
			else {
				return phase;
			}
		});
	}
});