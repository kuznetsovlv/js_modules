#!/usr/bin/env node
/*modules: linear.njs util.njs functions.njs math.njs*/

"use strict";

var linear = require('./linear.njs');
var util = require('./util.njs');
var func = require('./functions.njs');
var math = require('./math.njs');

var options = {
	current: {},
	defaults: {
		accuracy: {
			A: 0.0001,
			R: 0.001,
			B: 0.00001,
			C: 0.001,
			sigma: 100
		}
	}
};

function J (params, ageRate) {
	var r = params.R,
	    a = params.A,
	    b = params.B || 0,
	    c = params.C || 0;
	var j11, j12, j13, j14, j22, j23, j24, j33, j34, i, length = ageRate.length;
	j11 = j12 = j13 = j14 = j22 = j23 = j24 = j33 = j34 = 0;
	for (i = 0; i < length; ++i) {
		var p = ageRate[i],
		    x2 = p.x * p.x,
		    e = Math.exp(a * p.x + b * x2),
		    e2 = e * e,
		    dc = c - p.y,
		    diff = p.x * (2 * r * e2 + dc * e);
		j11 += e2;
		j12 += diff;
		j13 += p.x * diff;
		j14 += e;
		j23 += x2 * diff;
		j24 += p.x * e;
		j33 += x2 * p.x * diff;
		j34 += x2 * e;
	}
	j23 *= r;
	j24 *= r;
	j33 *= r;
	j34 *= r;
	var result = [
		[j11, j12],
		[j12, j13 * r]
	],
	n = i;
	if ('B' in params) {
		result[0].push(j13);
		result[1].push(j23);
		result.push([j13, j23, j33]);
	}
	if ('C' in params) {
		var last = [],
		    length = result.length;
		result[0].push(j14);
		result[1].push(j24);
		if (length === 3)
				result[2].push(j34);
		for (var i = 0; i < length; ++i) {
			last.push(util.getLast(result[i]));
		}
		last.push(n);
		result.push(last);
	}
	return result;
}

function f (params, ageRate) {
	var r = params.R,
	    a = params.A,
	    b = params.B || 0,
	    c = params.C || 0;
	var f1, f2, f3, f4;
	f1 = f2 = f3 = f4 = 0;
	for (var i = 0, length = ageRate.length; i < length; ++i) {
		var p = ageRate[i],
		    x2 = p.x * p.x,
		    e = Math.exp(a * p.x + b * x2),
		    dc = c - p.y,
		    df = r * e + dc,
		    diff = df * e;
		f1 += diff;
		f2 += p.x * diff;
		f3 += x2 * diff;
		f4 += df;
	}
	f2 *= r;
	f3 *= r;
	var result = [-f1, -f2];
	if ('B' in params)
		result.push(-f3);
	if ('C' in params)
		result.push(-f4);
	return result;
}

function arrToDelta (arr, x) {
	var delta = {
		R: arr[0],
		A: arr[1]
	}
	if ('B' in x)
		delta.B = arr[2];
	if ('C' in x)
		delta.C = util.getLast(arr);
	return delta;
}

function isStop (sigma, delta) {
	var accuracy = options.current.accuracy;
	if (sigma <= accuracy.sigma)
		return true;
	for (var key in delta)
		if (delta[key] > accuracy[key])
			return false;
	return true;
}

exports.approximate = function approximate (ageRates, x, accuracy) {
	if (!x || !ageRates)
		return undefined;
	if (!options.current.accuracy)
		options.current.accuracy = accuracy || options.defaults.accuracy;
	if (!options.current.accuracy.sigma)
		options.current.accuracy.sigma = options.defaults.accuracy.sigma;
	try {
		var delta = arrToDelta(linear.equation(J(x , ageRates), f(x, ageRates)), x);
	} catch (e) {
		delete options.current.accuracy;
		return undefined;
	}
	x.R += delta.R;
	x.A += delta.A;
	if ('B' in x)
		x.B += delta.B;
	if ('C' in x) {
		x.C += delta.C;
		if (x.C < 0)
			delete x.C;
	}
	x.sigma = math.sigma(ageRates, func.hompertzExt(x));
	if (isStop(x.sigma, delta)) {
		delete options.current.accuracy;
		return x;
	} else {
		return approximate (ageRates, x);
	}
};
