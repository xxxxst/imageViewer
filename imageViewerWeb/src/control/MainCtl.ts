
import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';

export default class MainCtl {
	static ins: MainCtl = new MainCtl();

	async init() {
		
	}

	async nextTick() {
		return new Promise((rsv) => {
			Vue.nextTick(rsv);
		});
	}
}