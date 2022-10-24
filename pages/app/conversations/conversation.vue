<template>
    <div class="flex flex-col justify-start items-center pb-4 " v-if="!notFound">
        <article class="prose prose-stale text-center flex flex-col items-center ">
            <h1 class="w-full text-center p-2 ">{{conversation.topic}}</h1>
        </article>
        <div class="flex flex-row flex-wrap">



            <div v-for="member of conversation.members" :data-tip="member.addr" :key="member.addr"
                class="tooltip b-all-without-content tooltip-primary bg-base-300  hover:bg-base-100 transition-all rounded-full text-base-content w-max p-2 m-1 text-center flex flex-row justify-between items-center">
                <div class="avatar h-full w-[2rem] mr-2">
                    <div class="w-full rounded-full">
                        <img :src="member.profile.avatarURL" />
                    </div>
                </div> {{member.handle}}

                <div class="ml-2 badge badge-info h-full" v-if="member.addr==myAddress">
                    You
                </div>
            </div>


        </div>
        <div class="flex flex-col w-full lg:w-1/2 h-full " v-for="msg of messages">
            <iframe sandbox :src="msg.content"
                class="overflow-auto h-96 w-full  rounded-t-lg bg-base-300 mt-2 mb-0 rounded-br-lg" />
            <div :data-tip="msg.author.addr"
                class="tooltip b-all-without-content tooltip-primary bg-base-300  hover:bg-base-100 transition-all  rounded-t-0 rounded-b-lg text-base-content w-max p-2 text-center flex flex-row justify-between items-center">
                <div class="avatar h-full w-[2rem] mr-2">
                    <div class="w-full rounded-full">
                        <img :src="msg.author.profile.avatarURL" />
                    </div>
                </div> {{msg.author.handle}}

                <div class="ml-2 badge badge-info h-full" v-if="msg.author.addr==myAddress">
                    You
                </div>
            </div>
        </div>
        <div class="w-full lg:w-1/2 text-neutral-content my-4 ">
            <div class="items-center text-center w-full">
                <h2 class="font-bold text-lg mb-2">Write new message in this conversation</h2>

                <template v-if="!sendingMessage">
                    <QuillEditor v-model:content="replyingMessage" contentType="html" theme="snow" toolbar="essential"
                        class="w-full min-h-[12rem] " />
                    <div class="flex w-full flex-raw justify-end mt-4"><button
                            @click.prevent="sendMessageInConversation" class="btn btn-secondary">Send
                            message</button>
                    </div>
                </template>




            </div>
        </div>
    </div>
    <div class="flex flex-col justify-center items-center pb-4 h-full" v-else>
        <article class="prose prose-stale text-center flex flex-col items-center justify-center">
            <h1 class="w-full text-center p-2 ">Error 404!</h1>
            <p class="text-center">Conversation with id {{$route.query.id}} wasn't found or is invalid!</p>

        </article>
    </div>
</template>
<script setup>
import { ArweaveWebWallet } from "arweave-wallet-connector";
import Account from "arweave-account";
import Arweave from 'arweave';
import ArDB from 'ardb';
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import base64arraybuffer from "@/utils/b64arraybuffer"
import parseConversationInit from "@/utils/parseConversationInit"
import downloadConversationMessages from "@/utils/downloadConversationMessages"
const wallet = useState("wallet", () => null);
const route = useRoute()
const arweaveState = useState("arweave", () => Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 60000,
    logging: false,
}));

let arweave = arweaveState.value
const ardbState = useState("ardb", () => new ArDB(arweave.value));
let ardb = ardbState.value
let account = useState("account", () => null);
let conversations = useState("conversations", () => ([]))
let accountToolsState = useState("accountTools", () => new Account({
    cacheIsActivated: true,
    cacheSize: 100,
    cacheTime: 60,
}))
let replyingMessage = ref("")
let notFound = ref(false);
let sendingMessage = ref(false)
let conversationInfo = ref({})
let myAddress = ref(null)
onMounted(() => {
    nextTick(() => {
        setTimeout(async () => {
            myAddress.value = await window.arweaveWallet.getActiveAddress()

        }, 50)// It's not me dumb, it's ArConnect not resolving promise if page just loaded

    })

})
const accountTools = accountToolsState.value
let conversationInitMeta
try {
    conversationInitMeta = await ardb.search("transaction").id(route.query.id).findOne()

} catch (e) {
    notFound.value = true
    console.log(e)

}
let conversation = ref(false)
let conversationDataRaw = await arweave.api.get(route.query.id)
console.log(conversationDataRaw)
if (conversationDataRaw.status != 200 && conversationDataRaw.status != 302 && conversationDataRaw.status != 202) {
    notFound.value = true
} else {
    conversation.value = await parseConversationInit(conversationDataRaw.data, conversationInitMeta, accountTools, arweave)
}
if (!conversation.value) {
    notFound.value = true
}
let messages = ref([])
messages.value = await downloadConversationMessages(conversation.value, ardb, arweave)
setInterval(async () => {
    messages.value = await downloadConversationMessages(conversation.value, ardb, arweave)
}, 3000)

async function sendMessageInConversation() {
    if (replyingMessage.value.trim() == "") { return }
    sendingMessage.value = true
    let replyingMessageIv = new Uint8Array(16)
    await crypto.getRandomValues(replyingMessageIv)
    let transaction = await arweave.createTransaction({
        data: await base64arraybuffer(await crypto.subtle.encrypt({ name: "AES-GCM", iv: replyingMessageIv }, conversation.value.communicationKey, new TextEncoder().encode(replyingMessage.value))) + ":" + await base64arraybuffer(replyingMessageIv),
    })
    transaction.addTag("Protocol-Name", "PermaMailv0")
    transaction.addTag("PM-Type", "Conversation-Message")
    transaction.addTag("Conversation-ID", conversation.value.id)
    let id = null;
    try {
        id = (await window.arweaveWallet.dispatch(transaction)).id
    } catch (e) {
        console.log("ERROR DURING DISPATCH", e)
    }
    console.log("id", id)
    let check = setInterval(async () => {
        let status = await fetch(`https://arweave.net/${id}`).then(res => res.text())
        if (status != "Not found") {
            clearInterval(check)
            replyingMessage.value = ""
            sendingMessage.value = false;

        }
    }, 3000)
}
// console.log(conversation.value)
</script>