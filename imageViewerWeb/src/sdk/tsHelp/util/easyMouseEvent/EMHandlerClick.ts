
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { EMType } from './EMMd';
import EMHandlerBase from './EMHandlerBase';

export default class EMHandlerClick extends EMHandlerBase {
	type: EMType = "click";

	isDown = false;
	downPos = { x: 0, y: 0 };
	scaleGap = 0;

	createHandler() {
		return new EMHandlerClick();
	}

	listen(_element: any, _cb: Function, _target: any = null) {
		this.bindHandler(_element, _cb, _target);
		EMHandlerBase.initGlobalEventBase();

		if (EMHandlerBase.isPC()) {
			this.comListen(this.element, "mousedown", this.onmousedown);
			this.comListen(this.element, "mouseup", this.onmouseup);
			// this.comListen(window, "mouseup", this.onmouseupGlobal);
			this.comListenGlobalUp(this.element);
		} else {
			this.comListen(this.element, "touchstart", this.ontouchstart);
			this.comListen(this.element, "touchend", this.ontouchend);
			// this.comListen(window, "touchend", this.ontouchendGlobal);
			this.comListenGlobalUp(this.element);
		}
	}

	off(_element: any, _cb: Function) {
		EMHandlerBase.clearGlobalEventBase();

		this.comClear();
	}

	private onmousedown(evt: MouseEvent) {
		this.isDown = true;
		this.downPos.x = evt.pageX;
		this.downPos.y = evt.pageY;
	}

	private onmouseup(evt: MouseEvent) {
		if (!this.isDown) {
			return;
		}
		this.isDown = false;
		
		var dx = Math.abs(evt.pageX - this.downPos.x);
		var dy = Math.abs(evt.pageY - this.downPos.y);
		const maxMoveSize = 5;
		if (dx >= maxMoveSize || dy >= maxMoveSize) {
			return;
		}
		this.cb && this.cb.call(this.target, evt);
	}

	private onmouseupGlobal(evt) {
		this.isDown = false;
	}

	private ontouchstart(evt: TouchEvent) {
		this.isDown = true;
		var touch = evt.touches && evt.touches[0];
		if (touch) {
			this.downPos.x = touch.pageX;
			this.downPos.y = touch.pageY;
		}
	}

	private static checkIsOver(el, nowEl) {
		var tmp = nowEl;
		do {
			if (tmp == el) {
				return true;
			}
			tmp = tmp.parentElement;
		} while (tmp != null);

		return false;
	}

	private ontouchend(evt: TouchEvent) {
		if (!this.isDown) {
			return;
		}

		this.isDown = false;
		
		var lastEvt = EMHandlerBase.lastTouchEvtBase || evt;
		var touch = lastEvt.touches && lastEvt.touches[0];
		if (touch) {
			var dx = Math.abs(touch.pageX - this.downPos.x);
			var dy = Math.abs(touch.pageY - this.downPos.y);
			const maxMoveSize = 5;
			if (dx >= maxMoveSize || dy >= maxMoveSize) {
				return;
			}
		}

		try {
			var endTarget = document.elementFromPoint(
				evt.changedTouches[0].pageX,
				evt.changedTouches[0].pageY
			);
			if (!EMHandlerClick.checkIsOver(this.element, endTarget)) {
				return;
			}
		} catch (ex) { }

		var newEvent = this.dealTouchEvt(evt);
		this.cb && this.cb.call(this.target, newEvent);
	}

	private ontouchendGlobal(evt) {
		this.isDown = false;
	}

}