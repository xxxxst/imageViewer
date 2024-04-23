
const fs = require("fs");

function makeReg(str) {
	if (!str) {
		return str;
	}
	try {
		var strReg = str;
		strReg = strReg.replace(/\\/g, "\\\\");
		strReg = strReg.replace(/\[/g, "\\[");
		strReg = strReg.replace(/\]/g, "\\]");
		strReg = strReg.replace(/\{/g, "\\{");
		strReg = strReg.replace(/\}/g, "\\}");
		strReg = strReg.replace(/\^/g, "\\]");
		strReg = strReg.replace(/\$/g, "\\$");
		strReg = strReg.replace(/\./g, "\\.");
		strReg = strReg.replace(/\*/g, ".*");

		return new RegExp(`^${strReg}$`);
	} catch (ex) { }
	return str;
}

function makeMap(arr) {
	var map = {};
	arr.forEach((val) => { val && (map[val] = 1); });
	return map;
}

function makeAutoIcoScss() {
	var endl = "\r\n";
	var mapSupportSuffix = makeMap(["png", "jpg", "bmp", "ico"]);

	var assestDir = "./src/assets/";
	var dstDir = assestDir + "css/";
	var dst = dstDir + "icoAuto.scss";
	var dir = assestDir + "img/";

	if (!fs.existsSync(dir)) {
		return;
	}

	if (!fs.existsSync(dstDir)) {
		return;
	}

	var strIgnore = process.env.IGNORE_FILE || "";
	var arrIgnre = strIgnore.split(/[ ,\t，;；]+/).map((val) => makeReg(val));

	// animation-timing-function: steps($w / $h - 1) !important;
	// animation-timing-function: steps($h / $w - 1) !important;
	var strRst = `
// This file is automatically generated by the program, please do not modify it

@mixin ico($name) {
	background: url("~@img/" + $name) no-repeat 0 0/100% 100%;
}

@mixin icoAni($name, $w, $h) {
	@if $w > $h {
		background: url("~@img/" + $name) no-repeat 0 0; background-size: ($w / $h * 100%) 100%;
	} @else {
		background: url("~@img/" + $name) no-repeat 0 0/100% ($h / $w * 100%);
	}
}

%css%`;

	var strCss = "";

	function setAni(name, path, width, height) {
		strCss += `.ico-${name} { @include icoAni("${path}", ${width}, ${height}); }` + endl;
	}

	function setDef(name, path) {
		strCss += `.ico-${name} { @include ico("${path}"); }` + endl;
	}

	fs.readdirSync(dir).forEach((path) => {
		var suffix = path.replace(/.*\./, "");
		if (!(suffix in mapSupportSuffix)) {
			return;
		}
		// check ignore file
		for (var i = 0; i < arrIgnre.length; ++i) {
			var reg = arrIgnre[i];
			switch (typeof (reg)) {
				case "string": {
					if (path == reg) {
						return;
					}
					break;
				}
				case "object": {
					if (reg.test(path)) {
						return;
					}
				}
			}
		}
		var name = path.replace(/\.[^.]*$/, "");
		if (suffix == "png" && path.indexOf("Ani." + suffix) >= 0) {
			// animate
			try {
				var fd = fs.openSync(dir + path);
				var buf = new Uint8Array(8);

				// haed
				fs.readSync(fd, buf, 0, 8, 0);
				var dv = new DataView(buf.buffer);
				var head = dv.getUint32(0, false);
				if (head != 0x89504e47) {
					setDef(name, path);
				} else {
					// width, height
					fs.readSync(fd, buf, 0, 8, 0x10);
					var dv = new DataView(buf.buffer);
					var width = dv.getUint32(0, false);
					var height = dv.getUint32(4, false);
					setAni(name, path, width, height);
				}

				fs.closeSync(fd);
			} catch (ex) { }
		} else {
			setDef(name, path);
		}
	});
	strRst = strRst.replace(/\%css\%/g, strCss);
	strRst = strRst.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");

	fs.writeFileSync(dst, strRst);
}

function main() {
	try {
		makeAutoIcoScss();
	} catch (ex) { }
}

if (typeof(require) !== "undefined" && typeof(module) !== "undefined" && require.main === module) {
	main();
}
