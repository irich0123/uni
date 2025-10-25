<script>
	// #ifdef APP-PLUS
	let jpushModule = uni.requireNativePlugin("JG-JPush");
	// #endif

	import {
		getNotifyConfigByCode
	} from "@/api/mall";
	import {
		getDefaultResource,
		queryActionConsume
	} from "@/api/common";
	import {
		getAllReleaseWorkType,
		getReleaseWorkStatusEnum,
		getWorkOrderStatusEnum,
		getCommodityStatusEnum
	} from '@/api/basic.js';

	export default {
		onLaunch: function() {
			console.log('App Launch')
			this.initData();

			// #ifdef APP-PLUS
			uni.getSystemInfo({
				success: (resInfo) => {
					uni.setStorageSync("theme", resInfo.osTheme === 'light' ? 1 : 0);
				}
			})
			// #endif

			const clearBadge = () => {
				var UIApplication = plus.ios.import("UIApplication");
				var app = UIApplication.sharedApplication();
				//获取应用图标的数量
				var oldNum = app.applicationIconBadgeNumber();
				if (oldNum != 0) {
					console.log('角标取值', oldNum);
					// console.log("oldNum:"+oldNum);
					var newNum = oldNum - 1;
					//设置应用图标的数量
					plus.runtime.setBadgeNumber(newNum);
					jpushModule.setBadge(newNum);
				}
			}

			const mallNotifyHandle = (code, relationId) => {
				let self = this;
				getNotifyConfigByCode({
					code: code
				}).then(res => {
					if (res.retCode === 0) {
						if (res.data.toUserType != null) {
							if (res.data.toUserType == 0 && code.indexOf("19") === 0) {
								uni.navigateTo({
									url: '/pagesPersonal/myMall/transactionDetailsForBuyer?id=' +
										relationId
								})
							} else if (res.data.toUserType == 1 && code.indexOf("19") === 0) {
								uni.navigateTo({
									url: '/pagesPersonal/myMall/transactionDetailsForSeller?id=' +
										relationId
								})
							} else if (res.data.toUserType == 1 && code.indexOf("16") === 0) {
								if (code === "1601") {
									uni.navigateTo({
										url: '/pagesNew/details/mallDetails?cId=' + relationId,
									})
								} else {
									uni.navigateTo({
										url: '/pagesPersonal/myMall/publishMall',
									})
								}
							}
						}
					}
				})
			}

			const workNotifyHandle = (content) => {
				if (content.indexOf("活信息") === 0) {
					uni.navigateTo({
						url: '/pagesPersonal/myReleaseWork/publishReleaseWork',
					})
				} else if (content.indexOf("承接信息") === 0) {
					uni.navigateTo({
						url: '/pagesPersonal/myWork/publishWorkOrder',
					})
				} else if (content.indexOf("信息置顶") === 0) {
					uni.navigateTo({
						url: '/pagesNew/stick/stickList',
					})
				}
			}

			const toDetail = (extras) => {
				if (!!extras.notifyCode && !!extras.relationId) {
					if (extras.notifyCode.indexOf("19") === 0 || extras.notifyCode.indexOf("16") === 0) {
						mallNotifyHandle(extras.notifyCode, extras.relationId);
					}
				} else if (!extras.notifyCode) {
					workNotifyHandle(extras.title);
				}
			}

			// #ifdef APP-PLUS
			plus.navigator.closeSplashscreen();

			jpushModule.initJPushService();
			jpushModule.setLoggerEnable(true);

			// 监听通知事件
			jpushModule.addNotificationListener(result => {
				let notificationEventType = result.notificationEventType
				let messageID = result.messageID;
				// let title = result.title;
				// let content = result.content;
				let extras = result.extras;

				console.log("result==",result);

				if (notificationEventType === 'notificationOpened') {
					//这里处理被点击的情况；
					//清除这条消息
					jpushModule.removeLocalNotification({
						messageID: messageID,
					})
					clearBadge();

					//跳转相应的页面
					toDetail(extras);
				}
			});

			jpushModule.addCustomMessageListener(result => {
				let type = result.type
				let messageType = result.messageType
				let content = result.content
			});

			jpushModule.addInMessageListener(result => {
				uni.showToast({
					icon: 'none',
					title: JSON.stringify(result),
					duration: 3000
				})
			});
			// #endif
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			initData() {
				let url = "https://img.yunjg.net";

				let defaultResource = [{
						resourceUrl: [url + "/default_resource/detail.png"]
					},
					{
						resourceUrl: [url + "/default_resource/work_order.png"]
					},
					{
						resourceUrl: [url + "/default_resource/work.png"]
					},
					{
						resourceUrl: [url + "/default_resource/work.png"]
					},
					{
						resourceUrl: [url + "/default_resource/awater.png"]
					},
				];
				uni.setStorageSync("defaultResource", defaultResource);

				this.getActionConsumeList();

				let basicTime = uni.getStorageSync("basicDataTime");
				// let basicTime = null;
				if (!basicTime || basicTime < (new Date().getTime() - 1 * 3600 * 1000)) {
					this.getDefaultResource();
					this.getReleaseWorkTypeList();
					this.getReleaseWorkStatusList();
					this.getWorkOrderStatusList();
					this.getCommodityStatusList();
					uni.setStorageSync("basicDataTime", new Date().getTime());
				}
			},
			getActionConsumeList() {
				queryActionConsume({}).then(res => {
					if (res.retCode === 0) {
						uni.setStorageSync("ActionConsume", res.data);
					} else {
						uni.setStorageSync("ActionConsume", []);
					}
				})
			},
			getDefaultResource() {
				getDefaultResource({}).then(res => {
					if (res.retCode === 0) {
						uni.setStorageSync("defaultResource", res.data);
					}
				});
			},
			getReleaseWorkTypeList() {
				getAllReleaseWorkType({}).then(res => {
					if (res.retCode === 0) {
						uni.setStorageSync("releaseWorkTypeList", res.data);
					}
				});
			},
			getReleaseWorkStatusList() {
				getReleaseWorkStatusEnum({}).then(res => {
					if (res.retCode === 0) {
						uni.setStorageSync("releaseWorkStatusList", res.data);
					}
				});
			},
			getWorkOrderStatusList() {
				getWorkOrderStatusEnum({}).then(res => {
					if (res.retCode === 0) {
						uni.setStorageSync("workOrderStatusList", res.data);
					}
				});
			},
			getCommodityStatusList() {
				getCommodityStatusEnum({}).then(res => {
					if (res.retCode === 0) {
						uni.setStorageSync("commodityStatusList", res.data);
					}
				});
			},
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import "@/common/main.css";

	page {
		background-color: transparent;
		height: 100vh;

		overflow: hidden;
	}

	@media (prefers-color-scheme: dark) {
		page {
			background-color: #000000;
		}
	}

	::v-deep iframe {
		/* #ifndef H5  */
		width: 780rpx !important; //解决webview滚动条的问题
		/* #endif  */
	}
</style>