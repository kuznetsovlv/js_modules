#!/usr/bin/env node
/*modules: math.njs*/

"use strict";

var math = require('./math.njs');

exports.hompertzExt = function hompertzExt (obj) {
	var A = obj.A || 0,
	    B = obj.B || 0,
	    C = obj.C || 0,
	    R = obj.R || 0;
	
	return function (x) {return C + R * Math.exp(x * (A + B * x));};
}
