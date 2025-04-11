/**
 * A simple loader that returns an empty module for node: protocol imports
 * This prevents errors when node: imports appear in code that gets bundled for the browser
 */
module.exports = function nodeLoader() {
  // Return an empty module
  return 'module.exports = {};';
};

module.exports.raw = false; 