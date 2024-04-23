
import { createRouter, createWebHashHistory, RouteRecordRaw } from '@/sdk/tsHelp/vue/v2c/IVueRouter';
import ComUtil from '@/util/ComUtil';
import Home from '@/components/views/home/Home.vue';

function p(param) {
	return function (r) {
		var rst = ComUtil.extend(param, true);
		for (var key in rst) {
			if (typeof (rst[key]) == "string" && rst[key].indexOf(":") == 0) {
				var temp = rst[key].substr(1);
				if (temp in r.params) {
					rst[key] = r.params[temp];
				} else {
					rst[key] = null;
				}
			}
		}
		return rst;
	}
}

const routes = [
	{ path: '/:page?', name: 'Home', component: Home, },
];

export default new class MainRouter {
	create() {
		return createRouter({
			history: createWebHashHistory(),
			routes,
		});
	}
}
