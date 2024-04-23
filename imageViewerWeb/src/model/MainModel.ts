
export default class MainModel{
	static ins = new MainModel();
	
	language = "default";

	baseUrl = "";
	domName = "";
	port = "";
	staticUrl = "";
	serverUrl = "/server/";
}

export class Size {
	width = 0;
	height = 0;
}
