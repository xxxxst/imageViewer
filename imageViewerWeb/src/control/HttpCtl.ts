
import MainModel from '@/model/MainModel';
import axios, { AxiosRequestConfig } from 'axios';

export default class HttpCtl {
	async comGet<T>(url: string, defVal: T, option: AxiosRequestConfig = {}) {
		try {
			var rst = await axios.get(url, option);
			return rst.data as T;
		} catch (ex) { }

		return defVal;
	}
	
	async comPost<T>(url: string, data, defVal: T, option: AxiosRequestConfig = {}) {
		try {
			var rst = await axios.post(url, data, option);
			return rst.data as T;
		} catch (ex) { }

		return defVal;
	}

	async getFileList(path: string) {
		var url = `${MainModel.ins.serverUrl}/fs/fileList/${path}`.replace(/([^:])[/]+/g, "$1/");
		return await this.comGet(url, [], { headers: {
			"Cache-Control": "no-store"
		}});
	}

}
