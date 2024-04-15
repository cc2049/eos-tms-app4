<template>
	<view class="nodata">
		<image src="https://eosine.cn/eos_tms/static/table/nodta.png" mode="" class="nodata-image"></image>
		<view class="tc" @click="clickText">{{text}}</view>
	</view>
</template>

<script setup name="noData">
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		computed,
		watch,
		getCurrentInstance
	} from 'vue';
	const {
		proxy
	} = getCurrentInstance();
	const props = defineProps({
		text: {
			type: String,
			default: '暂无数据',
		},
		showBtn:{
			type:Boolean,
			default: false,
		}
	})
	const clickText = ()=>{
		proxy.$emit("clickText");
	}
</script>

<style lang="scss" scoped>
	.nodata {
		position: fixed;
		z-index: 2;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		color: rgba(0, 0, 0, .7);
		font-size: 28rpx;

		&-image {
			width: 371rpx;
			height: 238rpx;
		}
	}
</style>