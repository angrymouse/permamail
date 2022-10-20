<template>
	<aside class="w-64 h-full" aria-label="Sidebar">
		<div class="overflow-y-auto py-4 px-3 bg-base-300 h-full flex flex-col justify-between">
			<ul class="space-y-2">
				<li>
					<NuxtLink to="/app/profile" class="
							flex
							items-center
							p-2
							text-base
							font-normal
							text-gray-900
							rounded-lg
							dark:text-white
						hover:bg-neutral-focus
						">
						<label tabindex="0" class="avatar">
							<div class="w-10 mask">
								<img :src="account.profile.avatarURL" />
							</div>
						</label>
						<label tabindex="0" class="mx-2">
							<div class="w-10 mask">
								{{ account.handle }}
							</div>
						</label>
					</NuxtLink>
				</li>
				<li>
					<NuxtLink to="/app/lobby" class="
							flex
							items-center
							p-2
							text-base
							font-normal
							text-gray-900
							rounded-lg
							dark:text-white
							hover:bg-gray-100
							dark:hover:bg-gray-700
						">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
							stroke="currentColor" class="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round"
								d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
						</svg>

						<span class="flex-1 ml-3 whitespace-nowrap">Lobby</span>

					</NuxtLink>
				</li>
				<li>
					<NuxtLink to="/app/conversations" class="
							flex
							items-center
							p-2
							text-base
							font-normal
							text-gray-900
							rounded-lg
							dark:text-white
							hover:bg-gray-100
							dark:hover:bg-gray-700
						">
						<svg aria-hidden="true" class="
								flex-shrink-0
								w-6
								h-6
								text-gray-500
								transition
								duration-75
								dark:text-gray-400
								group-hover:text-gray-900
								dark:group-hover:text-white
							" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z">
							</path>
							<path
								d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z">
							</path>
						</svg>
						<span class="flex-1 ml-3 whitespace-nowrap">Inbox</span>
						<span class="
								inline-flex
								justify-center
								items-center
								p-3
								ml-3
								w-3
								h-3
								text-sm
								font-medium
								text-blue-600
								bg-blue-200
								rounded-full
								dark:bg-blue-900 dark:text-blue-200
							">{{conversations.length}}</span>
					</NuxtLink>
				</li>

			</ul>
			<ul class=" 
					pt-4
					mt-4
					space-y-2
					border-t border-gray-200
					dark:border-gray-700
				">
				<li>
					<NuxtLink to="/app/compose" class="
                            bg-primary
							flex
							items-center
							p-2
							text-base
							font-normal
						    w-full
							rounded-lg
							transition
							duration-75
							text-white
                            hover:bg-primary-focus
							group
						">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
							stroke="currentColor" class="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round"
								d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
						</svg>
						<span class="ml-3">New conversation</span>
					</NuxtLink>
				</li>
				<li>
					<textarea readonly class="
                        textarea
							
							break-all
							
							
							
							readonly
							w-full
							textarea-bordered
							resize-none
							group
						">{{walletAddress}}</textarea>
				</li>
				<li>
					<button href="#" class="
							flex
							items-center
							p-2
							text-base
							font-normal
						w-full
							rounded-lg
							transition
							duration-75
							text-white
                            hover:bg-accent
							group
						" @click="copyAddress">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
							stroke="currentColor" class="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round"
								d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
						</svg><span class="ml-3">Copy</span>
					</button>
				</li>
			</ul>
		</div>
	</aside>
</template>
<script setup>
let account = useState("account", () => null);
let wallet = useState("wallet", () => null);
let ardb = useState("ardb", () => null);
let conversations = useState("conversations", () => ([]))
// setInterval(() => {
// 	console.log(conversations.value)
// },2000)

let walletAddress = ref(await wallet.value.getActiveAddress())
async function copyAddress() {
	navigator.clipboard.writeText(walletAddress.value)
}
</script>
