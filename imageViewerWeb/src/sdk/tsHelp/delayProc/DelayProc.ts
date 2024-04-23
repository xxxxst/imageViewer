
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

export default class DelayProc {
	waitTime = 1000;

	private lastProcTime = 0;

	private isWait = false;
	private waitRsv = null;
	private waitTimeId = -1;

	constructor(_waitTime = 1000) {
		this.waitTime = _waitTime;
	}

	private async sleep(time) {
		return new Promise<boolean>((rsv) => {
			this.waitRsv = rsv;
			this.waitTimeId = setTimeout(() => rsv(false), time);
		});
	}

	async isIgnore(immediately = false) {
		var time = new Date().getTime();

		if (this.isWait) {
			if (immediately) {
				clearTimeout(this.waitTimeId);
				this.waitRsv(true);
				
				this.lastProcTime = time;
				return false;
			} else {
				return true;
			}
			// this.lastProcTime = time;
			// return true;
		}

		if (immediately) {
			this.lastProcTime = time;
			return false;
		}

		// if (this.isWait) {
		// 	return true;
		// }

		if (time - this.lastProcTime > this.waitTime) {
			this.lastProcTime = time;
			return false;
		}

		this.isWait = true;
		var isAbort = await this.sleep(this.waitTime);
		this.isWait = false;

		if (!isAbort) {
			this.lastProcTime = time + this.waitTime;
		}
		return isAbort;
	}

	refresh() {
		if (!this.isWait) {
			return;
		}
		clearTimeout(this.waitTimeId);
		this.waitRsv(false);
	}
}
