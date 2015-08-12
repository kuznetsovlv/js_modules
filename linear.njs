#!/usr/bin/env node
/*modules: util.njs math.njs*/

"use strict";
var math = require('./math.njs');
var util = require('./util.njs');


var options = {
	errors: {
		eqWrong: 'Wrong equation!'
	}
};
exports.equation = function equation (left, right) {
	if (!left || !right || !left.length || right.length !== left.length)
		throw options.errors.eqWrong;
	var det = math.determinant(left),
	    result = [],
	    length = left[0].length;
	if (!det)
		return undefined;
	for (var i = 0; i < length; ++i) {
		var tmp = util.clone(left);
		for (var j = 0, l = tmp.length; j < l; ++j) {
			tmp[j][i] = right[j];
		}
		result.push(math.determinant(tmp) / det);
	}
	return result;
}
