
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import "reflect-metadata";

export enum DeserializeType {
	canSetNull = 0x1,
	// cloneDst = 0x2,
}

export interface IDeserializeParam {
	type?: DeserializeType;
}

type FunCreaterTmpl<T> = ((key?: string, src?: any, dst?: any) => T);
type FunCreater = FunCreaterTmpl<any>;

class DeserializeItem {
	creater: FunCreater = null;
	arrayDeep = 1;

	infKey = "";
	mapInfCreater: Record<string, FunCreater> = null;

	constructor(_creater: FunCreater = null, _arrDeep = 1, _infKey = "", _mapInfCreater = null) {
		this.creater = _creater;
		this.arrayDeep = _arrDeep;
		this.infKey = _infKey;
		this.mapInfCreater = _mapInfCreater;
	}
}

class DeserializeConfig {
	static headSymbol = (window["Symbol"] || ((s) => s))("__DeserializeHead__");
	static attrCreaterSymbol = (window["Symbol"] || ((s) => s))("__DeserializeAttrCreater__");
	static arrCreaterSymbol = (window["Symbol"] || ((s) => s))("__DeserializeArrCreater__");
	static mapCreaterSymbol = (window["Symbol"] || ((s) => s))("__DeserializeMapCreater__");
	static mapInfCreaterSymbol = (window["Symbol"] || ((s) => s))("__DeserializeMapInfCreater__");
	static customCreaterSymbol = (window["Symbol"] || ((s) => s))("__DeserializeCustomCreater__");
	static tagSymbol = (window["Symbol"] || ((s) => s))("__DeserializeTag__");

	canSetNull = false;
	// cloneDst = false;
	attr: Record<string, () => object> = {};
}

export function DeserializeHead(param?: IDeserializeParam) {
	return function (c: { new(...args) }) {
		try {
			var proto = c.prototype;
			if (!param) {
				return c;
			}
			var cfg = new DeserializeConfig();
			if ("type" in param) {
				cfg.canSetNull = !!(param.type & DeserializeType.canSetNull);
				// cfg.cloneDst = !!(param.type & DeserializeType.cloneDst);
			}
			Reflect.defineMetadata(DeserializeConfig.headSymbol, cfg, proto);

			// var cfg: SerializeConfig = proto[SerializeConfig.keyName] || (proto[SerializeConfig.keyName] = new SerializeConfig());
			// if ("type" in param) {
			// 	cfg.canSetNull = !!(param.type & SerializeType.canSetNull);
			// }
		} catch (ex) { }

		return c;
	}
}
export { DeserializeHead as DHead };

// attr
export function DeserializeAttr<T extends { new() }>(c: InstanceType<T>) {
	var md = new DeserializeItem(() => new c());
	return Reflect.metadata(DeserializeConfig.attrCreaterSymbol, md);
}
export { DeserializeAttr as DAttr };
export function DeserializeAttrCreater<T extends object>(creater: FunCreaterTmpl<T>) {
	var md = new DeserializeItem(creater);
	return Reflect.metadata(DeserializeConfig.attrCreaterSymbol, md);
}
export { DeserializeAttrCreater as DAttrClass };

// array
export function DeserializeArr<T extends { new() }>(c: InstanceType<T>, dimension = 1) {
	var md = new DeserializeItem(() => new c(), dimension);
	return Reflect.metadata(DeserializeConfig.arrCreaterSymbol, md);
}
export { DeserializeArr as DArr };
export function DeserializeArrCreater<T extends object>(creater: FunCreaterTmpl<T>, dimension = 1) {
	var md = new DeserializeItem(creater, dimension);
	return Reflect.metadata(DeserializeConfig.arrCreaterSymbol, md);
}
export { DeserializeArrCreater as DArrCreater };

// map
export function DeserializeMap<T extends { new() }>(c: InstanceType<T>) {
	var md = new DeserializeItem(() => new c());
	return Reflect.metadata(DeserializeConfig.mapCreaterSymbol, md);
}
export { DeserializeMap as DMap };
export function DeserializeMapCreater<T extends object>(creater: FunCreaterTmpl<T>) {
	var md = new DeserializeItem(creater);
	return Reflect.metadata(DeserializeConfig.mapCreaterSymbol, md);
}
export { DeserializeMapCreater as DMapCreater };

// map interface
export function DeserializeMapInf<T extends { new() }>(infKey: string, mapInf: Record<string, InstanceType<T>>) {
	var mapInfCrater: Record<string, FunCreater> = {};
	for (var key in mapInf) {
		((keyTmp) => {
			mapInfCrater[keyTmp] = () => new mapInf[keyTmp]();
		})(key);
	}
	var md = new DeserializeItem(null, 1, infKey, mapInfCrater);
	return Reflect.metadata(DeserializeConfig.mapInfCreaterSymbol, md);
}
export { DeserializeMapInf as DMapInf };
export function DeserializeMapInfCreater<T extends object>(infKey: string, mapInf: Record<string, FunCreaterTmpl<T>>) {
	var md = new DeserializeItem(null, 1, infKey, mapInf);
	return Reflect.metadata(DeserializeConfig.mapInfCreaterSymbol, md);
}
export { DeserializeMapInfCreater as DMapInfCreater };

// custom
// export function DeserializeCustom<T extends { new() }>(c: InstanceType<T>) {
// 	return Reflect.metadata(DeserializeConfig.customCreaterSymbol, () => new c());
// }
// export { DeserializeCustom as DCustom };
export function DeserializeCustomCreater<T extends object>(creater: FunCreaterTmpl<T>) {
	var md = new DeserializeItem(creater);
	return Reflect.metadata(DeserializeConfig.customCreaterSymbol, md);
}
export { DeserializeCustomCreater as DCustomCreater };

// tag
export function DeserializeTag(tag: string) {
	return Reflect.metadata(DeserializeConfig.tagSymbol, tag);
}
export { DeserializeTag as DTag };

class DeserializeObjectHelp {
	static ergToJson(obj: object, deep: number, tag: string = null) {
		const maxDeep = 1000;
		if (deep > maxDeep) {
			return undefined;
		}

		if (!obj || typeof (obj) != "object") {
			return obj;
		}
		// var isArr = Array.isArray(obj);
		if (Array.isArray(obj)) {
			var rstArr = [];
			for (var i = 0; i < obj.length; ++i) {
				rstArr.push(this.ergToJson(obj[i], deep + 1, tag));
			}
			return rstArr;
		}
		var rstObj = {};
		for (var key in obj) {
			var attrTag = Reflect.getMetadata(DeserializeConfig.tagSymbol, obj, key) || "";
			if (tag !== null && tag !== attrTag) {
				continue;
			}
			rstObj[key] = this.ergToJson(obj[key], deep + 1, tag);
		}
		return rstObj;
	}

	static getCraterMd(dst: any, key: string, symbol: string | number | Symbol) {
		return Reflect.getMetadata(symbol, dst, key) as DeserializeItem;
	}

	// static getAttrCreaterMd(dst: any, key: string) {
	// 	// var c = Reflect.getMetadata(DeserializeConfig.attrSymbol, dst, key);
	// 	// if (c) {
	// 	// 	return () => new c();
	// 	// }
	// 	return Reflect.getMetadata(DeserializeConfig.attrCreaterSymbol, dst, key) as DeserializeItem;
	// 	// return creater;
	// }

	// static getArrCreaterMd(dst: any, key: string) {
	// 	// var c = Reflect.getMetadata(DeserializeConfig.arrSymbol, dst, key);
	// 	// if (c) {
	// 	// 	return () => new c();
	// 	// }
	// 	return Reflect.getMetadata(DeserializeConfig.arrCreaterSymbol, dst, key) as DeserializeItem;
	// 	// return creater;
	// }

	// static getMapCreaterMd(dst: any, key: string) {
	// 	// var c = Reflect.getMetadata(DeserializeConfig.mapSymbol, dst, key);
	// 	// if (c) {
	// 	// 	return () => new c();
	// 	// }
	// 	return Reflect.getMetadata(DeserializeConfig.mapCreaterSymbol, dst, key) as DeserializeItem;
	// 	// return creater;
	// }

	// static getCustomCreaterMd(dst: any, key: string) {
	// 	// var c = Reflect.getMetadata(DeserializeConfig.mapSymbol, dst, key);
	// 	// if (c) {
	// 	// 	return () => new c();
	// 	// }
	// 	return Reflect.getMetadata(DeserializeConfig.customCreaterSymbol, dst, key) as DeserializeItem;
	// 	// if (!rst) {
	// 	// 	return null;
	// 	// }
	// 	// return (() => rst(key, src, dst));
	// 	// return creater;
	// }

	static ergSetObj<T = object>(dst: T, src: object, tag: string = null, mapCreaterMd: DeserializeItem = null) {
		if (!dst || typeof (dst) != "object" || Array.isArray(dst)) {
			return dst;
		}
		if (!src || typeof (src) != "object" || Array.isArray(src)) {
			return dst;
		}
		// dst = new Ccc();
		var cfg: DeserializeConfig = Reflect.getMetadata(DeserializeConfig.headSymbol, dst) || new DeserializeConfig();

		for (var key in src) {
			if (!mapCreaterMd && !(key in dst)) {
				continue;
			}

			var attrTag = Reflect.getMetadata(DeserializeConfig.tagSymbol, dst, key) || "";
			if (tag !== null && tag !== attrTag) {
				continue;
			}

			var srcData = src[key];
			var isSrcArr = Array.isArray(srcData);
			var typeSrcData = typeof (srcData);
			var isSrcEmpty = (srcData === null || srcData === undefined);

			var dstData = dst[key];
			var isDstArr = Array.isArray(dstData);
			var typeDstData = typeof (dstData);
			var isDstEmpty = (dstData === null || dstData === undefined);

			if (isSrcEmpty) {
				if (typeDstData == "object" && cfg.canSetNull) {
					if (isDstArr) {
						dst[key] = [];
					} else {
						dst[key] = srcData;
					}
				}
				continue;
			}

			if (isDstEmpty) {
				if (typeSrcData != "object") {
					continue;
				}
			} else {
				if (typeDstData != typeSrcData) {
					continue;
				}
				if (isSrcArr != isDstArr) {
					continue;
				}
			}

			if (typeSrcData != "object") {
				dst[key] = srcData;
				continue;
			}

			var customCreaterMd = this.getCraterMd(dst, key, DeserializeConfig.customCreaterSymbol);
			if (customCreaterMd) {
				dst[key] = customCreaterMd.creater(key, src, dst);
				continue;
			}

			if (isDstEmpty) {
				var attrCraterMd = this.getCraterMd(dst, key, DeserializeConfig.attrCreaterSymbol);
				var attrCreater = (attrCraterMd && attrCraterMd.creater);
				if(!attrCreater) {
					var mapCrater = mapCreaterMd && mapCreaterMd.creater;
					if (mapCreaterMd && mapCreaterMd.infKey) {
						var infKeyVal = src[key][mapCreaterMd.infKey];
						// console.info(key, mapCreaterMd.infKey, infKeyVal, src, mapCreaterMd);
						mapCrater = mapCreaterMd.mapInfCreater[infKeyVal];
					}
					attrCreater = mapCrater;
				}
				if (!attrCreater) {
					dst[key] = srcData;
				} else {
					var obj = attrCreater();
					var childMapCreaterMd = this.getCraterMd(dst, key, DeserializeConfig.mapCreaterSymbol);
					childMapCreaterMd = childMapCreaterMd || this.getCraterMd(dst, key, DeserializeConfig.mapInfCreaterSymbol);
					// var childMapCreater = this.getMapCreaterMd(dst, key);
					// console.info(222, obj, srcData, tag, childMapCreaterMd);
					DeserializeObjectHelp.ergSetObj(obj, srcData, tag, childMapCreaterMd);
					dst[key] = obj;
				}
				continue;
			}

			if (isSrcArr) {
				var arrCreaterMd = this.getCraterMd(dst, key, DeserializeConfig.arrCreaterSymbol);

				if (!arrCreaterMd.creater) {
					dst[key] = srcData;
					continue;
				}
				var deep = arrCreaterMd.arrayDeep;
				var arrSrcStk = [];
				var arrDstStk = [];
				var arrIdxStk = [];
				var arrSrcTmp = srcData;
				var arrDstTmp = [];
				var idxTmp = 0;
				var arrDstRoot = arrDstTmp;


				do {
					// var dstTmp2 = [];
					for (var i = idxTmp; i < arrSrcTmp.length; ++i) {
						var srcTmp2 = arrSrcTmp[i];
						if (arrSrcStk.length > deep - 1) {
							continue;
						}
						if (arrSrcStk.length == deep - 1) {
							if (Array.isArray(srcTmp2)) {
								continue;
							}
							var obj = arrCreaterMd.creater();
							arrDstTmp.push(obj);
							DeserializeObjectHelp.ergSetObj(obj, srcTmp2, tag);
							continue;
						}
						if (!Array.isArray(srcTmp2)) {
							continue;
						}
						var arrDstChildTmp = [];
						arrDstTmp.push(arrDstChildTmp);

						arrSrcStk.push(arrSrcTmp);
						arrDstStk.push(arrDstTmp);
						arrIdxStk.push(i + 1);
						arrSrcTmp = srcTmp2;
						arrDstTmp = arrDstChildTmp;
						i = -1;
						continue;
					}
					arrSrcTmp = arrSrcStk.pop();
					arrDstTmp = arrDstStk.pop();
					idxTmp = arrIdxStk.pop();
				} while (arrSrcTmp);
				dst[key] = arrDstRoot;


				// for (var i = 0; i < srcData.length; ++i) {
				// 	var obj = arrCreaterMd.creater();
				// 	arr.push(obj);
				// 	DeserializeObjectHelp.ergSetObj(obj, srcData[i], tag);
				// }
				// dst[key] = arr;
				continue;
			}

			var childMapCreaterMd = this.getCraterMd(dst, key, DeserializeConfig.mapCreaterSymbol);
			childMapCreaterMd = childMapCreaterMd || this.getCraterMd(dst, key, DeserializeConfig.mapInfCreaterSymbol);
			DeserializeObjectHelp.ergSetObj(dstData, srcData, tag, childMapCreaterMd);
		}

		return dst;
	}
}

export class DeserializeObject {
	// tag == null : set all attr
	// tag == ""   : set default attr
	static setObj<T = object>(dst: T, src: object, tag: string = null) {
		return DeserializeObjectHelp.ergSetObj(dst, src, tag);
	}

	static toJson(obj: object, tag: string = null) {
		return DeserializeObjectHelp.ergToJson(obj, 0, tag);
	}
}

export { DeserializeObject as DObject };
