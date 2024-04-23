
const fs = require("fs");
const path = require("path");

function setConfig(path, arrParam) {
	try {
		if (!fs.existsSync(path)) {
			return;
		}
		var str1 = fs.readFileSync(path, "utf-8");
		var str2 = str1;
		for (var i = 0; i < arrParam.length; ++i) {
			var it = arrParam[i];
			if (!it[1]) {
				continue;
			}
			str2 = str2.replace(it[0], it[1]);
		}
		if (str1 == str2) {
			return;
		}
		// console.info(str2);
		fs.writeFileSync(path, str2);
	} catch (ex) { console.info(ex); }
}

function formatDate(time, fmt) {
	function fill(num, tag) {
		var rst = "" + num;
		if (rst.length > tag.length) {
			return rst;
		}
		rst = tag + rst;
		return rst.substr(rst.length - tag.length);
	}

	var date = new Date(time);
	var arrWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
	var arrWeekCn = ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];
	var arr = [
		[/yyyy/g, fill(date.getFullYear(), "")],
		[/MM/g, fill(date.getMonth() + 1, "00")],
		[/M/g, fill(date.getMonth() + 1, "")],
		[/dd/g, fill(date.getDate(), "00")],
		[/d/g, fill(date.getDate(), "")],
		[/hh/g, fill(date.getHours(), "00")],
		[/h/g, fill(date.getHours(), "")],
		[/mm/g, fill(date.getMinutes(), "00")],
		[/m/g, fill(date.getMinutes(), "")],
		[/ss/g, fill(date.getSeconds(), "00")],
		[/s/g, fill(date.getSeconds(), "")],
		[/qqq/g, fill(date.getMilliseconds(), "000")],
		[/q/g, fill(date.getMilliseconds(), "0")],
		[/ww/g, fill(arrWeek[date.getDay()], "  ")],
		[/wwh/g, fill(arrWeekCn[date.getDay()], "  ")],
	];
	var rst = fmt;
	for (var i = 0; i < arr.length; ++i) {
		rst = rst.replace(arr[i][0], arr[i][1]);
	}
	return rst;
}

async function main(argv) {
	var version = argv[2] || "";
	var publishTime = argv[3] || "";
	var versionCode = argv[4] || "";
	const domainName = "vcedit.com".split(".").reverse().join("/");

	if (publishTime == "NOW_TIME") {
		publishTime = formatDate(new Date().getTime(), "yyyy-MM-dd hh:mm:ss");
	}

	setConfig(`./package.json`, [
		[/("version"\s*:\s*").*(")/g, `$1${version}$2`]
	]);
	setConfig(`./src/model/MainModel.ts`, [
		[/(version\s*=\s*").*(")/g, `$1${version}$2`],
		[/(publishTime\s*=\s*").*(")/g, `$1${publishTime}$2`]
	]);
	var rootName = path.basename(path.resolve("../"));
	setConfig(`../${rootName}ERunner/package.json`, [
		[/("version"\s*:\s*").*(")/g, `$1${version}$2`]
	]);
	var version2 = version.replace(/\./g, ",");
	setConfig(`../${rootName}ERunner/winExe/res.rc`, [
		[/(FILEVERSION\s*).*(,[^,]*)/g, `$1${version2}$2`],
		[/(PRODUCTVERSION\s*).*(,[^,]*)/g, `$1${version2}$2`],
		[/(FileVersion".*").*(\.[^.]*)/g, `$1${version}$2`],
		[/(ProductVersion".*").*(\.[^.]*)/g, `$1${version}$2`],
	]);
	setConfig(`../${rootName}Android/build.gradle`, [
		[/(versionCode\s*:\s*).*(\s*,)/g, `$1${versionCode}$2`],
		[/(versionName\s*:\s*").*(")/g, `$1${version}$2`],
	]);
	setConfig(`../${rootName}Android/app/src/main/java/${domainName}/${rootName}/model/MainModel.java`, [
		[/(version\s*=\s*").*(")/g, `$1${version}$2`],
		[/(publishTime\s*=\s*").*(")/g, `$1${publishTime}$2`]
	]);
}

if (typeof(require) !== "undefined" && typeof(module) !== "undefined" && require.main === module) {
	main(process.argv);
}
