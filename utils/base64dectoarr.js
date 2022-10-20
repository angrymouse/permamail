import b64ToUint6 from "./b64touint6";
export default function base64DecToArr(sBase64, nBlocksSize) {
	const sB64Enc = sBase64.replace(/[^A-Za-z0-9+/]/g, "");
	const nInLen = sB64Enc.length;
	const nOutLen = nBlocksSize
		? Math.ceil(((nInLen * 3 + 1) >> 2) / nBlocksSize) * nBlocksSize
		: (nInLen * 3 + 1) >> 2;
	const taBytes = new Uint8Array(nOutLen);

	let nMod3;
	let nMod4;
	let nUint24 = 0;
	let nOutIdx = 0;
	for (let nInIdx = 0; nInIdx < nInLen; nInIdx++) {
		nMod4 = nInIdx & 3;
		nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << (6 * (3 - nMod4));
		if (nMod4 === 3 || nInLen - nInIdx === 1) {
			nMod3 = 0;
			while (nMod3 < 3 && nOutIdx < nOutLen) {
				taBytes[nOutIdx] = (nUint24 >>> ((16 >>> nMod3) & 24)) & 255;
				nMod3++;
				nOutIdx++;
			}
			nUint24 = 0;
		}
	}

	return taBytes;
}
