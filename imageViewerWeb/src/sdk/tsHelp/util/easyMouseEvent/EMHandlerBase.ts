
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { EMType } from './EMMd';

class OriginEventMd {
	element = null;
	cb: Function = null;

	constructor(_element, _cb) {
		this.element = _element;
		this.cb = _cb;
	}
}

export default abstract class EMHandlerBase {
	static vTag = "_$_em_event";
	// static vGlobalDownTag = "_$_em_event_gdown";
	// static vGlobalMoveTag = "_$_em_event_gmove";
	static vGlobalUpTag = "_$_em_event_gup";
	static globalHandlerId = 0;
	static isPc = null;
	static globalMousePos = { x: 0, y: 0 };
	static globalListenCount = 0;
	static lastTouchEvtBase = null;

	type: EMType = "down";
	protected handlerId = 0;
	protected mapOriginEvent: Record<string, OriginEventMd[]> = {};

	element: any = null;
	target: any = null;
	cb: Function = null;

	constructor() {
		this.createId();
	}

	abstract listen(_element: any, _cb: Function, _target: any);
	abstract off(_element: any, _cb: Function);
	abstract createHandler(): EMHandlerBase;

	// getHandler(el): EMDataMd {
	// 	var map = el[EMHandlerBase.vTag];
	// 	if(!map) {
	// 		return null;
	// 	}
	// 	map = map[this.type];
	// 	if(!map) {
	// 		return null;
	// 	}
	// 	var hd = map[this.handlerId];
	// 	if(!hd) {
	// 		return null;
	// 	}
	// 	return hd;
	// }

	// protected comGetInfo(el) {
	// 	// el[EMHandlerBase.vTag][this.type][this.handlerId] = this
	// 	var map = (el[EMHandlerBase.vTag] || (el[EMHandlerBase.vTag]={}));
	// 	map = (map[this.type] || (map[this.type] = {}));
	// 	return (map[this.handlerId] || (map[this.handlerId] = this)) as EMDataMd;
	// }

	protected static isPC() {
		if (EMHandlerBase.isPc === null) {
			const reg = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i;
			EMHandlerBase.isPc = !navigator.userAgent.match(reg);
		}

		return EMHandlerBase.isPc;
	}

	protected bindHandler(_element: any, _cb: Function, _target: any = null) {
		this.element = _element;
		this.target = _target;
		this.cb = _cb;

		var el = this.element;
		// el[EMHandlerBase.vTag][this.type][this.handlerId] = this;
		var map = (el[EMHandlerBase.vTag] || (el[EMHandlerBase.vTag] = {}));
		map = (map[this.type] || (map[this.type] = {}));
		map[this.handlerId] || (map[this.handlerId] = this);
	}

	protected createId() {
		++EMHandlerBase.globalHandlerId;
		this.handlerId = EMHandlerBase.globalHandlerId;
	}

	protected comListen(ele, originFunName: string, fun: Function) {
		// var md = new EMComEventMd();
		// md.funName = funName;
		// md.originFunName = originFunName;
		// md.fun = evt => fun.call(this, evt, el, cb, taget);
		// md.cb = cb;

		// var info = this.comGetInfo(el);
		// info.orginEvents.push(md);
		// el.addEventListener(originFunName, md.fun);

		var anoFun = evt => fun.call(this, evt);

		if (!(originFunName in this.mapOriginEvent)) {
			this.mapOriginEvent[originFunName] = [];
		}
		var arr = this.mapOriginEvent[originFunName];
		arr.push(new OriginEventMd(ele, anoFun));

		ele.addEventListener(originFunName, anoFun, false);
	}

	protected static initGlobalEventBase() {
		++EMHandlerBase.globalListenCount;
		if (EMHandlerBase.globalListenCount > 1) {
			return;
		}
		if (this.isPC()) {
			window.addEventListener("mousemove", this.anoTouchmoveBase, false);
		} else {
			window.addEventListener("touchstart", this.anoTouchmoveBase, false);
			window.addEventListener("touchmove", this.anoTouchmoveBase, false);
		}
	}
	
	protected static clearGlobalEventBase() {
		--EMHandlerBase.globalListenCount;
		if (EMHandlerBase.globalListenCount > 0) {
			return;
		}
		if (this.isPC()) {
			window.removeEventListener("mousemove", this.anoTouchmoveBase);
		} else {
			window.removeEventListener("touchstart", this.anoTouchmoveBase);
			window.removeEventListener("touchmove", this.anoTouchmoveBase);
		}
	}

	// private static anoTouchstartBase = (evt) => EMHandlerBase.ontouchstartBase(evt);
	// private static ontouchstartBase(evt) {
	// 	if (this.isPC()) {
	// 		this.globalMousePos.x = evt.pageX;
	// 		this.globalMousePos.y = evt.pageY;
	// 	} else {
	// 		var touch = evt.touches && evt.touches[0];
	// 		if (touch) {
	// 			this.globalMousePos.x = touch.pageX;
	// 			this.globalMousePos.y = touch.pageY;
	// 		}
	// 		// EMHandlerBase.lastTouchEvtBase = evt;
	// 	}
	// }

	private static anoTouchmoveBase = (evt) => EMHandlerBase.ontouchmoveBase(evt);
	private static ontouchmoveBase(evt) {
		if (this.isPC()) {
			this.globalMousePos.x = evt.pageX;
			this.globalMousePos.y = evt.pageY;
		} else {
			var touch = evt.touches && evt.touches[0];
			if (touch) {
				this.globalMousePos.x = touch.pageX;
				this.globalMousePos.y = touch.pageY;
			}
			EMHandlerBase.lastTouchEvtBase = evt;
		}
	}

	// protected comListenGlobalMove(ele) {
	// 	var funName = EMHandlerBase.isPC() ? "mousemove" : "touchmove";

	// 	if (!window[EMHandlerBase.vGlobalMoveTag]) {
	// 		window[EMHandlerBase.vGlobalMoveTag] = [];
	// 		window.addEventListener(funName, () => {
	// 			var arr = window[EMHandlerBase.vGlobalMoveTag];
	// 			for (var i = 0; i < arr.length; ++i) {
	// 				arr[i].obj.isDown = false;
	// 			}
	// 		}, false);
	// 	}
	// 	var arr = window[EMHandlerBase.vGlobalMoveTag];
	// 	arr.push({ ele: ele, obj: this });
	// }

	protected comListenGlobalUp(ele) {
		var funName = EMHandlerBase.isPC() ? "mouseup" : "touchend";

		if (!window[EMHandlerBase.vGlobalUpTag]) {
			window[EMHandlerBase.vGlobalUpTag] = [];
			window.addEventListener(funName, () => {
				var arr = window[EMHandlerBase.vGlobalUpTag];
				for (var i = 0; i < arr.length; ++i) {
					arr[i].obj.isDown = false;
				}
			}, false);
		}
		var arr = window[EMHandlerBase.vGlobalUpTag];
		arr.push({ ele: ele, obj: this });
	}

	protected clearEleMap() {
		var el = this.element;
		var map1 = el[EMHandlerBase.vTag];
		if (!map1) {
			return;
		}
		var map2 = map1[this.type];
		if (!map2) {
			return;
		}
		if (!map2[this.handlerId]) {
			for (var key in map1) {
				return;
			}
			delete el[EMHandlerBase.vTag];
			return;
		}
		delete map2[this.handlerId];
		for (var key in map2) {
			return;
		}
		delete map1[this.type];
		for (var key in map1) {
			return;
		}
		delete el[EMHandlerBase.vTag];
	}

	protected comClear() {
		for (var key in this.mapOriginEvent) {
			var arr = this.mapOriginEvent[key];
			for (var i = 0; i < arr.length; ++i) {
				arr[i].element.removeEventListener(key, arr[i].cb);
			}
			// this.element.removeEventListener(key, fun);
		}
		this.mapOriginEvent = {};
		this.clearEleMap();

		// var arr2 = window[EMHandlerBase.vGlobalMoveTag];
		// if (arr2) {
		// 	for (var i = arr2.length - 1; i >= 0; --i) {
		// 		var it = arr2[i];
		// 		if (it.obj == this) {
		// 			arr2.splice(i, 1);
		// 		}
		// 	}
		// }

		var arr2 = window[EMHandlerBase.vGlobalUpTag];
		if (arr2) {
			for (var i = arr2.length - 1; i >= 0; --i) {
				var it = arr2[i];
				if (it.obj == this) {
					arr2.splice(i, 1);
				}
			}
		}
	}

	protected dealTouchEvt(evt) {
		var touch = evt.touches && evt.touches[0];
		var newEvent: any = {
			button: 1,
			which: 1,
			originalEvent: evt,
			touches: evt.touches,
		};
		var proto = Object.getPrototypeOf(evt);
		var newProto = {};
		for (var key in proto) {
			newProto[key] = function (this: any) {
				evt[key].apply(evt, arguments);
			}
		}
		Object.setPrototypeOf(newEvent, newProto);
		for (var key in evt) {
			if (key in newEvent) {
				continue;
			}
			newEvent[key] = evt[key];
		}

		if (evt.touches.length > 1) {
			newEvent.which = 100 + evt.touches.length;
		}
		if (touch != null) {
			var ele = document.elementFromPoint && document.elementFromPoint(touch.pageX, touch.pageY);
			newEvent.target = ele || evt.target;
			newEvent.srcElement = ele || evt.srcElement;

			newEvent.clientX = touch.clientX;
			newEvent.clientY = touch.clientY;
			newEvent.pageX = touch.pageX;
			newEvent.pageY = touch.pageY;
			newEvent.screenX = touch.screenX;
			newEvent.screenY = touch.screenY;
			newEvent.radiusX = touch.radiusX;
			newEvent.radiusY = touch.radiusY;
		}

		return newEvent;
	}
}