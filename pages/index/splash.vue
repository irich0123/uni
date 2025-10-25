<template>
	<view class="splash" @click="skip">
		<image alt="" :src="splashUrl" mode="aspectFill" />
		<view class="time">{{ countDown }}s</view>
		<view class="skip" v-if="showSkip">跳过</view>
	</view>
</template>

<script>
	import {
		getActiveSplash
	} from "@/api/common";

	export default {
		data() {
			return {
				splashUrl: null,
				showSkip: false, // 是否显示跳过广告按钮
				countDown: 0, // 倒计时

				timer: null,
			};
		},
		onLoad() {
			this.init();
		},
		methods: {
			init() {
				this.querySplash();
			},
			querySplash() {
				let self = this;
				getActiveSplash({
					onShow: 1
				}).then(res => {
					if (res.retCode === 0 && res.data && res.data.img) {
						self.splashUrl = res.data.img;
						self.showAd();
					} else {
						self.skip();
					}
				}).catch(() => {
					self.skip();
				});
			},
			showAd() {
				this.countDown = 3; // 设置倒计时时间
				this.startCountDown(); // 开始倒计时
			},
			startCountDown() {
				let self = this;
				clearTimeout(self.timer);
				const reload = () => {
					// 1s一次, 轮询中
					self.timer = setTimeout(() => {
						self.countDown--;
						self.startCountDown();
					}, 1000)
				}
				if (this.countDown > 0) {
					reload();
				} else {
					this.skip();
				}
			},
			skip() {
				uni.switchTab({
					url: '/pages/index/index',
				})
			},
		},
	};
</script>

<style scoped lang="scss">
	.splash {
		background-color: white;
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;

		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;

		image {
			width: 100%;
			height: 100%;
		}

		.time {
			position: absolute;
			top: 20px;
			right: 20px;
			font-size: 14px;
			color: #fff;
			background-color: rgba(0, 0, 0, 0.5);
			padding: 5px 10px;
			border-radius: 20px;
		}

		.skip {
			position: absolute;
			bottom: 20px;
			right: 20px;
			font-size: 12px;
			color: #fff;
			background-color: rgba(0, 0, 0, 0.5);
			padding: 5px 10px;
			border-radius: 15px;
			cursor: pointer;
			z-index: 999;
		}
	}

	@media (prefers-color-scheme: dark) {
		.splash {
			background-color: black;
		}
	}
</style>