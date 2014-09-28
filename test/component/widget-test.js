/*globals buster:false*/
buster.testCase("troopjs-dom/component/widget", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	require([
		"troopjs-dom/component/widget",
		"troopjs-dom/loom/weave",
		"troopjs-dom/loom/unweave",
		"text!troopjs-dom/test/component/widget.html",
		"jquery",
		"when"
	],
		function (Widget, weave, unweave, html, $, when) {

			run({
				"setUp": function () {
					this.$el = $(html).appendTo("body");
				},

				"dom event handler - declarative": function() {
					// See foo-dom-event.js
					var me = this;
					var $el = me.$el.filter(".foo-dom-event");
					var $btn;
					var $txt;
					var spy = me.spy();

					return weave.call($el, spy).then(function() {
						$btn = $el.find("input[type='button']");
						$txt = $el.find("input[type='text']");

						// Assert trigger click with two arguments.
						$btn.trigger("click", ["foo", "bar"]);
						// Assert all matched handlers are invoked.
						assert.equals(spy.callCount, 7);

						// Assert trigger keydown with arbitary object.
						spy.reset();
						$txt.trigger("keydown", { "foo": "bar"});
						assert.calledOnce(spy);

						return unweave.call($el).then(function() {

							// Assert all DOM listeners are removed after widget stopped.
							spy.reset();
							$btn.trigger("click");
							$btn.trigger("keydown");
							refute.called(spy);
						});
					});
				},

				"dom event handler - dynamic": function() {
					// See foo-dom-event.js
					var me = this;
					var $el = me.$el.filter(".foo-dom-event");
					var $btn;
					var $txt;
					var spy = me.spy();

					var foo = Widget($el);
					return foo.start().then(function() {
						$btn = $el.find("input[type='button']");
						$txt = $el.find("input[type='text']");

						foo.on("dom/click", function() {
							spy();
						});

						var handlers = foo.handlers['dom/click'];
						var modified;
						assert((modified = handlers.modified));

						$btn.trigger("click", ["foo", "bar"]);

						assert.called(spy);

						foo.on("dom/click", function() {}, ".btn");

						refute.equals(handlers.modified, modified, 'assert modified is updated');

						return foo.stop();
					});
				},

				"//render proxy - html": function() {
					var me = this;

					return weave.call(me.$el.filter(".foo")).spread(function(widgets) {
						var widget = widgets[0];
						function assertContent(expected) {
							assert.same(expected, widget.html());
						}
						return widget.html("foo").then(function() {
							assertContent("foo");
						}).then(function() {
							return widget.html(when("foo")).then(function() {
								assertContent("foo");
							});
						}).then(function() {
							return widget.html(function(val) {
								return when(val);
							}, "foo").then(function() {
								assertContent("foo");
							});
						}).then(function() {
							return widget.html(when(function(val) {
								return when(val);
							}), "foo").then(function() {
								assertContent("foo");
							});
						});
					});
				},

				"tearDown": function () {
					this.$el.remove();
				}
			});
		});
});
