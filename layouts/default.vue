<template>
	<div class="h-screenminusnavbar" v-if="wallet&&account">
		<div class="navbar bg-neutral">
			<div class="flex-1">
				<img src="~/assets/permamail-01.png" class="w-16" />
				<a class="p-4 normal-case text-2xl"> PermaMail</a>
			</div>
			<div class="flex-none">
				<label tabindex="0" class="avatar">
					<div class="w-10 mask">
						<img :src="account.profile.avatarURL" />
					</div>
				</label>
				<div class="mx-2 flex justify-center items-center">
					{{ account.profile.handleName||account.handle }}
				</div>
			</div>
		</div>
		<div class="flex flex-row  justify-start align-stretch h-full w-full">
			<sidebar />
			<div class="flex w-screenminussidebar h-full flex-col justify-start align-start overflow-auto">
				<slot />
			</div>
		</div>
	</div>
	<div v-else class="h-full flex flex-row justify-center items-center">
		<connect-wallet :show="true" />
	</div>
</template>
<script setup>
import Account from "arweave-account";
// import { useRouter } from "nuxt";
let router = useRouter();
let wallet = useState("wallet", () => null);
let account = useState("account", () => null);
console.log(account.value)
// router.push("#connectWallet");
</script>
<style>
.h-screenminusnavbar {
	height: calc(100vh - 80px)
}

.w-screenminussidebar {
	width: calc(100vw - 16rem)
}
</style>