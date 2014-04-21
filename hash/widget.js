/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"../component/widget",
	"troopjs-jquery/hashchange"
], function (Widget) {
	"use strict";

	/**
	 * Widget that attaches to the window object in order to handle `window.location.hash` changes.
	 * @class dom.hash.widget
	 * @extend dom.component.widget
	 * @alias widget.hash
	 */

	var $ELEMENT = "$element";
	var HASH = "_hash";
	var RE = /^#/;

	/**
	 * Hash change event (global)
	 * @localdoc Triggered when a {@link #$element} with {@link dom.hash.widget} attached to it changes its hash
	 * @event hub/hash/change
	 * @param {String} hash The new hash
	 */

	/**
	 * Hash change event (local)
	 * @localdoc Triggered when the attached {@link #$element} hash is changed
	 * @event dom/hashchange
	 * @preventable
	 * @param {Object} $event {@link jQuery} event
	 * @param {String} hash The new hash
	 */

	/**
	 * Hash set event (global)
	 * @localdoc Triggered when a component wants to change the hash of an {@link #$element}'s with {@link dom.hash.widget} attached to it
	 * @event hub/hash/set
	 * @param {String} hash The new hash
	 * @param {Boolean} [silent=false] Change the hash silently without triggering {@link dom.hash.widget#event-hub/hash/change} event.
	 */

	/**
	 * Hash set event (local)
	 * @localdoc Triggered when a component wants to change the attached {@link #$element} hash
	 * @event dom/hashset
	 * @preventable
	 * @param {Object} $event {@link jQuery} event
	 * @param {String} hash The new hash
	 * @param {Boolean} [silent=false] Change the hash silently without triggering {@link dom.hash.widget#event-dom/hashchange} event.
	 */

	/**
	 * Hash change handler (global)
	 * @inheritdoc #event-hub/hash/change
	 * @handler hub/hash/change
	 * @template
	 * @return {Promise}
	 */

	return Widget.extend({
		"displayName" : "dom/hash/widget",

		/**
		 * @inheritdoc
		 * @handler
		 */
		"sig/start" : function () {
			this[$ELEMENT].trigger("hashchange");
		},

		/**
		 * Hash change handler (local)
		 * @inheritdoc #event-dom/hashchange
		 * @localdoc Handles changing hash of the attached {@link #$element}
		 * @param {Object} $event {@link jQuery} event
		 * @handler
		 * @fires hub/hash/change
		 */
		"dom/hashchange": function ($event) {
			var me = this;
			var hash = me[$ELEMENT].get(0).location.hash.replace(RE, "");

			// Did anything change?
			if (hash !== me[HASH]) {
				// Store and publish new hash
				me.publish("hash/change", me[HASH] = hash);
			}
			else {
				// Prevent further hashchange handlers from receiving this
				$event.stopImmediatePropagation();
			}
		},

		/**
		 * Hash set handler (local)
		 * @inheritdoc #event-dom/hashset
		 * @localdoc Handles setting hash of the attached {@link #$element}
		 * @handler
		 * @fires hub/hash/set
		 */
		"dom/hashset": function ($event, hash, silent) {
			this.publish("hash/set", hash, silent);
		},

		/**
		 * Hash set handler (global)
		 * @inheritdoc #event-hub/hash/set
		 * @localdoc Implicitly translates {@link dom.hash.widget#event-hub/hash/set} to {@link #event-dom/hashset} by setting the {@link #$element} hash
		 * @handler hub/hash/set
		 * @return {Promise}
		 */
		"hub:memory/hash/set": function (hash, silent) {
			var me = this;

			// If we are silent we update the local me[HASH] to prevent change detection
			if (silent === true) {
				me[HASH] = hash;
			}

			me[$ELEMENT].get(0).location.hash = hash;
		}
	});
});
