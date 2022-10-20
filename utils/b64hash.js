import base64_arraybuffer from "@/utils/base64arraybuffer";
export default async function b64hash(src) {
	if (typeof src == "string") {
		const utf8 = new TextEncoder().encode(src);
		const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
		return await base64_arraybuffer(hashBuffer);
	} else {
		const hashBuffer = await crypto.subtle.digest("SHA-256", src);
		return await base64_arraybuffer(hashBuffer);
	}
}
