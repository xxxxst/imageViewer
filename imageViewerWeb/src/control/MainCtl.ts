
import DataCtl from '@/control/DataCtl';
import HttpCtl from '@/control/HttpCtl';
import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';
import { state } from '@/store/MainStore';

export default class MainCtl {
	static ins: MainCtl = new MainCtl();

	httpCtl = new HttpCtl();
	dataCtl = new DataCtl();

	async init() {
		state.supportDb = await this.dataCtl.init();
	}

	async nextTick() {
		return new Promise((rsv) => {
			Vue.nextTick(rsv);
		});
	}
}