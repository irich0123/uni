<template>
	<view class="container">
		<view class="flex flex-direction padding-lr padding-tb-ssm bg-white">
			<view class="flex margin-bottom-sm gray-border-bottom align-center justify-between"
				v-if="showStatusBar">
				<view class="padding-lr padding-tb-ssm radius-xl gray-border-1 text-theme text-sm"
					v-if="stickApply.status ===1" @click.stop="toPay">立即支付
				</view>
				<view class="text-theme text-df text-bold" v-if="stickApply.status !==1">
					{{ stickApply.statusName }}
				</view>
				<view class="text-gray-4 text-sm">{{ stickApply.updatetime | formatDate }}</view>
			</view>
			<view class="flex flex-direction text-df">
				<view class="flex align-center justify-between padding-tb-ssm">置顶城市：<text>{{stickApply.addressDetails}}</text></view>
				<view class="flex align-center justify-between padding-tb-ssm">位置：<text>{{stickApply.typeName}}</text></view>
				<view class="flex align-start justify-between padding-tb-ssm">时间：<text>{{stickApply.starttime | formatDate}} -
						{{stickApply.endtime | formatDate}}</text></view>
				<view class="flex align-center justify-between padding-tb-ssm">费用：<text>{{stickApply.amount | formatPrice}} 元</text></view>
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
	import {
		getStickApplyTypeEnum
	} from "@/api/stick";

	export default {
		name: "stickApplyListCell",
		data() {
			return {
				siteList: [],
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
		mounted() {},
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
	.container {
	}
</style>