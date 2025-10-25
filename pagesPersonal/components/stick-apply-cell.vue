<template>
	<view class="container">
		<view class="flex flex-direction padding-lr padding-tb-ssm bg-white">
			<view class="flex margin-bottom-sm gray-border-bottom align-center justify-between" v-if="showStatusBar">
				<view class="padding-lr padding-tb-ssm radius-xl gray-border-1 text-theme text-sm"
					v-if="stickApply.status ===1" @click.stop="toPay">立即支付
				</view>
				<view class="text-theme text-df text-bold" v-if="stickApply.status !==1">
					{{ stickApply.statusName }}
				</view>
				<view class="text-gray-4 text-sm">{{ stickApply.updatetime | formatDate }}</view>
			</view>

			<view class="flex padding-tb-sm" v-if="stickApply.workOrder">
				<view class="position-relative" style="width: 160rpx;height:160rpx;min-width:160rpx;">
					<image class="radius-s" style="width:160rpx;height:160rpx;"
						:src="(!stickApply.workOrder.img || stickApply.workOrder.img.length ===0)?thumbImg:stickApply.workOrder.img[0]" />
				</view>
				<view class="margin-left-sm">
					<view class="details-title text-black margin-bottom-xs text-normal text-bold">
						<span>{{ stickApply.workOrder.title }}</span>
					</view>
				</view>
			</view>

			<view class="flex padding-tb-sm" v-if="stickApply.releaseWork">
				<view class="position-relative" style="width: 160rpx;height:160rpx;min-width:160rpx;">
					<image class="radius-s" style="width:160rpx;height:160rpx;"
						:src="(!stickApply.releaseWork.img || stickApply.releaseWork.img.length ===0)?thumbImg:stickApply.releaseWork.img[0]" />
				</view>
				<view class="margin-left-sm">
					<view class="details-title text-black margin-bottom-xs text-normal text-bold">
						<span>{{ stickApply.releaseWork.title }}</span>
					</view>
				</view>
			</view>

			<view class="flex flex-direction text-df text-gray-4">
				<view class="flex align-center justify-between">
					<view class="flex align-center padding-tb-xs">
						置顶城市：<span class="text-bold">{{stickApply.addressDetails}}</span></view>
					<view class="flex align-center padding-tb-xs">
						展示位置：<span class="text-bold">{{stickApply.typeName}}</span>
					</view>
				</view>
				<view class="flex align-start align-center justify-between padding-tb-xs">
					<span>时间：</span><span>{{stickApply.starttime | formatDate}} -
						{{stickApply.endtime | formatDate}}</span></view>
				<view class="flex align-center justify-between padding-tb-xs">
					总金额：<span class="text-bold">{{stickApply.amount | formatPrice}} 元</span></view>
			</view>
			<slot />
		</view>
	</view>
</template>

<script>
	import {
		formatTime6,
		priceTranslate,
	} from "@/utils/myUtil";

	export default {
		name: "stickApplyCell",
		data() {
			return {
				siteList: [],
				thumbImg: null,
			}
		},
		props: {
			stickApply: {
				type: Object,
				default: function() {
					return {};
				},
			},
			showStatusBar: {
				type: Boolean,
				default: true,
			},
		},
		mounted() {
			let defaultResource = uni.getStorageSync("defaultResource");
			this.thumbImg = defaultResource[3].resourceUrl[0];
		},
		filters: {
			formatDate(time) {
				return formatTime6(new Date(time));
			},
			formatPrice(number) {
				return priceTranslate(number);
			},
		},
		methods: {
			toPay() {
				this.$emit("handle", {
					action: "pay",
					id: this.stickApply.id
				});
			}
		}
	}
</script>

<style scoped lang="scss">
	.container {}
</style>