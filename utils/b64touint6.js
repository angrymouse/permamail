export default function b64ToUint6(nChr) {
	return nChr > 64 && nChr < 91
		? nChr - 65
		: nChr > 96 && nChr < 123
		? nChr - 71
		: nChr > 47 && nChr < 58
		? nChr + 4
		: nChr === 43
		? 62
		: nChr === 47
		? 63
		: 0;
}
