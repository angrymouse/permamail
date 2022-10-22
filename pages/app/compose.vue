<template >
    <div v-if="!sending" class="flex flex-col justify-start items-center pb-4 ">
        <article class="prose prose-stale text-center flex flex-col items-center">
            <h1 class="w-full text-center p-2 ">Create new conversation</h1>

        </article>
        <div class="card w-1/2 bg-neutral text-neutral-content mb-4 mt-0">
            <div class="card-body items-center text-center">
                <h2 class="card-title mb-2">Provide conversation topic</h2>
                <input type="text" placeholder="Subject" class="input input-bordered w-full max-w-xs" v-model="topic" />
            </div>
        </div>
        <div class="card w-1/2 bg-neutral text-neutral-content">
            <div class="card-body items-center text-center">
                <h2 class="card-title">Add members</h2>
                <div class="flex flex-col justify-center items-stretch w-1/2 ">
                    <div v-for="member in members" :data-tip="member.addr" :key="member.addr"
                        class="tooltip b-all-without-content tooltip-primary bg-base-300  hover:bg-base-100 transition-all rounded-full text-base-content w-full p-2 m-1 text-center flex flex-row justify-between items-center">
                        <div class="avatar h-full w-[2rem]">
                            <div class="w-full rounded-full">
                                <img :src="member.profile.avatarURL" />
                            </div>
                        </div> {{member.handle}}
                        <svg v-if="member.addr!==myAddress" @click="removeMember(member.addr)"
                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-6 h-6 cursor-pointer hover:text-red-600 transition-colors">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div class="badge badge-info h-full" v-else>
                            You
                        </div>
                    </div>
                </div>
                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Arweave address or MetaWeave handle</span>
                    </label>
                    <label class="input-group">
                        <input type="text" placeholder="udOL7D... or @my#handle" class="input input-bordered"
                            v-model="currentAddingMember" />
                        <button class="btn btn-secondary" @click="addMemberByButton"><svg
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                            </svg>
                        </button>
                    </label>
                </div>
                <p>Tip! If you're bored, you can chat with developer of PermaMail, @angry#udOe38</p>
                <p class="bg-base-300 text-red-500 w-full rounded border border-red-700 p-1"
                    v-for="err of membersErrors">
                    {{err}}</p>

            </div>
        </div>
        <div class="card w-1/2 bg-neutral text-neutral-content my-4 ">
            <div class="card-body items-center text-center w-full">
                <h2 class="card-title mb-2">Write first message in this conversation</h2>

                <div class="w-full h-auto d-block text-center pb-8 mb-8">
                    <QuillEditor v-model:content="initMessage" contentType="html" theme="snow" toolbar="full"
                        class="w-full min-h-[12rem] " />

                </div>


            </div>
        </div>
        <button class="btn btn-secondary btn-lg" @click="createConversation">Start conversation</button>
    </div>
    <div v-else class="flex flex-col justify-center items-center h-full w-full">
        <article class="prose prose-stale text-center flex flex-col items-center">
            <h1 class="w-full text-center">Conversation is creating...</h1>
            <p class="w-full text-center"> It may take several minutes, don't close this tab.</p>
        </article>
    </div>
</template>
<script setup>
import Arweave from 'arweave';
import Account from 'arweave-account'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { decode } from 'punycode';
const accountTools = new Account();
let wallet = useState("wallet", () => null);
let account = useState("account", () => null);

let arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 60000,
    logging: false,
})
let currentAddingMember = ref("")
let membersErrors = ref([])
let myAddress = ref(null)
let members = ref([]);
let initMessage = ref("")
let topic = ref("")
let sending = ref(false)
let router = useRouter()

nextTick(() => {
    setTimeout(async () => {
        myAddress.value = await wallet.value.getActiveAddress()

        addMember(myAddress.value)
    }, 50)// It's not me dumb, it's ArConnect not resolving promise if page just loaded

})





function addMemberByButton() {
    addMember(currentAddingMember.value)
    currentAddingMember.value = ""
}
// console.log(myAddress)
// let members = ref([{ address: await wallet.value.getActiveAddress(), handle: account.value.handle }])
async function addMember(id) {
    console.log(id)
    if (!id) { return }
    membersErrors.value = []
    let address = null

    let acc = await accountTools.find(id.startsWith("@") ? id.slice(1) : id)
    console.log(acc)
    address = acc.addr ? acc.addr : id
    console.log("found", address)


    let pubkey;
    let profile
    try {
        console.log("|", address, myAddress.value)

        pubkey = (address === myAddress.value ? await wallet.value.getActivePublicKey() : await fetchPubkey(address))
        console.log("pubkey", pubkey, await wallet.value.getActivePublicKey(), await fetchPubkey(address))
        if (!pubkey) {
            membersErrors.value.push("Cannot fetch pubkey of " + id + "! You can add only addresses that already had submitted transactions to arweave network!")
        }

        profile = await accountTools.get(address)

        profile.pubkey = pubkey
        profile.importedPubkey = await importPubkey(pubkey)
    } catch (e) {
        console.log(e)
        membersErrors.value.push("Invalid address!")

    }
    if (!members.value.find(m => m.addr == profile.addr) && membersErrors.value.length == 0) {
        members.value.push(profile)
    }

}
const fetchPubkey = async address => {

    let txid = await arweave.wallets.getLastTransactionID(address)
    console.log(txid)
    if (txid === '') {
        return undefined
    }

    let tx = await arweave.transactions.get(txid)

    if (tx === undefined) {
        return undefined
    }
    return tx.owner
}
const importPubkey = async stringPubkey => {

    var keyData = {
        kty: 'RSA',
        e: 'AQAB',
        n: stringPubkey,
        alg: 'RSA-OAEP-256',
        ext: true
    }

    var algo = { name: 'RSA-OAEP', hash: { name: 'SHA-256' } }

    return await crypto.subtle.importKey('jwk', keyData, algo, true, ['encrypt'])
}
async function removeMember(addr) {
    members.value = members.value.filter(mem => mem.addr !== addr)
}
async function createConversation() {
    sending.value = true
    let conversationData = ""
    let encryptionKey = await crypto.subtle.generateKey({
        name: "AES-GCM",
        length: 256,

    }, true, ["encrypt", "decrypt"])
    let key = (await crypto.subtle.exportKey("jwk", encryptionKey)).k
    let keyHash = await b64hash(key)
    conversationData += keyHash + ";"
    let keyShares = []
    for (let member of [...members.value]) {
        let encryptedKey = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, member.importedPubkey, new TextEncoder().encode(key))
        keyShares.push(await base64_arraybuffer(encryptedKey))
    }
    conversationData += keyShares.join(":") + ";"

    let topicIv = new Uint8Array(16)
    await crypto.getRandomValues(topicIv)

    let encryptedTopic = await crypto.subtle.encrypt({ name: "AES-GCM", iv: topicIv }, encryptionKey, new TextEncoder().encode(topic.value))
    conversationData += await base64_arraybuffer(topicIv) + ":" + await base64_arraybuffer(encryptedTopic) + ";"

    let initMessageIv = new Uint8Array(16)
    await crypto.getRandomValues(initMessageIv)

    let encryptedInitMessage = await crypto.subtle.encrypt({ name: "AES-GCM", iv: initMessageIv }, encryptionKey, new TextEncoder().encode(initMessage.value))
    conversationData += await base64_arraybuffer(initMessageIv) + ":" + await base64_arraybuffer(encryptedInitMessage)
    let transaction = await arweave.createTransaction({
        data: conversationData,
    })
    transaction.addTag('Content-Type', 'text/plain');
    transaction.addTag('Protocol-Name', 'PermaMailv0');
    transaction.addTag("PM-Type", "Conversation-Init")
    for (let member of [...members.value]) {
        transaction.addTag("Member", member.addr)
    }
    let { id } = await wallet.value.dispatch(transaction)
    let check = setInterval(async () => {
        let status = await fetch(`https://arweave.net/${id}`).then(res => res.text())
        if (status != "Not found") {
            clearInterval(check)
            sending.value = false;
            router.push("/app/conversations/conversation?id=" + id)
        }
    }, 3000)
    // sending.value = false

}
async function b64hash(string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    return await base64_arraybuffer(hashBuffer)
}
const base64_arraybuffer = async (data) => {
    // Use a FileReader to generate a base64 data URI
    const base64url = await new Promise((r) => {
        const reader = new FileReader()
        reader.onload = () => r(reader.result)
        reader.readAsDataURL(new Blob([data]))
    })

    /*
    The result looks like 
    "data:application/octet-stream;base64,<your base64 data>", 
    so we split off the beginning:
    */
    return base64url.split(",", 2)[1]
}

</script>
<style>
.b-all-without-content::before,
.b-all-without-content:hover::before {
    word-break: break-all;
}
</style>