<template>
	<view class="">
		<PageList :pageID="pageID"></PageList>
	</view>
</template>

<script setup>
	import { onLoad, onShow  } from '@dcloudio/uni-app'
	import { ref, reactive, computed, watch } from 'vue';
	
	import useTabStore from '@/store/menus.js'
	import useUserStore from '@/store/user.js'
	
	
	onLoad( option =>{
		uni.setNavigationBarTitle({
			title: option.title
		});
	})
</script>

<style>
</style>
