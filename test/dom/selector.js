/*globals buster:false*/
buster.testCase("troopjs-browser/dom/selector", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	require([ "troopjs-browser/dom/selector", "jquery" ], function (Selector, $) {
		var tail = Selector.tail;

		run({
			"tail": {
				"able to extract tag/id/class": function () {
					assert.equals(tail(".class"), ".class");
					assert.equals(tail("#id"), "#id");
					assert.equals(tail("tag"), "tag");
				},

				"able to extract tag/id/class with stacking": function() {
					assert.equals(tail("tag #id .class"), ".class");
					assert.equals(tail("tag #id.class"), "#id");
					assert.equals(tail("tag#id.class"), "tag");
				},

				"able to extract tag/id/class with attributes": function() {
					assert.equals(tail(".class[attr = '#123']"), ".class");
					assert.equals(tail("#id[attr = '#123']"), "#id");
					assert.equals(tail("tag[attr = '#123']"), "tag");
				},

				"able to extract tag/id/class with attributes and stacking": function() {
					assert.equals(tail("tag #id .class[attr = '#123']"), ".class");
					assert.equals(tail("tag #id.class[attr = '#123']"), "#id");
					assert.equals(tail("tag#id.class[attr = '#123']"), "tag");
				},

				"able to extract tag/id/class with attributes, stacking and escaped chars": function() {
					assert.equals(tail("tag #id .class[attr = '\\[#123\\]'"), ".class");
					assert.equals(tail("tag #id.class[attr = '\\[#123\\]']"), "#id");
					assert.equals(tail("tag#id.class[attr = '\\[#123\\]']"), "tag");
				},

				"able to extract tag from shortest possible selector": function() {
					assert.equals(tail(".a"), ".a");
					assert.equals(tail("#a"), "#a");
					assert.equals(tail("a"), "a");
				},

				"able to extract from empty selector": function () {
					assert.equals(tail(""), "");
				}
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
