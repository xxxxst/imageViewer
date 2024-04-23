
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import DelayProc from '../delayProc/DelayProc';
import { createDecorator, Vue } from './v2c/IVueClassComponent';

// 函数装饰器
function VDelayProc(time: number) {
	return (target: Vue, key: string, descriptor: any) => {
		var fun = target[key];

		createDecorator((componentOptions, handler) => {
			var mixins = componentOptions.mixins || (componentOptions.mixins = []);

			mixins.push({
				created() {
					var local = this;
					var delay = new DelayProc(time);
					local[key] = async function () {
						if (await delay.isIgnore()) {
							return;
						}
						fun.apply(local, arguments);
					}
				}
			});
		})(target, null);
	}
}

export default VDelayProc;
