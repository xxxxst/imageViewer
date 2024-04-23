
const fs = require("fs");
const { execSync, spawn, spawnSync } = require('child_process');
const pngCompress = require("./pngCompress");

function copyFile(src, dst) {
	if (!fs.existsSync(src)) {
		return;
	}

	if (fs.existsSync(dst)) {
		var st1 = fs.statSync(src);
		var st2 = fs.statSync(dst);
		if (st1.mtimeMs <= st2.mtimeMs) {
			return;
		}
	}

	fs.copyFileSync(src, dst);
}

function setConfig(path, scale) {
	var str1 = fs.readFileSync(path, "utf-8");
	var str2 = str1.replace(/(src\s*=[^\d]+)\d+/, `$1${scale}`);
	if (str1 == str2) {
		return;
	}
	fs.writeFileSync(path, str2);
}

function getSuffix(path) {
	if (path.indexOf(".") < 0) {
		return "";
	}
	return path.replace(/.*\./, ".");
}

function xcopy(src, dst) {
	src = src.replace(/[/]+/g, "\\");
	dst = dst.replace(/[/]+/g, "\\");
	var strCmd = `xcopy /y /q "${src}" "${dst}"`;
	var buf = execSync(`${strCmd}`);
	// if (buf.byteLength > 0) {
	// 	console.info(buf.toString());
	// }
}

function updateImage(srcDir, dstDir) {
	srcDir = srcDir.replace(/[\\/]+/, "/").replace(/\/+$/, "").trim();
	dstDir = dstDir.replace(/[\\/]+/, "/").replace(/\/+$/, "").trim();
	try {
		var arr = fs.readdirSync(dstDir);
		for (var i = 0; i < arr.length; ++i) {
			var name = arr[i];
			var suffix = getSuffix(name).toLocaleLowerCase();
			if (suffix != ".png") {
				continue;
			}
			var srcPath = srcDir + "/" + name;
			var dstPath = dstDir + "/" + name;
			if (!fs.existsSync(srcPath) || !fs.existsSync(dstPath)) {
				continue;
			}
			var stSrc = fs.statSync(srcPath);
			var stDst = fs.statSync(dstPath);
			if (stSrc.isDirectory() || stDst.isDirectory()) {
				continue;
			}
			if (Math.abs(stSrc.mtimeMs - stDst.mtimeMs) <= 0.000001) {
				continue;
			}
			// console.info(name, stSrc.mtimeMs, stDst.mtimeMs);
			// console.info(srcPath, dstDir);
			xcopy(srcPath, dstDir + "/");
		}
	} catch (ex) { console.info(111, ex); }
}

async function main(argv) {
	var scale = argv[2];

	var dir = argv[1];
	dir = dir.replace(/[\\/]+/g, "/").replace(/\/[^/]*$/g, "/");
	dir = dir + "../../";
	
	var aniConfigPath = `${dir}resource/data/animate.txt`;
	if (fs.existsSync(aniConfigPath)) {
		setConfig(aniConfigPath, scale);
		var exe2 = `${dir}../../mergeImage/mergeImageNode/dist/mergeAni.bat`;
		var buf = execSync(`${exe2} "${aniConfigPath}`);
		// var buf = execSync(`${exe2} "v" "${dir}resource/data/render${scale}/$f_*.png" "${dir}public/static/image/"`);
		if (buf.byteLength > 0) {
			console.info(buf.toString());
		}
	}

	var configPath = `${dir}resource/data/image.txt`;
	if (fs.existsSync(configPath)) {
		setConfig(configPath, scale);

		var exe1 = `${dir}../../mergeImage/mergeImageNode/dist/mergeImage.bat`;
		var buf = execSync(`"${exe1}" "${configPath}"`);
		if (buf.byteLength > 0) {
			console.info(buf.toString());
		}
	}

	// copyFile(`${dir}resource/data/render1/title.png`, `${dir}public/static/image/title.png`);
	
	var dir = `./resource/data/`;
	updateImage(`${dir}render${scale}Compress/`, "./public/static/image/");
	updateImage(`${dir}render${scale}Compress/`, "./src/assets/img/");
	
	// compress merge png
	var quality = 85;

	pngCompress.compress("./public/static/image/image.png", "", quality, 0);

	var aniDir = `${dir}resource/data/render${scale}Compress/`;
	if (fs.existsSync(aniDir)) {
		var arr = fs.readdirSync(aniDir);
		for (var i = 0; i < arr.length; ++i) {
			var name = arr[i];
			var aniSubDir = aniDir + name;
			var st = fs.statSync(aniSubDir);
			if (!st.isDirectory()) {
				continue;
			}
			var aniPath = `./public/static/image/${name}.png`;
			if (!fs.existsSync(aniPath)) {
				continue;
			}
			pngCompress.compress(aniPath, "", quality, 0);
		}
	}
}

if (typeof(require) !== "undefined" && typeof(module) !== "undefined" && require.main === module) {
	main(process.argv);
}
