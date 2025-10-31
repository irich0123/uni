<template>
	<view class="dialog bg-gray-1 flex justify-center flex-direction align-center" v-if="showDialog">
		<view class="title">服务协议和隐私政策</view>
		<view class="content text-gray-5 text-df">
			请你务必审慎阅读、充分理解“服务协议”和“隐私政策”各条款，包括但不限于：为了更好的向你提供服务，我们需要收集你的设备标识、操作日志等信息用于分析、优化应用性能。你可阅读
			<text class="text-theme" @click="linkClick(0)">《服务协议》</text>和
			<text class="text-theme" @click="linkClick(1)">《隐私政策》</text>
			了解详细信息。如果你同意，请点击下面按钮开始接受我们的服务。
		</view>
		<view class="btn-line flex margin-top margin-bottom-ssm">
			<view class="btn text-df" @click="disagree">不同意并退出</view>
			<view @click="agree" class="btn btn-agree text-normal">同意</view>
		</view>
	</view>
</template>

<script>
	import {
		initApp
	} from "@/utils/init";
	import {
		initPush
	} from "@/utils/push";
	import {
		webUrl
	} from "@/utils/config";

	export default {
		data() {
			return {
				linkList: [{
						"url": webUrl + '/useragreement/index.html',
						"name": '用户协议',
					},
					{
						"url": webUrl + '/privacy/index.html',
						"name": '隐私政策',
					},
				],
				showDialog: false,
			}
		},
		onLoad() {
			//#ifndef APP-PLUS 
			uni.reLaunch({
				url: "/pages/index/splash",
			})
			//#endif

			//#ifdef APP-PLUS 
			let platform = uni.getSystemInfoSync().osName;
			uni.setStorageSync("platform", platform);

			let agree = uni.getStorageSync('agree');
			if (!agree) {
				this.showDialog = true;
			} else {
				uni.redirectTo({
					url: "/pages/index/splash",
				})
			}
			//#endif
		},
		methods: {
			linkClick(index) {
				uni.navigateTo({
					url: '/pages/common/webview?title=' + encodeURIComponent(this.linkList[index].name) + '&url=' +
						encodeURIComponent(this.linkList[index].url),
				})
			},
			disagree() {
				// #ifdef APP-PLUS
				switch (uni.getSystemInfoSync().osName) {
					case 'android':
						plus.runtime.quit();
						break;
					case 'ios':
						const exitIosAPP = uni.requireNativePlugin('CGF-ExitIosApp');
						exitIosAPP.exitIosApp();
						break;
					default:
						console.log('运行在开发者工具上')
						break;
				}
				// #endif
			},
			agree() {
				uni.setStorageSync('agree', 1) // 设置缓存，下次进入应用不再弹出

				uni.setStorageSync("deviceInfo", plus.device.getDeviceId());

				initApp();

				initPush();
				
				uni.reLaunch({
					url: "/pages/index/splash"
				})
			}
		},
	}
</script>

<style lang="scss">
	// 弹窗样式
	.dialog {
		margin: calc(30vh) auto 0 auto;
		width: 600rpx;
		padding-bottom: 10rpx;
		border-radius: 16rpx;

		.title {
			text-align: center;
			line-height: 100rpx;
			font-size: 34rpx;
			font-weight: 600;
		}

		.content {
			line-height: 1.7;
			padding: 0 32rpx;
			text-indent: 1em;

		}

		.btn-line {
			width: 90%;

			.btn {
				flex: 1;
				text-align: center;
				padding: 10rpx 0;
				background-color: #cccccc;
				margin: 0 20rpx;
				color: #777777;
				border-radius: 10rpx;
			}

			.btn-agree {
				color: #fb5318;
			}
		}
	}
</style>