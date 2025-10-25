<template>
    <view class="container">
        <view class="flex flex-direction padding radius bg-white">
            <view class="flex align-center justify-between" style="min-height:60rpx;">
                <view class="text-theme text-df text-bold">{{ transaction.statusDesc }}</view>
                <view class="text-gray-4 text-sm">{{ transaction.updateTime | formatDate }}</view>
            </view>

            <!-- 信息、图片开始 -->
            <view class="padding-bottom-sm flex" style="min-height:170rpx;">
                <view class="position-relative" style="margin-top:8rpx;width:160rpx;height:160rpx;min-width:160rpx;">
                    <view class="position-absolute" style="top:0;top:0;width:60rpx;height:60rpx;z-index:2;"
						v-if="transaction.releaseWorkResponse.stickStatus === 2">
                        <image style="width:60rpx;height:60rpx;" :src="imgUrl+'/index/zhiding.png'"/>
                    </view>
                    <view style="width:160rpx;height:160rpx;">
                        <image style="width:160rpx;height:160rpx;" class="radius-s"
                             :src="(!transaction.releaseWorkResponse.img || transaction.releaseWorkResponse.img.length ===0)?releaseWorkThumb:transaction.releaseWorkResponse.img[0]" />
                    </view>
                </view>
                <view class="margin-left-sm" style="width:100%;">
                    <!-- 信息标题开始 -->
                    <view class="details-title text-gray-4 text-bold margin-bottom-ssm text-normal">
                        {{ transaction.releaseWorkResponse.title }}
                    </view>
                    <!-- 信息标题结束-->
                    <view class="text-df">
                        <view class="flex flex-direction">
                            <view class="text-gray-4 margin-bottom-ssm" v-show="transaction.releaseWorkResponse.unitPrice">
                                <text>单价：</text>
                                <text class="margin-right-xs" v-if="transaction.releaseWorkResponse.unitPrice">
                                    {{ transaction.releaseWorkResponse.unitPrice | formatPrice }}元
                                </text>
                                <text class="margin-right-xs" v-else>待议</text>
                            </view>
                            <view class="text-gray-4 margin-bottom-ssm">
                                <text>交期：</text>
                                <text class="margin-right-xs">{{ transaction.deliveryTime | formatDate }}</text>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
            <!-- 信息、图片结束 -->
            <slot/>
        </view>
    </view>
</template>

<script>
import {calculateMath, formatTime6, priceTranslate} from "@/utils/myUtil";
import {imgUrl} from "@/utils/config"

export default {
    name: "workTransactionListCell",
    props: {
        transaction: {
            type: Object,
            default: {},
        },
    },
	data() {
		return {
			releaseWorkThumb: '',
			imgUrl: imgUrl,
		}
	},
	mounted() {
		let defaultResource = uni.getStorageSync("defaultResource");
		console.log("defaultResource=",defaultResource);
		this.releaseWorkThumb = defaultResource[2].resourceUrl[0];
	},
    filters: {
        formatDate(time) {
            return formatTime6(new Date(time));
        },
        formatPrice(number) {
            return priceTranslate(number);
        }
    }
}
</script>

<style scoped lang="scss">
.container {
    width:100%;
	
	.details-title {
	    overflow: hidden;
	    line-height: 1.5;
	    min-height: 80rpx;
	    display: -webkit-box;
	    text-overflow: ellipsis;
	    word-wrap: break-word;
	    white-space: normal !important;
	    -webkit-line-clamp: 2;
	    -webkit-box-orient: vertical;
	}

}

</style>
