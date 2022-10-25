import b64hash from "./b64hash";
import base64DecToArr from "./base64dectoarr";
import base64arraybuffer from "@/utils/b64arraybuffer";
export default async function parseConversationInit(
	conversation,
	ardb,
	arweave
) {
	let messages = [];
	messages.push({
		author: conversation.creator,
		content: makeMessageCode(conversation.initMessage),
	});
	let replies = (
		await ardb
			.search("transactions")
			.from(conversation.members.map((member) => member.addr))
			.tags([
				{
					name: "Protocol-Name",
					values: ["PermaMailv0"],
				},
				{
					name: "PM-Type",
					values: ["Conversation-Message"],
				},
				{ name: "Conversation-ID", values: [conversation.id] },
			])
			.exclude("anchor")
			.findAll()
	).reverse();
	for await (let reply of replies) {
		let encryptedMessage = await fetch(`https://arweave.net/${reply.id}`).then(
			(res) => res.text()
		);

		let decryptedMessage;
		try {
			decryptedMessage = new TextDecoder().decode(
				await crypto.subtle.decrypt(
					{
						name: "AES-GCM",
						iv: base64DecToArr(encryptedMessage.split(":")[1]), //The initialization vector you used to encrypt
						//The addtionalData you used to encrypt (if any)
						//The tagLength you used to encrypt (if any)
					},
					conversation.communicationKey,
					base64DecToArr(encryptedMessage.split(":")[0])
				)
			);
		} catch (e) {
			console.log(e);
			continue;
		}

		messages.push({
			author: conversation.members.find(
				(member) => member.addr == reply.owner.address
			),
			content: makeMessageCode(decryptedMessage),
		});
	}
	console.log("replies", replies);
	return messages;
}
function makeMessageCode(text) {
	return (
		`<html><head><meta charset="utf8"/></head><body>` +
		text +
		`
   
    <style>
    body{
        height:max-content;
        display:inline-block;
        position:relative;
        margin-top:0;
        margin-bottom:0;
        
    }
    html{
        height:max-content;
        margin:0;
        padding:0
      
    }
    *{font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    color:#d4d4d4
}
    </style></body></html>`
	);
}
