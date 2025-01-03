
export default class ComUtil {
	static dataVersion: string = "1.0.1";
	static EARTH_RADIUS = 6378137.0;	//地球吧半径

	// array 转 object
	static mapArray(arr, keyName): any {
		var rst = {};
		for (var i = 0; i < arr.length; ++i) {
			rst[arr[i][keyName]] = arr[i];
		}
		return rst;
	}

	// get object first key
	static objFirstKey(obj: object) {
		for (var key in obj) {
			return key;
		}
		return null;
	}

	// base64 image => blob
	static b64ImgToBlob(b64ImgData) {
		/^data:(.*?);base64,/.test(b64ImgData);
		var contentType = RegExp.$1;
		var b64Data = b64ImgData.replace(/data:.*?;base64,/, "");
		return ComUtil.b64toBlob(b64Data, contentType, 512);
	}

	// base64 => blob
	static b64toBlob(b64Data, contentType, sliceSize = 512) {
		contentType = contentType || '';
		sliceSize = sliceSize || 512;

		var byteCharacters = atob(b64Data);
		var byteArrays = [];

		for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			var slice = byteCharacters.slice(offset, offset + sliceSize);

			var byteNumbers = new Array(slice.length);
			for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			var byteArray = new Uint8Array(byteNumbers);

			byteArrays.push(byteArray);
		}

		var blob = new Blob(byteArrays, { type: contentType });
		return blob;
	}

	// 面积计算
	static calcArea(pos1, pos2, pos3) {
		//三角形三条边的长度
		var lineP1P2: number = ComUtil.calcRange(pos1, pos2);
		var lineP2P3: number = ComUtil.calcRange(pos2, pos3);
		var lineP1P3: number = ComUtil.calcRange(pos1, pos3);

		//半周长
		var semic: number = (lineP1P2 + lineP2P3 + lineP1P3) / 2;

		//海伦公式求三角形面积
		var s: number = Math.sqrt(semic * (semic - lineP1P2) * (semic - lineP2P3) * (semic - lineP1P3));
		return s;
	}

	// 距离计算
	static calcRange(pos1, pos2) {
		// var dx = (pos2.pntx - pos1.pntx);
		// var dy = (pos2.pnty - pos1.pnty);
		var dz = (pos2.height - pos1.height);
		// var len = Math.sqrt(dx*dx + dy*dy + dz*dz);
		var gpsLen = ComUtil.getGreatCircleDistance(pos1.lon, pos1.lat, pos2.lon, pos2.lat);
		var len = Math.sqrt(gpsLen * gpsLen + dz * dz);
		return len;
	}

	//两坐标（经纬度）之间距离计算
	// 返回 米
	static getGreatCircleDistance(startLon, startLat, endLon, endLat) {
		var EARTH_RADIUS = 6378137.0;

		var radLat1 = ComUtil.getRad(startLat);
		var radLat2 = ComUtil.getRad(endLat);
		var dy = radLat1 - radLat2; // a
		var dx = ComUtil.getRad(startLon) - ComUtil.getRad(endLon); // b
		var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(dy / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(dx / 2), 2)));
		s = s * EARTH_RADIUS;
		s = Math.round(s * 10000) / 10000.0;
		return s;
	}

	// 度转弧度
	static getRad(d) {
		return d * Math.PI / 180.0;
	}
	// 合并对象
	// 相同属性，data将覆盖template
	static mergeObj(template: object, data: object)
	static mergeObj(template: object, data: object, isReturnNew: boolean)
	static mergeObj(template: object, ...args: object[])
	static mergeObj(template: object, b?, c?) {
		var isReturnNew = false;
		var arrData = [];
		if (arguments.length == 3 && typeof (arguments[2]) == "boolean") {
			isReturnNew = c;
			arrData.push(b);
		} else {
			for (var i = 1; i < arguments.length; ++i) {
				arrData.push(arguments[i]);
			}
			if (arguments.length >= 3) {
				// console.info(template, b);
			}
		}
		var rst = isReturnNew ? this.mix(template) : template;
		// if(isMix){
		// 	rst = isReturnNew ? this.mix(template) : template;
		// }else{
		// 	rst = isReturnNew ? this.extend(template, true) : template;
		// }

		for (var i = 0; i < arrData.length; ++i) {
			var data = arrData[i];

			for (var key in data) {
				try {
					var des = Object.getOwnPropertyDescriptor(data, key);
					if ("get" in des) {
						Object.defineProperty(rst, key, des);
						// console.info(key, source[key], Object.getOwnPropertyDescriptor(source, key));
						continue;
					}
				} catch (ex) { }

				try {
					if (key in rst) {
						var des = Object.getOwnPropertyDescriptor(rst, key);
						if ("get" in des) {
							delete rst[key];
						}
					}
				} catch (ex) { }

				if (this.isArray(data[key])) {
					var sub = template[key] || [];
					if (typeof (sub) != "object") {
						sub = [];
					}
					rst[key] = this.mergeObj(sub, data[key]);
				} else if (typeof (data[key]) == "object") {
					var sub = template[key] || {};
					if (typeof (sub) != "object") {
						sub = {};
					}
					rst[key] = this.mergeObj(sub, data[key]);
				} else {
					rst[key] = data[key];
				}
			}
		}
		return rst;
	}
	
	static clone(source) {
		if (typeof (source) != "object") {
			return source;
		}

		var rst = {};
		if (this.isArray(source)) {
			rst = [];
		}
		Object.setPrototypeOf(rst, Object.getPrototypeOf(source));
		
		for (var key in source) {
			rst[key] = this.clone(source[key]);
		}
		return rst;
	}

	// 拷贝对象
	static extend(source, isDeep = false) {
		if (typeof (source) != "object") {
			return source;
		}

		var rst = {};
		if (this.isArray(source)) {
			rst = [];
		}

		if (isDeep) {
			for (var key in source) {
				// try{
				// 	var des = Object.getOwnPropertyDescriptor(source, key);
				// 	if("get" in des){
				// 		Object.defineProperty(rst, key, des);
				// 		continue;
				// 	}
				// }catch(ex){ }

				rst[key] = this.extend(source[key], isDeep);
			}
		} else {
			for (var key in source) {
				// try{
				// 	var des = Object.getOwnPropertyDescriptor(source, key);
				// 	if("get" in des){
				// 		Object.defineProperty(rst, key, des);
				// 		continue;
				// 	}
				// }catch(ex){ }

				rst[key] = source[key];
			}
		}
		return rst;
	}

	// 混合
	static mix(source) {
		if (typeof (source) != "object") {
			return source;
		}

		var rst = {};
		if (this.isArray(source)) {
			rst = [];
		}

		for (var key in source) {
			try {
				var des = Object.getOwnPropertyDescriptor(source, key);
				if ("get" in des) {
					Object.defineProperty(rst, key, des);
					continue;
				}
			} catch (ex) { }

			rst[key] = this.mix(source[key]);
		}

		return rst;
	}

	// 是否为数组
	static isArray(value) {
		if (typeof (Array.isArray) === "function") {
			return Array.isArray(value);
		} else {
			return Object.prototype.toString.call(value) === "[object Array]";
		}
	}

	// 是否为IE浏览器
	static isIE() {
		if (!!window["ActiveXObject"] || "ActiveXObject" in window) {
			return true;
		} else {
			return false;
		}
	}

	static rgb2hex(r: number, g: number, b: number) {
		return r << 16 + g << 8 + b;
	}

	// static getRgba(str) {
	// 	var val = str.trim();
	// 	var rst = { r: 0, g: 0, b: 0, a: 1 };

	// 	if (val.substr(0, 1) == "#") {
	// 		// #ffffff
	// 		if (val.length == 4) {
	// 			var r = parseInt(val.substr(1, 1), 16);
	// 			var g = parseInt(val.substr(2, 1), 16);
	// 			var b = parseInt(val.substr(3, 1), 16);
	// 			rst.r = (r << 4) + r;
	// 			rst.g = (g << 4) + g;
	// 			rst.b = (b << 4) + b;
	// 		} else if (val.length == 7) {
	// 			rst.r = parseInt(val.substr(1, 2), 16);
	// 			rst.g = parseInt(val.substr(3, 2), 16);
	// 			rst.b = parseInt(val.substr(5, 2), 16);
	// 		}
	// 		rst.a = 1;
	// 	} else if (val.substr(0, 4) == "rgba") {
	// 		// rgba
	// 		var isMatch = /^rgba\(([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9.]+)\)$/.test(val);
	// 		if (isMatch) {
	// 			rst.r = parseInt(RegExp.$1);
	// 			rst.g = parseInt(RegExp.$2);
	// 			rst.b = parseInt(RegExp.$3);
	// 			rst.a = parseFloat(RegExp.$4);
	// 		}
	// 	} else if (val.substr(0, 4) == "rgb(") {
	// 		// rgb
	// 		var isMatch = /^rgb\(([0-9]+)[^0-9]+([0-9]+)[^0-9]+([0-9]+)\)$/.test(val);
	// 		if (isMatch) {
	// 			rst.r = parseInt(RegExp.$1);
	// 			rst.g = parseInt(RegExp.$2);
	// 			rst.b = parseInt(RegExp.$3);
	// 			rst.a = 1;
	// 		}
	// 	} else {
	// 		rst = { r: 255, g: 255, b: 255, a: 1 };
	// 	}
	// 	return rst;
	// }

	// static hsv2rgb(hsv:{h:number,s:number,v:number}) {
	// 	var rgb={r:0,g:0,b:0};
	// 	var hh, p, q, t, ff;
	// 	var i;

	// 	// < is bogus, just shuts up warnhsvgs
	// 	if (hsv.s <= 0.0) {
	// 		rgb.r = hsv.v; rgb.g = hsv.v; rgb.b = hsv.v;
	// 		return rgb;
	// 	}
	// 	hh = hsv.h;
	// 	if (hh >= 360.0) hh = 0.0;
	// 	hh /= 60.0;
	// 	i = parseInt(hh);
	// 	ff = hh - i;
	// 	p = hsv.v * (1.0 - hsv.s);
	// 	q = hsv.v * (1.0 - (hsv.s * ff));
	// 	t = hsv.v * (1.0 - (hsv.s * (1.0 - ff)));

	// 	switch (i) {
	// 		case 0:
	// 			rgb.r = hsv.v; rgb.g = t; rgb.b = p;
	// 			break;
	// 		case 1:
	// 			rgb.r = q; rgb.g = hsv.v; rgb.b = p;
	// 			break;
	// 		case 2:
	// 			rgb.r = p; rgb.g = hsv.v; rgb.b = t;
	// 			break;

	// 		case 3:
	// 			rgb.r = p; rgb.g = q; rgb.b = hsv.v;
	// 			break;
	// 		case 4:
	// 			rgb.r = t; rgb.g = p; rgb.b = hsv.v;
	// 			break;
	// 		case 5:
	// 		default:
	// 			rgb.r = hsv.v; rgb.g = p; rgb.b = q;
	// 			break;
	// 	}

	// 	return rgb;
	// }

	static rgb2hsv(rgb:{r:number,g:number,b:number}) {
		var hsv = { h: 0, s: 0, v: 0 };
		var min, max, delta;

		min = rgb.r < rgb.g ? rgb.r : rgb.g;
		min = min < rgb.b ? min : rgb.b;

		max = rgb.r > rgb.g ? rgb.r : rgb.g;
		max = max > rgb.b ? max : rgb.b;

		hsv.v = max;
		delta = max - min;
		if (delta < 0.00001) {
			hsv.s = 0;
			hsv.h = 0;
			return hsv;
		}
		if (max > 0.0) {
			hsv.s = (delta / max);
		} else {
			// if max is 0, then r = g = b = 0              
			// s = 0, h is undefined
			hsv.s = 0.0;
			hsv.h = NaN;
			return hsv;
		}
		if (rgb.r >= max) {
			hsv.h = (rgb.g - rgb.b) / delta;
		} else {
			if (rgb.g >= max) {
				hsv.h = 2.0 + (rgb.b - rgb.r) / delta;
			} else {
				hsv.h = 4.0 + (rgb.r - rgb.g) / delta;
			}
		}

		hsv.h *= 60.0;

		if (hsv.h < 0.0) {
			hsv.h += 360.0;
		}

		return hsv;
	}

	// static rgb2hsl(rgb: [number, number, number]) {
	// 	for (var i = 0; i < rgb.length; ++i) {
	// 		rgb[i] = rgb[i] / 256;
	// 	}
	// 	var [r, g, b] = rgb;
	// 	var h, s, l;
	// 	h = s = l = 0;
	// 	var min = Math.min(r, g, b);
	// 	var max = Math.max(r, g, b);
	// 	var range = max - min;

	// 	l = (min + max) / 2;
	// 	if (range == 0) {
	// 		s = 0;
	// 		h = 0;
	// 	} else {
	// 		if (l < 0.5) {
	// 			s = (max - min) / (max + min);
	// 		} else {
	// 			s = (max - min) / (2 - max - min);
	// 		}

	// 		var dr = (((max - r) / 6.0) + (range / 2.0)) / range;
	// 		var dg = (((max - g) / 6.0) + (range / 2.0)) / range;
	// 		var db = (((max - b) / 6.0) + (range / 2.0)) / range;

	// 		if (r == max) h = db - dg;
	// 		else if (g == max) h = (1.0 / 3.0) + dr - db;
	// 		else if (b == max) h = (2.0 / 3.0) + dg - dr;

	// 		if (h < 0) h += 1;
	// 		if (h > 1) h -= 1;
	// 	}
	// 	return [h, s, l];
	// }

	// 获取元素绝对位置
	static getAbsolutePos(ele) {
		var x = 0;
		var y = 0;
		if (ele.getBoundingClientRect) {
			const rect = ele.getBoundingClientRect();
			x = rect.left + window.scrollX;
			y = rect.top + window.scrollY;
			return { x, y};
		}

		var el = ele;
		while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
			x += el.offsetLeft - el.scrollLeft;
			y += el.offsetTop - el.scrollTop;
			el = el.offsetParent;
			if (el == document.body) {
				break;
			}
		}
		return { x, y };
	}

}