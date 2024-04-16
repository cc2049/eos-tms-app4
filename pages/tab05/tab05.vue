<template>
	<view class="mine">
		<EosTabBar></EosTabBar>
		<!-- 个人中心页面 -->
		<view class="gradualEnveloping" :style="[myStyle]">
			<view class="content">
				<view class="personal disflex justify-sb">
					<view class="disflex">
						<view class="mr-20 u-avatar">
							<u-avatar :src="userStore.AVATAR" v-if="userStore.AVATAR"></u-avatar>
							<u-avatar :text="userStore.VNAME?.substr(0, 1)" v-else bg-color="#307CFF"
								style="color:#fff" class="text-white"></u-avatar>
						</view>
						<view>
							<view class="disflex">
								<view class="username mr-20">{{ userStore.VNAME }} </view>
								<view class="tag" :class="{red:userStore.CERTIFICATIONSTATUS!=1}">
									{{ authStatus[userStore.CERTIFICATIONSTATUS] }}
								</view>
							</view>
							<view class="disflex mt-10" v-if="userStore.COMPANYNAME">
								<view class="mr-10">
									<image src="https://eosine.cn/eos_tms/static/mine/company.png" mode="" class="companyImg"></image>
								</view>
								<view class="company">{{ userStore.COMPANYNAME }}</view>
							</view>
						</view>
					</view>
				</view>
				<image src="https://eosine.cn/eos_tms/static/mine/approve.png" mode="widthFix" style="width: 100%;margin-bottom: 4rpx;"
					v-if="userStore.CERTIFICATIONSTATUS==0"></image>
				<view class="content-item">
					<view class="content-commonTitle">常用功能</view>
					<view class="commonly disflex justify-sb">
						<view class="commonly-item" v-for="item in oftenList" :key="item.BILLNO" @click="goPage(item)">
							<view>
								<image v-if=" item.META.VIMG" :src="'https://eosine.cn/eos_tms/static/mine/'+ item.META.VIMG " mode=""
									class="commonly-img"></image>
							</view>
							<view class="commonly-text">{{ item.NAME }}</view>
						</view>
					</view>
				</view>

				<view class="content-item property" v-if="wallet">
					<view class="property-top">
						<view class="property-title mb-30">我的资产 <image src="https://eosine.cn/eos_tms/static/mine/eye.png" mode=""
								class="property-img"></image>
						</view>
						<view class="disflex justify-sb">
							<div class="property-number">****</div>
							<div class="property-btn">去提现</div>
						</view>
						<view class="property-explain">可提取余额(元)</view>
					</view>
					<view class="property-fotter">
						<view class="disflex">
							<view>绑定银行卡</view>
							<view class="property-fotter-number">*</view>
							<view>张</view>
						</view>
						<view>查看详情></view>
					</view>
				</view>
			</view>
		</view>

		<view class="content">
			<image src="https://eosine.cn/eos_tms/static/mine/bg.png" mode="widthFix" style="width: 100%;margin-bottom: 4rpx;"></image>
			<view class="content-item">
				<view class="content-commonTitle">更多服务</view>
				<view class="moreServe">
					<view v-for="item in moreServeList" :key="item.BILLLNO" @click="goPage(item)">
						<view>
							<image v-if="item.META.VIMG" :src="'https://eosine.cn/eos_tms/static/mine/'+ item.META.VIMG " mode=""
								class="moreServe-img"></image>
						</view>
						<view class="moreServe-text">{{ item.NAME }}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		onLoad,
		onShow,
		onPullDownRefresh
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		computed,
		watch,
		getCurrentInstance
	} from 'vue';
	import {
		goPage
	} from '@/common'
	import {
		getMyMenu,
		getUrlParams
	} from '@/common'

	const {
		appContext: {
			config: {
				globalProperties: global
			}
		}
	} = getCurrentInstance();

	import useUserStore from '@/store/user.js'
	import useTabStore from '@/store/menus.js'

	const userStore = computed(() => useUserStore().userInfo)
	const menuList = computed(() => useTabStore().tab05)
	const personalConfig = ref(null)
	const oftenList = ref([]);
	const moreServeList = ref([])
	const wallet = ref(null)
	const showModel = ref(false)

	const authStatus = {
		0: '未认证',
		1: '已认证',
		2: '审核中',
		3: '驳回'
	}
	
	/* 设置导航栏高度
	*  statusBarHeight 状态栏
	*/
	// #ifndef H5
	let res = uni.getSystemInfoSync();
	// #endif
	
	// #ifdef MP-WEIXIN
	let buttonInfo = uni.getMenuButtonBoundingClientRect();
	let navBarHeight = (buttonInfo.top - res.statusBarHeight) * 2 + buttonInfo.height;
	let _navBarHeight = navBarHeight * 750 / wx.getSystemInfoSync().windowWidth;//导航栏高度
	let statusBarHeight = res.statusBarHeight * 750 / wx.getSystemInfoSync().windowWidth;//状态栏高度
	const  myStyle ={ "padding-top": parseInt( _navBarHeight )+'px' };
	// #endif
	
	// #ifdef APP-PLUS
	const  myStyle ={ "padding-top": res.statusBarHeight + 10 +'px' };
	// #endif

	onLoad(() => {
		let conifg = menuList.value
		if (!conifg) return;
		oftenList.value = getMyMenu(conifg.CHILDREN, 'OFTEN')[0]?.CHILDREN;
		moreServeList.value = getMyMenu(conifg.CHILDREN, 'EXTEN')[0] ? getMyMenu(conifg.CHILDREN, 'EXTEN')[0].CHILDREN : getMyMenu(conifg.CHILDREN, 'APPHZGONG')[0]?.CHILDREN;
		wallet.value = getMyMenu(conifg.CHILDREN, 'WALLET')[0]?.CHILDREN;
	})



	const getOut = () => {
		uni.reLaunch({
			url: '/pages/login/login?by=5'
		})
	}

	const switchRole = () => {
		uni.getStorage({
			key: 'userInfoCache',
			success: function(res) {
				let cacheData = JSON.parse(res.data)
				if (res.data && cacheData.userInfo.USERNAME) {
					let uutype = cacheData.userInfo.USERTYPE == 1 ? 2 : 1;
					uni.reLaunch({
						url: '/pages/index/login?by=0&ut=' + uutype
					})
				} else {
					uni.reLaunch({
						url: '/pages/login/login?by=5'
					})
				}
			}
		})
	}


	const getUserInfo = () => {
		global.$u.api.getUserInfo().then(res => {
			useUserStore().setUserinfo(res.RESULT)
		})
	}

	// 下拉刷新
	onPullDownRefresh(() => {
		getUserInfo()
		setTimeout(function() {
			uni.stopPullDownRefresh();
		}, 500);
	})

	onShow(() => {
		getUserInfo()
	})
</script>


<style>
	page{
		background-color: #f3f3f3!important;
	}
</style>

<style lang="scss" scoped>
	
	.mine {
		padding-bottom: 70px;
		.gradualEnveloping{
			// padding-top: 150rpx;
		}
		.personal {
			margin-bottom: 38rpx;

			.username {
				font-size: 40rpx;
				font-weight: bold;
				color: #151515;
			}

			.tag {
				background: rgba(34, 106, 250, 0.25);
				border-radius: 28rpx;
				padding: 8rpx 16rpx;
				font-size: 22rpx;
				font-weight: 500;
				color: #226AFA;

				&.red {
					color: #f93a4a;
					background: #FFEDEA;
				}
			}

			.company {
				font-size: 26rpx;
				font-weight: 500;
				color: rgba(21, 21, 21, 0.82);
			}

			.companyImg {
				width: 24rpx;
				height: 24rpx;
			}

			&-img {
				width: 24rpx;
				height: 28rpx;
			}

			&-cut {
				width: 120rpx;
				height: 52rpx;
				background: #226AFA;
				border-radius: 26rpx 0 0 26rpx;
				text-align: center;
				font-size: 22rpx;
				font-weight: 500;
				color: #FFFFFF;
				transform: translateX(16rpx);
			}
		}

		.commonly {
			font-size: 23rpx;
			font-weight: 500;
			color: #151515;
			margin-top: 30rpx;
			text-align: center;

			&-img {
				width: 60rpx;
				height: 60rpx;
			}

			&-text {
				margin-top: 10rpx;
			}
		}

		.property {
			// background-color: #2A77FB;
			color: #FFFFFF;
			overflow: hidden;
			// padding: 24rpx 0 0 0;
			padding: 0;

			&-title {
				font-size: 27rpx;
				font-weight: 500;
			}

			&-number {
				font-size: 52rpx;
				font-weight: bold;
			}

			&-btn {
				width: 137rpx;
				height: 48rpx;
				background: #FFFFFF;
				box-shadow: 0rpx 0rpx 10rpx 0rpx rgba(75, 134, 234, 0.8);
				background: linear-gradient(to right, #EAF3FF, #CFE4FE);
				border-radius: 24rpx;
				font-size: 24rpx;
				font-weight: 500;
				color: #174AA2;
				text-align: center;
				line-height: 48rpx;
			}

			&-explain {
				font-size: 24rpx;
				font-weight: 400;
				color: rgba(255, 255, 255, 0.8);
				margin-top: 15rpx;
				// margin-bottom: 25rpx;
				padding-bottom: 25rpx;
			}

			&-top {
				padding: 24rpx 30rpx 0 30rpx;
				
				background-color: #337ff7;
				background-size: cover;
			}

			&-fotter {
				background-color: #206EEE;
				padding: 28rpx 30rpx;
				font-size: 24rpx;
				font-weight: 400;
				color: #FFFFFF;
				display: flex;
				align-items: center;
				justify-content: space-between;

				&-number {
					font-size: 32rpx;
					font-weight: bold;
					margin: 0 6rpx 0 10rpx;
				}
			}

			&-img {
				width: 24rpx;
				height: 18rpx;
			}
		}

		.moreServe {
			text-align: center;
			display: grid;
			grid-template-columns: 25% 25% 25% 25%;
			// grid-column-gap: 20px;
			grid-row-gap: 35rpx;

			&-text {
				margin-top: 22rpx;
			}

			&-img {
				width: 54rpx;
				height: 54rpx;
			}
		}

		.logout {
			font-size: 26rpx;
			font-family: PingFang SC;
			font-weight: 500;
			color: #151515;
			padding: 30rpx;
		}

	}
	
	:deep(.u-avatar){
		color: #FFFFFF !important;
	}
</style>