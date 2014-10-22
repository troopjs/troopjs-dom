/*globals buster:false*/
buster.testCase("troopjs-dom/component/widget", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	require([
		"troopjs-dom/component/widget",
		"troopjs-dom/loom/weave",
		"troopjs-dom/loom/unweave",
		"jquery",
		"when"
	],
		function (Widget, weave, unweave, $, when) {

			run({
				"setUp": function () {
					this.$el = $("\
<div class=\"foo\" data-weave=\"troopjs-dom/test/component/foo\"></div>\
<div class=\"foobar\" data-weave=\"troopjs-dom/test/component/foo,troopjs-dom/test/component/bar(123, 'abc')\"></div>\
<div class=\"bar\" data-weave=\"troopjs-dom/test/component/foo,troopjs-dom/test/component/bar(123, 'abc')\" data-unweave=\"troopjs-dom/test/component/foo\"></div>\
<div class=\"foobar2\" data-weave=\"troopjs-dom/test/component/foo\"></div>\
<div class=\"foo-dom-event\" data-weave=\"troopjs-dom/test/component/foo-dom-event\">\
	<input id=\"btn-foo\" class=\"btn\" type=\"button\" data-type=\"x-button\" value=\"click\" />\
	<input class=\"txt\" type=\"text\" value=\"keydown\" />\
	<input class=\"btn\" type=\"checkbox\" checked/>\
</div>\
<div class=\"temp\" data-weave=\"troopjs-dom/test/component/tmp\"></div>\
<div class=\"error\" data-weave=\"troopjs-dom/test/component/thrown\"></div>\
");
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
