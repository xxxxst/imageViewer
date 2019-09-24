
import axios from 'axios'

export default class Lang {
	static ins: Lang = new Lang();

	configData: any = new class {
		nowLang: string = "default";
	}
	mapLangData: any = {};

	constructor() {
		this.mapLangData["default"] = {};
		for (var key in this) {
			if (typeof this[key] === "string") {
				this.mapLangData["default"][key] = this[key];
			}
		}
	}

	loadLang() {

	}

	switchLang(langName: string) {
		if (langName == this.configData.nowLang) {
			return;
		}

		if (langName in this.mapLangData) {
			this.switchLangNoHttp(langName);
			return;
		}

		var url = `static/data/lang/${langName}/locale.ini`;
		axios.get(url).then(response => {
			//success
			var arrData = response.data.split("\r\n");
			this.mapLangData[langName] = {};
			for (var i = 0; i < arrData.length; ++i) {
				var arrOne = arrData[i].split("=");
				if (arrOne.length != 2) {
					continue;
				}
				var key = arrOne[0].trim();
				var val = arrOne[1].trim();

				this.mapLangData[langName][key] = val;
			}

			this.switchLangNoHttp(langName);
			// console.info(this.mapLangData);
		}, response => {
			//error
		});
	}

	switchLangNoHttp(langName: string) {
		for (var key in this.mapLangData[langName]) {
			this[key] = this.mapLangData[langName][key];
		}
		this.configData.nowLang = langName;
	}

	langName: string = "简体中文";

	webTitle: string = "imageViewer";

	ok: string = "确定";
	cancel: string = "取消";

	week1: string = "星期一";
	week2: string = "星期二";
	week3: string = "星期三";
	week4: string = "星期四";
	week5: string = "星期五";
	week6: string = "星期六";
	week7: string = "星期七";

	docLicense = "版权声明：本文为博主原创文章，未经博主允许不得转载。";
}
