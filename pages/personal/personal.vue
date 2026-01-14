<template>
	<view class="container">
		<!-- #ifndef H5 -->
		<view class="bg-theme position-fixed" style="top:0;left:0;right:0;z-index: 999;">
			<view :style="'height:'+statusbarHeight+'px'" style="width:100%"></view>
			<view class="flex align-center" :style="'width:' +menubarLeftPosition+'px;height:40px'">
				<!-- #ifdef MP-WEIXIN -->
				<view class="flex-twice text-lg color-white padding-left-lg"></view>
				<!-- #endif -->
				<!-- #ifndef MP-WEIXIN -->
				<view class="flex-sub"></view>
				<view class="flex-twice text-center text-lg color-white"></view>
				<!-- #endif -->
				<!-- #ifdef APP-PLUS -->
				<view class="flex-sub flex align-center justify-end padding-right margin-right-sm">
				<!-- #endif -->
					<!-- #ifndef APP-PLUS -->
					<view class="flex-sub flex align-center justify-end margin-right-xs">
					<!-- #endif -->
						<uni-icons class="nav-right-btn" type="chat" color="white" size="25" @click="toMessage" />
						<image class="sign-image nav-right-btn" :src="imgUrl+'/personal/ic_sign.png'" @click="toSign"
							v-if="isShowSignModule" />
					</view>
				</view>
			</view>
			<!-- #endif -->

			<view :style="'padding-top:'+ (contentTop) +'px;'">
				<!-- #ifdef H5  -->
				<uni-transition class="top-notify-tips" :duration="2000" :mode-class="modeClass"
					:styles="transformClass" :show="transShow">
					<uni-notice-bar :showClose="true" :show="isShowNotice" text="关注【云加工】公众号，可获得金豆两颗哦！"
						@close="closeNotice" />
				</uni-transition>
				<!-- #endif  -->
				<view class="bg-theme padding-tb margin-bottom-xl">
					<view class="padding-lr flex align-center" @click.stop="switchToUrl(urlList.userInfo)">
						<view style="position: relative;min-width: 100rpx;height:100rpx;">
							<image class="avatar-image" @touchstart="touchStart" @touchend="touchEnd"
								@click.stop="avatarClicked"
								:src="(!token || !userData.avatar)?defaultUserAvatar:userData.avatar" />
							<view v-show="token && isShowIdentifyIcon">
								<view
									class="radius-x gray-border-1 flex align-center justify-center color-white text-xss"
									style="position:absolute;bottom:-2rpx;right:0;width:30rpx;height:30rpx;"
									:class="userData.userVerifyStatus === 2?'bg-theme':(userData.userVerifyStatus === 3?'bg-blue':'')">
									{{userData.userVerifyStatus === 2?'个':(userData.userVerifyStatus === 3?'企':'')}}
								</view>
							</view>
						</view>

						<!--            个人信息开始-->
						<view class="flex flex-direction align-start justify-center color-white margin-left">
							<view class="text-xxl text-bold" v-if="!token || !userData.id">登录/注册</view>
							<view class="text-xxl flex flex-direction" v-else>
								<view class="flex align-center justify-start text-bold">
									<view>{{ userData.realName }}</view>
									<image class="deposit-image"
										:style="'display:'+userData.depositCount?'block':'none'"
										:src="imgUrl+'/personal/baozhengjinbai.png'" />
								</view>
								<view v-if="userData.userVerifyStatus === 3" class="text-lg">
									{{ userData.companyName }}
								</view>
							</view>
						</view>
						<!--            个人信息结束-->
					</view>

					<!--            发单、信誉度开始-->
					<view class="flex text-lg margin-top-xl padding-lr color-white">
						<view class="flex flex-direction align-center justify-center flex-sub">
							<view class="margin-bottom-xss">
								{{ userData.userAverageScoreAVG ? Math.round(userData.userAverageScoreAVG) : 0 }}
							</view>
							<view class="text-sm">评价分</view>
						</view>
						<view class="flex flex-direction align-center justify-center flex-sub">
							<view class="margin-bottom-xss">
								{{ userData.reputationScore ? userData.reputationScore : 0 }}
							</view>
							<view class="text-sm">信誉度</view>
						</view>
						<view class="flex flex-direction align-center justify-center flex-sub">
							<view class="margin-bottom-xss">{{ userData.releaseWorkCnt ? userData.releaseWorkCnt : 0 }}
							</view>
							<view class="text-sm">发单量</view>
						</view>
						<view class="flex flex-direction align-center justify-center flex-sub">
							<view class="margin-bottom-xss">{{ userData.orderCnt ? userData.orderCnt : 0 }}</view>
							<view class="text-sm">成单量</view>
						</view>
					</view>
					<!--            发单、信誉度结束-->

					<!--            金豆余额开始-->
					<view style="position: relative;height: 60px;" class="margin-lr">
						<view class="bg-white flex padding-tb-lg radius-l"
							style="position:absolute;top:30rpx;left: 0;width: 100%;">
							<view class="flex flex-direction flex-sub align-center justify-center"
								@click.stop="switchToUrl(urlList.money)">
								<image style="width:50rpx;height:40rpx" :src="imgUrl+'/personal/yue.png'" />
								<view class="text-df text-gray-5 margin-top-sm">钱包</view>
							</view>
							<view class="flex flex-direction flex-sub align-center justify-center"
								@click.stop="switchToUrl(urlList.goldBean)">
								<image style="width:42rpx;height:42rpx" :src="imgUrl+'/personal/jindou.png'" alt="" />
								<view class="text-df text-gray-5 margin-top-sm">金豆</view>
							</view>
							<view class="flex flex-direction flex-sub align-center justify-center"
								@click.stop="switchToUrl(urlList.credit)">
								<image style="width:50rpx;height:40rpx" :src="imgUrl+'/personal/kaquan.png'" alt="" />
								<view class="text-df text-gray-5 margin-top-sm">卡券</view>
							</view>
						</view>
					</view>
					<!--            金豆余额结束-->
				</view>

				<!--列表开始-->
				<scroll-view scroll-y class="padding-top-xs h5-margin bg-gray-1" :style="'height:'+listHeight+'px;'">
					<view class="padding-lr padding-top">
						<view class="radius bg-white margin-bottom">
							<!--                我是接单方开始-->
							<view class="flex padding-tb-lg">
								<view class="flex-treble flex flex-direction align-center justify-center">
									<image class="party-image" :src="imgUrl+'/personal/work.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">我是接单方</view>
								</view>

								<view class="flex-twice flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.publishWork)">
									<image class="btn-image" :src="imgUrl+'/personal/fabu.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">已发布</view>
								</view>

								<view class="flex-twice flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.contactedReleaseWork)">
									<image class="btn-image" :src="imgUrl+'/personal/cuohe.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">已联系</view>
								</view>
								<view class="flex-twice flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.transactionWork)">
									<image class="btn-image" :src="imgUrl+'/personal/exchange.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">接单交易</view>
								</view>


							</view>
							<!--                我是接单方结束-->
							<!--                我是发单方开始-->
							<view class="flex padding-tb-lg">
								<view class="flex-treble flex flex-direction align-center justify-center">
									<image class="party-image" :src="imgUrl+'/personal/sendimg.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">我是发单方</view>
								</view>

								<view class="flex-twice flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.publishReleaseWork)">
									<image class="btn-image" :src="imgUrl+'/personal/fabbublue.png'" alt="" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">已发布</view>
								</view>

								<view class="flex-twice flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.contactedWork)">
									<image class="btn-image" :src="imgUrl+'/personal/cuoheblue.png'" alt="" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">已联系</view>
								</view>
								<view class="flex-twice flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.transactionReleaseWork)">
									<image class="btn-image" :src="imgUrl+'/personal/exchangeb.png'" alt="" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">外发交易</view>
								</view>

							</view>
							<!--                我是发单方结束-->
						</view>
						<view class="radius bg-white margin-bottom padding-bottom">
							<view class="text-lg text-gray-5 text-bold padding">商城</view>
							<view class="flex">
								<view class="flex-sub flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.commodity)">
									<image style="width:53rpx;height:53rpx" :src="imgUrl+'/mall/ic_stock.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">商品</view>
								</view>

								<view class="flex-sub flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.saleOrder)">
									<image class="btn-image" :src="imgUrl+'/mall/ic_commodity_transaction.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">销售订单</view>
								</view>
								<view class="flex-sub flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.purchaseOrder)">
									<image class="btn-image" :src="imgUrl+'/mall/ic_commodity_transaction_buyer.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">采购订单</view>
								</view>
								<view class="flex-sub flex flex-direction align-center justify-center" />
							</view>
						</view>

						<view class="radius bg-white margin-bottom padding-bottom" v-if="isShowGiftStore">
							<view class="text-lg text-gray-5 text-bold padding">金豆换礼品</view>
							<view class="flex">
								<view class="flex-sub flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.giftList)">
									<image class="btn-image" :src="imgUrl+'/ic_gift.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">礼品小店</view>
								</view>

								<view class="flex-sub flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.myGiftCart)">
									<image class="btn-image" :src="imgUrl+'/ic_cart_round.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">购物车</view>
								</view>
								<view class="flex-sub flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.myGift)">
									<image class="btn-image" :src="imgUrl+'/ic_gift_list.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">礼品清单</view>
								</view>
								<view class="flex-sub flex flex-direction align-center justify-center" />
							</view>
						</view>

						<view class="radius bg-white margin-bottom padding-bottom">
							<view class="text-lg text-gray-5 text-bold padding">服务</view>
							<view class="flex">
								<view class="flex-sub flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.stick)">
									<image class="btn-image-2" :src="imgUrl+'/personal/ic_top.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">置顶</view>
								</view>
								<view class="flex-sub flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.favorite)">
									<image class="btn-image" :src="imgUrl+'/personal/mark.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">收藏</view>
								</view>
								<view class="flex-sub flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.subscribe)">
									<image style="width:38rpx;height:50rpx" :src="imgUrl+'/personal/ic_dingyue.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">订阅</view>
								</view>
								<!-- 							<view class="flex-sub flex flex-direction align-center justify-center"
								@click.stop="switchToUrl(urlList.complaint)">
								<image style="width:45rpx;height:50rpx"
									:src="imgUrl+'/personal/ic_five_complaint.png'" />
								<view class="yjg-work-text text-sm margin-top-sm text-gray-5">我的投诉</view>
							</view> -->
								<view class="flex-sub flex flex-direction align-center justify-center"
									@click.stop="switchToUrl(urlList.more,true)">
									<image class="btn-image" :src="imgUrl+'/personal/chat.png'" />
									<view class="yjg-work-text text-sm margin-top-sm text-gray-5">更多服务</view>
								</view>
							</view>
						</view>
						<!--列表结束-->
						<view class="blank"></view>
					</view>
				</scroll-view>
			</view>
		</view>

</template>

<script>
	import {
		active,
		imgUrl
	} from '@/utils/config';

	import uniNoticeBar from '@/components/uni-notice-bar/uni-notice-bar.vue';
	import uniTransition from "@/components/uni-transition/uni-transition.vue";
	import uniIcons from "@/components/uni-icons/uni-icons.vue";
	import {
		wxMPSubscribeInfoCheck
	} from "@/api/push";
	import {
		getModuleConfig
	} from "@/api/common";

	import {
		getPerDetailsInfo,
		briefSubscribeTemplate,
		updateSubscribeTemplate,
		adminLogin
	} from "@/api/user";

	// #ifdef APP-PLUS
	let jpushModule = uni.requireNativePlugin("JG-JPush");
	import {
		judgeIosPermission
	}
	from "@/js_sdk/wa-permission/permission.js"
	// #endif

	export default {
		name: "personal",
		components: {
			uniNoticeBar,
			uniTransition,
			uniIcons
		},
		data() {
			return {
				imgUrl: imgUrl,
				statusbarHeight: 0,
				menubarLeftPosition: 375,
				contentTop: 0,
				listHeight: 0,

				active: active,
				userData: {},
				urlList: {
					userInfo: "./userInfo",
					money: "/pagesPersonal/wallet/myWallet",
					goldBean: "/pagesPersonal/goldBean/myGoldBean",
					credit: "/pagesPersonal/card/cardList",

					transactionWork: "/pagesPersonal/myWork/transactionWork",
					contactedWork: "/pagesPersonal/myReleaseWork/contactedWork",
					publishWork: "/pagesPersonal/myWork/publishWork",

					transactionReleaseWork: "/pagesPersonal/myReleaseWork/transactionReleaseWork",
					contactedReleaseWork: "/pagesPersonal/myWork/contactedReleaseWork",
					publishReleaseWork: "/pagesPersonal/myReleaseWork/publishReleaseWork",

					commodity: "/pagesPersonal/myMall/publishMall",
					saleOrder: "/pagesPersonal/myMall/myCommoditySellTransaction",
					purchaseOrder: "/pagesPersonal/myMall/myCommodityBuyTransaction",

					giftList: "/pagesGiftStore/giftStore/giftList",
					myGiftCart: "/pagesGiftStore/giftCart/myGiftCart",
					myGift: "/pagesGiftStore/giftCart/myGift",

					favorite: "./myMarked",
					subscribe: "./mySubscribe",
					complaint: "./myComplaint",
					more: "/pagesMore/index",
					stick: "/pagesPersonal/myStick/stick-apply-list",
				},
				isShowIdentifyIcon: true,
				defaultUserAvatar: '', //默认头像
				token: null,

				isShowNotice: false,
				transShow: false,
				modeClass: ['fade', 'slide-top'],
				transformClass: {
					'position': 'fixed',
					'bottom': 0,
					'top': 0,
					'left': 0,
					'right': 0,
					'display': 'flex',
				},
				isShowGiftStore: false, //是否显示金豆商城
				isShowSignModule: false, //是否可以签到

				mainSwitch: true,
				templateList: [],
				toAsk: [],

				touchStartTime: null,
				touchEndTime: null,
			}
		},
		//tab点击
		onTabItemTap() {
			//腾讯一次性订阅消息，规则是每订阅一次，可以得到一次推送订阅消息，所以要用户不断的使用小程序，不断的请求订阅消息，才能持续收到订阅消息，如果不用，已经发过一次通知后，就收不到了
			// #ifdef MP-WEIXIN
			let lastAskTime = uni.getStorageSync('lastAskTime');

			if ((!lastAskTime || ((new Date().getTime() - lastAskTime) > 10 * 60 * 1000))) {
				if (this.token) {
					this.briefSubscribeTemplate();
				}
			}
			// #endif
		},
		onLoad() {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync("user")


			this.getSystemStatusBarHeight();

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync("user")

			if (!!uni.getStorageSync("needRefresh")) {
				uni.removeStorageSync("needRefresh");
				this.initData();
			}

			// #ifdef APP-PLUS
			let notifyConfirmTime = uni.getStorageSync('notifyConfirmTime');
			if (!notifyConfirmTime) {
				notifyConfirmTime = new Date().getTime();
			}
			if ((new Date().getTime() - notifyConfirmTime) > 3 * 60 * 60 * 1000) {
				uni.setStorageSync('notifyConfirmTime', new Date().getTime());
				this.toCheckNotify();
			}
			// #endif

		},
		methods: {
			//获取系统状态栏高度
			getSystemStatusBarHeight: function() {
				// #ifdef APP-PLUS
				var height = plus.navigator.getStatusbarHeight();
				this.statusbarHeight = height;
				this.contentTop = this.statusbarHeight + 40; //加上标题栏高度
				// #endif

				// #ifdef MP-WEIXIN
				var rec = uni.getMenuButtonBoundingClientRect();
				this.statusbarHeight = rec.top - (40 - rec.height) / 2;
				this.menubarLeftPosition = rec.left - 5;
				this.contentTop = this.statusbarHeight + 40; //加上标题栏高度
				// #endif

				this.listHeight = uni.getWindowInfo().safeArea.bottom - this.contentTop - 228;

				// #ifdef H5
				this.contentTop = this.statusbarHeight; //加上标题栏高度
				this.listHeight -= 100;
				// #endif
			},
			initData() {
				let defaultResource = uni.getStorageSync("defaultResource");
				this.defaultUserAvatar = defaultResource[4].resourceUrl[0];

				this.getModuleConfig();

				if (!!this.token) {
					this.loadUserData();
				}


			},
			aniHandle() {
				this.transShow = true;
				setTimeout(() => {
					this.transShow = false;
				}, 5000)
			},
			getModuleConfig() {
				let self = this;
				getModuleConfig().then(res => {
					if (res.retCode === 0) {
						self.isShowGiftStore = !!res.data.giftStoreStatus;
						self.isShowSignModule = !!res.data.signModuleStatus;
					}
				});
			},
			//查询用户是否关注云加工公众号
			getWxSubscribeInfoForUser() {
				let self = this;
				let param = {
					projectName: 'YJG',
				}
				wxMPSubscribeInfoCheck(param).then(res => {
					if (res.retCode === 0) {
						if (res.data) {
							self.isShowNotice = false;
							self.transShow = false;
						} else {
							let lastTipForceCloseTime = uni.getStorageSync("tipForceCloseTime");
							if (!lastTipForceCloseTime || (new Date().getTime() - lastTipForceCloseTime) > 24 *
								60 * 60 * 1000) {
								self.isShowNotice = true
								self.aniHandle();
							}
						}
					}
				});
			},

			//关闭分享信息显示
			closeNotice() {
				this.transShow = false
				uni.setStorageSync('tipForceCloseTime', new Date().getTime())
			},

			//获取用户个人信息
			loadUserData() {
				let self = this;
				getPerDetailsInfo().then(res => {
					if (res.retCode === 0) {
						if (res.data) {
							uni.setStorageSync('user', res.data);
							self.isShowIdentifyIcon = res.data.userVerifyStatus !== 1;
							res.data.userAverageScoreAVG = !res.data.userAverageScoreAVG ? '' : res.data
								.userAverageScoreAVG
							self.userData = Object.assign({}, res.data);
						}


						//#ifdef H5
						self.getWxSubscribeInfoForUser()
						//#endif

						// #ifdef MP-WEIXIN
						self.initSubscribeTemplate();
						// #endif
					}
				});
			},
			switchToUrl(url, noNeedToken) {
				if (!noNeedToken && !this.token) {
					this.toLogin();
				} else {
					uni.navigateTo({
						url: url,
					})
				}
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
			toCheckNotify() {
				let platform = uni.getStorageSync("platform")
				if (platform === 'android') {
					jpushModule.isNotificationEnabled((result) => {
						console.log("result=", result);
						let status = result.code
						if (status === 0) {
							uni.showModal({
								title: '小二提醒',
								content: '您未打开APP通知权限，有可能收不到系统通知！现在去打开吗？',
								cancelText: '取消',
								confirmText: '确定',
								confirmColor: '#fb5318',
								success: function(res1) {
									if (res1.confirm) {
										uni.openAppAuthorizeSetting();
									}
								}
							})
						}
					});
				} else if (platform === 'ios') {
					var e = judgeIosPermission("push");
					if (!e) {
						uni.showModal({
							title: '小二提醒',
							content: '您未打开APP通知权限，有可能收不到系统通知！现在去打开吗？',
							cancelText: '取消',
							confirmText: '确定',
							confirmColor: '#fb5318',
							success: function(res1) {
								if (res1.confirm) {
									uni.openAppAuthorizeSetting();
								}
							}
						})
					}
				}
			},
			toMessage() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: '/pagesMore/message/messageList',
				})
			},
			toSign() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: '/pagesChoose/clock/clock-in',
				})
			},
			initSubscribeTemplate() {
				if (!this.userData.id) {
					return;
				}
				let self = this;
				briefSubscribeTemplate({}).then(res => {
					if (res.retCode === 0) {
						self.templateList = res.data.all; //总模板数组
						self.toAsk = res.data.my; //排除上次问过，还没被使用过的

						self.requestCurrentSubscribe();
					}
				});
			},
			requestCurrentSubscribe() {
				let self = this;
				uni.getSetting({
					withSubscriptions: true,
					success(res) {
						// res.subscriptionsSetting = {
						//   mainSwitch: true, // 订阅消息总开关
						//   itemSettings: {   // 每一项开关
						//     SYS_MSG_TYPE_INTERACTIVE: 'accept', // 小游戏系统订阅消息
						//     SYS_MSG_TYPE_RANK: 'accept'
						//     zun-LzcQyW-edafCVvzPkK4de2Rllr1fFpw2A_x0oXE: 'reject', // 普通一次性订阅消息
						//     ke_OZC_66gZxALLcsuI7ilCJSP2OJ2vWo2ooUPpkWrw: 'ban',
						//   }
						// }
						console.log(res);
						self.mainSwitch = res.subscriptionsSetting.mainSwitch;

						if (!self.mainSwitch) {
							self.templateList.forEach(v => {
								v.enable = false;
							});
						} else {
							self.templateList.forEach(v => {
								if (Object.prototype.hasOwnProperty(res.subscriptionsSetting.itemSettings,
										v.templateId) && res.subscriptionsSetting.itemSettings[v
										.templateId] === 'ban') {
									v.enable = false;
								} else {
									v.enable = true;
								}
							})
						}
					}
				});
			},
			briefSubscribeTemplate() {
				let self = this;
				briefSubscribeTemplate({}).then(res => {
					if (res.retCode === 0) {
						self.toAsk = res.data.my; //排除上次问过，还没被使用过的

						self.requestSubscribe();
					}
				});
			},
			requestSubscribe() {
				//排除不要问的
				this.templateList.forEach(v => {
					if (this.toAsk.indexOf(v.templateId) > -1) {
						v.enable = true;
					} else {
						v.enable = false;
					}
				})

				console.log("templateList=", this.templateList);

				let tmpAsk = this.templateList.filter(v => v.enable).map(v => v.templateId);
				if (tmpAsk.length === 0) {
					return true;
				}

				//取前3项
				if (tmpAsk.length > 3) {
					tmpAsk = tmpAsk.splice(0, 3);
				}

				console.log("tmpAsk==", tmpAsk);

				let self = this;

				uni.setStorageSync('lastAskTime', new Date().getTime());

				uni.requestSubscribeMessage({
					tmplIds: tmpAsk,
					success(res) {
						console.log(res);
						let arr = [];
						tmpAsk.forEach(v => {
							if (!!res[v]) {
								arr.push({
									enumId: self.templateList.find(m => m
										.templateId === v).enumId,
									status: res[v],
								})
							}
						})
						self.updateSubscribe(arr);
					},
					fail(res) {
						console.log(res);
					}
				})
			},
			updateSubscribe(list) {
				let self = this;
				updateSubscribeTemplate(list).then(res => {
					console.log(res);
				});
			},
			touchStart() {
				this.touchStartTime = new Date().getTime();
			},
			touchEnd() {
				this.touchEndTime = new Date().getTime();
				//#ifdef H5
				this.avatarClicked();
				//#endif
			},
			avatarClicked() {
				if (this.touchEndTime - this.touchStartTime > 500) {
					this.handleAvatarLongPress();
				} else {
					if (this.token) {
						this.switchToUrl(this.urlList.userInfo)
					} else {
						this.toLogin();
					}
				}
			},
			handleAvatarLongPress() {
				// #ifndef APP-PLUS
				if (!this.userData) {
					return;
				}
				let token = uni.getStorageSync("adminToken");
				if (!token) {
					this.adminLogin();
				} else {
					uni.navigateTo({
						url: '/pagesAdmin/admin/index',
					})
				}
				// #endif
			},
			adminLogin() {
				let self = this;
				let param = {
					phone: this.userData.mobile,
				}
				adminLogin(param).then(res => {
					if (res.retCode === 0) {
						uni.setStorageSync("adminToken", res.data.adminToken);
						setTimeout(() => {
							uni.navigateTo({
								url: '/pagesAdmin/admin/index',
							})
						},500)
					}
				});
			}
		},
		/**
		 * 用户点击右上角分享 ---小程序
		 */
		onShareAppMessage: function(ops) {
			if (ops.from === 'menu') {
				// 来自右上角转发菜单
			}
			if (ops.from === 'button') {
				// 页面内转发按钮
				console.log(ops.target)
			}
			return {
				title: '云加工小程序',
				path: '/pages/index/index',
				imageUrl: this.imgUrl + '/share.png',
				success: function(res) {
					console.log("转发成功:" + JSON.stringify(res));
				},
				fail: function(res) {
					// 转发失败
					console.log("转发失败:" + JSON.stringify(res));
				}
			}
		},
	}
</script>

<style scoped lang="scss">
	@import '../../static/css/noticeBar.css';

	.container {
		width: 100%;
		height: 100%;

		/* #ifdef H5 */
		overflow-y: hidden;
		/* #endif */

		.blank {
			height: 100rpx;
		}
	}

	.h5-margin {
		/* #ifdef H5 */
		padding-top: 20rpx;
		margin-bottom: 100rpx;
		/* #endif */
	}

	.sign-image {
		width: 36rpx;
		height: 36rpx;
		padding: 0 10rpx 0 16rpx;
	}

	::v-deep .uni-noticebar__content-text {
		font-size: 26rpx !important;
	}

	.avatar-image {
		width: 100rpx;
		height: 100rpx;
		border: 2rpx solid #eeeeee;
		border-radius: 100rpx;
	}

	.deposit-image {
		margin-left: 15rpx;
		width: 32rpx;
		height: 40rpx;
	}

	.party-image {
		width: 60rpx;
		height: 60rpx;
	}

	.btn-image {
		width: 50rpx;
		height: 50rpx;
	}

	.btn-image-2 {
		width: 60rpx;
		height: 60rpx;
	}
</style>