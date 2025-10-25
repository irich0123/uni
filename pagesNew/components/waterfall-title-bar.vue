<template>
    <view class="container">
        <view class="padding-ssm flex align-center justify-between">
            <view class="title-left text-black text-df text-bold">
                {{ item.title }}
            </view>
            <view style="width:56rpx;" v-if="!!item.imgUrl" @click.stop="onOperate">
                <image style="width:56rpx;height:56rpx;" :src="item.imgUrl"></image>
            </view>
        </view>
        <view class="subtitle-line text-black-5 text-bold text-df">{{ item.subtitle }}</view>
        <view class="text-gray-5 text-df padding-tb-ssm flex align-center" 
			v-if="!!item.unitPriceMin || !!item.qtyInStock || !!item.unitPriceGoldBean">
            <view class="text-black padding-tb-xs padding-left-xs" style="overflow: hidden;">
                <span v-if="!!item.unitPriceMin" class="margin-right-sm">￥{{ item.unitPriceMin | formatPrice }}</span>
                <span v-else-if="!!item.unitPriceGoldBean" class="margin-right-sm">金豆{{ item.unitPriceGoldBean | formatQuantity }}颗</span>
                <span v-if="!!item.qtyInStock">
                    <span>{{ item.qtyInStock | formatQuantity }}</span>
                    <span class="padding-left-xs">{{ item.unit }}</span>
                </span>
            </view>
        </view>
    </view>
</template>

<script>
import {calculateMath, priceTranslate} from "@/utils/myUtil";

export default {
    name: "waterfall-title-bar",
    props: {
        item: {
            type: Object,
            default() {
                return {
                    title: '',
                    imgUrl: '',
                    subtitle: '',
                    unitPrice: 0,
                    qtyInStock: 0,
                }
            }
        },
    },
    filters: {
        formatPrice(number) {
            return priceTranslate(number);
        },
        formatQuantity(number) {
            return calculateMath(number, 0);
        }
    },
    methods: {
        onOperate() {
            this.$emit("onOperate", {})
        },
    }
}
</script>

<style scoped>
.container {
    width: 100%;
}

.title-left {
    line-height: 1.5;
    overflow: hidden;
    display: -webkit-box;
    text-overflow: ellipsis;
    word-wrap: break-word;
    white-space: normal !important;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.subtitle-line {
    line-height: 1.5;
    overflow: hidden;
    display: -webkit-box;
    text-overflow: ellipsis;
    word-wrap: break-word;
    white-space: normal !important;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}


</style>
