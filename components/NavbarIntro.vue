<template>
	<div class="navbar bg-neutral">
		<div class="flex-1">
			<img src="~/assets/permamail-01.png" class="w-16" />
			<NuxtLink class="p-4 normal-case text-2xl" to="/"> PermaMail</NuxtLink>
		</div>
		<div class="flex-none">
			<ul class="menu menu-horizontal p-0">
				<li>
					<NuxtLink to="/app/lobby" class="btn btn-outline btn-accent"
						>Go to app</NuxtLink
					>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup>
</script>

<style>
</style>