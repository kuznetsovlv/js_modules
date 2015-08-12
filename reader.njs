#!/usr/bin/env node

"use strict"

function Reader (path, encoding) {
	this.fs = require('fs');
	this.fd = this.fs.openSync(path, 'r');
	this.encoding = encoding || 'utf8';
	this.path = path;
}

exports.getReader = function getReader (path, encoding) {return new Reader(path, encoding)};

var proto = Reader.prototype;

proto.nextLine = (function nextLine () {
	var position = 0,
	    length = 1024,
	    p = -1,
	    str,
	    end = false;
	function _line () {
		if (end)
			return undefined;
		var buffer = new Buffer(length),
		    l = this.fs.readSync(this.fd, buffer, 0, length, position);
		str = buffer.toString(this.encoding);
		p = str.search('\n');
		if (p < 0 && l === length) {
			length *= 2;
			return _line();
		}
		position += (++p);
		if (l < length)
			end = true;
		return str.substr(0, p).replace(/\r|\n/g,'');
	}
	return _line;
}());