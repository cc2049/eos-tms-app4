<template>
	<view class="list">
		<view v-if="pageCode == 'subscriptionSource' && showQueryConfig.length == 0" class="mb-20 subscriptionSource">
			<customChooser :list="allLineList" value="BILLNO" :defaultValue="defaultValue"
				@change="clickCustomChooser" />
		</view>
		<view v-else-if="pageCode == 'HALL'" class="mb-20 subscriptionSource">
			<customChooser :list="allLineList" value="BILLNO" :defaultValue="defaultValue" label="VNAME" customLabelHall
				@change="clickCustomChooserHALL" />
		</view>
		<view class="myCar" :class="pageCode == 'subscriptionSource'?'myCarFooter':''">
			<filterSearch :config="queryConfig" :key="queryConfig" @resetPopup="resetPopup" @search="search"
				v-if="pageCode != 'subscriptionSource' && pageCode != 'HALL' || (pageCode == 'subscriptionSource' && showQueryConfig.length > 0)"
				@keywordBlur="keywordBlur" />
			<tms-app-list :showCOLUMNS="showCOLUMNS" :allCOLUMNS="allCOLUMNS" :tableData="tableData"
				ref="commonTableRef" v-if="tableData.length>0" :btnList="ButtonList" @clickBtn="clickBtn"
				@clickAlone="clickAlone" :countDownTime="pageCode == 'HALL'?permissDetailData.BIDENDTIME : ''"
				@refreshDetails="refreshDetails" :hasBidInfo="pageCode == 'HALL' && sysCode !='JDWL'?true:false">
				<template #bidInfo v-if="pageCode == 'HALL' && sysCode !='JDWL'">
					<template v-if="sysCode!='JDWL'">
						<view v-if="tableData[0].WINASSIGNTYPE == 1" class="bidInfo">
							<view class="bidInfo-header mb-10">
								<view class="bidInfo-header-left">中标分配:人工预置</view>
							</view>
							<template v-for="(item,index) in winBiddingList" :key="item.num">
								<view v-if="tableData[0].WINNUM > index" class="disflex justify-sb">
									<view class="">{{item.title}}</view>
									<view class="">{{tableData[0][item.num]}}%</view>
								</view>
							</template>
						</view>

						<view class="bidInfo">
							<view class="disflex justify-sb bidInfo-header" @tap.stop="showTable = !showTable">
								<view class="bidInfo-header-left">出价信息：</view>
								<view>报名单位{{permissDetailData.SIGNCOUNT}} 出价单位{{permissDetailData.COMPANYCOUNT}}
								</view>
							</view>
							<view class="disflex justify-sb bidInfo-header" @tap.stop="showTable = !showTable">
								<view class="bidInfo-header-left"></view>
								<view>
									出价次数{{permissDetailData.RECORDCOUNT}} 剩余出价次数{{permissDetailData.REMAINNUM}} </view>
							</view>
							<view class="disflex justify-sb bidInfo-header" @tap.stop="showTable = !showTable" v-if="permissDetailData.CARRIERVISITRANK == 1">
								<view class="bidInfo-header-left"></view>
								<view>
									出价排名{{permissDetailData.CHINESERANK}} </view>
							</view>

							<view class="disflex mt-20" v-if="permissDetailData.BIDTYPE == 0 ">
								<scroll-view scroll-x="true">
									<view class="customChooser-radio">
										<view class="customChooser-radio-item" v-for="(item,index) in Number(permissDetailData.ROUNDNUM)" :key="index"
											:class="{'active':chooeseROUNDNUM == item}" @click.stop="ROUNDNUMChange(item)">{{item}}</view>
									</view>
								</scroll-view>
								
							</view>

							<view class="bidInfo-tableBg" v-show="showTable">
								<u-table border-color="#fff" font-size="24" color="#1D1D1D">
									<u-tr>
										<u-th>出价单位</u-th>
										<u-th>出价金额</u-th>
										<u-th>出价时间</u-th>
										<u-th>状态</u-th>
									</u-tr>
									<u-tr v-for="row in permissDetailData.SUBLIST">
										<u-td>{{row.BIDDERNAME}}</u-td>
										<u-td>{{row.BIDPRICE}}</u-td>
										<u-td>{{row.BIDDATE}}</u-td>
										<u-td>{{row.BILLSTATUS == 1?'有效':'无效'}}</u-td>
									</u-tr>
								</u-table>
							</view>
						</view>
					</template>
				</template>
			</tms-app-list>
			<noData v-if="showNoData" />
			<u-modal v-model="showModel" show-cancel-button @confirm="confirmModel" :async-close="true"
				:content="modelContent">
			</u-modal>
		</view>
		<view class="footer" v-if="pageCode == 'subscriptionSource' && showQueryConfig.length == 0" @click="goSetting">
			订阅设置
		</view>
		<view class="addBtn" v-if="showAddBtn" @click="clickBtn(addBtnList[0])">
			新增
		</view>
	</view>
</template>

<script setup>
	import {
		onLoad,
		onShow,
		onPullDownRefresh,
		onReachBottom,
		onNavigationBarButtonTap,
		onHide,
		onBackPress
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		computed,
		watch,
		getCurrentInstance,
	} from 'vue';

	import {
		getForm,
		getShowCol,
		getFormValue

	} from '@/common/form.js'
	import {
		getMyMenu,
		getUrlParams
	} from '@/common'
	import {
		mapState,
		mapActions
	} from 'pinia'

	import SendStore from '@/store/detail-ZLZH.js'
	const SendDetail = SendStore();
	const emit = defineEmits(['change'])

	const sysCode = ref(getApp().globalData.sysCode)


	import SendStore2 from '@/store/assigned.js'
	const SendDetail2 = SendStore2();

	let initPageID = null;
	const pageTitle = ref('列表')
	import filterSearch from "@/components/filterSearch/index.vue"
	import customChooser from "@/components/customChooser/index.vue"
	import noData from "@/components/noData/index.vue"

	const {
		appContext: {
			config: {
				globalProperties: global
			}
		}
	} = getCurrentInstance();
	const commonUrl = ref(null)

	const allLineList = ref([])
	const receivingParam = ref({})

	const winBiddingList = ref([{
			title: '第一名分配',
			num: 'ONEPRESENDCARNUM',
		},
		{
			title: '第二名分配',
			num: 'TWOPRESENDCARNUM',
			colorClass: 'two'
		},
		{
			title: '第三名分配',
			num: 'THREEPRESENDCARNUM',
			colorClass: 'tree'
		},
		{
			title: '第四名分配',
			num: 'FOURPRESENDCARNUM',
			colorClass: 'four'
		},
		{
			title: '第五名分配',
			num: 'FIVEPRESENDCARNUM',
			colorClass: 'five'
		},
	])

	const showAddBtn = ref(false)

	onLoad((p) => {

		receivingParam.value = p

		commonUrl.value = getApp().globalData.BaseURL

		uni.showLoading()
		pageTitle.value = p.title

		initPageID = getApp().globalData.activeMenuID.PAGEID
		getPageConfig()

		showAddBtn.value = false


	})

	onShow(() => {
		if (pageCode.value == 'subscriptionSource') {
			pageInfo.currentPage = 1
			getAllLine()
		} else if (pageCode.value == 'HALL') {
			clearInterval(timer.value);
			timer.value = null;
			count.value = 0
			getPermissDetail(customChooserVal.value)
		}
	})
	onHide(() => {
		if (pageCode.value == 'HALL') {
			clearInterval(timer.value);
			timer.value = null;
			count.value = 0
		}
	})
	onPullDownRefresh(() => {
		pageInfo.currentPage = 1
		setTimeout(function() {
			uni.stopPullDownRefresh();
		}, 1000);

		if (pageCode.value == 'HALL') {
			clearInterval(timer.value);
			timer.value = null;
			count.value = 0
			getPermissDetail(customChooserVal.value)
		} else {
			queryList()
		}

	})

	onReachBottom(() => {
		if (pageInfo.currentPage > pageInfo.totalPages) {
			return global.$_showToast('没有更多数据了。')
		}
		queryList()
	})
	
	

	// const ROUNDNUMarray = ref([])
	// const ROUNDNUMindex = ref('')
	const chooeseROUNDNUM = ref('')
	const ROUNDNUMChange = (e) => {
		chooeseROUNDNUM.value = String(e)
		clearInterval(timer.value);
		timer.value = null;
		count.value = 0
		getPermissDetail(customChooserVal.value)
	}

	const commonData = ref({})
	const showCOLUMNS = ref([])
	const allCOLUMNS = ref([])
	const allButton = ref([])
	const ButtonList = ref([])
	const SLOTCFG = ref(null)
	const QUERY = ref([])

	const queryForm = {}
	const queryConfig = ref([])
	const showQueryConfig = ref([])

	const pageInfo = reactive({
		currentPage: 1,
		pageSize: 10,
		totalResult: 0,
		sortName: "",
		sortOrder: "",
		totalPages: 0,
	});

	const tableData = ref([])
	const totalData = ref(null)
	const listUrl = ref('')

	const addBtnList = ref([])
	const pageCode = ref(null)

	onNavigationBarButtonTap((obj) => {
		clickBtn(addBtnList.value[0])
	})

	const getPageConfig = () => {

		let portData = {}

		if (receivingParam.value.allId) {

			let strArr = receivingParam.value.allId.split(',')
			portData = {
				BILLNO: receivingParam.value.BILLNO,
				MODULEID: strArr[0],
				PAGEID: strArr[1],
			}
		}


		global.$u.api.getConifg(portData).then(res => {
			commonData.value = res.RESULT
			const {
				COLUMNS,
				BUTTON,
				SLOTCFG,
				QUERY,
				MAINTABLE,
				SUBTABLE,
				PAGES,
				VCODE
			} = commonData.value
			allCOLUMNS.value = COLUMNS
			showCOLUMNS.value = getShowCol(COLUMNS)
			SendDetail.setShowCOLUMNS(showCOLUMNS.value)
			SendDetail.setCOLUMNS(COLUMNS)
			SendDetail.setMAINTABLE(MAINTABLE)
			SendDetail.setSUBTABLE(SUBTABLE)
			ButtonList.value = getShowCol(BUTTON)
			allButton.value = BUTTON
			listUrl.value = SLOTCFG
			queryForm.value = getFormValue(QUERY)
			queryConfig.value = QUERY
			showQueryConfig.value = getShowCol(QUERY)
			pageCode.value = VCODE
			if (pageCode.value == 'subscriptionSource') {
				getAllLine()
			} else if (pageCode.value == 'HALL') {
				uni.showLoading()
				getHALLTopList()
			} else {
				addBtnList.value = allButton.value.filter(ele => ele.ACTION == "ADD")
				setPLUSBtn(addBtnList.value)
				queryList()
			}
		})
	}

	const setPLUSBtn = (arr) => {
		if (arr.length == 0) return

		showAddBtn.value = true

	}

	const uToast = ref(null)
	const customChooserVal = ref(null)

	const LAT = ref('0')
	const LON = ref('0')

	const showNoData = ref(false)
	const queryList = () => {
		showNoData.value = false
		let data = {
			PAGENUM: pageInfo.currentPage,
			PAGESIZE: pageInfo.pageSize,
			SORTNAME: pageInfo.sortName,
			REVERSE: pageInfo.sortOrder,
			PARENTPAGE: "",
			LAT: LAT.value,
			LON: LON.value,
			...queryForm.value,
		};
		if (pageCode.value == 'subscriptionSource') data.BILLNO = customChooserVal.value

		if (receivingParam.value.allId) {
			let strArr = receivingParam.value.allId.split(',')
			data.BILLNO = receivingParam.value.BILLNO
			data.MODULEID = strArr[0]
			data.PAGEID = strArr[1]
		}



		data.KEYWORD = queryForm.value.KEYWORD || ''
		getApp().globalData.activeMenuID.PAGEID = initPageID
		global.$axios(listUrl.value, data, 'POST', true, true).then(res => {
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
	const modelContent = ref('')
	const showModel = ref(false)
	const saveDataModel = ref({})
	const clickAlone = (row) => {
		let btnList = allButton.value.filter(ele => ele.ACTION == "DTL")
		console.log('btnListbtnListbtnList', btnList)
		btnList.length ? clickBtn(btnList[0], row) : ''
	}
	const clickBtn = (btn, row) => {
		console.log(btn, row)
		const {
			VTYPE,
			ACTIONADDRESS,
			VNAME,
			ACTION,
			BILLNO,
			OTHER,
			PK_PAGE,
			PAGEPATH,
			APPLETOTHER
		} = btn
		getApp().globalData.activeMenuID.PAGEID = initPageID

		switch (VTYPE) {
			case "1":
				getApp().globalData.activeMenuID.PAGEID = PK_PAGE
				uni.$off('reload')
				uni.$once('reload', () => {
					console.log('要刷新页面了');
					pageInfo.currentPage = 1
					queryList()
					if (pageCode.value == 'subscriptionSource') {
						getAllLine()
					}
				})
				let path = ''
				if (ACTION == "ADD") {
					path = `/pages/common/form/form?title=新增${pageTitle.value}`
				} else if (ACTION == "DTL") {
					path = (APPLETOTHER ? APPLETOTHER : PAGEPATH ? PAGEPATH : '/pages/common/detail/detail') +
						`?BILLNO=${row.BILLNO}&url=${ACTIONADDRESS}&PKBILLNO=${row.SUBLIST?row.SUBLIST[0].PKBILLNO:null}&BILLSTATUS=${row.BILLSTATUS}`
				} else if (ACTION == "EDIT") {
					path =
						`/pages/common/form/form?isEdit=1&BILLNO=${row.BILLNO}&title=编辑${pageTitle.value}&isDetail=1`
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
					row,
					...getUrlParams(ACTIONADDRESS)
				}

				break;

			case "21":
				getApp().globalData.activeMenuID.PAGEID = PK_PAGE
				uni.$off('reload')
				uni.$once('reload', () => {
					console.log('要刷新页面了');
					pageInfo.currentPage = 1
					queryList()
					if (pageCode.value == 'subscriptionSource') {
						getAllLine()
					}
				})
				SendDetail2.setTableData([row])
				console.log('打开自定义', SendDetail2);
				getApp().globalData.activeMenuID.PAGEID = PK_PAGE
				let path21 = (APPLETOTHER ? APPLETOTHER : PAGEPATH) +
					`?BILLNO=${row.BILLNO}&url=${ACTIONADDRESS}&title=${VNAME}&OTHER=${OTHER}`
				uni.navigateTo({
					url: path21
				})
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
		} else {
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
	const goToForm = () => {
		uni.navigateTo({
			url: '/pages/common/form/form'
		})
	}
	const resetPopup = (val) => {
		queryForm.value = {}
		pageInfo.currentPage = 1
		queryList()
	}
	const search = (val) => {
		queryForm.value = val
		pageInfo.currentPage = 1


		if (pageCode == 'subscriptionSource' && showQueryConfig.length > 0) {
			uni.getLocation({
				type: "gcj02",
				geocode: true,
				success: res => {
					const {
						latitude,
						longitude
					} = res
					LAT.value = latitude
					LON.value = longitude
					queryList()
				},
				fail: (err) => {
					console.log("address:", "-----", err)
					queryList()
				},
			});
		} else {
			queryList()
		}

	}
	const keywordBlur = (val) => {
		queryForm.value.KEYWORD = val
		pageInfo.currentPage = 1
		queryList()
	}
	const goSetting = () => {
		uni.navigateTo({
			url: '/pages_cys/tab01/takematerial/setting'
		})


	}

	const defaultValue = ref(null)
	const getAllLine = () => {
		let data = {
			PAGENUM: pageInfo.currentPage,
			PAGESIZE: pageInfo.pageSize,
		};
		global.$axios('/oms/app/subscriptionLine/getAllLine', data, 'POST', true, true).then(res => {
			let {
				TOTAL,
				RECORDS,
				TOTALDATA,
				PAGES,
			} = res.RESULT;

			allLineList.value = [{
				label: '全部',
				BILLNO: null
			}]
			let arr = []
			if (RECORDS.length > 0) {
				arr = RECORDS.map(item => {
					return {
						// label: `${item.SENDAREASHI == '市辖区' ? item.SENDAREASHENG : item.SENDAREASHI}-${item.RECVAREASHI == '市辖区' ? item.RECVAREASHENG : item.RECVAREASHI}`,
						label:`${item.SENDAREASHENG}${item.SENDAREASHI=='市辖区'?item.SENDAREASHENG:item.SENDAREASHI}-${item.RECVAREASHENG}${item.RECVAREASHI=='市辖区'?item.RECVAREASHENG:item.RECVAREASHI}`,
						...item
					}
				})
				allLineList.value.push(...arr)
			}
			if (allLineList.value.length > 0) {
				defaultValue.value = allLineList.value[0].BILLNO
				customChooserVal.value = defaultValue.value
				queryList()
			} else {
				queryList()
			}
		})
	}
	const clickCustomChooser = (e) => {
		customChooserVal.value = e
		pageInfo.currentPage = 1
		queryList()

	}
	const getHALLTopList = () => {
		let url = queryConfig.value[0].OTHER
		let data = {
			PAGENUM: 1,
			PAGESIZE: 99
		}
		global.$axios(url, data, 'POST').then(res => {
			allLineList.value = res.RESULT.RECORDS
			defaultValue.value = res.RESULT.RECORDS[0].BILLNO
			customChooserVal.value = res.RESULT.RECORDS[0].BILLNO
			getDetailNoDynamic(defaultValue.value)

		}).catch(err => {})
	}
	const refreshDetails = () => {
		getDetailNoDynamic(customChooserVal.value)
	}
	const commonTableRef = ref('')
	const clickCustomChooserHALL = (e) => {
		customChooserVal.value = e
		clearInterval(timer.value);
		timer.value = null;
		count.value = 0

		commonTableRef.value.clearCountDown()

		getDetailNoDynamic(e)
		uni.showLoading()
	}
	const timer = ref(null)
	const count = ref(0)
	const getDetailNoDynamic = (val) => {
		let data = {
			BILLNO: val
		}
		global.$axios(listUrl.value, data, 'POST').then(res => {
			tableData.value = [res.RESULT]
			getPermissDetail(val)
		}).catch(err => {})
	}
	const permissDetailData = ref({})
	const showTable = ref(true)

	const getPermissDetail = (val) => {
		console.log(val)
		if (!val) return uni.hideLoading()
		let data = {
			BILLNO: val,
			ROUNDNUM: String(ROUNDNUMindex.value + 1)
		}
		global.$axios('oms/omsBidRecord/getPermissDetail', data, 'POST').then(res => {
			uni.hideLoading()
			permissDetailData.value = res.RESULT
			tableData.value[0].BILLSTATUS = permissDetailData.value.BILLSTATUS


			// ROUNDNUMarray.value = Array.from({
			// 	length: permissDetailData.value.ROUNDNUM
			// }, (val, i) => i + 1)
			
			// ROUNDNUMindex.value = permissDetailData.value.ROUNDNUM - 1
			chooeseROUNDNUM.value = chooeseROUNDNUM.value != '' && chooeseROUNDNUM.value? chooeseROUNDNUM.value : permissDetailData.value.ROUNDNUM 
			

			count.value = 10
			Verification()

		}).catch(err => {})
	}
	const Verification = () => {
		timer.value = setInterval(() => {
			if (count.value > 0 && count.value <= 10) {
				count.value--;
			} else if (count.value == 0) {
				getPermissDetail(customChooserVal.value);
				clearInterval(timer.value);
				timer.value = null;
			}
		}, 1000);
	};

	onBackPress((p) => {
		console.log('执行了fahui')
		clearInterval(timer.value);
		timer.value = null;
	})
</script>

<style scoped lang="scss">
	.myCar {
		&.myCarFooter {
			padding-bottom: 120rpx;
		}

		.myCarItem {}
	}

	.footer {
		background-color: #307cff;
		height: 98rpx;
		font-size: 28rpx;
		font-weight: 500;
		color: #ffffff;
		line-height: 98rpx;
		text-align: center;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 99;
	}

	.subscriptionSource {
		padding: 20rpx 30rpx;
		background-color: #fff;
		position: sticky;
		top: 0;
		z-index: 99;
	}

	.bidInfo {
		margin-top: 30rpx;

		&-header {
			color: #2c76ff;
			font-size: 24rpx;

			&-left {
				font-weight: bold;
			}
		}

		&-tableBg {
			background-color: #fff;
			overflow-y: auto;
			padding-top: 20rpx;

			.u-td {
				border: none;
			}

			.u-tr {
				border-bottom: 1rpx solid #bbbbbb;
			}

			.u-tr:first-child {
				border: none;
			}

			.u-th {
				background: rgba(48, 124, 255, 0.1);
				border: none !important;
				font-size: 28rpx;
				font-weight: 500;
				color: #151515;
			}
		}
	}


	.addBtn {
		width: 150rpx;
		height: 150rpx;
		background: rgba(48, 124, 255, 0.8);
		position: fixed;
		right: 50rpx;
		bottom: 10%;
		color: #fff;
		text-align: center;
		line-height: 150rpx;
		border-radius: 50%;



	}
</style>