<template>
	<view class="container bg-white radius">
		<view class="notice_popup_title text-bold">
			奖励规则
		</view>
		<view
			class="flex align-center justify-between text-df gray-border-top gray-border-left gray-border-right margin-lr-sm padding-tb-sm">
			<view class="flex-sub gray-border-right">
				分享
			</view>
			<view class="flex-sub gray-border-right">
				被点击(次)
			</view>
			<view class="flex-sub">
				得金豆(颗)
			</view>
		</view>

		<view class="flex align-center justify-between text-df gray-border margin-lr-sm padding-tb-sm"
			v-for="(item,index) in shareRuleList" :key="index">
			<view class="flex-sub gray-border-right">
				<view v-if="item.type === 0">
					自己的活
				</view>
				<view v-if="item.type === 1">
					别人的活
				</view>
				<view v-if="item.type === 2">
					自己的承接
				</view>
				<view v-if="item.type === 3">
					别人的承接
				</view>
				<view v-else>
				</view>
				<!--                        `type` int(1) NOT NULL COMMENT '0=自己的活信息 1=别人的活信息 2=自己的承接信息 3=别人的承接信息',-->
			</view>
			<view class="flex-sub gray-border-right">
				{{ item.timesClicked }}
			</view>
			<view class="flex-sub">
				{{ item.goldBean }}
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getInfoShareRuleList,
	} from "@/api/user";
	export default {
		name: "shareRulePanel",
		data() {
			return {
				shareRuleList: [],
			}
		},
		mounted() {
			this.getInfoShareRuleList();
		},
		methods: {
			//获取分享奖励规则
			getInfoShareRuleList() {
				let self = this;
				getInfoShareRuleList().then(res => {
					if (res.retCode === 0) {
						self.shareRuleList.splice(0, self.shareRuleList.length);
						if (res.data.length > 0) {
							self.shareRuleList = res.data
						}
					}
				});
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
	}

	.notice_popup {
		width: 100% !important;
		z-index: 9999;
	}

	.notice_popup_title {
		width: 590rpx;
		font-size: 32rpx;
		padding: 30rpx 40rpx 20rpx 40rpx;
		text-align: center;
	}

	.notice_popup_line {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		font-size: 28rpx;
		border: 2rpx solid #eeeeee;
		border-bottom: 0;
		margin: 0 20px;
		line-height: 80rpx;
	}
</style>