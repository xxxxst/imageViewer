
(function () {
	if (!window["process"]) {
		return;
	}

	try {
		var remote = window.require('@electron/remote');
		if (!remote) {
			return;
		}

		var appMain = remote.require('./main');
		window["WinSrv"] = appMain.WinServer.ins;
	} catch (ex) { }
})();
