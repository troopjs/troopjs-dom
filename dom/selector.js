define([ "troopjs-core/object/factory" ], function (Factory) {
	var LENGTH = "length";
	var SLASH = "\\";
	var SPACE = " ";

	return Factory({
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
		}
	});
});