<template>
	<input type="checkbox" id="connectWallet" class="modal-toggle" :checked="show" />

	<div class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-3xl text-center">Select your arweave wallet</h3>
			<div class="py-4 flex justify-center">
				<!-- <div class="card card-compact m-2 w-1/3 bg-base-200" @click="connectArconnect">
					<figure>
						<img src="https://7qx7gbohuua3h7r32vf6ddrjoi7mkdmczz6cdtcq2e3dhdpavd3q.arweave.net/_C_zBcelAbP-O9VL4Y4pcj7FDYLOfCHMUNE2M43gqPc"
							alt="ArConnect" height="200" />
					</figure>
					<div class="card-body w-full flex bg-neutral">
						<h2 class="card-title w-full block text-center">ArConnect</h2>
					</div>
				 </div> -->
				<!-- ArConnect uses own encryption method, which is not normal RSA encryption and not compatible with most software -->
				<div class="card card-compact m-2 w-1/3 bg-base-200" @click="connectArweaveApp">
					<figure>
						<img src="https://yctstiqqys3b4j5qb55sxtn6airb6a56tlwxtkfi36of6cbg2a5a.arweave.net/wKcpohDEth4nsA97K82-AiIfA76a7XmoqN-cXwgm0Do"
							alt="Arweave.app" width="900" />
					</figure>
					<div class="card-body w-full flex bg-neutral">
						<h2 class="card-title w-full block text-center">Arweave.app</h2>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import { ArweaveWebWallet } from "arweave-wallet-connector";
import Account from "arweave-account";
import Arweave from 'arweave';
import ArDB from 'ardb';
import base64_arraybuffer from "@/utils/base64arraybuffer.js"
import base64DecToArr from "@/utils/base64dectoarr"
import b64hash from "@/utils/b64hash.js"
import parseConversationInit from "@/utils/parseConversationInit.js"
const props = defineProps(["show"]);

const show = ref(props.show || false);
const wallet = useState("wallet", () => null);

const arweave = useState("arweave", () => Arweave.init({
	host: 'arweave.net',
	port: 443,
	protocol: 'https',
	timeout: 60000,
	logging: false,
}));


const ardbState = useState("ardb", () => new ArDB(arweave.value));
let ardb = ardbState.value
let account = useState("account", () => null);
let conversations = useState("conversations", () => ([]))
let accountToolsState = useState("accountTools", () => new Account({
	cacheIsActivated: true,
	cacheSize: 100,
	cacheTime: 60,
}))
const accountTools = accountToolsState.value
async function connectArweaveApp() {
	let webwallet = new ArweaveWebWallet(
		{
			name: "PermaMail",
			logo: "https://kzkeritrjgkyldnitrmkjjccocmld2jgstizgx4fjmnra4yx3l2q.arweave.net/VlRIonFJlYWNqJxYpKRCcJix6SaU0ZNfhUsbEHMX2vU",
		},
		"arweave.app"
	);
	await webwallet.connect();
	let address = await webwallet.namespaces.arweaveWallet.getActiveAddress()
	account.value = await accountTools.get(address);
	wallet.value = webwallet.namespaces.arweaveWallet;
	// window.arweaveWallet = webwallet.namespaces.arweaveWallet
	// router.push("/app/lobby");
	conversationsLoader(address)
	setInterval(() => conversationsLoader(address), 10000)
}
async function connectArconnect() {
	window.arweaveWallet.connect([
		"ACCESS_ADDRESS",
		"ACCESS_PUBLIC_KEY",
		"SIGN_TRANSACTION",
		"ENCRYPT",
		"DECRYPT",
		"SIGNATURE",
		"DISPATCH",
	]);
	let address = await window.arweaveWallet.getActiveAddress()
	account.value = await accountTools.get(address);
	wallet.value = window.arweaveWallet;
	conversationsLoader(address)
	setInterval(() => conversationsLoader(address), 10000)
	// router.push("/app/lobby");
}
let lock = false
function conversationsLoader(address) {
	if (lock) { return }
	lock = true
	ardb.search('transactions').tags([{ name: 'Protocol-Name', values: ['PermaMailv0'] }, { name: "Member", values: [address] }, { name: "PM-Type", values: ["Conversation-Init"] }]).exclude("anchor").findAll().then(async c => {
		let differs = c.filter(conv => !conversations.value.find(co => co.id === conv.id))
		console.log(differs)
		await Promise.all(differs.map(async conversation => {
			let raw = await fetch(`https://arweave.net/${conversation.id}`).then(res => res.text())

			let parsed = await parseConversationInit(raw, conversation, accountTools, arweave.value)
			if (parsed) {
				conversations.value.push(parsed)
			} else { conversations.value.push({ id: conversation.id, corrupted: true }) }
		}))
		lock = false

	})

}



</script>