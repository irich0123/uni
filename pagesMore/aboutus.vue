<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="关于我们" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'"
			v-if="appBasic.id">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="yjg-logo">
				<image :src="imgUrl+appBasic.logoUrl" />
			</view>

			<view class="bg-white margin padding-lr padding-top text-df text-gray-4 radius">
				<view v-for="(item,index) in desc" :key="index" class="padding-bottom" style="line-height: 1.8;">
					{{item}}
				</view>
			</view>

			<view class="bottom-text flex flex-direction">
				<!-- #ifdef APP-PLUS -->
				<view class="text-center text-gray-1 text-ssm text-medium">V {{appBasic.version}}</view>
				<!-- #endif -->
				<view class="text-center text-gray-1 text-ssm text-medium margin-top-sm margin-bottom-xs">
					{{appBasic.copyright}}
				</view>
				<view class="flex justify-center">
					<view v-for="(item,index) in linkList" :key="index">
						<!-- #ifdef MP-WEIXIN -->
						<view class="text-center text-sm text-bold" style="color: #9999ff;"
							@click="toWebView(item.type)" v-if="item.type!==1">
							《{{item.name}}》</view>
							<!-- #endif -->
						<!-- #ifndef MP-WEIXIN -->
						<view class="text-center text-sm text-bold" style="color: #9999ff;"
							@click="toWebView(item.type)">
							《{{item.name}}》</view>
							<!-- #endif -->
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		imgUrl,
		webUrl
	} from '@/utils/config.js';
	import {
		queryAppBasic
	} from '@/api/common.js'

	export default {
		components: {
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listYPosition: 0,
				listHeight: 0,

				appBasic: {},

				linkList: [],
				desc: [],
			}
		},
		watch: {
			statusbarHeight: {
				handler(newVal, oldVal) {
					//#ifndef H5
					this.contentTop = newVal + 40;
					this.listHeight = uni.getWindowInfo().safeArea.height;
					//#endif
					// #ifdef H5
					this.listHeight = uni.getWindowInfo().safeArea.height - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		onLoad() {
			// #ifdef APP-PLUS
			this.theme = uni.getStorageSync("theme");
			uni.onThemeChange((res) => {
				this.theme = (res.theme === 'light' ? 1 : 0);
				uni.setStorageSync("theme", this.theme);
			})
			
			// #endif

			this.loadAppInfo();
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
			loadAppInfo() {
				var self = this;
				queryAppBasic({}).then(res => {
					if (res.retCode === 0 && res.data.length > 0) {
						self.appBasic = res.data[0];

						if (self.appBasic.description) {
							self.desc = self.appBasic.description.split("^")
						}

						self.linkList.splice(0, self.linkList.length);
						if (self.appBasic.userProtocolUrl) {
							self.linkList.push({
								name: '用户服务协议',
								url: webUrl + self.appBasic.userProtocolUrl + "?t=" + new Date().getTime(),
								type: 0,
							})
						}

						if (self.appBasic.privacyUrl) {
							self.linkList.push({
								name: '隐私政策',
								url: webUrl + self.appBasic.privacyUrl + "?t=" + new Date().getTime(),
								type: 1,
							})
						}

						// #ifdef APP-PLUS
						let platform = uni.getStorageSync("platform");
						if (platform === 'android') {
							self.appBasic.version = self.appBasic.androidVersion;
						} else {
							self.appBasic.version = self.appBasic.iosVersion;

						}
						let check = uni.getStorageSync("newAppVersion");
						console.log("check=", check);

						if (!check || !check.time || check.time < (new Date().getTime() - 7 * 24 * 3600 * 1000) ||
							check.versionCode < self.appBasic.androidCode) {
							if (platform === 'android') {
								plus.runtime.getProperty(plus.runtime.appid, (info) => {
									if (self.appBasic.androidCode > parseInt(info.versionCode)) {
										uni.showModal({
											title: '提示',
											content: '检测到已有新版本 v ' + self.appBasic.version +
												'，请至应用宝或手机厂商商店下载使用',
											showCancel: false,
											success: function(res0) {
												if (res0.confirm) {
													uni.setStorageSync("newAppVersion", {
														time: new Date().getTime(),
														versionCode: self.appBasic
															.androidCode,
													})
												} else if (res0.cancel) {}
											}
										});
									}
								})
							} else {
								plus.runtime.getProperty(plus.runtime.appid, (info) => {
									if (self.appBasic.iosCode > parseInt(info.versionCode)) {
										uni.showModal({
											title: '提示',
											content: '检测到已有新版本 v ' + self.appBasic.version +
												'，请至苹果应用商店下载使用',
											showCancel: false,
											success: function(res0) {
												if (res0.confirm) {
													uni.setStorageSync("newAppVersion", {
														time: new Date().getTime(),
														versionCode: self.appBasic
															.androidCode,
													})
												} else if (res0.cancel) {}
											}
										});
									}
								})
							}
						}
						// #endif
					}
				});
			},
			toWebView(index) {
				uni.navigateTo({
					url: '/pages/common/webview?url=' + encodeURIComponent(this.linkList[index].url) + '&title=' +
						encodeURIComponent(this.linkList[index].name),
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.main {
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}

	.yjg-logo {
		width: 200rpx;
		height: 200rpx;
		margin: 120rpx auto 100rpx auto;

		image {
			width: 100%;
			height: 100%;
			border-radius: 20rpx;
		}
	}

	.logo-icon {
		width: 130upx;
	}

	.item-icon {
		width: 60upx;
		height: 60upx;
	}

	.bottom-text {
		position: fixed;
		width: 100vw;
		bottom: 50rpx;
	}
</style>