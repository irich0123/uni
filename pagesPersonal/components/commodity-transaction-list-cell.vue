<template>
    <view class="container">
        <view>
            <view class="flex align-start justify-between padding-bottom-sm margin-bottom-ssm gray-border-bottom" v-show="showStatusBar">
                <view class="text-black text-sm">
                    {{ transaction.statusName }}
                </view>
                <view class="text-sm text-gray-5">{{ transaction.updateTime | formatDate }}</view>
            </view>
            <view class="padding-tb-sm flex">
				<image class="radius-s margin-top-ssm margin-right-sm" style="min-width: 160rpx;width: 160rpx;height: 160rpx;"
					:src="(!transaction.commoditySnapshot.photos || transaction.commoditySnapshot.photos.length === 0)?commodityThumb:transaction.commoditySnapshot.photos[0]" />
                <view class="flex-grow margin-left-sm">
					<view class="text-black margin-bottom-ssm text-normal text-bold" style="overflow: hidden;line-height: 1.5;min-height: 80rpx;display: -webkit-box;text-overflow: ellipsis;
						word-wrap: break-word;white-space: normal !important;-webkit-line-clamp: 2;">
						{{ transaction.commoditySnapshot.title }}
					</view>
                    <!-- 信息标题结束-->
                    <view class="text-sm text-gray-5">
                        <view>
                            <view>
                                <text>数量：</text>
                                <text>
                                    {{
                                        transaction.quantity | formatQuantity
                                    }}{{ transaction.commoditySnapshot.unit }}
                                </text>
                            </view>
                            <view>
                                <text>总价：</text>
                                <text>{{ transaction.totalValuePaid | formatPrice }}元</text>
                            </view>
                        </view>
                        <view>
                            <text>编号：</text>
                            <text>{{ transaction.identifier }}</text>
                        </view>
                    </view>
                </view>
            </view>
			<slot></slot>
        </view>
    </view>
</template>

<script>
	import {
		webUrl
	} from "@/utils/config";
import {calculateMath, formatTime6, priceTranslate} from "@/utils/myUtil";

export default {
    name: "commodityTransactionListCell",
    props: {
        transaction: {
            type: Object,
            default: {}
        },
        showStatusBar: {
            type: Boolean,
            default: true,
        },
    },
    filters: {
        formatDate(time) {
            return formatTime6(new Date(time));
        },
        formatPrice(number) {
            return priceTranslate(number);
        },
        formatQuantity(number) {
            return calculateMath(number, 0);
        }
    },
	data() {
		return {
			commodityThumb: '',
		}
	},
	created() {
		let defaultResource = uni.getStorageSync("defaultResource");
		this.commodityThumb = defaultResource[2].resourceUrl[0];
	},
}
</script>

<style scoped lang="scss">
.container {
    width: 100%;
}
</style>
