
import { createStore, Store } from '@/sdk/tsHelp/vue/v2c/IVuex';
import { reactive } from '@/sdk/tsHelp/vue/v2c/IVue';

import Lang from '@/lang/Lang'

class StateVue {
	//语言
	lang = Lang.ins;

	domSize = { width: 0, height: 0 };
	remUnit = 100;
	htmlFontSize = 100;

	isDebug = false;
	cdn = true;
}

export const state = reactive(new StateVue());

export default new class MainStore {
	store: Store<StateVue> = null;
	create() {
		this.store = createStore({
			state,
		});
		return this.store;
	}
}
