
export default interface IInnerServer{
	fileGet(path:string):string;
	fileSaveString(path:string, data:string):string;
	onExit():void;
}