
import { DArr, DeserializeObject, DMap, DMapInf, DTag } from "@/sdk/tsHelp/deserializeObject/DeserializeObject";

enum Type {
	type1 = "type1",
	type2 = "type2",
}

class Bbb1 {
	type = Type.type1;
	bbb = "bbb1";
}

class Bbb2 {
	type = Type.type2;
	bbb2 = "bbb2";
}

class BbbHelp {
	static mapType = {
		[Type.type1]: Bbb1,
		[Type.type2]: Bbb2,
	}
}

class Aaa {
	aaa = "aaa";
	bbb = new Bbb1();

	@DTag("tag") tag = "tag";

	@DArr(Bbb1)
	ccc: Bbb1[] = [];

	@DArr(Bbb1, 2)
	ddd: Bbb1[][] = [];

	@DArr(Bbb1, 3)
	eee: Bbb1[][][] = [];

	@DMap(Bbb1)
	fff: Record<string, Bbb1> = {};

	@DMapInf("type", BbbHelp.mapType)
	ggg: Record<string, Bbb1> = {};

	hhh = null;
}

export default class DeserializeObjectTest {
	init() {
		var aaa = new Aaa();
		var jsonObj = {
			aaa: "$aaa",
			bbb: { bbb: "$bbb" },
			tag: "$tag",
			ccc: [{ bbb: "$bbb1" }, { bbb: "$bbb2" }],
			ddd: [[{ bbb: "$bbb1" }], [{ bbb: "$bbb2" }]],
			eee: [[[{ bbb: "$bbb1" }], [{ bbb: "$bbb2" }]], [[{ bbb: "$bbb3" }]]],
			fff: { "f1": { bbb: "$bbb1" }, "f2": { bbb: "$bbb2" } },
			ggg: { "f1": { type: "type1", bbb: "$bbb1" }, "f2": { type: "type2", bbb2: "$bbb2" } },
			hhh: { bbb: "$bbb1" },
		};
		DeserializeObject.setObj(aaa, jsonObj);
		console.info(aaa);
	}
}

new DeserializeObjectTest().init();
