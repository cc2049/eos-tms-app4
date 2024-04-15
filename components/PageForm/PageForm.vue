<template>
	<div class="masterForm content">
		<div class="mainForm content-item" v-if="mConfig?.length > 0">
			<div class="main-content">
				<tms-app-form ref="mFormRef" :config="mConfig" v-model="form" :detail="detail">
					<template #ExAptitude="{ OTHER ,LABEL,modelValue,FIELD}">
						<div class="certification">
							<view class="certification-title disflex justify-sb">
								<view class="title">{{LABEL}}</view>
								<!-- <view v-if="setExAptitude(OTHER).isSwitch && !detail"> -->
								<view v-if="setExAptitude(OTHER).isSwitch">
									<!-- <u-switch v-model="form[FIELD]" :active-value="1" :inactive-value="0" @change="val=>changeSwitch(val,FIELD)" size="38" ></u-switch> -->
									<switch :checked="modelValue[FIELD] == '1'" :disabled="detail" @change="changeSwitch($event,FIELD)"
										style="transform:scale(0.6)" />
								</view>
								<view v-else class="certification-explain">{{setExAptitude(OTHER).explain}}</view>
							</view>
							<view v-if="form[FIELD] == 1 || setExAptitude(OTHER).isSwitch == ''"
								class="certification-content">
								<view class="certification-content-alone" v-for="(item,index) in setExAptitude(OTHER).newList" :key="index" >
									<view class="certification-content-haveImage" v-if="form[item.id] || detail">
										<image :src="form[item.id].includes('http')? form[item.id]: BaseURL + form[item.id]" mode="widthFix"
											@click="checkImage(form[item.id])"
											class="certification-content-haveImage-image" />
										<span class="removeBtn" @click="form[item.id] = ''" v-if="!detail">
											<uni-icons type="closeempty" color="#fff"></uni-icons>
										</span>
									</view>
									<view class="certification-content-noHaveImage" v-else
										@click="certificationUpload(item)">
										<image
											:src="item.bgImg == 2?'https://eosine.cn/eos_tms/static/form/2.png':item.bgImg == 3?'https://eosine.cn/eos_tms/static/form/3.png':'https://eosine.cn/eos_tms/static/form/1.png'"
											mode="" class="certification-content-noHaveImage-image"></image>
										<view class="certification-explain">
											<text class="request" v-if="item.require"></text>
											{{item.label}}
										</view>
									</view>
								</view>
							</view>
						</div>
					</template>
				</tms-app-form>
			</div>
		</div>
		<template v-if="form?.SubFormValue?.length >0">
			<div class="subForm " v-for="(sub, index) in form.SubFormValue" :key="index">
				<div class="subForm-content content-item">
					<div class="subForm-title ">
						<div class="title">{{form.SubFormTitle}}</div>
						<div class="add" @click="sFormAdd">add</div>
					</div>
					<div class="subForm-content-title">
						<div class="title"><text>第{{index + 1}}条</text></div>
						<div class="del" v-if="form.SubFormValue.length > 0" @click="sFormRemove(index)">del</div>
					</div>
					<Form ref="sFormRef" :config="sConfig" :MainData="form" v-model="form.SubFormValue[index]"
						:detail="detail" />
				</div>
			</div>
		</template>
	</div>
</template>

<script setup>
	import {
		onLoad,
		onReady,
		onPageScroll
	} from "@dcloudio/uni-app"
	import {
		ref,
		reactive,
		computed,
		watch
	} from "vue"

	const props = defineProps({
		modelValue: Object,
		mConfig: Array,
		sConfig: Array,
		sformValue: Object,
		detail: {
			type: Boolean,
			default: false
		},
	})
	const emit = defineEmits(['update:modelValue'])

	const form = ref({})

	watch(() => props.modelValue, val => {
		form.value = val
	}, {
		immediate: true
	})

	watch(form.value, val => {
		emit("update:modelValue", val)
	}, {
		deep: true
	})
	const mFormRef = ref(null)
	const sFormRef = ref(null)
	const BaseURL = ref(getApp().globalData.BaseURL)
	const mapShowCol = config => {

	}
	const sFormAdd = (index) => {
		let copyForm = JSON.parse(JSON.stringify(props.sformValue))
		form.value.SubFormValue.push(copyForm)
	}
	const sFormRemove = (index, Jindex) => {
		let config = props.sConfig[index]
		let {
			FIELD
		} = config
		uni.showModal({
			title: '提示',
			content: '是否删除当前数据？',
			showCancel: true,
			success: ({
				confirm,
				cancel
			}) => {
				if (confirm) form.value[FIELD].splice(Jindex, 1)
			}
		})
	}

	const submitForm = () => {
		return new Promise((resolve, reject) => {
			if (!mFormRef.value.submitForm()) return reject()
			let validateArr = [];
			if (props.sConfig.length) {
				for (let i = 0; i < sFormRef.value.length; i++) {
					const elTable = sFormRef.value[i];
					validateArr.push(elTable.submitForm());
				}
				let valids = validateArr.filter((el) => el !== false);
				if (valids.length == sFormRef.value.length) {
					resolve(form.value)
				}
			} else {
				resolve(form.value)
			}
		});
	}
	const setExAptitude = (OTHER) => {
		try {
			let {
				explain,
				isSwitch,
				list
			} = JSON.parse(OTHER)
			let newList = JSON.parse(list)
			return {
				explain,
				isSwitch,
				newList
			}
		} catch (error) {
			console.error("setExAptitude异常", error);
			return false;
		}
	}
	const changeSwitch = (val, FIELD) => {
		form.value[FIELD] = val.detail.value ? '1' : '0'
	}

	const checkImage = (url) => {
		uni.previewImage({
			urls: url.includes('http')?[url] : [BaseURL.value + url],
			current: 0,
			indicator: "number",
			longPressActions: null,
		})
	}
	const certificationUpload = (item) => {
		let Token = uni.getStorageSync('token_key');
		uni.chooseImage({
			count: 1,
			sizeType: ["original"],
			sourceType: item.accpt == 1 ? ["album"] : ["album", "camera"],
			success: (res) => {
				let path = res.tempFilePaths;
				uni.showLoading({
					title: "上传中",
					mask: true,
				});
				const uploadUrl = "/eos-api/sys/file/upload"
				let elUrl = path[0];
				uni.uploadFile({
					url: getApp().globalData.BaseURL + uploadUrl,
					name: "file",
					filePath: elUrl,
					header: {
						Authorization: 'Bearer ' + Token
					},
					formData: {
						BILLFROM: "1"
					},

					success: (uploadFileRes) => {
						let data = JSON.parse(uploadFileRes.data)
						if (data.SUCCESS) {
							let url = data.RESULT.FILEPATH
							form.value[item.id] = url
						} else {
							uni.showToast({
								title: `图片上传失败:${data.Message}`,
								duration: 2000,
								icon: "none",
							});
						}
					},
					fail: (err) => {
						console.log(err)
						uni.showToast({
							title: `上传失败:${err.Message}`,
							duration: 2000,
							icon: "none",
						});
					},
					complete: (res) => {
						console.log(444, res)
					},
				});
				uni.hideLoading();
			},
		});
	}


	defineExpose({
		type: "MasterForm",
		submitForm
	});
</script>
<style lang="scss" scoped>
	.masterForm,.content {
		padding: 0 !important;
		.content-item{
			border-radius: 0;
			padding: 0 !important;
		}
	}
	.subForm {
		&-title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin: 16rpx;
			color: $primary;
		}

		.subForm-content {
			&-title {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin: 16rpx;
			}
		}
	}

	.certification {
		.title {
			font-size: 32rpx;
			font-weight: 500;
			color: #111111;
		}

		&-explain {
			font-size: 24rpx;
			font-weight: 500;
			color: #307cff;
		}

		&-content {
			display: flex;
			justify-content: space-between;
			padding: 10rpx 0;

			&-alone {
				width: calc(50% - 10rpx);
				position: relative;
			}

			&-noHaveImage {
				background: #e3efff;
				border-radius: 9rpx;
				padding: 30rpx;
				text-align: center;

				&-image {
					width: 158rpx;
					height: 99rpx;
					border-radius: 10rpx;
					margin-bottom: 10rpx;
				}
			}

			&-haveImage {
				&-image {
					width: 100%;
					height: 200rpx !important;
					border-radius: 10rpx;
				}
			}
		}
	}

	.removeBtn {
		position: absolute;
		right: 0;
		top: 0;
		width: 40rpx;
		height: 40rpx;
		background: rgba($color: #000, $alpha: 0.6);
		text-align: center;
		line-height: 40rpx;
	}

	.request {
		position: relative;
		top: 6rpx;
		color: #ed0909;
		font-size: 26rpx;

		&::before {
			content: "*";
		}
	}
</style>