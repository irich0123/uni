<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="热心推广送金豆" @action="navAction" @reSize="reSize" />
		<!-- #endif -->
		<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:'+ (contentTop) +'px;height:'+listHeight+'px;'"
			@scroll="scrollHandle">
			<image src="https://web.yunjg.net/pullnewgiftbeans/image/bactoph.png" style="width:100%;display:block;"
				mode="widthFix" />
			<image src="https://web.yunjg.net/pullnewgiftbeans/image/bacdownl.png" style="width:100%;display:block;"
				mode="widthFix" />
		</scroll-view>
		<view class="flex align-center justify-center share-panel" :style="'top:'+panelTop +'px'">
			<!-- #ifdef MP-WEIXIN -->
			<button open-type='share' class="open-btn" :plain="true">
				<view class="share-btn">去分享</view>
			</button>
			<!-- #endif -->
			<!-- #ifdef APP-PLUS -->
			<view class="share-btn" @click="handleShare">去分享</view>
			<!-- #endif -->
			<!-- #ifdef H5 -->
			<view class="share-btn">点击屏幕右上角菜单分享</view>
			<!-- #endif -->
		</view>
	</view>
</template>

<script>
	import {
		active,
		imgUrl
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	import {
		queryShareTemplate
	} from '@/api/user.js'
	// #endif
	// #ifdef H5
	import {
		wxShareHomePage
	} from "@/utils/wxPortalShare.js";
	// #endif
	// #ifdef APP-PLUS
	import UniShare from '@/components/uni-share/js_sdk/uni-share.js';
	const uniShare = new UniShare();
	// #endif

	export default {
		name: "jobShare",
		components: {
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				imgUrl: imgUrl,
				token: null,
				userData: {},

				active: active,
				share: {},

				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
				panelTop: 540,
			}
		},
		watch: {
			statusbarHeight: {
				handler(newVal, oldVal) {
					let mobileInfo = uni.getWindowInfo();
					//#ifndef H5
					this.contentTop = newVal + 40;
					this.listHeight = mobileInfo.safeArea.height - newVal;
					this.panelTop = 540 * (mobileInfo.screenWidth / 375);
					//#endif
					//#ifdef H5
					this.listHeight = mobileInfo.safeArea.height;
					this.panelTop = (540 - (this.active === 'prod' ? 76 : 36) - mobileInfo.safeArea.top) * (mobileInfo
						.screenWidth / 375)
					//#endif
				},
				immediate: true,
			}
		},
		onLoad() {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");

			if (!this.token) {
				this.toLogin();
				return;
			}

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
			initData() {
				// #ifdef APP-PLUS
				this.getShareUrl();
				// #endif
				// #ifdef H5
				wxShareHomePage("o=t&u=" + this.userData.id)
				// #endif
			},
			getShareUrl() {
				let self = this;
				let param = {
					pageType: 3, //首页
				}
				queryShareTemplate(param).then(res => { //这里是错误的  todo!!!
					if (res.retCode === 0 && res.data.length > 0) {
						self.share = res.data[0];
					}
				})
			},
			scrollHandle(e) {
				let screen = uni.getWindowInfo();
				//#ifndef H5
				this.panelTop = 540 * (screen.screenWidth / 375) - e.detail.scrollTop;
				//#endif
				//#ifdef H5
				this.panelTop = (540 - (this.active === 'prod' ? 76 : 36) - screen.safeArea.top) * (screen.screenWidth /
						375) - e
					.detail.scrollTop;
				//#endif
			},

			// #ifdef APP-PLUS
			handleShare() {
				let menu = [];
				let self = this;

				uni.getProvider({
					service: 'share',
					success: function(res) {
						if (res.provider.indexOf("weixin") > -1) {
							menu.push({
								"img": "/static/app-plus/sharemenu/wechatfriend.png",
								"text": "微信好友",
								"share": { //当前项的分享参数配置。可覆盖公共的配置如下：分享到微信小程序，配置了type=5
									"provider": "weixin",
									"scene": "WXSceneSession"
								}
							});
						}
						if (res.provider.indexOf("qq") > -1) {
							menu.push({
								"img": "/static/app-plus/sharemenu/qq.png",
								"text": "QQ",
								"share": {
									"provider": "qq"
								}
							})
						}
						if (menu.length === 0) {
							uni.showToast({
								title: '您的设备未安装微信或QQ',
								icon: 'none',
								duration: 2000,
							})
							return;
						}

						let img = self.imgUrl + '/share.png';

						uniShare.show({
							content: { //公共的分享参数配置  类型（type）、链接（herf）、标题（title）、summary（描述）、imageUrl（缩略图）
								type: 5, //分享到小程序
								miniProgram: {
									id: "gh_fff781253752",
									path: "/pages/index/index?o=t&u=" + self.userData.id,
									type: 0,
									webUrl: self.share.localUrl,
								},
								imageUrl: img,
								href: self.share.localUrl,
								title: '没活干就上云加工',
								summary: '没活干就上云加工',
							},
							menus: menu,
							cancelText: "取消分享",
						}, e => { //callback
							console.log(e);
						})
					},
				});
			},
			// #endif
		},
		// #ifdef MP-WEIXIN
		onShareAppMessage: function(ops) {
			if (ops.from === 'menu') {
				// 来自右上角转发菜单
			}
			if (ops.from === 'button') {
				// 页面内转发按钮
				console.log(ops.target)
			}

			let title = "找活用【云加工】就够了";
			let path = '/pages/index/index?o=t&u=' + this.userData.id;

			const promise = new Promise(resolve => {
				queryShareTemplate({
					pageType: 3 //首页
				}).then(res => {
					if (res.retCode === 0 && res.data.length > 0) {
						setTimeout(() => {
							resolve({
								title: res.data[0].title,
								path: path,
								imageUrl: res.data[0].icon ? res.data[0].icon : '',
							})
						}, 200);
					}
				});
			});
			return {
				promise
			}
		},
		// onShareTimeline() {
		// 	return {
		// 		title: '没活干，就上云加工',
		// 		query: 'o=t&u=' + this.userData.id,
		// 		imageUrl: this.imgUrl + '/share.png',
		// 	}
		// },
		// #endif
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;

		.share-panel {

			position: fixed;
			width: 100%;


			.open-btn {
				width: 80%;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;
				border: 0;

				.share-btn {
					width: 100%;
					padding: 20rpx 0;
					height: 56rpx;
					background-image: linear-gradient(#fedd3e, #ffab00);
					border-radius: 0.2rem;
					color: #8a2502;
					font-weight: bold;
					font-size: 20px;
					text-align: center;
					line-height: 1.5;
				}
			}

			.share-btn {
				width: 80%;
				padding: 20rpx 0;
				height: 56rpx;
				background-image: linear-gradient(#fedd3e, #ffab00);
				border-radius: 0.2rem;
				color: #8a2502;
				font-weight: bold;
				font-size: 20px;
				text-align: center;
				line-height: 1.5;
			}

		}

	}
</style>