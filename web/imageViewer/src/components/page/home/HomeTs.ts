
//Home
import Vue from "vue";
import { Emit, Inject, Model, Prop, Provide, Watch } from 'vue-property-decorator';
import Component from "vue-class-component";
import axios from 'axios';

import MainStore, { SState, state } from '../../../model/MainStore';
import MainModel, { Size } from '../../../model/MainModel';
import MainCtl from '../../../control/MainCtl';
import ComUtil from '../../../util/ComUtil';
import IInnerServer from '../../../util/IInnerServer';
import EnvMd from '../../../model/EnvMd';

declare var CP: any;

@Component({ components: { }})
export default class Home extends Vue {
	@SState("winSize") winSize: Size;
	@SState("isDebug") isDebug:boolean;
	@SState("cdn") cdn:boolean;

	path = "";
	oldOncontextmenu: any = null;

	lstData = [];
	scale = 1;
	selectItem = null;
	showPreviewBox = true;

	selectScale = 1;
	selectSize = {w:1, h:1};
	selectPos = {x:0, y:0};
	downSelect = false;
	downSelectPos = {x: 0, y:0};
	downPos = {x: 0, y:0};

	picker: any = null;
	objColor = { r: 255, g: 255, b: 255, a: 1 };
	isShowColorPicker = false;
	isDownColorPicker = false;
	isDownColorCont = false;

	arrQuickColor = ["#fff", "#000", "#f00", "#0f0", "#00f", "#ff0", "#f0f", "#0ff"];

	get colorRgb() {
		var c = this.objColor;
		return `rgb(${c.r},${c.g},${c.b})`;
	}

	get colorRgba() {
		var c = this.objColor;
		return `rgba(${c.r},${c.g},${c.b},${c.a})`;
	}

	@Watch("scale")
	onScaleChanged() {
		$.cookie('scale', this.scale.toString(), { expires: 9999, path: '/' });
	}

	@Watch("path")
	onPathChanged() {
		if(this.path) {
			$.cookie('search_path', this.path, { expires: 9999, path: '/' });
		}
		this.updatePath();
	}

	saveTimeoutId = -1;
	@Watch("colorRgb")
	onColorChanged() {
		if(this.saveTimeoutId >= 0) {
			return;
		}
		this.saveTimeoutId = setTimeout(()=> {
			this.saveTimeoutId = -1;
			var co = (this.objColor.r<<16) + (this.objColor.g<<8) + (this.objColor.b);
			$.cookie('back_color', co.toString(), { expires: 9999, path: '/' });
		}, 1000);
	}

	created() {
		EnvMd.init();
		
		this.isDebug = !!window["__debug__"];
		this.cdn = !!window["__cdn__"];

		if(this.isDebug) {
			MainModel.ins.serverUrl = "http://localhost:8093/test/server/";
		}

		var scaleTmp = $.cookie('scale');
		if(scaleTmp) {
			var val = parseInt(scaleTmp);
			if(isNaN(val)) { val = 1; }
			if(val < 0) { val = 1; }
			this.scale = val;
		}

		var pathTmp = $.cookie('search_path');
		if(pathTmp) {
			this.path = pathTmp;
		}

		var coTmp = $.cookie('back_color');
		if(coTmp) {
			var co = parseInt(coTmp);
			if(!isNaN(co)) {
				var r = (co&0xff0000)>>16;
				var g = (co&0x00ff00)>>8;
				var b = (co&0x0000ff);
				this.objColor.r = r;
				this.objColor.g = g;
				this.objColor.b = b;
			}
		}
		
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

	anoOnMouseup = (a)=>this.onMouseup(a);
	onMouseup(evt) {
		this.downSelect = false;

		if(!this.isDownColorCont) {
			this.isDownColorCont = false;
			this.isDownColorPicker = false;
			this.isShowColorPicker = false;
			return;
		}
		this.isDownColorCont = false;

		if(!this.isDownColorPicker) {
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

	anoOnMousewheel = (a)=>this.onMousewheel(a);
	onMousewheel(evt) {
		if (evt.ctrlKey === true || evt.metaKey) {
			evt.preventDefault();
		}
	}

	anoOnMousewheelContent = (a)=>this.onMousewheelContent(a);
	onMousewheelContent(evt) {
		if (!evt.ctrlKey && !evt.metaKey) {
			return;
		}
		evt.preventDefault();

		var scaleTmp = this.scale;
		if(evt.deltaY < 0) {
			scaleTmp += 1;
		} else {
			scaleTmp -= 1;
		}

		if(scaleTmp < 1) {
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
		if(it.isImg) {
			return it.src;
		}

		var root = "static/image/";
		if(it.isDir) {
			return root + "folder.png";
		}

		var isMatch = /\.[^\.]+/.test(it.name);
		if(!isMatch) {
			return root + "unknown.png";
		}

		switch(RegExp.$1) {
			default: return root + "unknown.png";
		}

		return root + "unknown.png";
	}

	async updatePath() {
		var url = `${MainModel.ins.serverUrl}directory/list`;
		var md = {
			path: this.path,
			rewrite: "0",
		}
		var rst = await axios.post(url, md);

		this.selectItem = null;

		var arr = rst.data;
		for(var i = 0; i < arr.length; ++i) {
			arr[i].src = "";
			arr[i].isImg = false;
			if(arr[i].isDir) {
				continue;
			}

			arr[i].isImg = /(.png|.jpg|.bmp|.svg)$/.test(arr[i].name);
			if(!arr[i].isImg) {
				continue;
			}

			var path = this.path + "/" + arr[i].name;
			// path = this.encodeBase64(path);
			arr[i].src = `${MainModel.ins.serverUrl}file/get/0/${path}`;
		}

		this.lstData = rst.data;

		// console.info(rst.data);
	}

	encodeBase64(str) {
		return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
		function toSolidBytes(match, p1) {
			return String.fromCharCode(parseInt('0x' + p1));
		}));
	}

	async initColorPicker() {
		await ComUtil.nextTick();

		var eleBox: any = this.$refs.colorPicker;
		this.picker = new CP(eleBox, false, eleBox);
		try {
			this.picker.self.classList.add('static');
		} catch (ex) { }
		this.picker.set(this.colorRgb);
		this.picker.enter();

		$(eleBox).find(".static>.color-picker-container>.color-picker-sv").on("mousedown", ()=> {
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

		if(!this.picker) {
			this.initColorPicker();
		}
	}

	onClickQuickColor(idx) {
		var co = this.arrQuickColor[idx].substr(1);
		// console.info(co);
		if(co.length == 6) {
			var r = parseInt(co.substr(0, 2), 16);
			var g = parseInt(co.substr(2, 2), 16);
			var b = parseInt(co.substr(4, 2), 16);
			this.objColor = { r: r, g: g, b: b, a: this.objColor.a };
		} else if(co.length == 3) {
			var r = parseInt(co.substr(0, 1)+"f", 16);
			var g = parseInt(co.substr(1, 1)+"f", 16);
			var b = parseInt(co.substr(2, 1)+"f", 16);
			this.objColor = { r: r, g: g, b: b, a: this.objColor.a };
		}

		this.isShowColorPicker = false;
	}

	onImageLoad(evt, it) {
		var ele = evt.path[0];
		if(!ele) {
			return;
		}
		// console.info(evt, it);
		if(ele.width >= ele.height) {
			$(ele).css("width", "100%");
		} else {
			$(ele).css("height", "100%");
		}
		// console.info(ele.width, ele.height);
	}

	onClickImage(evt, it) {
		// if(this.selectItem == it) {
		// 	this.selectItem = null;
		// } else {
		// 	this.selectItem = it;
		// }
		this.selectItem = it;
		
		if(evt.button == 2) {
			var ele: any = this.$refs.copyInput;
			$(ele).val(it.name);
			ele.select();
			ele.setSelectionRange(0, ele.value.length);
			document.execCommand("copy");
		}
	}

	onDetailImageLoad(evt) {
		var box:any = this.$refs.detailBox;
		var ele:any = this.$refs.detailImg;
		// var ele = evt.path[0];

		if(!box || !ele) {
			return;
		}
		var w = ele.width;
		var h = ele.height;

		var boxW = $(box).width();
		var boxH = $(box).height();

		if(w / h > boxW / boxH) {
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
		var box:any = this.$refs.detailBox;
		var ele:any = this.$refs.detailImg;
		if(!box || !ele) {
			return;
		}
		
		var w = this.selectSize.w * this.selectScale;
		var h = this.selectSize.h * this.selectScale;
		var x = this.selectPos.x;
		var y = this.selectPos.y;
		
		var boxW = $(box).width();
		var boxH = $(box).height();

		if(w < boxW) {
			x = (boxW-w)/2;
		} else {
			if(x > 50) {
				x = 50;
			} else if(x + w + 50 < boxW) {
				x = boxW - w - 50;
			}
		}

		if(h < boxH) {
			y = (boxH-h)/2;
		} else {
			if(y > 50) {
				y = 50;
			} else if(y + h + 50 < boxH) {
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
		if(!this.selectItem) {
			return;
		}

		var scaleTmp = this.selectScale;
		if(evt.deltaY < 0) {
			scaleTmp += 1;
		} else {
			scaleTmp -= 1;
		}

		if(scaleTmp < 1) {
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

		var newx = x - (dx/w) * (neww - w);
		var newy = y - (dy/h) * (newh - h);

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

	anoOnMousemove = (a)=>this.onMousemove(a);
	onMousemove(evt) {
		if(this.downSelect) {
			var x = this.downSelectPos.x + evt.pageX - this.downPos.x;
			var y = this.downSelectPos.y + evt.pageY - this.downPos.y;
			this.selectPos.x = x;
			this.selectPos.y = y;
			this.updateDetailPos();
		}
	}

};
