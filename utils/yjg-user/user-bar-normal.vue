<template>
	<view class="container">
		<view class="flex flex-grow align-center justify-between">
			<view class="flex align-center justify-start margin-left-ssm" @click="onHeadClick">
				<view class="flex position-relative margin-right-sm">
					<image style="width:70rpx;height:70rpx" class="round" :src="user.avatar?user.avatar:defaultImg"></image>
					
					<view class="position-relative text-xss position-absolute" style="top:20px;left:20px">
						<view class="color-white radius-x gray-border-1 flex align-center justify-center"
							style="width:26rpx;height:26rpx;background: #fb5318;"
							v-if="user.userVerifyStatus === 2">个
						</view>
						<view class="color-white radius-x gray-border-1 flex align-center justify-center"
							style="width:26rpx;height:26rpx;background: #2078e4;"
							v-if="user.userVerifyStatus === 3">企
						</view>
					</view>
				</view>
				<view class="margin-left-ssm">
					<view class="text-black text-normal">{{ user.realName }}</view>
					<view class="text-black text-xs1" v-show="!!user.userAverageScoreAVG">
						<text>评分：</text>
						<text class="margin-left-ssm">{{ user.userAverageScoreAVG }}</text>
					</view>
				</view>
			</view>

			<view class="padding-tb-xss text-df color-white radius-xl">
				<view v-if="contactOn" class="flex align-center justify-end">
					<view class="margin-left-sm flex align-center justify-center radius-xl theme-border"
						style="width:60rpx;height:60rpx" @click.stop="onCall">
						<uni-icons color="#fb5318" size="22" type="phone"></uni-icons>
					</view>
				</view>
				<view v-else-if="userDetailOn">
					<view @click.stop="onBoothClick(1)" v-if="user.userVerifyStatus===3"
						class="text-theme theme-border radius-xl text-df padding-tb-ssm padding-lr flex align-center justify-center">
						企业展台
					</view>
					<view @click.stop="onBoothClick(0)" v-else-if="detailColor!=='gray'"
						class="text-theme theme-border radius-xl text-df padding-tb-ssm padding-lr flex align-center justify-center">
						个人资料
					</view>
					<view @click.stop="onBoothClick(0)" v-else
						class="text-black-4 gray-border-1 radius-xl text-df padding-tb-ssm padding-lr flex align-center justify-center">
						个人资料
					</view>
				</view>
				<view v-else-if="userBoothOn" @click.stop="onBoothClick(2)" v-else
					class="text-theme theme-border radius-xl text-df padding-tb-ssm padding-lr flex align-center justify-center">
					TA的店铺
				</view>
			</view>
		</view>

		<view class="flex margin-top-sm" v-if="statisticsOn">
			<view class="flex-sub text-center">
				<text class="text-gray-4 text-sm">信誉度：</text>
				<text class="text-theme margin-left-ssm text-sm">{{ user.reputationScore }}</text>
			</view>
			<view class="flex-sub text-center">
				<text class="text-gray-4 text-sm">成单量：</text>
				<text class="text-theme margin-left-ssm text-sm">{{ user.orderCnt }}</text>
			</view>
			<view class="flex-sub text-center">
				<text class="text-gray-4 text-sm">发单量：</text>
				<text class="text-theme margin-left-ssm text-sm">{{ user.releaseWorkCnt }}</text>
			</view>
		</view>
		<!--            信誉度、成单量、发单量结束-->
	</view>
</template>

<script>
	import UniIcons from "@/components/uni-icons/uni-icons";
	import {
		imgUrl
	} from "@/utils/config";
	
	export default {
		name: "UserBarNormal",
		components: {
			UniIcons
		},
		props: {
			// 自定义内容
			user: {
				type: Object,
				default: function() {
					return {};
				},
			},
			userDetailOn: {
				type: Boolean,
				default: false,
			},
			userBoothOn: {
				type: Boolean,
				default: false,
			},
			contactOn: {
				type: Boolean,
				default: false,
			},
			statisticsOn: {
				type: Boolean,
				default: false,
			},
			detailColor: {
				type: String,
				default: "",
			},
		},
		data() {
			return {
				defaultImg: imgUrl+"/awater.png",
				token: null,
			}
		},
		mounted() {
			this.token = uni.getStorageSync("token");
		},
		methods: {
			onHeadClick() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				
				uni.navigateTo({
					url: '/pagesNew/details/otherUserInfo?userId=' + this.user.id,
				})
			},
			onBoothClick(type) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				
				if (type === 0) {
					uni.navigateTo({
						url: '/pagesNew/details/otherUserInfo?userId=' + this.user.id,
					})
				} else if (type === 1) {
					uni.navigateTo({
						url: '/pagesCertification/enterprise/enterpriseDetails?userId=' + this.user.id,
					})
				} else if (type === 2) {
					uni.navigateTo({
						url: '/pagesNew/domall/boothCommodity?id=' + this.user.id,
					})
				}
			},
			onCall() {
				this.$emit("onCall", {
					mobile: this.user.mobile
				});
			},
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1000
				});
				uni.navigateTo({
					url: '/pages/login/login'
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
	}
</style>