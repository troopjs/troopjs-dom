/*globals buster:false*/
buster.testCase("troopjs-browser/component/widget", function (run) {
	"use strict";

	var assert = buster.referee.assert,
		refute = buster.referee.refute;

	require([
		"troopjs-browser/component/widget",
		"text!troopjs-browser/test/component/widget.html",
		"jquery"
	],
		function (Widget, html, $) {

			run({
				"setUp": function () {
					this.$el = $(html).appendTo("body");
					this.timeout = 1000;
				},

				"single widget, no parameter": {
					"weave/unweave": function () {
						var $el = $(".foo");
						return $el.weave().spread(function (widgets) {
							var widget = widgets[0];

							// data-weave attribute is cleared.
							refute($el.attr("data-weave"));
							assert("troopjs-browser/component/widget/foo", widget.displayName);
							assert.same(widget.toString(), $el.attr("data-woven"));
							assert.same("started", widget.phase);

							return $el.unweave().then(function () {
								refute($el.attr("data-woven"));
								assert.same("troopjs-browser/test/component/foo", $el.attr("data-weave"));
							});
						});
					}
				},

				"two widgets, one with parameters": {
					"weaving": function () {
						var $el = $(".foobar");
						return $el.weave(456, "def").spread(function (widgets) {
							// Two widgets received.
							var foo = widgets[0];
							var bar = widgets[1];

							// data-weave attribute is cleared.
							refute($el.attr("data-weave"));

							// Two widgets should share the same DOM element.
							assert.same($el.get(0), foo.$element.get(0));
							assert.same($el.get(0), bar.$element.get(0));

							// The woven attribute should consist of two widgets.
							assert.same([foo.toString(), bar.toString()].join(" "), $el.attr("data-woven"));

							assert.same("started", foo.phase);
							assert.same("started", bar.phase);

							return $el.unweave().then(function () {
								refute($el.attr("data-woven"));
								assert.same(
									"troopjs-browser/test/component/foo troopjs-browser/test/component/bar(123, 'abc')",
									$el.attr("data-weave")
								);
							});
						});
					}
				},

				"two widgets, with unweave attributes": {
					"weave/unweave": function () {
						var $el = $(".bar");
						return $el.weave(456, "def").spread(function (widgets) {
							var bar = widgets[1];
							return $el.unweave().spread(function (widgets) {
								assert.same(1, widgets.length);
								var foo = widgets[0];
								assert.same("troopjs-browser/test/component/foo", foo.displayName);
								// "bar" still in data-woven attribute.
								assert.same(bar.toString(), $el.attr("data-woven"));
								// data-unweave attribute should be cleared afterward.
								refute($el.attr("data-unweave"));
								assert.same("troopjs-browser/test/component/foo", $el.attr("data-weave"));
							});
						});
					}
				},

				"dynamic weaving/unweave": {
					"weave/unweave": function () {
						var $el = $(".foobar2");
						return $el.weave().spread(function (widgets) {
							var foo = widgets[0];
							return $el
								.attr("data-weave", "troopjs-browser/test/component/bar(123, 'abc')")
								.weave(456, "def")
								.spread(function (widgets) {

									assert.same(1, widgets.length);
									var bar = widgets[0];
									assert.same("troopjs-browser/test/component/bar", bar.displayName);

									// data-unweave attribute should be cleared afterward.
									refute($el.attr("data-weave"));
									// "bar" appears in data-woven attribute.
									assert.same([foo.toString(), bar.toString()].join(" "), $el.attr("data-woven"));

									$el.attr("data-unweave", "troopjs-browser/test/component/bar");
									return $el.unweave().spread(function (unweaved) {
										assert.same(1, unweaved.length);

										// data-unweave attribute should be cleared afterward.
										refute($el.attr("data-unweave"));
										assert.same(foo.toString(), $el.attr("data-woven"));
									});
								});
						});
					}
				},

				"tearDown": function () {
					this.$el.remove();
				}
			});
		});
});
