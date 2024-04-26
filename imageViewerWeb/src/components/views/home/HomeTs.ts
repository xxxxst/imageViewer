
//Home
import { Vue } from '@/sdk/tsHelp/vue/v2c/IVue';
import { Comp, Inject, Model, Prop, Provide, Watch, DEEP, IMMEDIATE, State } from '@/sdk/tsHelp/vue/v2c/IVueDecorator';
import axios from 'axios';

import { WinServerHelp } from '@/server/WinServer';
import '@/server/ElectronWinServer';
import MainModel, { Size } from '@/model/MainModel';
import MainCtl from '@/control/MainCtl';
import ComUtil from '@/util/ComUtil';
import IInnerServer from '@/util/IInnerServer';
import EnvMd from '@/model/EnvMd';
import TimeFormat from '@/sdk/tsHelp/util/TimeFormat';

declare var CP: any;

@Comp({})
export default class Home extends Vue {
	@State() winSize: Size;
	@State() isDebug: boolean;
	@State() enableWinServer: boolean;
	@State() cdn: boolean;

	path = "";
	lstPath = [];
	showQuickBox = true;
	oldOncontextmenu: any = null;
	isCopySuffix = true;
	antiAliasing = true;

	lstData = [];
	scale = 1;
	downImageIdx = -1;
	selectItem = null;
	showPreviewBox = true;

	selectScale = 1;
	selectOriginSize = { w: 1, h: 1 };
	selectSize = { w: 1, h: 1 };
	selectPos = { x: 0, y: 0 };
	downSelect = false;
	downSelectPos = { x: 0, y: 0 };
	downPos = { x: 0, y: 0 };

	picker: any = null;
	objColor = { r: 255, g: 255, b: 255, a: 1 };
	isShowColorPicker = false;
	isDownColorPicker = false;
	isDownColorCont = false;

	arrQuickColor = ["#fff", "#000", "#f00", "#0f0", "#00f", "#ff0", "#f0f", "#0ff"];

	imgLoadedCount = 0;

	lstSortType = [
		{ key: "default", desc: "默认" },
		{ key: "hue", desc: "色相" },
		{ key: "mtimeMs", desc: "修改日期" },
		// { key:"complex", desc:"复杂度"},
	];
	sortType = "default";

	get colorRgb() {
		var c = this.objColor;
		return `rgb(${c.r},${c.g},${c.b})`;
	}

	get colorRgba() {
		var c = this.objColor;
		return `rgba(${c.r},${c.g},${c.b},${c.a})`;
	}

	@Watch()
	isCopySuffixChanged() {
		var dataCtl = MainCtl.ins.dataCtl;
		dataCtl.setItem("copy_suffix", this.isCopySuffix ? "1" : "0");
		// $.cookie('copy_suffix', this.isCopySuffix ? "1" : "0", { expires: 9999, path: '/' });
	}

	@Watch()
	antiAliasingChanged() {
		var dataCtl = MainCtl.ins.dataCtl;
		dataCtl.setItem("antiAliasing", this.antiAliasing ? "1" : "0");
		// $.cookie('antiAliasing', this.antiAliasing ? "1" : "0", { expires: 9999, path: '/' });
	}

	@Watch()
	scaleChanged() {
		var dataCtl = MainCtl.ins.dataCtl;
		dataCtl.setItem("scale", this.scale.toString());
		// $.cookie('scale', this.scale.toString(), { expires: 9999, path: '/' });
	}

	@Watch()
	pathChanged() {
		var dataCtl = MainCtl.ins.dataCtl;
		var newpath = this.path.replace(/[ ]*[\\/]+[ ]*/g, "/");
		if (newpath != this.path) {
			this.path = newpath;
			return;
		}

		var tmp = this.path.replace(/([/]$)|(^[/])/g, "");
		this.lstPath = tmp.split("/");

		if (this.path) {
			dataCtl.setItem("search_path", this.path);
			// $.cookie('search_path', this.path, { expires: 9999, path: '/' });
		}
		this.updatePath();
	}

	saveTimeoutId = -1;
	@Watch()
	colorRgbChanged() {
		var dataCtl = MainCtl.ins.dataCtl;
		if (this.saveTimeoutId >= 0) {
			return;
		}
		this.saveTimeoutId = setTimeout(() => {
			this.saveTimeoutId = -1;
			var co = (this.objColor.r << 16) + (this.objColor.g << 8) + (this.objColor.b);
			dataCtl.setItem("back_color", co.toString());
			// $.cookie('back_color', co.toString(), { expires: 9999, path: '/' });
		}, 1000);
	}

	sortDefault(a, b) {
		if (a.type != b.type) {
			return (a.type == "folder") ? -1 : 1;
		}
		var s1 = a.name.toLocaleLowerCase();
		var s2 = b.name.toLocaleLowerCase();
		if (s1 == s2) { return 0; }
		return s1 < s2 ? -1 : 1;
	}

	sortHue(a, b) {
		if (a._hue != b._hue) {
			return (a._hue - b._hue);
		}
		return this.sortDefault(a, b);
	}

	sortMtime(a, b) {
		if (a.mtimeMs != b.mtimeMs) {
			return (a.mtimeMs - b.mtimeMs);
		}
		return this.sortDefault(a, b);
	}

	@Watch()
	sortTypeChanged() {
		var dataCtl = MainCtl.ins.dataCtl;
		dataCtl.setItem("sort_type", this.sortType);
		// $.cookie('sort_type', this.sortType, { expires: 9999, path: '/' });

		var arr = this.lstData;
		switch (this.sortType) {
			case "hue": {
				if (arr.length > 0 && ("_hue" in arr[0])) {
					arr.sort(this.sortHue);
				} else if (this.imgLoadedCount == arr.length) {
					this.onAllImageLoaded();
				}
				break;
			}
			case "mtimeMs": {
				arr.sort(this.sortMtime);
				break;
			}
			case "default":
			default: {
				arr.sort(this.sortDefault);
				break;
			}
			// case "complex": {
			// 	if(arr.length > 0 && ("_complex" in arr[0])) {
			// 		arr.sort((a,b)=>a._complex-b._complex);
			// 	} else if(this.imgLoadedCount == arr.length) {
			// 		this.onAllImageLoaded();
			// 	}
			// 	// arr.sort((a,b)=>a.mtimeMs-b.mtimeMs);
			// 	break;
			// }
		}
	}

	created() {
		this.init();
	}

	mounted() {
		this.oldOncontextmenu = document.oncontextmenu;
		document.oncontextmenu = function (e) { return false; };
		// document.addEventListener("oncontextmenu", this.anoOnContentmenu, { passive: false });
		document.addEventListener("mousewheel", this.anoOnMousewheel, { passive: false });
		document.addEventListener("mouseup", this.anoOnMouseup);
		document.addEventListener("mousemove", this.anoOnMousemove);

		var ele = this.$refs.content as any;
		ele && ele.addEventListener("mousewheel", this.anoOnMousewheelContent, { passive: false });
	}

	destroyed() {
		document.oncontextmenu = this.oldOncontextmenu;
		// document.removeEventListener("oncontextmenu", this.anoOnContentmenu);
		document.removeEventListener("mouseup", this.anoOnMouseup);
		document.removeEventListener("mousemove", this.anoOnMousemove);

		var ele = this.$refs.content as any;
		ele && ele.removeEventListener("mousewheel", this.anoOnMousewheelContent);
	}

	async init() {
		EnvMd.init();

		this.isDebug = !!window["__debug__"];
		this.cdn = !!window["__cdn__"];

		this.enableWinServer = WinServerHelp.enableWinServer();

		await MainCtl.ins.init();
		var dataCtl = MainCtl.ins.dataCtl;

		// if (this.isDebug) {
		// 	MainModel.ins.serverUrl = "http://localhost:9100/test/server/";
		// }

		var scaleTmp = await dataCtl.getItem("scale") || "";
		// var scaleTmp = $.cookie('scale');
		if (scaleTmp) {
			var val = parseInt(scaleTmp);
			if (isNaN(val)) { val = 1; }
			if (val < 0) { val = 1; }
			this.scale = val;
		}

		var pathTmp = await dataCtl.getItem("search_path") || "";
		// var pathTmp = $.cookie('search_path');
		if (pathTmp) {
			this.path = pathTmp;
		} else {
			this.path = "{demo}";
		}

		var typeTmp = await dataCtl.getItem("sort_type") || "";
		// var typeTmp = $.cookie('sort_type');
		if (typeTmp) {
			this.sortType = typeTmp;
		}

		var copySuffixTmp = await dataCtl.getItem("copy_suffix") || "";
		// var copySuffixTmp = $.cookie('copy_suffix');
		if (copySuffixTmp != "") {
			this.isCopySuffix = copySuffixTmp == "1";
		}

		var antiTmp = await dataCtl.getItem("antiAliasing") || "";
		// var antiTmp = $.cookie('antiAliasing');
		if (antiTmp != "") {
			this.antiAliasing = antiTmp == "1";
		}

		var coTmp = await dataCtl.getItem("back_color") || "";
		// var coTmp = $.cookie('back_color');
		if (coTmp) {
			var co = parseInt(coTmp);
			if (!isNaN(co)) {
				var r = (co & 0xff0000) >> 16;
				var g = (co & 0x00ff00) >> 8;
				var b = (co & 0x0000ff);
				this.objColor.r = r;
				this.objColor.g = g;
				this.objColor.b = b;
			}
		}
	}

	anoOnMouseup = (a) => this.onMouseup(a);
	onMouseup(evt) {
		this.downSelect = false;
		this.downImageIdx = -1;

		if (!this.isDownColorCont) {
			this.isDownColorCont = false;
			this.isDownColorPicker = false;
			this.isShowColorPicker = false;
			return;
		}
		this.isDownColorCont = false;

		if (!this.isDownColorPicker) {
			return;
		}
		this.isDownColorPicker = false;
		this.isShowColorPicker = false;
	}

	// anoOnContentmenu = (a)=>this.onContentmenu(a);
	// onContentmenu(evt) {
	// 	evt.preventDefault();
	// 	return false;
	// }

	anoOnMousewheel = (a) => this.onMousewheel(a);
	onMousewheel(evt) {
		if (evt.ctrlKey === true || evt.metaKey) {
			evt.preventDefault();
		}
	}

	anoOnMousewheelContent = (a) => this.onMousewheelContent(a);
	onMousewheelContent(evt) {
		if (!evt.ctrlKey && !evt.metaKey) {
			return;
		}
		evt.preventDefault();

		var scaleTmp = this.scale;
		if (evt.deltaY < 0) {
			scaleTmp += 1;
		} else {
			scaleTmp -= 1;
		}

		if (scaleTmp < 1) {
			scaleTmp = 1;
		}

		this.scale = scaleTmp;
	}

	getItemBoxStyle() {
		var w = 76 * this.scale;
		return {
			width: w + 'px'
		};
	}

	getItemStyle() {
		var w = 76 * this.scale - (76 - 48);
		return {
			width: w + 'px',
			height: w + 'px'
		};
	}

	getIcon(it) {
		if (it.isImg) {
			return it.src;
		}

		var root = "static/image/suffix/";
		if (it.type == "folder") {
			return root + "folder.png";
		}

		var isMatch = /\.[^.]+/.test(it.name);
		if (!isMatch) {
			return root + "unknown.png";
		}

		switch (RegExp.$1) {
			default: return root + "unknown.png";
		}

		return root + "unknown.png";
	}

	getFileUrl(path: string) {
		var mapType = {
			".ico": "image/vnd.microsoft.icon",
			".jpg": "image/jpeg",
			".tif": "image/tiff",
			".svg": "image/svg+xml",
		};
		var suffix = path.replace(/(?:.*(\.))|(?:.*)/, "$1").toLowerCase();
		var type = "";
		if (suffix in mapType) {
			type = mapType[suffix];
		} else {
			suffix = suffix.replace(/[.]+/, "");
			suffix && (type = "image/" + suffix);
		}
		var buf = WinServerHelp.getFileData(path);
		var blob = new Blob([buf], { type: type });
		return URL.createObjectURL(blob);
	}

	async updatePath() {

		this.lstData = [];

		// var url = `${MainModel.ins.serverUrl}directory/list`;
		// var md = {
		// 	path: this.path,
		// 	rewrite: "0",
		// }

		if (this.enableWinServer) {
			for (var i = 0; i < this.lstData.length; ++i) {
				var it = this.lstData[i];
				URL.revokeObjectURL(it.src);
				it.src = "";
			}
		}

		var arr = [];
		if (this.path.indexOf("{demo}") == 0) {
			arr = [
				{ "name": "arrowLeft.png", "type": "file", "size": 336, "mtimeMs": 1581056324, "ctimeMs": 1581056324 },
				{ "name": "suffix", "type": "folder", "size": 0, "mtimeMs": 1581056324, "ctimeMs": 1581056324 }
			];
		} else {
			// arr = (await axios.post(url, md)).data;
			if (this.enableWinServer) {
				arr = WinServerHelp.getFileList(this.path);
			} else {
				arr = await MainCtl.ins.httpCtl.getFileList(this.path);
			}
		}

		this.downImageIdx = -1;
		this.selectItem = null;
		this.imgLoadedCount = 0;

		// var arr = rst.data;
		for (var i = 0; i < arr.length; ++i) {
			arr[i].src = "";
			arr[i].isImg = false;
			arr[i].w = 0;
			arr[i].h = 0;
			if (arr[i].type == "folder") {
				continue;
			}

			arr[i].isImg = /(.ico|.png|.jpg|.jpeg|.bmp|.svg|.tif|.tiff|.gif)$/.test(arr[i].name);
			if (!arr[i].isImg) {
				continue;
			}

			var path = this.path + "/" + arr[i].name;
			// path = this.encodeBase64(path);
			if (this.path.indexOf("{demo}") == 0) {
				arr[i].src = `./static/image/${arr[i].name}`;
			} else {
				if (this.enableWinServer) {
					arr[i].src = this.getFileUrl(path);
				} else {
					// arr[i].src = `${MainModel.ins.serverUrl}file/get/0/${path}?v=${Math.random()}`;
					arr[i].src = `${MainModel.ins.serverUrl}fs/readFile/${path}?v=${Math.random()}`;
					// arr[i].src = `http://localhost:9102/test/server/file/get/0/${path}?v=${Math.random()}`;
				}
			}
		}

		arr.sort(this.sortDefault);

		this.lstData = arr;

		this.sortTypeChanged();

		// console.info(rst.data);
	}

	encodeBase64(str) {
		function toSolidBytes(match, p1) {
			return String.fromCharCode(parseInt('0x' + p1));
		}
		return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, toSolidBytes));
	}

	async initColorPicker() {
		await MainCtl.ins.nextTick();

		var eleBox: any = this.$refs.colorPicker;
		this.picker = new CP(eleBox, false, eleBox);
		try {
			this.picker.self.classList.add('static');
		} catch (ex) { }
		this.picker.set(this.colorRgb);
		this.picker.enter();

		$(eleBox).find(".static>.color-picker-container>.color-picker-sv").on("mousedown", () => {
			this.isDownColorPicker = true;
		});

		var local = this;
		this.picker.on("change", function (this, color) {
			var r = parseInt(color.substr(0, 2), 16);
			var g = parseInt(color.substr(2, 2), 16);
			var b = parseInt(color.substr(4, 2), 16);
			local.objColor = { r: r, g: g, b: b, a: local.objColor.a };
		});
	}

	onClickColorView() {
		this.isShowColorPicker = !this.isShowColorPicker;

		if (!this.picker) {
			this.initColorPicker();
		}
	}

	onClickQuickColor(idx) {
		var co = this.arrQuickColor[idx].substr(1);
		// console.info(co);
		if (co.length == 6) {
			var r = parseInt(co.substr(0, 2), 16);
			var g = parseInt(co.substr(2, 2), 16);
			var b = parseInt(co.substr(4, 2), 16);
			this.objColor = { r: r, g: g, b: b, a: this.objColor.a };
		} else if (co.length == 3) {
			var r = parseInt(co.substr(0, 1) + "f", 16);
			var g = parseInt(co.substr(1, 1) + "f", 16);
			var b = parseInt(co.substr(2, 1) + "f", 16);
			this.objColor = { r: r, g: g, b: b, a: this.objColor.a };
		}

		this.isShowColorPicker = false;
	}

	onImageLoad(evt, it) {
		var ele = evt.path[0];
		if (!ele) {
			return;
		}
		$(ele).css("width", "");
		$(ele).css("height", "");
		$(ele).css("margin-left", "");

		it.w = ele.width;
		it.h = ele.height;
		// console.info(evt, it);
		if (ele.width >= ele.height) {
			$(ele).css("width", "100%");
		} else {
			$(ele).css("height", "100%");
			$(ele).css("margin-left", ((it.h - it.w) / it.h / 2 * 100) + "%");
		}
		// console.info(ele.width, ele.height);
		++this.imgLoadedCount;
		if (this.imgLoadedCount == this.lstData.length) {
			this.onAllImageLoaded();
		}
	}

	onAllImageLoaded() {
		var arr = this.lstData;

		// if(this.sortType == "complex") {
		// 	for(var i = 0;  i < arr.length; ++i) {
		// 		var cpx = arr[i].size/(arr[i].w*arr[i].h);
		// 		if(isNaN(cpx)) {
		// 			cpx = 0;
		// 		}
		// 		arr[i]._complex = cpx;
		// 	}
		// 	arr.sort((a,b)=>a._complex-b._complex);
		// 	return;
		// }

		if (this.sortType != "hue") {
			return;
		}
		var w = 2;
		var h = 2;

		// console.info("aaa:", this.lstData);
		// var ele = this.$refs.cvsImg as HTMLCanvasElement;
		var ele = document.createElement("canvas");
		ele.width = w;
		ele.height = h;
		ele.style.width = "1px";
		ele.style.height = "1px";
		var ctx = ele.getContext("2d");

		// var arr = this.lstData;
		for (var i = 0; i < arr.length; ++i) {
			if (!arr[i].isImg) {
				arr[i]._hue = -99;
				continue;
			}

			var img = $('#cont_img_' + i)[0] as HTMLImageElement;
			if (!img) {
				continue;
			}

			// if (i == 4) {
			// 	console.info(i, img.crossOrigin, img.src);
			// 	continue;
			// }
			ctx.clearRect(0, 0, w, h);
			var data = null;
			try {
				// console.info(img.width, img.height);
				ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, w, h);
				data = ctx.getImageData(0, 0, w, h);
			} catch (ex) {
				// console.info(i, img.crossOrigin, img.src);
				ele = document.createElement("canvas");
				ele.width = w;
				ele.height = h;
				ele.style.width = "" + w + "px";
				ele.style.height = "" + h + "px";
				ctx = ele.getContext("2d");

				arr[i]._hue = -98;
				continue;
			}
			var r = 0;
			var g = 0;
			var b = 0;
			var a = 0;
			var c = data.data.length / 4;
			for (var j = 0; j < c; ++j) {
				// var at = data.data[j * 4 + 3] / 255;
				// var a2 = (a * j + at) / (j + 1);
				// r = (r * a * j + data.data[j * 4 + 0] / c * at) / (j + 1) / a2;
				// g = (g * a * j + data.data[j * 4 + 1] / c * at) / (j + 1) / a2;
				// b = (b * a * j + data.data[j * 4 + 2] / c * at) / (j + 1) / a2;
				// a = a2;
				var at = data.data[j * 4 + 3];
				if (at < a) {
					continue;
				}
				r = data.data[j * 4 + 0];
				g = data.data[j * 4 + 1];
				b = data.data[j * 4 + 2];
				a = at;
			}

			// var hue = this.getHue(r/255,g/255,b/255);
			var hsv = ComUtil.rgb2hsv({ r: r / 255, g: g / 255, b: b / 255 });
			var hh = hsv.h;
			// var hue = hsv.h;
			if (hsv.v < 0.3 || hsv.s < 0.15) {
				// hue = -hsv.v;
				hh = 361;
				// hue = 361 * 100 + hsv.s * 10 + hsv.v;
			}
			var hue = hh * 100 + hsv.v * 10 + hsv.s;
			// console.info(i, img.width, img.height, r, g, b, a, hsv.h, hsv.s, hsv.v, hue, arr[i].name);
			// arr[i].aaa = hsv;
			// var hue = r<<16+g<<8+b;
			arr[i]._hue = hue;
			// console.info(i, r, g, b, a, ",", hue, arr[i].name);
		}

		arr.sort(this.sortHue);
		// console.info(arr);
	}

	onDownImage(idx) {
		this.downImageIdx = idx;
	}

	onUpImage(evt, it, idx) {
		// console.info(evt);
		// copy to clipboard
		if (evt.button == 2) {
			var ele: any = this.$refs.copyInput;
			var val = it.name;
			if (!this.isCopySuffix) {
				val = val.replace(/\.[^.]*$/, "");
			}
			$(ele).val(val);
			ele.select();
			ele.setSelectionRange(0, ele.value.length);
			document.execCommand("copy");
		} else if (evt.detail == 2) {
			// double click
			if (it.type == "folder") {
				this.path = this.path.replace(/[\\/]+$/, "") + "/" + it.name;
			}
			return;
		}

		if (this.downImageIdx != idx) {
			this.downImageIdx = -1;
			return;
		}
		this.downImageIdx = -1;

		if (this.selectItem == it) {
			return;
		}

		// if(this.selectItem == it) {
		// 	this.selectItem = null;
		// } else {
		// 	this.selectItem = it;
		// }
		var eleImg: any = this.$refs.detailImg;
		if (eleImg) {
			$(eleImg).css("width", "");
			$(eleImg).css("height", "");
			$(eleImg).css("left", "");
			$(eleImg).css("top", "");
			$(eleImg).css("visibility", "");
		}

		this.selectItem = it;
	}

	onDetailImageLoad(evt) {
		var box: any = this.$refs.detailImgBox;
		var ele: any = this.$refs.detailImg;
		// var ele = evt.path[0];

		if (!box || !ele) {
			return;
		}
		var w = ele.width;
		var h = ele.height;

		this.selectOriginSize.w = w;
		this.selectOriginSize.h = h;

		var boxW = $(box).width();
		var boxH = $(box).height();

		if (w / h > boxW / boxH) {
			h = boxW * 0.9 / w * h;
			w = boxW * 0.9;
		} else {
			w = boxH * 0.9 / h * w;
			h = boxH * 0.9;
		}

		var x = (boxW - w) / 2;
		var y = (boxH - h) / 2;

		this.selectSize.w = w;
		this.selectSize.h = h;
		this.selectScale = 1;
		this.selectPos.x = x;
		this.selectPos.y = y;

		$(ele).css("visibility", "visible");

		this.updateDetailPos();
	}

	updateDetailPos() {
		var box: any = this.$refs.detailImgBox;
		var ele: any = this.$refs.detailImg;
		if (!box || !ele) {
			return;
		}

		var w = this.selectSize.w * this.selectScale;
		var h = this.selectSize.h * this.selectScale;
		var x = this.selectPos.x;
		var y = this.selectPos.y;

		var boxW = $(box).width();
		var boxH = $(box).height();

		if (w < boxW) {
			x = (boxW - w) / 2;
		} else {
			if (x > 50) {
				x = 50;
			} else if (x + w + 50 < boxW) {
				x = boxW - w - 50;
			}
		}

		if (h < boxH) {
			y = (boxH - h) / 2;
		} else {
			if (y > 50) {
				y = 50;
			} else if (y + h + 50 < boxH) {
				y = boxH - h - 50;
			}
		}

		this.selectPos.x = x;
		this.selectPos.y = y;

		$(ele).css("width", w + "px");
		$(ele).css("height", h + "px");
		$(ele).css("left", x + "px");
		$(ele).css("top", y + "px");
	}

	onDetailMousewheel(evt) {
		if (!this.selectItem) {
			return;
		}

		var scaleTmp = this.selectScale;
		if (evt.deltaY < 0) {
			scaleTmp += 1;
		} else {
			scaleTmp -= 1;
		}

		if (scaleTmp < 1) {
			scaleTmp = 1;
		}

		var oldScale = this.selectScale;
		this.selectScale = scaleTmp;


		var x = this.selectPos.x;
		var y = this.selectPos.y;
		var w = this.selectSize.w * oldScale;
		var h = this.selectSize.h * oldScale;
		var neww = this.selectSize.w * this.selectScale;
		var newh = this.selectSize.h * this.selectScale;
		var dx = evt.offsetX - x;
		var dy = evt.offsetY - y;

		var newx = x - (dx / w) * (neww - w);
		var newy = y - (dy / h) * (newh - h);

		// console.info(evt.offsetX, x, newx, dx, w, neww);

		this.selectPos.x = newx;
		this.selectPos.y = newy;

		this.updateDetailPos();
	}

	onDownSelect(evt) {
		this.downSelect = true;
		this.downSelectPos.x = this.selectPos.x;
		this.downSelectPos.y = this.selectPos.y;
		this.downPos.x = evt.pageX;
		this.downPos.y = evt.pageY;
	}

	anoOnMousemove = (a) => this.onMousemove(a);
	onMousemove(evt) {
		if (this.downSelect) {
			var x = this.downSelectPos.x + evt.pageX - this.downPos.x;
			var y = this.downSelectPos.y + evt.pageY - this.downPos.y;
			this.selectPos.x = x;
			this.selectPos.y = y;
			this.updateDetailPos();
		}
	}

	formatSize(size) {
		var arr = ["K", "M", "G", "T"];
		var unit = "";

		var idx = arr.length - 1;
		for (var i = 0; i < arr.length; ++i) {
			var val = Math.pow(10, (i + 1) * 3);
			if (size < val) {
				idx = i - 1;
				break;
			}
		}
		if (idx >= 0) {
			var val = Math.pow(10, (idx + 1) * 3);
			size = (size / val).toFixed(2);
			unit = arr[idx];
		}

		if (unit != "") {
			unit += "B"
		}

		return size + unit;
	}

	formatTime(time) {
		return TimeFormat.format(new Date(time * 1000), "yyyy/MM/dd hh:mm:ss");
		return time;
	}

	onClickBack() {
		var path = this.path.replace(/[/]+$/, "");
		if (path.indexOf("/") < 0) {
			return;
		}

		this.path = path.replace(/[/][^/]+$/, "");
	}

	onClickQuickItem(idx) {
		var newPath = "";
		for (var i = 0; i <= idx; ++i) {
			newPath += this.lstPath[i] + "/";
		}
		this.path = newPath;
	}

	onInputFocus() {
		this.showQuickBox = false;
		var ele = this.$refs.txtPath as HTMLInputElement;
		ele && ele.select();
	}

	onInputBlur() {
		this.showQuickBox = true;
		var ele = this.$refs.txtPath as HTMLInputElement;
		ele.selectionStart = ele.selectionEnd;
	}

	onQuickBoxMousewheel(evt) {
		if (evt.shiftKey) {
			return;
		}
		var ele = this.$refs.quickBox as HTMLDivElement;
		// var left = 50 * (evt.deltaY>0?1:-1) + ele.scrollLeft;
		ele.scrollLeft = 50 * (evt.deltaY > 0 ? 1 : -1) + ele.scrollLeft;
	}

};
