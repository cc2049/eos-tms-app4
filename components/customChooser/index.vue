<template>
	<view class="customChooser">
		<scroll-view scroll-x="true">
			<view class="customChooser-radio">
				<view class="customChooser-radio-item" v-for="(item,index) in list"
					:class="{'active':newvalue == item[value]}" @click="clickRadio(item)">{{ customLabelHall?'场次'+(index+1):item[label]}}</view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
	import {
		onLoad,
		onShow,
		onTabItemTap,
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		computed,
		watch,
		getCurrentInstance,
	} from 'vue';

	import {
		mapState,
		mapActions
	} from 'pinia'

	const emit = defineEmits(['change'])

	const props = defineProps({
		list: {
			type: Array,
			default: [],
		},
		label: {
			type: String,
			default: 'label',
		},
		value: {
			type: String,
			default: 'value',
		},
		defaultValue: {
			type: String,
			default: '',
		},
		customLabelHall:{
			type: Boolean,
			default: false,
		}
	});

	const {
		appContext: {
			config: {
				globalProperties: global
			}
		}
	} = getCurrentInstance();

	const newvalue = ref(null)
	onLoad(() => {

	})

	watch(() => props.defaultValue, () => {
		newvalue.value = props.defaultValue
	}, {
		immediate: true,
	});
	const clickRadio = (item) => {
		newvalue.value = item[props.value]
		emit('change', newvalue.value)

	}
	
</script>

<style scoped lang="scss">
	.customChooser {
		&-radio {
			display: flex;
			align-items: center;

			&-item {
				margin-right: 20rpx;
				background: #E7EBEE;
				border-radius: 30rpx;
				padding: 10rpx 18rpx;
				font-size: 26rpx;
				font-weight: 400;
				color: #738493;
				flex: 0;
				white-space: nowrap;

				&.active {
					background: #2C76FF;
					font-size: 26rpx;
					font-weight: 500;
					color: #FFFFFF;
				}
			}
		}
	}
</style>