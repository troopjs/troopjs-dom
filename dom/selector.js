define([ "troopjs-core/object/factory", "./constants", "./config" ], function (Factory, CONSTANTS, CONFIG) {
	var UNDEFINED;
	var LENGTH = "length";
	var INDEXES = "indexes";
	var INDEXED = "indexed";
	var INDEXER = "indexer";
	var SLASH = "\\";
	var SPACE = " ";
	var CLASS = "class";
	var ID = "id";
	var TAG = "tag";
	var UNIVERSAL = "universal";
	var RE_SPACE = /\s+/;
	var querySelectorAll = CONFIG[CONSTANTS["querySelectorAll"]];
	var matchesSelector = CONFIG[CONSTANTS["matchesSelector"]];

	/**
	 * Extracts key for universal indexer
	 * @private
	 * @return {String[]}
	 */
	function getElementUniversal() {
		return [ "*" ];
	}

	/**
	 * Extracts key for tag indexer
	 * @private
	 * @param element
	 * @return {String[]}
	 */
	function getElementTagName(element) {
		return [ element.nodeName.toUpperCase() ];
	}

	/**
	 * Extracts key for class indexer
	 * @private
	 * @param element
	 * @return {String[]}
	 */
	function getElementClassNames(element) {
		var className;
		var result;

		// Do we have a `className` property
		if ((className = element.className) !== UNDEFINED) {
			// DOM `className`
			if (typeof className === "string") {
				result = className.split(RE_SPACE);
			}
			// SVG `className`
			else if (className instanceof SVGAnimatedString) {
				result = className.baseVal.split(RE_SPACE);
			}
		}

		return result;
	}

	/**
	 * Extracts key for id indexer
	 * @private
	 * @param element
	 * @return {String[]}
	 */
	function getElementId(element) {
		var id;

		return (id = element.id) !== UNDEFINED && [ id ];
	}

	return Factory(function Selector() {
		this[INDEXES] = [];
	}, {
		/**
		 * Gets last token from selector
		 * @param {String} selector CSS selector
		 * @return {String} last token
		 */
		"last": function last(selector) {
			var index = selector[LENGTH];
			var stop = index;
			var char = selector[--index];
			var skip = false;

			step: while (index > 0) {
				switch (char) {
					case SPACE:
						/* Marks EOT if:
						 * * Next char is not SLASH
						 * * Not in skip mode
						 */
						if ((char = selector[--index]) !== SLASH && !skip) {
							// We're 2 steps passed the end of the selector so we should adjust for that
							index += 2;

							// Break the outer while
							break step;
						}
						break;

					case "]":
						/* Marks begin of skip if:
						 * * Next char is not SLASH
						 */
						skip = (char = selector[--index]) !== SLASH;
						break;

					case "[":
						/* Marks end of skip if:
						 * * Next char is not SLASH
						 */
						if (!(skip = (char = selector[--index]) === SLASH)) {
							// Compensate for index already decreased
							stop = index + 1;
						}
						break;

					case "#":
					case ".":
						/* Marks stop if:
						 * * Next char is not SLASH
						 * * Next char is not SPACE
						 * * Not in skip mode
						 */
						if ((char = selector[--index]) !== SLASH && char !== SPACE && !skip) {
							// Compensate for index already decreased
							stop = index + 1;
						}
						break;

					default:
						// Store next char
						char = selector[--index];
						break;
				}
			}

			return selector.substring(index, stop);
		},

		/**
		 * Adds candidate
		 * @param {String} selector CSS selector
		 * @param {...*} [args] Additional arguments attached with candidate
		 * @return {Object} this
		 */
		"add": function add(selector, args) {
			var me = this;
			var indexes = me[INDEXES];
			var indexed;
			var indexer;
			var index;
			var name;
			var key;
			var last = me.last(selector);

			switch (last[0]) {
				case "#":
					name = ID;
					key = last.substring(1);
					indexer = getElementId;
					break;

				case ".":
					name = CLASS;
					key = last.substring(1);
					indexer = getElementClassNames;
					break;

				case "*":
					name = UNIVERSAL;
					key = "*";
					indexer = getElementUniversal;
					break;

				default:
					name = TAG;
					key = last.toUpperCase();
					indexer = getElementTagName;
					break;
			}

			if ((index = indexes[name]) === UNDEFINED) {
				index = indexes[name] = indexes[indexes[LENGTH]] = {};
				index[INDEXER] = indexer;
				indexed = index[INDEXED] = {};
			}
			else {
				indexed = index[INDEXED];
			}

			if (key in indexed) {
				indexed[key].push(arguments);
			}
			else {
				indexed[key] = [ arguments ];
			}

			return me;
		},

		/**
		 * Matches candidates against element
		 * @param element DOM Element
		 * @return {Array} Matching array of candidates
		 */
		"matches": function (element) {
			var me = this;
			var indexer;
			var indexed;
			var indexes = me[INDEXES];
			var index;
			var indexCount = indexes[LENGTH];
			var keys;
			var keysCount;
			var candidates;
			var candidate;
			var candidateCount;
			var result = [];
			var resultCount = 0;

			if (!element) {
				return result;
			}

			while (indexCount--) {
				index = indexes[indexCount];
				indexer = index[INDEXER];
				indexed = index[INDEXED];

				keys = indexer(element);
				keysCount = keys[LENGTH];

				while (keysCount--) {

					if ((candidates = indexed[keys[keysCount]]) !== UNDEFINED) {
						candidateCount = candidates[LENGTH];

						while (candidateCount--) {
							candidate = candidates[candidateCount];

							if (matchesSelector(element, candidate[0])) {
								result[resultCount++] = candidate;
							}
						}
					}
				}
			}

			return result;
		}
	});
});