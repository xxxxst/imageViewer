
const { app, BrowserWindow, Menu } = require('electron');
const fs = require('fs');
const path = require('path');

class SysConst {
	static get docDir() {
		var obj = app.extend && app.extend.erunner;
		if (obj) {
			return obj.baseDir;
		}
		// return app.getPath("appData") + "/erunner";
		return "./";
	}

	static get configPath() {
		return this.docDir + "/config.json";
	}
}

class DebugCtl {
	mapOnseKeyDown = {};

	init() {
		this.mapOnseKeyDown["F12"] = false;
		this.mapOnseKeyDown["F11"] = false;
		this.mapOnseKeyDown["F5"] = false;

		app.on("browser-window-created", (evt, win) => {
			win.webContents.on("before-input-event", (evt2, input) => {
				if (input.type == "keyDown") {
					if ((input.key in this.mapOnseKeyDown) && !this.mapOnseKeyDown[input.key]) {
						this.mapOnseKeyDown[input.key] = true;
						this.onOnceKeydown(win, evt2, input);
					}
				} else if (input.type == "keyUp") {
					if ((input.key in this.mapOnseKeyDown)) {
						this.mapOnseKeyDown[input.key] = false;
					}
				}
			});
		});
	}

	onOnceKeydown(win, evt, input) {
		switch (input.key) {
			case "F12": {
				if (win.webContents.isDevToolsOpened()) {
					win.webContents.devToolsWebContents.focus();
				} else {
					win.webContents.openDevTools();
				}
				this.mapOnseKeyDown["F12"] = false;
				break;
			}
			case "F11": {
				win.setFullScreen(!win.isFullScreen());
				break;
			}
			case "F5": {
				win.reload();
				break;
			}
		}
	}
}

class ComUtil {
	static _loopTrymkdir(fpath) {
		var parentPath = path.dirname(fpath);
		if (!fs.existsSync(parentPath)) {
			this._loopTrymkdir(parentPath);
		}
		fs.mkdirSync(fpath);
	}

	static trymkdir(fpath) {
		try {
			if (fs.existsSync(fpath)) {
				return;
			}
			this._loopTrymkdir(fpath);
		} catch (ex) { }
	}

	static merge(obj, ...args) {
		for (var i = 0; i < args.length; ++i) {
			if (typeof (args[i]) != "object" || args[i] === null) {
				continue;
			}
			for (var key in args[i]) {
				if (typeof (args[i][key]) != "object" || typeof (obj[key]) != "object") {
					obj[key] = args[i][key];
					continue;
				}

				if ((args[i][key] instanceof Array) || (obj[key] instanceof Array)) {
					obj[key] = args[i][key];
					continue;
				}

				this.merge(obj[key], args[i][key]);
			}
		}
	}
}

class WinServer {
	static ins = new WinServer();

	enableWinServer() {
		return true;
	}

	getFileList(path) {
		function getFileType(stat) {
			var type = "unknown";
			if(stat.isFile()) {
				type = "file";
			} else if(stat.isDirectory()) {
				type = "folder";
			}
			return type;
		}
		try {
			var stat = fs.statSync(path);
			if (!stat || !stat.isDirectory()) {
				return;[]
			}
			var arr = fs.readdirSync(path);
			var rst = [];
			for(var i = 0; i < arr.length; ++i) {
				var stat = fs.statSync(path + "/" + arr[i]);

				var md = {
					type: getFileType(stat),
					name: arr[i],
					size: stat.size,
					mtimeMs: stat.mtimeMs,
					ctimeMs: stat.ctimeMs,
				}
				rst.push(md);
			}
			return rst;
		} catch (ex) { }
		return [];
	}

	getFileData(path) {
		try {
			if (!fs.existsSync(path)) {
				return new ArrayBuffer(0);
			}
			return fs.readFileSync(path);
		} catch (ex) { }
		return new ArrayBuffer(0);
	}
}

class App {
	cfgMd = {
		win: {
			x: -1,
			y: -1,
			width: 800,
			height: 600,
		}
	};
	winMinSize = [300, 300];
	winBox = { x: -1, y: -1, width: 600, height: 800 };

	async run(...args) {
		await app.whenReady();

		this.readConfig();

		(new DebugCtl()).init();

		var winMd = this.cfgMd.win;
		var x = winMd.x == -1 ? undefined : winMd.x;
		var y = winMd.y == -1 ? undefined : winMd.y;
		var winOption = {
			x: x,
			y: y,
			width: winMd.width,
			height: winMd.height,
			webPreferences: {
				webSecurity: false,
				nodeIntegration: true,
				enableRemoteModule: true,
				contextIsolation: false,
			}
		};

		Menu.setApplicationMenu(null);
		this.win = new BrowserWindow(winOption);
		
		var obj = app.extend && app.extend.erunner;
		obj = obj || { projPath: "", projDir: "", baseDir: "", entryPath: "", iconBuf: null };
		if (obj.iconBuf) {
			obj.parseIcon(obj.iconBuf, (img) => {
				win.setIcon(img);
			});
		}

		this.initEvent();

		var strParam = args[0] || "";
		strParam = strParam.trim();
		var ch = strParam.charAt(0);
		if (ch != "?" && ch != "#") {
			strParam = "";
		}
		strParam = "#" + args.join(" ");
		
		// if (MainCtl.ins.isDev) {
		// 	this.win.loadURL("http://localhost:8059");
		// } else {
		// 	this.win.loadFile("assets/web/index.html");
		// }
		var projDir = obj.projDir && (obj.projDir + "/");
		var path = projDir + "web/index.html";
		path = path.replace(/([^:])[/\\]+/g, "$1/");
		if (!/[^:/\\#?]+:\/\//.test(path)) {
			path = "file://" + path;
		}
		// this.win.loadFile(path + strParam);
		this.win.loadURL(path + strParam);
	}
	
	readConfig() {
		var cfgPath = SysConst.configPath;
		if (fs.existsSync(cfgPath)) {
			var data = fs.readFileSync(cfgPath).toString();
			try {
				var obj = JSON.parse(data);
				ComUtil.merge(this.cfgMd, obj);

				var win = this.cfgMd.win;
				win.width = Math.max(this.winMinSize[0], win.width);
				win.height = Math.max(this.winMinSize[1], win.height);
				win.x = Math.max(-win.width, win.x);
				win.y = Math.max(-win.height, win.y);
			} catch (ex) { }
		}
	}

	saveConfig() {
		var box = this.winBox;
		var win = this.cfgMd.win;
		win.x = box.x;
		win.y = box.y;
		win.width = Math.max(this.winMinSize[0], box.width);
		win.height = Math.max(this.winMinSize[1], box.height);

		var cfgPath = SysConst.configPath;
		var text = JSON.stringify(this.cfgMd);
		fs.writeFileSync(cfgPath, text);
	}

	initEvent() {
		this.initContextMenu();
		this.win.on("close", ()=>{
			var box = this.win.getBounds();
			this.winBox = box;
			
			this.win.destroy();
		});
		app.on('window-all-closed', () => {
			try {
				this.saveConfig();
			} catch (ex) {
				console.info(ex);
			}
			if (process.platform !== 'darwin') {
				app.quit()
			}
		});
	}

	initContextMenu() {
		var map = {
			canUndo		: { role: "undo", label: "撤销" },
			canRedo		: { role: "redo", label: "重做" },
			canCut		: { role: "cut", label: "剪切" },
			canCopy		: { role: "copy", label: "复制" },
			canPaste	: { role: "paste", label: "粘贴" },
			canDelete	: { role: "delete", label: "删除" },
			canSelectAll: { role: "selectAll", label: "全选" },
		};
		this.win.webContents.on('context-menu', (evt, param) => {
			evt.preventDefault();
			
			var menu = new Menu();
			for (var key in map) {
				if (key == "canSelectAll" && !param.isEditable) {
					continue;
				}
				if (param.editFlags[key]) {
					menu.append(new MenuItem(map[key]));
				}
			}
			menu.popup(this.win, param.x, param.y);
		});
	}
}

function main(...args) {
	try {
		new App().run(...args);
	} catch (ex) {
		console.info(ex);
	}
}

module.exports = {
	default: main,
	WinServer,
}

if (typeof(require) !== "undefined" && typeof(module) !== "undefined" && require.main === module) {
	main();
}
