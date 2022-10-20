<template>
	<div class="hero min-h-screen bg-base-200">
		<div class="hero-content text-center">
			<div
				class="
					max-w-md
					flex
					justify-center
					flex-col
					items-center
					align-items-center
				"
			>
				<img
					src="~/assets/permamail-01.png"
					class="w-40 d-flex justify-self-center"
				/>
				<h1 class="text-5xl font-bold">PermaMail</h1>
				<p class="py-6">
					Tired of monopolized email/messaging services? Already shared phone,
					bank card and location with another app just to send message? Not sure
					through which ad networks your messages go? Stop it! PermaMail is your
					decentralized inbox that can replace monopolized and centralized email
					for you. It's time to value privacy!
				</p>
				<NuxtLink class="btn btn-primary" to="/app/lobby"> Get Started </NuxtLink>
			</div>
		</div>
		<ConnectWallet />
	</div>
</template>
<script setup>
// This will also work in `<script setup>`

definePageMeta({
	layout: "intro",
});
</script>