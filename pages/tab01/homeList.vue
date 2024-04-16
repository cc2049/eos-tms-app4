<template>
	<view class="homeList ">
		<view class="disflex justify-sb tabBlock">
			<view class="tab" v-if="props.MODULEID">
				<view class="tab-btn" v-for="(btn,index) in listMAINTABLE" :key="index" :class="chooseTab == btn.BILLNO ?'active':''"
					@click="clickTab(btn,index)">{{btn.VNAME}}
				</view>
			</view>

			<view class="tab" v-else>
				<view class="tab-btn" v-for="(btn,index) in listMAINTABLE" :key="index" :class="chooseTab == btn.ACTION ?'active':''"
					@click="clickTab1(btn,index)">{{btn.NAME}}
				</view>
			</view>

			<image src="https://eosine.cn/eos_tms/static/table/ffgl.png" mode="" class="filterIcon" @click="clickFilter"></image>
	
		</view>
		<view class="centent">
			<tms-app-list v-if="tableData.length>0" :showCOLUMNS="showCOLUMNS" :allCOLUMNS="allCOLUMNS"
				:tableData="tableData" :btnList="showButton" @clickBtn="clickBtn" @clickAlone="clickAlone" />

			<view class="nodata"> 暂无数据 </view>
		</view>
		<u-modal v-model="showModel" show-cancel-button @confirm="confirmModel" :async-close="true"
			:content="modelContent">
		</u-modal>

		<u-popup v-model="showFiltrate" mode="bottom">
			<view class="filtratePop">
				<view class="filtratePop-top">
					<tms-app-form ref="mFormRef" :config="mConfig" v-model="queryForm" />
				</view>
				<view class="filtratePop-footer">
					<u-button type="primary" class="filtratePop-btn mr-20" @click="resetPopup">重置</u-button>
					<u-button type="primary" class="filtratePop-btn" @click="search">查询</u-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script setup>
	import {
		onLoad,
		onShow,
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		computed,
		watch,
		getCurrentInstance,
		onMounted
	} from 'vue';

	import {
		getForm,
		getShowCol,
		getFormValue
	} from '@/common/form.js'



	import useUserStore from '@/store/user.js'
	const userStore = computed(() => useUserStore().userInfo)

	import {
		goPage,
		getMyMenu
	} from '@/common'

	const {
		appContext: {
			config: {
				globalProperties: global
			}
		}
	} = getCurrentInstance();


	const props = defineProps({
		MODULEID: String,
		PAGEID: String,
		operationalMotion: String,
		mentList: Array,
	})
	
	const Location =ref();
	
	

	watch(() => props.operationalMotion, (val) => {
		if (val == 'onPullDownRefresh') {
			pageInfo.currentPage = 1
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000);
			queryList()
		} else if (val == 'onReachBottom') {
			if (pageInfo.currentPage > pageInfo.totalPages) {
				return global.$_showToast('没有更多数据了。')
			}
			queryList()
		}
		uni.$emit('clearOperationalMotion')

	}, {
		immediate: true,
	});



	const menuActiveMODULEID = ref(null)
	const menuActivePAGEID = ref(null)
	const LAT = ref('0')
	const LON = ref('0')

	onMounted(() => {
		if (props.MODULEID) {
			getListConfig()
		} else if(props.mentList.length) {
			console.log(props.mentList);
			listMAINTABLE.value = props.mentList
			menuActiveMODULEID.value = listMAINTABLE.value[0].BILLNO
			menuActivePAGEID.value = listMAINTABLE.value[0].ACTION
			getListConfig()
		}
		uni.getLocation({
			type: "gcj02",
			geocode: true,
			success: res => {
				const {latitude,longitude} = res
				LAT.value = latitude
				LON.value = longitude
			},
			fail: (err) => {
				console.log("address:", "-----" , err )
			},
		});
	})


	const commonData = ref({})
	const showCOLUMNS = ref([])
	const allCOLUMNS = ref([])
	const showButton = ref([])
	const allButton = ref([])
	const SLOTCFG = ref(null)
	const QUERY = ref([])
	const mConfig = ref([])

	const queryForm = ref({})
	const queryForm1 = ref({})
	const pageCode = ref(null)

	const pageInfo = reactive({
		currentPage: 1,
		pageSize: 10,
		totalResult: 0,
		sortName: "",
		sortOrder: "",
	});
	const chooseTab = ref('')

	const listConfig = ref({})

	const listMAINTABLE = ref([])
	const getListConfig = () => {
		let data = {
			MODULEID: props.MODULEID || menuActiveMODULEID.value,
			PAGEID: props.PAGEID || menuActivePAGEID.value,
		}
		uni.showLoading({
			title: '加载中...',
			mask: true
		})

		global.$u.api.getConifg(data).then(res => {
			uni.hideLoading()
			const {
				COLUMNS,
				BUTTON,
				SLOTCFG,
				QUERY,
				MAINTABLE,
				SUBTABLE,
				PAGES,
				VCODE
			} = res.RESULT
			if (props.MODULEID) {
				pageCode.value = VCODE
				listMAINTABLE.value = MAINTABLE
				if (listMAINTABLE.value.length > 0) {
					clickTab(listMAINTABLE.value[0])
				} else {
					clickTab(res.RESULT)
				}
			} else {
				clickTab(res.RESULT)
			}
		})

	}

	const listUrl = ref(null)
	const totalData = ref(0)
	const tableData = ref([])
	const tabsIndex = ref(0)

	const clickTab1 = (btn, index = 0) => {
		menuActiveMODULEID.value = listMAINTABLE.value[index].BILLNO
		menuActivePAGEID.value = listMAINTABLE.value[index].ACTION
		getListConfig()
	}

	const clickTab = (btn, index = 0) => {
		const {
			BILLNO,
			COLUMNS,
			BUTTON,
			SLOTCFG,
			QUERY,
			MAINTABLE,
			SUBTABLE,
			PAGES,
			ACTION
		} = btn

		chooseTab.value = BILLNO
		showCOLUMNS.value = getShowCol(COLUMNS)
		allCOLUMNS.value = COLUMNS
		showButton.value = getShowCol(BUTTON)
		allButton.value = BUTTON
		mConfig.value = QUERY

		listUrl.value = SLOTCFG
		queryForm.value = getFormValue(QUERY)
		queryForm1.value = getFormValue(QUERY)

		pageInfo.currentPage = 1

		tableData.value = []

		tabsIndex.value = index

		queryList()

	}
	const queryList = (flag = false) => {
		uni.showLoading({
			title: '加载中...',
			mask: true
		})
		console.log(queryForm.value)
		let data = {
			MODULEID: props.MODULEID || menuActiveMODULEID.value,
			PAGEID: chooseTab.value || menuActivePAGEID.value,
			PAGENUM: pageInfo.currentPage,
			PAGESIZE: pageInfo.pageSize,
			SORTNAME: pageInfo.sortName,
			REVERSE: pageInfo.sortOrder,
			PARENTPAGE: "",
			BILLSTATUS: tabsIndex.value == 1 ? '3' : '2',
			LAT:LAT.value,
			LON:LON.value,
			...queryForm.value
		};
		global.$axios(listUrl.value, data, 'POST', true).then(res => {
			uni.hideLoading()
			uni.stopPullDownRefresh()
			let {
				TOTAL,
				RECORDS,
				TOTALDATA,
				PAGES,
			} = res.RESULT;
			if (pageInfo.currentPage == 1) {
				tableData.value = []
				tableData.value = RECORDS
			} else {
				tableData.value = [...tableData.value, ...RECORDS]
			}
			if (pageInfo.currentPage <= PAGES) {
				pageInfo.currentPage += 1
			}
			totalData.value = TOTALDATA ? JSON.parse(TOTALDATA) : null;
			pageInfo.totalResult = TOTAL
			pageInfo.totalPages = PAGES 

		})
	}

	const showFiltrate = ref(false)
	const resetPopup = () => {
		pageInfo.currentPage = 1
		queryForm.value = JSON.parse(JSON.stringify(queryForm1.value))
		queryList(true)
	}
	const search = () => {
		pageInfo.currentPage = 1
		showFiltrate.value = false
		if(LAT.value == '0' || LON.value == '0'){
			uni.getLocation({
				type: "gcj02",
				geocode: true, 
				success: res => {
					const {latitude,longitude} = res
					LAT.value = latitude
					LON.value = longitude
					queryList()
				},
				fail: (err) => {
					console.log("address:", "-----" , err )
					queryList()
				},
			});
		}else{
			queryList()
		}
		
		
	}
	const clickFilter = () => {
		showFiltrate.value = true
	}

	const modelContent = ref('')
	const showModel = ref(false)
	const saveDataModel = ref({})
	const clickBtn = (btn, row) => {
		const {
			VTYPE,
			ACTIONADDRESS,
			VNAME,
			ACTION,
			BILLNO,
			PK_PAGE,
			PAGEPATH,
			APPLETOTHER
		} = btn
		uni.$off("reload")
		uni.$once('reload', () => {
			getApp().globalData.activeMenuID = {

				MODULEID: props.MODULEID || menuActiveMODULEID.value,
				PAGEID: chooseTab.value,
			}
			pageInfo.currentPage = 1
			queryList()
		})
		switch (VTYPE) {
			case "1": 
				getApp().globalData.activeMenuID = {
					PAGEID: PK_PAGE,
					MODULEID: props.MODULEID || menuActiveMODULEID.value
				}
				let path = ''
				if (ACTION == "ADD") {
					path = `/pages/common/form/form?title=新增${pageTitle.value}`
				} else if (ACTION == "DTL") {
					path = (APPLETOTHER?APPLETOTHER:PAGEPATH ? PAGEPATH : '/pages/common/detail/detail') +
						`?BILLNO=${row.BILLNO}&url=${ACTIONADDRESS}`
				} else if (ACTION == "EDIT") {
					path = `/pages/common/form/form?isEdit=1&BILLNO=${row.BILLNO}&title=编辑${pageTitle.value}`
				} else {
					path = ACTIONADDRESS + `?BILLNO=${row.BILLNO}`
				}
				console.log('path', path);
				return uni.navigateTo({
					url: path
				})
				break;
			case "3":
				let content = `您确定要${VNAME}(${row.BILLNO})吗？`;
				modelContent.value = content
				showModel.value = true
				saveDataModel.value = {
					btn: btn,
					row
				}
				break;
			default:

				break;
		}
	}

	const confirmModel = () => {
		const url = saveDataModel.value.btn.ACTIONADDRESS
		let data = null
		if (saveDataModel.value.NODE) {
			data = {
				NODE: saveDataModel.value.NODE,
				BILLNO: saveDataModel.value.row.BILLNO
			}
		}
		else {
			data = [saveDataModel.value.row.BILLNO]
		}
		global.$axios(url, data, 'POST').then(res => {
			showModel.value = false
			global.$_showToast(res.MESSAGE || '提交成功')
			setTimeout(() => {
				pageInfo.currentPage = 1
				queryList()
			}, 2000)
		}).catch(err => {
			showModel.value = false
		})
	}


	const clickAlone = (row) => {
		let btnList = allButton.value.filter(ele => ele.ACTION == "DTL")
		if (btnList.length > 0) clickBtn(btnList[0], row)


	}
</script>

<style scoped lang="scss">
	.nodata {
		position: relative;
		top: 50rpx;
		text-align: center;
		color: #999;
	}

	.homeList {
		margin-top: 10rpx;
		background-color: #F3F3F3;

		.tabBlock {
			background-color: #F3F3F3;
			padding: 0rpx 16rpx 30rpx 16rpx;
			position: sticky;
			top: 0;
			z-index: 99;
		}

		.tab {
			display: flex;

			&::-webkit-scrollbar {
				display: none;
				width: 0;
				height: 0
			}

			&-btn {
				height: 38rpx;
				background: #EAEAEA;
				border-radius: 20rpx;
				font-size: 26rpx;
				font-weight: 500;
				color: #838EA4;
				margin-right: 20rpx;
				flex-shrink: 0;

				width: 91rpx;
				height: 46rpx;
				text-align: center;
				line-height: 46rpx;

				&.active {
					background: #FFFFFF;
					border: 1px solid #165FE4;
					border-radius: 20rpx;
					font-size: 26rpx;
					font-weight: bold;
					color: #1E64DF;

					position: relative;

					&:before {
						content: "";
						width: 0px;
						height: 0px;
						border-top: 14rpx solid #1E64DF;
						border-left: 14rpx solid transparent;
						border-right: 14rpx solid transparent;
						position: absolute;
						bottom: -14rpx;
						left: 30rpx;
					}

					&:after {
						content: "";
						width: 0px;
						height: 0px;
						border-top: 11rpx solid #FFFFFF;
						border-left: 11rpx solid transparent;
						border-right: 11rpx solid transparent;
						position: absolute;
						bottom: -11rpx;
						left: 33rpx;
					}
				}
			}

		}

		.filterIcon {
			width: 30rpx;
			height: 30rpx;
			margin-right: 20rpx;
		}
	}
</style>