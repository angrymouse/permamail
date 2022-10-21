import b64hash from "./b64hash";
import base64DecToArr from "./base64dectoarr";

export default async function parseConversationInit(
	conversation,
	{ id, tags, owner },
	accountTools,
	arweave
) {
	if (init.split(";").length != 4) {
		return false;
	}
	let [keyHash, keyShares, encryptedTopic, encryptedInitMessage] =
		init.split(";");
	keyShares = keyShares.split(":");
	let decryptedKey;
	let topic;
	let initMessage;
	let members = [];
	for (let share of keyShares) {
		let decrypted;
		try {
			decrypted = await window.arweaveWallet.decrypt(base64DecToArr(share), {
				name: "RSA-OAEP",
			});
		} catch (e) {
			console.error(e);
			continue;
			return;
		}
		if ((await b64hash(decrypted)) == keyHash) {
			decryptedKey = await window.crypto.subtle.importKey(
				"jwk",
				{
					kty: "oct",
					k: new TextDecoder().decode(decrypted),
					alg: "A256GCM",
					ext: true,
				},
				{ name: "AES-GCM" },
				true,
				["encrypt", "decrypt"]
			);
		}
	}
	if (!decryptedKey) {
		return false;
	}
	if (encryptedTopic.split(":").length != 2) {
		return false;
	}
	if (encryptedInitMessage.split(":").length != 2) {
		return false;
	}
	try {
		topic = new TextDecoder().decode(
			await crypto.subtle.decrypt(
				{
					name: "AES-GCM",
					iv: base64DecToArr(encryptedTopic.split(":")[0]), //The initialization vector you used to encrypt
					//The addtionalData you used to encrypt (if any)
					//The tagLength you used to encrypt (if any)
				},
				decryptedKey,
				base64DecToArr(encryptedTopic.split(":")[1])
			)
		);
	} catch (e) {
		return false;
	}
	try {
		initMessage = new TextDecoder().decode(
			await crypto.subtle.decrypt(
				{
					name: "AES-GCM",
					iv: base64DecToArr(encryptedInitMessage.split(":")[0]), //The initialization vector you used to encrypt
					//The addtionalData you used to encrypt (if any)
					//The tagLength you used to encrypt (if any)
				},
				decryptedKey,
				base64DecToArr(encryptedInitMessage.split(":")[1])
			)
		);
	} catch (e) {
		return false;
	}
	members = await Promise.all(
		tags
			.filter((tag) => tag.name == "Member")
			.map(async (member) => await accountTools.get(member.value))
	);
	return {
		id,
		raw: init,
		topic,
		initMessage,
		members,
		communicationKey: decryptedKey,
		corrupted: false,
		creator: await accountTools.get(owner.address),
	};
}
