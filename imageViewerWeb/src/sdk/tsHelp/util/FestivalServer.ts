
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import TimeFormat from '@/sdk/tsHelp/util/TimeFormat';
import { ChineseDate } from './ChineseCalendar';

export enum FestivalLeapType {
	leapFirst = 0,		// 闰月优先
	leapDelay = 1,		// 非闰月优先
	leapAll = 2,		// 都是节日
}

export enum FestivalType {
	date = 1,			// 阳历节日
	dateWeek = 2,		// 阳历某月第几个星期几，星期从周日(0)开始
	cdate = 3,			// 农历节日
	cdateLastDay = 4,	// 农历某月最后一天
	qingMing = 5,		// 清明节
	dateLastDay = 6,	// 阳历某月最后一天
}

// 节日
export class FestivalMd {
	id = 0;
	type = FestivalType.date;
	desc = "";
	detail = "";
	month = 1;		// 从1开始
	day = 1;
	num = 1;		// 阳历某月第几个星期几
	week = 0;		// 阳历某月第几个星期几
	leapType = FestivalLeapType.leapFirst;	// 农历闰月优先，0：闰月优先，1：非闰月优先，2：都是节日
}

interface IEventMd {
	cb: Function;
	target: any;
}

export default class FestivalServer {
	public static ins = new FestivalServer();
	// type, desc, param1, param2, param3
	// type=1, desc, month, day			阳历节日
	// type=2, desc, month, num, week	阳历某月第几个星期几，星期从周日(0)开始
	// type=3, desc, month, day			农历节日
	// type=4, desc, month				农历某月最后一天
	// type=5, desc						清明节
	// type=6, desc						阳历某月最后一天
	private arrDefineFestival = [
		[1, "元旦", 1, 1],
		[1, "情人节", 2, 14],
		[1, "妇女节", 3, 8],
		[1, "植树节", 3, 12],
		[1, "愚人节", 4, 1],
		[1, "劳动节", 5, 1],
		[2, "母亲节", 5, 2, 0],		// 2
		[1, "儿童节", 6, 1],
		[2, "父亲节", 6, 3, 0],		// 2
		[1, "建军节", 8, 1],
		[1, "青年节", 8, 12],
		[1, "教师节", 9, 10],
		[1, "国庆节", 10, 1],
		[1, "万圣节", 11, 1],
		[2, "感恩节", 11, 4, 4],	// 2
		[1, "平安夜", 12, 24],
		[1, "圣诞节", 12, 25],

		[4, "除夕", 12],			// 4
		[3, "春节", 1, 1],
		[3, "元宵节", 1, 15],
		[5, "清明节"],				// 5
		[3, "端午节", 5, 5],
		[3, "七夕节", 7, 7],
		[3, "中秋节", 8, 15],
		[3, "重阳节", 9, 9],
	];

	arrDefFestival: FestivalMd[] = [];
	arrCustomFestival: FestivalMd[] = [];

	private mapFestival1: Record<string, FestivalMd> = {};
	private arrFestival2: FestivalMd[] = [];
	private mapFestival3: Record<string, FestivalMd> = {};
	private mapFestival4: Record<string, FestivalMd> = {};
	private datFestival5 = new FestivalMd();
	private mapFestival6: Record<string, FestivalMd> = {};

	isInit = false;

	mapEvent: Record<string, IEventMd[]> = {};

	// qingMingData = [];

	init(_arrCustomFestival: FestivalMd[] = null) {
		if (this.isInit) {
			return;
		}

		this.strQingMin = this.strQingMin.replace(/[\r\n,]/g, "");
		if (_arrCustomFestival) {
			this.arrCustomFestival = _arrCustomFestival;
		}

		this.convertDefFestival();
		this.updateFestival();

		this.isInit = true;

		// for (var i = 0; i < this.arrDefFestivalDefine.length; ++i) {
		// 	var it = this.arrDefFestivalDefine[i];
		// 	switch (it[0]) {
		// 		case 1: {
		// 			this.mapFestival1[it[2] + "_" + it[3]] = it;
		// 			break;
		// 		}
		// 		case 2: {
		// 			this.arrFestival2.push(it);
		// 			break;
		// 		}
		// 		case 3: {
		// 			this.mapFestival3[it[2] + "_" + it[3]] = it;
		// 			break;
		// 		}
		// 		case 4: {
		// 			this.mapFestival4[it[2]] = it;
		// 			break;
		// 		}
		// 		case 5: {
		// 			this.datFestival5 = it;
		// 			break;
		// 		}
		// 	}
		// }
	}

	private checkLeap(md: FestivalMd, cdate: ChineseDate) {
		return (md.leapType == FestivalLeapType.leapAll
			|| (md.leapType == FestivalLeapType.leapFirst && !cdate.hasLeap)
			|| (md.leapType == FestivalLeapType.leapDelay && !cdate.isLeap)
		);
	}
	
	getFestivalMd(year: number, month: number, day: number, cdate?: ChineseDate) {
		this.init();
		// var cdate = ChineseDate.fromDateTime(year, month, day);

		if (!cdate) {
			cdate = ChineseDate.fromDateTime(year, month, day);
		}

		// if (cdate) {
		// 	console.info(cdate.hasLeap);
		// }

		if (cdate) {
			// 农历节日
			var viewMonth = cdate.month + 1;
			var key = viewMonth + "_" + cdate.day;
			if (key in this.mapFestival3) {
				var md = this.mapFestival3[key];
				// console.info("aaa", month, day, cdate, this.checkLeap(md, cdate), this.mapFestival3);
				if (this.checkLeap(md, cdate)) {
					return md;
				}
			}

			// 农历某月最后一天
			if (cdate.day == (29 + (cdate.isLongMonth ? 1 : 0))) {
				if (viewMonth in this.mapFestival4) {
					var md = this.mapFestival4[viewMonth];
					if (this.checkLeap(md, cdate)) {
						return md;
					}
				}
			}
		}
		
		// 清明节
		if (month == 3) {
			var no = this.getQingMingDay(year);
			if (no > 0 && day == no) {
				return this.datFestival5;
			}
		}

		// 阳历节日
		var viewMonth = month + 1;
		var key2 = "" + viewMonth + "_" + day;
		if (key2 in this.mapFestival1) {
			return this.mapFestival1[key2];
		}

		// 阳历某月最后一天
		if (viewMonth in this.mapFestival6) {
			var md = this.mapFestival6[viewMonth];
			var day2 = new Date(year, month + 1, 0).getDate();
			if (day == day2) {
				return md;
			}
		}

		// 某月第几个星期几
		var week = new Date(year, month, day).getDay();
		// console.info(111, month, week, day);
		for (var i = 0; i < this.arrFestival2.length; ++i) {
			var it = this.arrFestival2[i];
			// var m = it.month;
			// var n = it[3];
			// var w = it[3];
			if (it.month != viewMonth) {
				continue;
			}

			if (it.week != week) {
				// console.info(555, it.month, month, it.week, week);
				continue;
			}

			if (Math.ceil(day / 7) != it.num) {
				continue;
			}
			return it;
		}
		return null;
	}

	getFestival(year, month, day, cdate?: ChineseDate) {
		var md = this.getFestivalMd(year, month, day, cdate);
		if (!md) {
			return "";
		}
		return md.desc;
	}

	// 从阳历指定日期开始查找指定节日所在阳历日期
	findFestivalDate(startDate: Date, md: FestivalMd) {
		function findCDate(startDateTmp: Date, cmonth: number, cday: number, leapType: FestivalLeapType) {
			// var date = new Date(year, 0, 1);
			var time = startDateTmp.getTime();
			var startCdate = new ChineseDate(startDateTmp);
			var arrParam: { year: number, isLeap: boolean }[] = [];
			switch (leapType) {
				case FestivalLeapType.leapDelay: {
					// 非闰月优先
					arrParam = [
						{ year: startCdate.year, isLeap: false },
						{ year: startCdate.year + 1, isLeap: false },
						{ year: startCdate.year + 2, isLeap: false },
					];
					break;
				}
				case FestivalLeapType.leapAll: {
					// 都是节日
					arrParam = [
						{ year: startCdate.year, isLeap: false },
						{ year: startCdate.year, isLeap: true },
						{ year: startCdate.year + 1, isLeap: false },
						{ year: startCdate.year + 1, isLeap: true },
						{ year: startCdate.year + 2, isLeap: false },
						{ year: startCdate.year + 2, isLeap: true },
					];
					break;
				}
				default: {
					// 闰月优先
					arrParam = [
						{ year: startCdate.year, isLeap: true },
						{ year: startCdate.year + 1, isLeap: true },
						{ year: startCdate.year + 2, isLeap: true },
					];
					break;
				}
			}
			var newDate: Date = null;
			for (var i = 0; i < arrParam.length; ++i) {
				var it = arrParam[i];
				var month = cmonth;
				var day = cday;
				// if cday = 0, is last day of month
				if (cday == 0) {
					day = 1;
				}
				var cdate = new ChineseDate(it.year, month, day, it.isLeap);
				if (cday == 0) {
					cdate.day = 29 + (cdate.isLongMonth ? 1 : 0)
				}
				newDate = cdate.toDateTime();
				if (newDate.getTime() > time) {
					return newDate;
				}
			}
			return newDate;
			// var cdate = new ChineseDate(startCdate.year, cmonth, cday, leapType == 0);
			// var newDate = cdate.toDateTime();
			// if (newDate.getTime() < date.getTime()) {
			// 	cdate = new ChineseDate(startCdate.year + 1, cmonth, cday, leapType == 0);
			// 	newDate = cdate.toDateTime();
			// }
		}

		var rst = { year: 0, month: 0, day: 0, festival: md.desc, isFind: false };
		// var stTime = startDate.getTime();
		var stYear = startDate.getFullYear();
		var stMonth = startDate.getMonth();
		var stDay = startDate.getDate();
		// rst.year = year;
		rst.festival = md.desc;
		switch (md.type) {
			case FestivalType.date: {
				// 阳历节日
				var year = stYear;
				var month = md.month - 1;
				if (month < stMonth || (month == stMonth && md.day < stDay)) {
					year += 1;
				}
				var date = new Date(year, month, md.day);
				rst.year = date.getFullYear();
				rst.month = date.getMonth();
				rst.day = date.getDate();
				rst.isFind = (rst.year == year && rst.month == month && rst.day == md.day);
				if (!rst.isFind) {
					if (rst.year < year || rst.month < month) {
						rst.day = 1;
					} else if (rst.year > year || rst.month > month) {
						rst.day = new Date(year, month + 1, 0).getDate();
					}
					rst.year = year;
					rst.month = month;
				}
				break;
			}
			case FestivalType.dateWeek: {
				// 阳历某月第几个星期几
				var year = stYear;
				var month = md.month - 1;
				if (month < stMonth) {
					year += 1;
				}
				var date = new Date(year, month, 1 + (md.num - 1) * 7);
				var week = date.getDay();
				date.setDate(date.getDate() + ((md.week - week + 7) % 7));
				if (date.getTime() < startDate.getTime()) {
					++year;
					date = new Date(year, month, 1 + (md.num - 1) * 7);
					week = date.getDay();
					date.setDate(date.getDate() + ((md.week - week + 7) % 7));
				}

				rst.year = date.getFullYear();
				rst.month = date.getMonth();
				rst.day = date.getDate();
				rst.isFind = (rst.year == year && rst.month == month);
				if (!rst.isFind) {
					if (rst.year < year || rst.month < month) {
						rst.day = 1;
					} else if (rst.year > year || rst.month > month) {
						rst.day = new Date(year, month + 1, 0).getDate();
					}
					rst.year = year;
					rst.month = month;
				}
				break;
			}
			case FestivalType.cdate: {
				// 农历节日
				var month = md.month - 1;
				var newDate = findCDate(startDate, month, md.day, md.leapType);
				var cdate = new ChineseDate(newDate);
				rst.year = newDate.getFullYear();
				rst.month = newDate.getMonth();
				rst.day = newDate.getDate();
				rst.isFind = (cdate.month == month && cdate.day == md.day);
				break;
			}
			case FestivalType.cdateLastDay: {
				// 农历某月最后一天
				var month = md.month - 1;
				var newDate = findCDate(startDate, month, 0, md.leapType);
				var cdate = new ChineseDate(newDate);

				rst.year = newDate.getFullYear();
				rst.month = newDate.getMonth();
				rst.day = newDate.getDate();
				rst.isFind = (cdate.month == month);
				break;
			}
			case FestivalType.qingMing: {
				// 清明节
				var year = stYear;
				var month = 3;
				if (stMonth > month) {
					year += 1;
				}
				var day = this.getQingMingDay(year);
				// console.info(day, year, stYear, stMonth, month, day, stDay);
				if (day != 0 && year == stYear && stMonth == month && day < stDay) {
					year += 1;
					day = this.getQingMingDay(year);
				}
				rst.year = year;
				rst.month = month;
				rst.day = day || 5;
				rst.isFind = (day != 0);
				break;
			}
			case FestivalType.dateLastDay: {
				// 阳历某月最后一天
				var year = stYear;
				var month = md.month - 1;
				if (stMonth > month) {
					year += 1;
				}
				var date = new Date(year, month + 1, 0);
				rst.year = date.getFullYear();
				rst.month = date.getMonth();
				rst.day = date.getDate();
				rst.isFind = (rst.month == month);
				break;
			}
		}
		return rst;
	}

	setCustomFestival(_arrCustomFestival: FestivalMd[]) {
		this.arrCustomFestival = _arrCustomFestival;
		this.updateFestival();
	}

	private updateFestival() {
		this.mapFestival1 = {};
		this.arrFestival2 = [];
		this.mapFestival3 = {};
		this.mapFestival4 = {};
		this.datFestival5 = new FestivalMd();
		this.mapFestival6 = {};

		var arr = [this.arrDefFestival, this.arrCustomFestival];
		for (var i = 0; i < arr.length; ++i) {
			for (var j = 0; j < arr[i].length; ++j) {
				var it = arr[i][j];
				switch (it.type) {
					case FestivalType.date: {
						this.mapFestival1[it.month + "_" + it.day] = it;
						break;
					}
					case FestivalType.dateWeek: {
						this.arrFestival2.push(it);
						break;
					}
					case FestivalType.cdate: {
						this.mapFestival3[it.month + "_" + it.day] = it;
						break;
					}
					case FestivalType.cdateLastDay: {
						this.mapFestival4[it.month] = it;
						break;
					}
					case FestivalType.qingMing: {
						this.datFestival5 = it;
						break;
					}
					case FestivalType.dateLastDay: {
						this.mapFestival6[it.month] = it;
					}
				}
			}
		}

		this.send("festivalChanged");
	}

	private convertDefFestival() {
		var arr: FestivalMd[] = [];
		for (var i = 0; i < this.arrDefineFestival.length; ++i) {
			var it = this.arrDefineFestival[i] as any;
			var md = new FestivalMd();
			md.type = it[0];
			md.desc = it[1];
			arr.push(md);

			switch (md.type) {
				case FestivalType.date: case FestivalType.cdate: {
					// 阳历节日/农历节日
					md.month = it[2];
					md.day = it[3];
					break;
				}
				case FestivalType.dateWeek: {
					// 阳历某月第几个星期几
					md.month = it[2];
					md.num = it[3];
					md.week = it[4];
					break;
				}
				case FestivalType.cdateLastDay: {
					// 农历某月最后一天
					md.month = it[2];
					break;
				}
				case FestivalType.qingMing: {
					// 清明节
					break;
				}
				case FestivalType.dateLastDay: {
					// 阳历某月最后一天
					md.month = it[2];
					break;
				}
			}
		}
		this.arrDefFestival = arr;
	}

	listen(type: "festivalChanged", cb: Function, target: any = null) {
		var arr = this.mapEvent[type] || (this.mapEvent[type] = []);
		arr.push({ cb, target });
	}

	remove(type: "festivalChanged", cb: Function, target: any = null) {
		if (!(type in this.mapEvent)) {
			return;
		}
		var arr = this.mapEvent[type];
		for (var i = arr.length - 1; i >= 0; --i) {
			var it = arr[i];
			if (it.cb == cb && it.target == target) {
				arr.splice(i, 1);
			}
		}
	}

	private send(type: "festivalChanged", ...args) {
		if (!(type in this.mapEvent)) {
			return;
		}
		var arr = this.mapEvent[type];
		for (var i = 0; i < arr.length; ++i) {
			var it = arr[i];
			try {
				it.cb.apply(it.target, args);
			} catch (ex) { }
		}
	}

	// // 计算清明节的日期在4月份的第几日(可计算范围: 1700-3100)
	// private getQingMingDay2(year: number) {
	// 	if (year == 2232) {
	// 		return 4;
	// 	}
	// 	if (year < 1700) {
	// 		return 0;
	// 	}
	// 	if (year >= 3100) {
	// 		return 0;
	// 	}
	// 	var coefficient = [5.15, 5.37, 5.59, 4.82, 5.02, 5.26, 5.48, 4.70, 4.92, 5.135, 5.36, 4.60, 4.81, 5.04, 5.26];
	// 	var mod = year % 100;
	// 	return Math.floor((mod * 0.2422 + coefficient[Math.floor(year / 100) - 17] - Math.floor(mod / 4)));
	// }

	// 计算清明节的日期在4月份的第几日(可计算范围: 1900-2900)
	getQingMingDay(year: number) {
		if (year < this.startQingMingYear || year >= this.startQingMingYear + this.strQingMin.length) {
			return 0;
		}
		const charCode0 = 48;
		return this.strQingMin.charCodeAt(year - this.startQingMingYear) - charCode0;
	}

	// 清明节数据起始日期
	private startQingMingYear = 1900;
	// 清明节数据（阳历）
	// 每个数据代表一个年份的日期
	// 数字代表当月的阳历日数
	private strQingMin = `5566556655665556555655565556555655565556555655555555555555555555555555555555455545554555455545554555,
4555455544554455445544554455445544554455444544454445444544454445444544454444444444444444444444444444,
5555455545554555455545554555455545554455445544554455445544554455445544454445444544454445444544454444,
5555555555555555555555555555555545554555455545554555455545554555455544554455445544554455445544554445,
5556555655565556555655565556555555555555555555555555555555555555455545554555455545554555455545554455,
4455445544554455445544554445444544454445444544454445444544444444444444444444444444444444444434443444,
4555455545554555455545554455445544554455445544554455444544454445444544454445444544454444444444444444,
5555555555555555555545554555455545554555455545554555445544554455445544554455445544454445444544454445,
5556555655565555555555555555555555555555555555554555455545554555455545554555455544554455445544554455,
4455445544554445444544454445444544454445444544444444444444444444444444444444444434443444344434443444,
4`;
}
