
// build library

const fs = require("fs");
const Path = require("path");
const clear = require("./help/clear");
const cp = require("./help/cp");

async function main(argv) {
	// console.info(argv);
	var strLibPath = "./src/entryLib/";
	var strOutPath = "./dist/web/";
	var strServerOutPath = "./dist/server/";
	clear(strServerOutPath);
	if (!fs.existsSync(strLibPath)) {
		return;
	}
	var mapCopyFile = {};
	// var arrJsFile = [];
	fs.readdirSync(strLibPath).forEach(function (path) {
		var name = path.replace(/\.+[^.]*$/, "");
		var outHtmlPath = strOutPath + name + ".html";
		if (!fs.existsSync(outHtmlPath)) {
			return;
		}

		var str = fs.readFileSync(outHtmlPath, "utf-8");
		// remove tag <head>...</head>
		str = str.replace(/.*\<\/head\>/, "");
		// match src <script src="..." >
		var regJsUrl = /src="([^"]+)"/g;
		var mat = str.match(regJsUrl);
		if (!mat) {
			return;
		}
		var arrJsFile = mat.map(function (str) {
			return str.replace(regJsUrl, "$1");
		});
		// check js file exist
		for (var i = 0; i < arrJsFile.length; ++i) {
			if (!fs.existsSync(strOutPath + arrJsFile[i])) {
				return;
			}
		}
		for (var i = 0; i < arrJsFile.length; ++i) {
			var str2 = arrJsFile[i];
			if (str2 in mapCopyFile) {
				continue;
			}
			mapCopyFile[str2] = 1;

			var srcPath = strOutPath + str2;
			var dstPath = strServerOutPath + str2;
			cp(srcPath, dstPath);
		}
		const endl = "\r\n";
		var strEntry = "" + endl;
		strEntry += "window = this.window || this.globalThis || {};" + endl + endl;
		for (var i = 0; i < arrJsFile.length; ++i) {
			var str2 = arrJsFile[i];
			var strExt = Path.extname(str2).toLocaleLowerCase();
			if (strExt == ".js") {
				str2 = str2.substr(0, str2.length - strExt.length);
			}
			// var strName = Path.basename(str2);
			// console.info(strExt, strName);
			str2 = "./" + str2;
			strEntry += 'require("' + str2 + '");' + endl;
		}
		fs.writeFileSync(strServerOutPath + name + ".js", strEntry);
		fs.unlinkSync(outHtmlPath);
		// console.info(arrJsFile);
		// console.info(arr);
	});
	// fs.existsSync("./dist/"
}

if (typeof (require) !== "undefined" && typeof (module) !== "undefined" && require.main === module) {
	main(process.argv);
}
