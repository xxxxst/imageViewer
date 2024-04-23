
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) xxxxst. All rights reserved.
 *  Licensed under the MIT License
 *--------------------------------------------------------------------------------------------
*/

import { createDecorator } from './v2c/IVueClassComponent';

//使vue忽略该属性，不会转换为get/set方法
export function VIgnore(target?: any, key?: any, descriptor?: any): any {
	var targetKey = target;

	function create(targetSub: any, keySub: any, descriptor?: any) {
		// set state
		function setState(obj) {
			//string
			var tmp = null;
			Object.defineProperty(obj, keySub, {
				enumerable: true,
				configurable: true,
				get: () => { return tmp; },
				set: (value: any) => { tmp = value; },
			});
		}

		if (targetSub || true) {
			createDecorator((componentOptions, handler) => {
				var mixins = componentOptions.mixins || (componentOptions.mixins = []);

				mixins.push({
					data: function () {
						// var rst = {};
						setState(this);

						return {};
					}
				});

			})(targetSub, keySub, descriptor);
		} else {
			setState(targetSub);
		}
	}

	// @Des
	if (key != null) {
		targetKey = key;
		create(target, targetKey);

		return;
	}

	// @Des(...args)
	return create;
}