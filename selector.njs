#!/usr/bin/env node

"use strict"

var countrys = Object.defineProperties({}, {
	/*Data:*/
	4070: {value: 'Finland', writeble: false, enumerable: true, configurable: false},
	/*Methods*/
	getCode: {
		value: function (country) {
			if (typeof country !== 'string')
				return undefined;
			country = country.toLowerCase();
			for (var code in this)
				if (this[code].toLowerCase() === country)
					return code;
			return undefined;
		},
		writeble: false,
		enumerable: false,
		configurable: false
	},
	checkValue: {
		value: function (code, value) {
			return this[code] && code === value;
		},
		writeble: false,
		enumerable: false,
		configurable: false
	}
});
var causes = Object.defineProperties({},{
	/*Data:*/
	all: {
		value: {
			name: "All causes",
			regExps: {
				'07A': /^A000$/,
				'07B': /^B000$/,
				'08A': /^A000$/,
				'08B': /^B000$/,
				'09A': /^B00$/,
				'09B': /^B00$/,
				'101': /^1000$/,
				'104': /^AAA$/
			}
		},
		writeble: false,
		enumerable: true,
		configurable: false
	},
	II: {
		value: {
			name: "Neoplasms",
			regExps: {
				'07A': /^A0(?:(?:4[4-9])|(?:5\d)|(?:60))$/,
				'07B': /^B01[89]$/,
				'08A': /^A0(?:(?:4[5-9])|(?:5\d)|(?:6[01]))$/,
				'08B': /^B0(?:(?:19)|(?:20))$/,
				'09A': /^B(?:(?:0[89])|(?:1[0-7]))\d$/,
				'09B': /^B(?:(?:0[89])|(?:1[0-7]))\d$/,
				'101': /^1026$/,
				'104': /^(?:(?:C\d{2,3})|(?:D(?:(?:[0-3]\d\d?)|(?:4[0-8]\d?))))$/
			}
		},
		writeble: false,
		enumerable: true,
		configurable: false
	},
	VII: {
		value: {
			name: "Disorders of circulatory system",
			regExps: {
				'07A': /^A0(?:79)|(?:8[0-6])$/,
				'07B': /^B02[4-9]$/,
				'08A': /^A08[0-8]$/,
				'08B': /^B0(?:(?:2[5-9])|(?:30))$/,
				'09A': /^B(?:(?:2[5-9])|(?:30))$/,
				'09B': /^B(?:(?:2[5-9])|(?:30))$/,
				'101': /^1064$/,
				'104': /^I\d{2,3}$/
			}
		},
		writeble: false,
		enumerable: true,
		configurable: false
	},
	VII_Ishc: {
		value: {
			name: "Ischaemic heart diseases",
			regExps: {
				'07A': /^A081$/,
				'07B': /^B026$/,
				'08A': /^A083$/,
				'08B': /^B028$/,
				'09A': /^B27$/,
				'09B': /^B27$/,
				'101': /^1067$/,
				'104': /^I2[0-5]\d$/
			}
		},
		writeble: false,
		enumerable: true,
		configurable: false
	},
	/*Methods:*/
	getCode: {
		value: function (name) {
			if (typeof name !== 'string')
				return undefined;
			name = name.toLowerCase();
			for (var code in this)
				if (this[code].name.toLowerCase() === name)
					return code;
			return undefined;
		},
		writeble: false,
		enumerable: false,
		configurable: false
	},
	checkValue: {
		value: function (code, icd, value) {
			var r = this[code];
			if (!r)
				return undefined;
			r = r.regExps[icd];
			if (!r)
				return undefined;
			switch (typeof value) {
				case 'number': value = [value, ''].join(''); 
				case 'string': return r.test(value); break;
				default: return undefined;
			}
		},
		writeble: false,
		enumerable: false,
		configurable: false
	}
});

function Selector (selectors, opts) {
	var del = opts.del || ',',
	    keys = opts.keys,
	    checkers = {
	    	defaultCheck: function () {return true;}
	    };
	if (selectors.country) {
		var code = selectors.country;
		if (!countrys[c])
			code = countrys.getCode(c);
		checkers.country = function (value) {
			return countrys.checkValue(code, value);
		}
	}
	if (selectors.cause) {
		code = selectors.cause;
		if (!causes[code])
			code = causes.getCode(code);
		checkers.cause = function (value, icd) {
			return causes.checkValue(code, icd, value);
		}
	}
	if (selectors.sex) {
		var sexes = ['none', 'male', 'female'],
		    sex = selectors.sex;
		if (typeof sex !== 'number') {
			if (sexes[+sex]) {
				sex = +sex;
			} else {
				sex = sex.toLowerCase();
				for (var s = 0, l = sexes.length; s < l; ++s)
					if (sex === sexes[s]) {
						sex = s;
						break;
					}
			}
		}
		checkers.sex = function (value) {
			return +value === sex;
		}
	}
	if (selectors.year) {
		var year = selectors.year,
		    min = 0, max = 0;
		if (/^\d{4}-\d{4}$/.test(year)) {
			year = year.split('-');
			min = +year[0];
			max = +year[1];
		} else if (/^\d{4}[-+]$/.test(year)) {
			min = + year.slice(0, -1);
			max = Infinity;
		} else {
			min = max = +year;
		}
		checkers.year = function (value) {
			value = +value;
			return value >= min && value <= max;
		}
	}
	if (typeof keys === 'string')
		keys = keys.toLowerCase().split(del);
	else
		for (var i = 0, l = keys.length; i < l; ++i)
			keys[i] = keys[i].toLowerCase();
	this.checkString = function checkString (str) {
		if (typeof str === 'string')
			str = str.split(del);
		function _getValue (key) {
			for (var i = 0, l = keys.length; i < l; ++i)
				if (keys[i] === key)
					return str[i];
			return undefined;
		}
		var icd = _getValue('list');
		for (var key in checkers) {
			if (!checkers[key](_getValue(key), icd))
				return false;
		}
		return true;
	}
}

exports.getSelector = function (selectors, opts) {return new Selector (selectors, opts)};
