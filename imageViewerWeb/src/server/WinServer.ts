
export class SyncServerMd {
	arrIp: string[] = [];
	port = 0;
	syncKey = "";
}

export default class WinServer {
	enableWinServer() {
		return false;
	}

	getFileList(path: string) {
		return [];
	}

	getFileData(path: string) {
		return new ArrayBuffer(0);
	}
}

declare var WinSrv: WinServer;

export class WinServerHelp {
	static enableWinServer() {
		return WinSrv.enableWinServer();
	}

	static getFileList(path: string) {
		return WinSrv.getFileList(path);
	}

	static getFileData(path: string) {
		return WinSrv.getFileData(path);
	}
}

window["WinSrv"] = window["WinSrv"] || new WinServer();
