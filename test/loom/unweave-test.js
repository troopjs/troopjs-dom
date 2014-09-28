/*globals buster:false*/
buster.testCase("troopjs-dom/loom/unweave", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	require([
			"troopjs-dom/component/widget",
			"troopjs-dom/loom/weave",
			"troopjs-dom/loom/unweave",
			"when",
			"jquery"
		],
		function (Widget, weave, unweave, when, $) {

			run({
				"setUp": function () {
					this.$el = $("<div></div>");
				},

				"one widget": {
					"weave/unweave": function () {
						var $el = this.$el.attr("data-weave", "troopjs-dom/component/widget");

						return weave.call($el).spread(function (woven) {
							return unweave.call($el).spread(function (unwoven) {
								// Make sure the same widgets that were woven were unwoven
								assert.equals(woven, unwoven);
								// no more data-woven attribute
								refute.defined($el.attr("data-woven"));
							});
						});
					},

					"weave/unweave in parallel": function() {
						var $el = this.$el.attr("data-weave", "troopjs-dom/component/widget");

						// Call weave and unweave without pause
						return when.join(weave.call($el), unweave.call($el)).spread(function (woven, unwoven) {
							// Make sure the same widgets that were woven were unwoven
							assert.equals(woven, unwoven);
							// no more data-woven attribute
							refute.defined($el.attr("data-woven"));
						});
					}
				},

				"two widgets": {
					"one with parameters": function () {
						var $el = this.$el.attr("data-weave", "troopjs-dom/component/widget troopjs-dom/component/widget(true, 1, 'string')");

						return weave.call($el).spread(function (woven) {
							return unweave.call($el).spread(function (unwoven) {
								assert.equals(woven, unwoven);
								refute.defined($el.attr("data-woven"));
								refute.defined($el.attr("data-weave"));
							});
						});
					},

					"one with unweave attribute": function () {
						var $el = this.$el.attr({
							"data-weave" : "troopjs-dom/component/widget troopjs-dom/test/loom/default",
							"data-unweave": "troopjs-dom/test/loom/default"
						});

						return weave.call($el).spread(function (woven) {
							assert.equals(woven.length, 2);

							var foo = woven[0];
							var bar = woven[1];

							return unweave.call($el).spread(function (unwoven) {
								assert.equals(unwoven.length, 1);

								var baz = unwoven[0];

								// correct widget was unwoven
								assert.equals(bar, baz);

								// "foo" still in data-woven attribute.
								assert.equals($el.attr("data-woven"), foo.toString());

								// data-unweave attribute should be cleared afterward.
								refute.defined($el.attr("data-unweave"));
							});
						});
					},

					"dynamic weaving/unweave": function () {
						var $el = this.$el.attr("data-weave", "troopjs-dom/component/widget");

						return weave.call($el).spread(function (woven) {
							assert.equals(woven.length, 1);

							var foo = woven[0];

							$el.attr("data-weave", "troopjs-dom/test/loom/default");

							return weave.call($el).spread(function (woven) {
								assert.equals(woven.length, 1);

								var bar = woven[0];

								$el.attr("data-unweave", "troopjs-dom/test/loom/default");

								return unweave.call($el).spread(function (unwoven) {
									assert.equals(unwoven.length, 1);

									var baz = unwoven[0];

									// correct widget was unwoven
									assert.equals(bar, baz);

									// "foo" still in data-woven attribute.
									assert.equals($el.attr("data-woven"), foo.toString());

									// data-unweave attribute should be cleared afterward.
									refute.defined($el.attr("data-unweave"));
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
