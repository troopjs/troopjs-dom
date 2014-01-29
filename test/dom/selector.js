/*globals buster:false*/
buster.testCase("troopjs-browser/dom/selector", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	require([ "troopjs-browser/dom/selector", "jquery" ], function (Selector, $) {
		run({
			".last able to extract tag/id/class": function () {
				var selector = Selector();

				assert.equals(selector.last(".class"), ".class");
				assert.equals(selector.last("#id"), "#id");
				assert.equals(selector.last("tag"), "tag");
			},

			".last able to extract tag/id/class with stacking": function() {
				var selector = Selector();

				assert.equals(selector.last("tag #id .class"), ".class");
				assert.equals(selector.last("tag #id.class"), "#id");
				assert.equals(selector.last("tag#id.class"), "tag");
			},

			".last able to extract tag/id/class with attributes": function() {
				var selector = Selector();

				assert.equals(selector.last(".class[attr = '#123']"), ".class");
				assert.equals(selector.last("#id[attr = '#123']"), "#id");
				assert.equals(selector.last("tag[attr = '#123']"), "tag");
			},

			".last able to extract tag/id/class with attributes and stacking": function() {
				var selector = Selector();

				assert.equals(selector.last("tag #id .class[attr = '#123']"), ".class");
				assert.equals(selector.last("tag #id.class[attr = '#123']"), "#id");
				assert.equals(selector.last("tag#id.class[attr = '#123']"), "tag");
			},

			".last able to extract tag/id/class with attributes, stacking and escaped chars": function() {
				var selector = Selector();

				assert.equals(selector.last("tag #id .class[attr = '\\[#123\\]'"), ".class");
				assert.equals(selector.last("tag #id.class[attr = '\\[#123\\]']"), "#id");
				assert.equals(selector.last("tag#id.class[attr = '\\[#123\\]']"), "tag");
			},

			".last able to extract tag from shortest possible selector": function() {
				var selector = Selector();

				assert.equals(selector.last(".a"), ".a");
				assert.equals(selector.last("#a"), "#a");
				assert.equals(selector.last("a"), "a");
			},

			".last able to extract from empty selector": function () {
				var selector = Selector();

				assert.equals(selector.last(""), "");
			},

			"add": function () {
				var selector = Selector();

				selector.add("tag", 1);
				selector.add("tag#id", 2);
				selector.add("tag#id.class1", 3);
				selector.add(".class1", 4);
				selector.add(".class2", 5);
				selector.add("#id", 6);
				selector.add("*", 7);

				console.log(selector.matches($("<tag id='id' class='class1 class2' />").get(0)));

				assert(true);
			}
		});
	});
});
