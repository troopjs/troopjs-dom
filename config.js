/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
  "troopjs-core/config",
  "module",
  "mu-merge/main"
], function (config, module, merge) {
  "use strict";

  /**
   * @class dom.config.signal
   * @extends core.config.signal
   * @private
   */
  var SIGNAL = {
    /**
     * Signal emitted when component renders.
     */
    "render": "sig/render"
  };

  /**
   * DOM component configuration
   * @class dom.config
   * @extends core.config
   * @private
   * @alias feature.config
   */

  return merge.call({}, config, {
     /**
     * @cfg {dom.config.signal}
     * @inheritdoc
     * @protected
     */
    "signal": SIGNAL
  }, module.config());
});
