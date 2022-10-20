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
        <div class="flex flex-col w-full lg:w-1/2 h-full ">
            <iframe sandbox :src="message"
                class="overflow-auto h-96 w-full  rounded-t-lg bg-base-300 mt-2 mb-0 rounded-br-lg" />
            <div :data-tip="conversation.creator.addr"
                class="tooltip b-all-without-content tooltip-primary bg-base-300  hover:bg-base-100 transition-all  rounded-t-0 rounded-b-lg text-base-content w-max p-2 text-center flex flex-row justify-between items-center">
                <div class="avatar h-full w-[2rem] mr-2">
                    <div class="w-full rounded-full">
                        <img :src="conversation.creator.profile.avatarURL" />
                    </div>
                </div> {{conversation.creator.handle}}

                <div class="ml-2 badge badge-info h-full" v-if="conversation.creator.addr==myAddress">
                    You
                </div>
            </div>
        </div>

    </div>
    <div class="flex flex-col justify-center items-center pb-4 h-full" v-else>
        <article class="prose prose-stale text-center flex flex-col items-center justify-center">
            <h1 class="w-full text-center p-2 ">Error 404!</h1>
            <p class="text-center">Conversation with id {{$route.params.id}} wasn't found or is invalid!</p>

        </article>
    </div>
</template>
<script setup>
import { ArweaveWebWallet } from "arweave-wallet-connector";
import Account from "arweave-account";
import Arweave from 'arweave';
import ArDB from 'ardb';
import base64arraybuffer from "@/utils/b64arraybuffer"
import parseConversationInit from "@/utils/parseConversationInit"
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
let notFound = ref(false);
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
    conversationInitMeta = await ardb.search("transaction").id(route.params.id).findOne()

} catch (e) {
    notFound.value = true
    console.log(e)

}
let conversation = ref(false)
let conversationDataRaw = await arweave.api.get(route.params.id)
console.log(conversationDataRaw)
if (conversationDataRaw.status != 200 && conversationDataRaw.status != 302 && conversationDataRaw.status != 202) {
    notFound.value = true
} else {
    conversation.value = await parseConversationInit(conversationDataRaw.data, conversationInitMeta, accountTools, arweave)
}
if (!conversation.value) {
    notFound.value = true
}

let message = ref(`data:text/html;base64,${await base64arraybuffer(new TextEncoder().encode(conversation.value.initMessage + `
    <meta charset="utf8"/>
    <style>
    *{font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    color:#d4d4d4
}
    </style>`))}`)
console.log(conversation.value)
</script>