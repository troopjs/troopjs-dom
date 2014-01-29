define([ "module", "./constants", "troopjs-utils/merge", "jquery" ], function (module, CONSTANTS, merge, $) {
	var config = {};

	config[CONSTANTS["querySelectorAll"]] = $.find;

	config[CONSTANTS["matchesSelector"]] = $.find.matchesSelector;

	return merge.call(config, module.config());
});