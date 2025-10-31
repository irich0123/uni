<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="签到" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<view class="header flex align-center justify-center"
			:style="'padding-top:'+contentTop+'px;background-image: url('+ imgUrl +'/clock/bg_red_bao.png);background-size: 100% 100%;'">
			<view class="btn-box bg-theme flex align-center justify-center color-white text-bold" @click="toSign">签到
			</view>
		</view>

		<view class="progress flex flex-direction align-center justify-center">
			<view v-if="days>1" class="text-theme">已连续签到{{days}}天，继续加油哦！</view>
			<view class="progress-box flex align-center justify-center">
				<view v-for="(item,index) in clockData" :key="index" class="flex align-center">
					<view class="bg-theme" :class="item.dash===1?'short-line-bold':'short-line'"
						v-if="item.dash!==null">&nbsp;</view>
					<image style="width: 75rpx;height: 75rpx;" :src="(index===2 || index===6)?giftImg:pendingImg"
						:class="item.clock>0?'':'op'" />
				</view>
			</view>
		</view>
		<view
			:style="'width: 100%;height: 45%;position: fixed;bottom: 0;left: 0;background-image: url('+ imgUrl +'/clock/bg_qd_red.png);background-size: 100% 100%;'">
			<view class="color-white padding-tb padding-lr-lg" style="position: absolute;bottom: 0;left: 0;">
				<view class="padding-tb-ssm text-xl" style="letter-spacing: 4rpx;line-height: 1.8;">签到规则：</view>
				<view class="padding-tb-ssm text-df" style="letter-spacing: 4rpx;line-height: 1.8;">
					1.连续签到3天可获得1颗金豆，连续签到7天可随机获得1-3颗金豆；</view>
				<view class="padding-tb-ssm text-df" style="letter-spacing: 4rpx;line-height: 1.8;">2.连续签到中断，将从第1天重新开始；
				</view>
				<view class="padding-tb-ssm text-df" style="letter-spacing: 4rpx;line-height: 1.8;">3.签到周期为7天；</view>
				<view class="padding-tb-ssm text-df" style="letter-spacing: 4rpx;line-height: 1.8;">4.签到获得的金豆不可用于提现。
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	import {
		getRecentSign,
		createSign
	} from "@/api/common";
	import {
		imgUrl
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "enterpriseList",
		components: {
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				clockData: [{
					dash: null,
					clock: 0,
				}],

				days: 0,

				pendingImg: imgUrl + "/clock/ic_qd_wqd.png",
				clockImg: imgUrl + "/clock/ic_qd_yqd.png",
				giftImg: imgUrl + "/clock/ic_qd_liwu.png",

				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
			}
		},
		watch: {
			statusbarHeight: {
				handler(newVal, oldVal) {
					//#ifndef H5
					this.contentTop = newVal + 40;
					//#endif
				}
			}
		},
		onLoad() {
			this.initData();
		},
		methods: {
			navAction(e) {
				if (e.action === 'back') {
					uni.navigateBack({
						delta: 1 // 返回的页面数
					});
				}
			},
			reSize(e) {
				this.statusbarHeight = e.value;
			},

			initData() {
				this.getRecentSign();
			},
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1000
				});
				uni.redirectTo({
					url: '/pages/login/login'
				})
			},
			toSign() {
				let self = this;
				createSign({}).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							icon: 'none',
							title: res.data.content,
							duration: 2000
						});
						if (res.data.content.indexOf("您今天已签到") === -1) {
							setTimeout(() => {
								self.getRecentSign();
							}, 2000);
						}
					}
				}).catch(err => {
					uni.showToast({
						icon: 'none',
						title: 'err.message',
						duration: 2000
					});
				});
			},
			getRecentSign() {
				let self = this;
				getRecentSign({}).then(res => {
					if (res.retCode === 0) {
						self.clockData.splice(0, self.clockData.length);

						self.days = res.data.filter(v => v.clockStatus > 0).length;

						let clockData = res.data.filter(v => v.clockStatus > 0);

						clockData.forEach(v => {
							let item = {
								dash: 1,
								clock: v.clockStatus,
							}
							self.clockData.push(item);
						})

						for (let i = 0; i < (7 - clockData.length); i++) {
							self.clockData.push({
								dash: 0,
								clock: 0,
							})
						}

						if (self.clockData.length > 0) {
							self.clockData[0].dash = null;
						}
					}
				});
			}

		},
	}
</script>

<style scoped lang="scss">
	.short-line-bold {
		width: 30rpx;
		height: 4rpx;
	}

	.short-line {
		width: 30rpx;
		height: 1rpx;
	}

	.op {
		opacity: 30%;
	}

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;

		.header {
			width: 100%;
			height: 33%;

			.btn-box {
				margin-top: 60rpx;
				width: 180rpx;
				height: 180rpx;
				border-radius: 180rpx;
			}
		}

		.progress {
			padding-top: 60rpx;

			.progress-box {
				width: 100%;
				padding-top: 30rpx;
				padding-bottom: 150rpx;
			}
		}
	}
</style>