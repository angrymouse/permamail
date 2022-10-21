<template >

    <div class="flex flex-col justify-start items-center pb-4 ">
        <article class="prose prose-stale text-center flex flex-col items-center ">
            <h1 class="w-full text-center p-2 ">Conversations where you are participating:</h1>


        </article>

        <div class="rounded p-2 flex flex-col items-stretch justify-start bg-neutral lg:w-1/2 w-full mt-4">

            <div class="w-full flex flex-row bg-neutral-100 rounded-md p-2 my-2 bg-primary-content"
                v-for="conversation of conversations">
                <div class="avatar-group -space-x-6">
                    <div class="avatar " v-for="member of conversation.members">
                        <div class="w-12">
                            <img :src="member.profile.avatarURL" />
                        </div>
                    </div>

                </div>
                <NuxtLink :to="'/app/conversations/conversation/?id='+conversation.id"
                    class="h-full w-full text-center flex flex-row justify-start items-center ml-4 font-semibold text-lg">
                    {{conversation.topic}}</NuxtLink>
            </div>
        </div>
    </div>


</template>
<script setup>
let conversations = useState("conversations", () => ([]))
console.log(conversations.value)
</script>