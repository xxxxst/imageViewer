
const fs = require("fs");
const Path = require("path");
const { execSync, spawn, spawnSync } = require('child_process');

function getSuffix(path) {
	if (path.indexOf(".") < 0) {
		return "";
	}
	return path.replace(/.*\./, ".");
}

function compress(srcPath, dstPath, quality, createTime) {
	srcPath = srcPath.replace(/[\\/]+/, "/").replace(/\/+$/, "").trim();
	dstPath = dstPath.replace(/[\\/]+/, "/").replace(/\/+$/, "").trim();
	if (!dstPath) {
		dstPath = srcPath;
	}
	try {
		if (!fs.existsSync(srcPath)) {
			return;
		}

		var arr = [];
		var st = fs.statSync(srcPath);
		if (st.isDirectory()) {
			arr = fs.readdirSync(srcPath);
		} else {
			var name = Path.basename(srcPath);
			arr.push(name);
			srcPath = Path.dirname(srcPath);
			dstPath = Path.dirname(dstPath);
		}

		// var arr = fs.readdirSync(dstDir);
		for (var i = 0; i < arr.length; ++i) {
			var name = arr[i];
			var srcSubPath = srcPath + "/" + name;
			var dstSubPath = dstPath + "/" + name;
			
			if (!fs.existsSync(srcSubPath)) {
				continue;
			}

			// directory
			var st = fs.statSync(srcSubPath);
			if (st.isDirectory()) {
				try {
					if (!fs.existsSync(dstSubPath)) {
						fs.mkdirSync(dstSubPath);
					}
					compress(srcSubPath, dstSubPath, quality, createTime);
				} catch (ex) { }
				continue;
			}

			var suffix = getSuffix(name).toLocaleLowerCase();
			if (suffix != ".png") {
				continue;
			}
			
			if (createTime > 0 && st.mtimeMs < createTime && fs.existsSync(dstSubPath)) {
				continue;
			}
			// console.info(name, st.mtimeMs, createTime);
			// return;
			// if (!fs.existsSync(srcSubPath)) {
			// 	continue;
			// }

			var strCmd = `pngquant -f --quality=${quality} -o "${dstSubPath}" "${srcSubPath}"`;
			var buf = execSync(strCmd);
			if (buf.byteLength > 0) {
				console.info(buf.toString());
			}
		}
	} catch (ex) { }
}

// function xcopy(src, dst) {
// 	src = src.replace(/[/]+/g, "\\");
// 	dst = dst.replace(/[/]+/g, "\\");
// 	var strCmd = `xcopy /y /q "${src}" "${dst}"`;
// 	var buf = execSync(`${strCmd}`);
// 	// if (buf.byteLength > 0) {
// 	// 	console.info(buf.toString());
// 	// }
// }

// function updateImage(srcDir, dstDir) {
// 	srcDir = srcDir.replace(/[\\/]+/, "/").replace(/\/+$/, "").trim();
// 	dstDir = dstDir.replace(/[\\/]+/, "/").replace(/\/+$/, "").trim();
// 	try {
// 		var arr = fs.readdirSync(dstDir);
// 		for (var i = 0; i < arr.length; ++i) {
// 			var name = arr[i];
// 			var suffix = getSuffix(name).toLocaleLowerCase();
// 			if (suffix != ".png") {
// 				continue;
// 			}
// 			var srcPath = srcDir + "/" + name;
// 			var dstPath = dstDir + "/" + name;
// 			if (!fs.existsSync(srcPath) || !fs.existsSync(dstPath)) {
// 				continue;
// 			}
// 			var stSrc = fs.statSync(srcPath);
// 			var stDst = fs.statSync(dstPath);
// 			if (stSrc.isDirectory() || stDst.isDirectory()) {
// 				continue;
// 			}
// 			if (Math.abs(stSrc.mtimeMs - stDst.mtimeMs) <= 0.000001) {
// 				continue;
// 			}
// 			// console.info(name, stSrc.mtimeMs, stDst.mtimeMs);
// 			// console.info(srcPath, dstDir);
// 			xcopy(srcPath, dstDir + "/");
// 		}
// 	} catch (ex) { console.info(111, ex); }
// }

function getLastConfig() {
	var rst = { createTime: 0, quality: 0 };
	try {
		var strText = fs.readFileSync("./pngCompress.log", "utf-8");
		var arr = strText.replace(/[\r\n]+/g, "\n").split("\n");
		for (var i = 0; i < arr.length; ++i) {
			var str = arr[i].trim();
			if (!str) {
				continue;
			}
			var idx = str.indexOf("=");
			if (idx < 0) {
				continue;
			}
			var key = str.substr(0, idx).trim();
			var val = str.substr(idx + 1).trim();
			if (!(key in rst)) {
				continue;
			}
			var ival = parseFloat(val);
			if (isNaN(ival)) {
				rst[key] = val;
				// return 0;
			} else {
				rst[key] = ival;
			}
		}
		return rst;
	} catch (ex) { }
	return rst;
}

function saveConfig(quality) {
	try {
		var time = new Date().getTime();
		var strLog = `createTime=${time}\r\nquality=${quality}`;
		fs.writeFileSync("./pngCompress.log", strLog);
	} catch (ex) { }
}

async function main(argv) {
	var quality = 85;
	var scale = argv[2];

	// var rootName = path.basename(path.resolve("../"));
	var cfg = getLastConfig();
	var time = cfg.createTime;
	if (cfg.quality != quality) {
		time = 0;
	}

	var dir = `./resource/data/`;
	var arr = fs.readdirSync(dir);
	for (var i = 0; i < arr.length; ++i) {
		var name = arr[i];
		if (name.indexOf("Compress") >= 0) {
			continue;
		}
		var srcDir = dir + name;
		var st = fs.statSync(srcDir);
		if (!st.isDirectory() || st.isSymbolicLink()) {
			continue;
		}
		var dstDir = dir + name + "Compress";
		if (!fs.existsSync(dstDir)) {
			fs.mkdirSync(dstDir);
		}
		compress(srcDir, dstDir, quality, time);
	}
	// compress(dir, dir, 85, time);
	saveConfig(quality);

	// updateImage(`${dir}render${scale}Compress/`, "./public/static/image/");
	// updateImage(`${dir}render${scale}Compress/`, "./src/assets/img/");
}

if (typeof(require) !== "undefined" && typeof(module) !== "undefined" && require.main === module) {
	main(process.argv);
}

module.exports = {
	compress
};
