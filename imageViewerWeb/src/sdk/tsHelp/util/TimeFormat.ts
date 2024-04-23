
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

export default class TimeFormat {
	static format(time: number | Date, strFormat: string) {
		function fill(num: number | string, tag: string) {
			var rst = "" + num;
			if (rst.length > tag.length) {
				return rst;
			}
			rst = tag + rst;
			return rst.substr(rst.length - tag.length);
		}

		var date = typeof(time) == "number" ? new Date(time) : time;
		var arrWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
		var arrWeekCn = ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];
		var arr: [RegExp, string][] = [
			[/yyyy/g, fill(date.getFullYear(), "")],
			[/MM/g, fill(date.getMonth() + 1, "00")],
			[/M/g, fill(date.getMonth() + 1, "")],
			// [/DD/g, fill(date.getDate(), "00")],
			// [/D/g, fill(date.getDate(), "")],
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
			[/ww/g, fill(arrWeek[date.getDay()], "")],
			[/wwh/g, fill(arrWeekCn[date.getDay()], "")],
		];
		var rst = strFormat;
		for (var i = 0; i < arr.length; ++i) {
			rst = rst.replace(arr[i][0], arr[i][1]);
		}
		return rst;
	}
}
