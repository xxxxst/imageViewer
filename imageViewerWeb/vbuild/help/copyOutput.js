
const fs = require("fs");
const clear = require("./clear");
const cp = require("./cp");

var src = "./dist/web/";
var dst = process.argv[2];

(function () {
	if (!fs.existsSync(src)) {
		return;
	}
	try {
		fs.mkdirSync(dst);
	} catch (ex) { }
	if (!fs.existsSync(dst)) {
		return;
	}
	clear(dst);
	cp(src, dst);
})();
