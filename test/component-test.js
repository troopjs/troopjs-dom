/*globals buster:false*/
buster.testCase("troopjs-dom/component", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	require( [ "troopjs-dom/component", "jquery" ] , function (Component, $) {


		run({
			"setUp": function () {
				this.$el = $("<form />");
			},

			"DOM events": {
				"add &amp; remove": function () {
					var $el = this.$el;
					var click1 = this.spy();
					var click2 = this.spy();
					var component = Component($el);

					component
						.on("dom/click", click1)
						.on("dom/click", click2);

					$el.click();
					assert.calledOnce(click1);
					assert.calledOnce(click2);

					component.off("dom/click", click1);

					$el.click();
					assert.calledOnce(click1);
					assert.calledTwice(click2);

					component.off("dom/click");

					$el.click();
					assert.calledOnce(click1);
					assert.calledTwice(click2);
				},

				"bubble": function () {
					var $el = this.$el;
					var $input = $("<input />").appendTo($el);
					var change1 = this.spy();
					var change2 = this.spy();

					Component($el).on("dom/change", change1);
					Component($input).on("dom/change", change2);

					$input.change();
					assert.calledOnce(change1);
					assert.calledOnce(change2);
					$el.change();
					assert.calledTwice(change1);
					assert.calledOnce(change2);
				},

				"prevent bubble": function () {
					var $el = this.$el;
					var $input = $("<input />").appendTo($el);
					var change1 = this.spy();
					var change2 = this.spy(function () {
						return false;
					});

					Component($el).on("dom/change", change1);
					Component($input).on("dom/change", change2);

					$input.change();
					refute.called(change1);
					assert.calledOnce(change2);
					$el.change();
					assert.calledOnce(change1);
				},

				"stopPropagation": function () {
					var $el = this.$el;
					var $input = $("<input />").appendTo($el);
					var change1 = this.spy();
					var change2 = this.spy(function ($event) {
						$event.stopPropagation();
					});

					Component($el).on("dom/change", change1);
					Component($input).on("dom/change", change2);

					$input.change();
					refute.called(change1);
					assert.calledOnce(change2);
					$el.change();
					assert.calledOnce(change1);
				},

				"stopImmediatePropagation": function () {
					var $el = this.$el;
					var change1 = this.spy(function ($event) {
						$event.stopImmediatePropagation();
					});
					var change2 = this.spy();

					Component($el).on("dom/click", change1);
					Component($el).on("dom/click", change2);

					$el.click();
					assert.calledOnce(change1);
					refute.called(change2);
				}
			},

			"tearDown": function () {
				this.$el.remove();
			}
		});
	});
});
