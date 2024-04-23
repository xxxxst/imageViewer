
//app

import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';
import { Comp, Inject, Model, Prop, Provide, Watch, DEEP, IMMEDIATE, State } from '@/sdk/tsHelp/vue/v2c/IVueDecorator';
// import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';

import { Size } from '@/model/MainModel';

import "@/control/AntDesignImport";
import VFuncBind from '@/sdk/tsHelp/vue/VFuncBind';

@Comp({ })
export default class ProjApp extends Vue {
	@State("lang.webTitle") webTitle;
	@State() domSize: Size;
	@State() htmlFontSize: number;

	// locale = zhCN;

	//title
	@Watch(IMMEDIATE)
	webTitleChanged() {
		document.title = this.webTitle;
	}

	//title
	@Watch()
	htmlFontSizeChanged() {
		document.getElementsByTagName("html")[0].style.fontSize = `${this.htmlFontSize}px`;
	}

	created() {
		window.addEventListener("resize", this.onResize, false);
	}

	mounted() {
		this.htmlFontSizeChanged();
		this.onResize();
	}

	unmounted() {
		window.removeEventListener("resize", this.onResize, false);
	}

	@VFuncBind()
	onResize() {
		this.domSize = { width: document.body.clientWidth, height: document.body.clientHeight };
	}
}
