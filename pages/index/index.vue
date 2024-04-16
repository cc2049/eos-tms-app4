<template>
	<view class="container">
		<!-- <uni-badge size="small" :text="100" absolute="rightBottom" type="primary">
			<button type="default">右下77</button>
		</uni-badge>
		<button @click="getAxiosData" class="text-blue">axios 案例</button>

		<uni-combox label="所在城市" :candidates="candidates" placeholder="请选择所在城市" v-model="city"></uni-combox>
		<uni-data-select v-model="value" :localdata="range" @change="change"></uni-data-select> -->
		
		<!-- <tab01 v-if="activeTab == 1 "  />
		<tab02 v-else-if="activeTab == 1" /> -->
		
		<button @click="goLogin"> 重新登录 </button>
		
		<EosTabBar></EosTabBar> 
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		watch,
		getCurrentInstance
	} from 'vue';
	const {
		appContext: {
			config: {
				globalProperties: global
			}
		}
	} = getCurrentInstance();

	const range = [{
			value: 0,
			text: "篮球"
		},
		{
			value: 1,
			text: "足球"
		},
		{
			value: 2,
			text: "游泳"
		},
	]

	const getAxiosData = () => {
		const url = '/oms/app/bidProject/getRushOrderCount'
		global.$axios({
			url,
			data: {},
		}).then(res => {
			const { RESULT } = res
			console.log(res);
		}).catch(err => {})
	}
	
	const goLogin =()=>{
		uni.clearStorage()
		uni.reLaunch({
			url: './login'
		})
	}
	
</script>

<style lang="scss">
	.container {
		padding: 20px;
		font-size: 14px;
		line-height: 24px;
	}

	.text-blue {
		color: $uni-warning;
	}
</style>