<template>
  <div class="select">
    <u-sticky>
      <div class="search-box">
        <u-search placeholder="请输入关键字查询" v-model="keyword" :show-action="false" @change="$u.debounce(getData, 500)"></u-search>
      </div>
    </u-sticky>
    <div class="select-content">
      <template v-if="dataList.length > 0">
        <div :class="['select-item',selectArrIds.includes(item.VALUE)?'check':'']" v-for="(item, index) in dataList" :key="index" @click="select(index)">
          {{item.LABEL}}
        </div>
        <noMore />
      </template>
      <noData v-else />
      <u-back-top :scroll-top="scrollTop" :iconStyle="{fontSize: '22px',color:'#1864f8'}"></u-back-top>
      <div class="select-check" v-if="mutiple">
        <div :class="['allcheck',selectArrIds.length == dataList.length?'checked':'']" @click="checkAll">全选</div>
        <div class="btnbox">
          <u-button type="primary" size="medium" @click="selectOK" :disabled="selectArrIds.length == '0'">确定</u-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onLoad, onReady, onPullDownRefresh, onPageScroll } from "@dcloudio/uni-app"
import { ref, reactive, computed, toRefs,getCurrentInstance } from "vue"
import request from "@/common/request"

import useFormStore from '@/store/form'
const useForm = useFormStore()
const config = computed(() => useForm.config)
console.log(888,config.value );
const { title, url, params, mutiple, MENUID } = toRefs(config.value)
	const {
		appContext: {
			config: {
				globalProperties: global
			}
		}
	} = getCurrentInstance();
const keyword = ref("")

const dataList = ref([])
const getData = () => {
  uni.showLoading({
    title: '加载中',
    mask: true
  })
  
  let URL = url.value ,queryData = {
	      KEYWORD: keyword.value,
	      MODULEID: MENUID.value,
	      ...params.value
  }
  console.log();
  global.$axios(URL, queryData, 'POST', true ).then((res) => {
    dataList.value = res.RESULT
	uni.hideLoading()
  });
}
const selectArr = ref([])
const selectArrIds = computed(() => selectArr.value.map(el => el.VALUE))
const select = index => {
  let row = dataList.value[index]
  if (mutiple.value) {
    if (selectArrIds.value.includes(row.VALUE)) {
      let dIndex = selectArrIds.value.findIndex(el => el == row.VALUE)
      selectArr.value.splice(dIndex, 1)
    } else {
      selectArr.value.push(row)
    }
  } else {
    uni.$emit("Select", row)
    setTimeout(() => {
      uni.navigateBack()
    }, 100)
  }
}
const checkAll = () => {
  if (selectArrIds.value.length == dataList.value.length) {
    selectArr.value = []
  } else {
    selectArr.value = dataList.value
  }
}
const selectOK = () => {
  uni.$emit("Select", selectArr.value)
  setTimeout(() => {
    uni.navigateBack()
  }, 100)
}

onPullDownRefresh(() => {
  getData()
})

onReady(() => {
  uni.setNavigationBarTitle({ title: title.value })
  getData()
})

const scrollTop = ref(0)
onPageScroll(e => {
  scrollTop.value = e.scrollTop;
})
</script>
<style lang="scss" scoped>
.select {
  &-content {
    box-sizing: border-box;
    margin: 16rpx;
    background: #fff;
    font-size: 26rpx;
  }
  &-item {
    padding: 20rpx;
    border-bottom: 2rpx solid $border-color;
    &.check {
      position: relative;
      &::after {
        content: "√";
        position: absolute;
        left: 0;
        top: 50%;
        color: $primary;
        transform: translateY(-50%);
      }
    }
  }
  &-check {
    box-sizing: border-box;
    width: 100%;
    padding: 20rpx;
    position: fixed;
    left: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>