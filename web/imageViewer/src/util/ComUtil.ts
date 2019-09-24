import Vue from 'vue';

export default class ComUtil {
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

	static rgb2hex(r, g, b) {
		return r<<16+g<<8+b;
	}

	static hsv2rgb(hsv:{h:number,s:number,v:number}) {
		var rgb={r:0,g:0,b:0};
		var hh, p, q, t, ff;
		var i;

		// < is bogus, just shuts up warnhsvgs
		if (hsv.s <= 0.0) {
			rgb.r = hsv.v; rgb.g = hsv.v; rgb.b = hsv.v;
			return rgb;
		}
		hh = hsv.h;
		if (hh >= 360.0) hh = 0.0;
		hh /= 60.0;
		i = parseInt(hh);
		ff = hh - i;
		p = hsv.v * (1.0 - hsv.s);
		q = hsv.v * (1.0 - (hsv.s * ff));
		t = hsv.v * (1.0 - (hsv.s * (1.0 - ff)));

		switch (i) {
			case 0:
				rgb.r = hsv.v; rgb.g = t; rgb.b = p;
				break;
			case 1:
				rgb.r = q; rgb.g = hsv.v; rgb.b = p;
				break;
			case 2:
				rgb.r = p; rgb.g = hsv.v; rgb.b = t;
				break;

			case 3:
				rgb.r = p; rgb.g = q; rgb.b = hsv.v;
				break;
			case 4:
				rgb.r = t; rgb.g = p; rgb.b = hsv.v;
				break;
			case 5:
			default:
				rgb.r = hsv.v; rgb.g = p; rgb.b = q;
				break;
		}

		return rgb;
	}

	static async nextTick() {
		return new Promise(rsv=>{
			Vue.nextTick(()=>{
				rsv();
			});
		});
	}
}