
export default class DataCtl {
	db: IDBDatabase = null;
	private dbName = "imageViewer.7059fba5";
	private storeName = "data";
	// private pkeyName = "id";

	async init() {
		var ok = await this.open();
		return ok;
	}

	private async open() {
		const version = 1;

		return new Promise<boolean>((rsv) => {
			var req = indexedDB.open(this.dbName, version);
			req.onerror = (evt: any) => {
				this.db = null;
				rsv(false);
			}
			req.onsuccess = (evt: any) => {
				this.db = evt.target.result as IDBDatabase;
				rsv(true);
			}
			req.onupgradeneeded = (evt: any) => {
				var db = evt.target.result as IDBDatabase;

				if (!db.objectStoreNames.contains(this.storeName)) {
					db.createObjectStore(this.storeName);
					// db.createObjectStore(storeName, { keyPath: pkeyName });
				}
			}
		});
	}

	// async loadJson(id: string) {
	// 	var data = await this.loadData(id);
	// 	var obj = null;
	// 	try {
	// 		obj = JSON.parse(data);
	// 	} catch (ex) { }

	// 	return obj || null;
	// }

	async getItem<T = any>(key: string) {
		return this.getData<T>(key);
	}

	async setItem<T = any>(key: string, data: any) {
		return this.setData<T>(key, data);
	}

	async getData<T = any>(key: string) {
		// const id = "config";
		var rst = await this.query(key);
		return rst as T;
		// if (!rst) {
		// 	return null;
		// }
		// return rst.content as string;
	}

	// async saveData(id: string, content: any) {
	// 	// const pkeyName = "id";

	// 	// const id = "config";
	// 	// await this.setData({
	// 	// 	[pkeyName]: id,
	// 	// 	content: content
	// 	// });

	// 	await this.setData(id, content);
	// }

	async delData(key: string) {
		// const storeName = "data";

		if (!this.db) {
			return false;
		}

		return new Promise<boolean>((rsv) => {
			var tr = this.db.transaction([this.storeName], "readwrite");
			var store = tr.objectStore(this.storeName);
			var req = store.delete(key);

			req.onerror = (evt: any) => {
				rsv(false);
			}
			req.onsuccess = (evt: any) => {
				rsv(true);
			};
		});
	}

	async setData<T = any>(key: string, data: T) {
		if (!this.db) {
			return false;
		}

		return new Promise<boolean>((rsv) => {
			var tr = this.db.transaction([this.storeName], "readwrite");
			var store = tr.objectStore(this.storeName);
			var req = store.put(data, key);

			req.onerror = (evt: any) => {
				console.info(evt);
				rsv(false);
			}
			req.onsuccess = (evt: any) => {
				rsv(true);
			};
		});
	}

	private async query(key) {
		if (!this.db) {
			return null;
		}

		return new Promise<any>((rsv) => {
			var tr = this.db.transaction([this.storeName], "readonly");
			var store = tr.objectStore(this.storeName);
			var req = store.get(key);

			req.onerror = (evt: any) => {
				rsv(null);
			}
			req.onsuccess = (evt: any) => {
				rsv(evt.target.result);
			};
		});
	}

}
