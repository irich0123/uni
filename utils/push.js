import {
	getNotifyConfigByCode
} from "@/api/mall";

const jpushModule = uni.requireNativePlugin("JG-JPush");


export const initPush = () => {
	console.log("jpushModule=", jpushModule);
	console.log("initPush start");

	jpushModule.initJPushService();
	jpushModule.setLoggerEnable(true);

	jpushModule.addConnectEventListener((result) => {
		console.log('监听 极光推送连接状态', result);
		let connectEnable = result.connectEnable;
		uni.$emit('connectStatusChange', connectEnable);
	});

	// 监听通知事件
	jpushModule.addNotificationListener(result => {
		console.log("result==", result);
		let notificationEventType = result.notificationEventType
		let messageID = result.messageID;
		let content = result.content;
		let extras = result.extras;


		if (notificationEventType === 'notificationArrived') {
			console.log("arrived");
			if (extras.notifyCode === '201') {
				var soundUrl = '/static/audio/2.caf';
			} else if (extras.notifyCode === '601') {
				var soundUrl = '/static/audio/happy.caf';
			} else if (extras.notifyCode.length === 0) {
				if (extras.title === "活信息审核失败" || extras.title === "承接信息审核失败") {
					var soundUrl = '/static/audio/info_fail.caf';
				} else if (extras.title === "活信息审核通过" || extras.title === "承接信息审核通过") {
					var soundUrl = '/static/audio/info_success.caf';
				} else if (extras.title === "个人认证审核通过") {
					var soundUrl = '/static/audio/person_success.caf';
				} else if (extras.title === "个人认证审核失败") {
					var soundUrl = '/static/audio/person_fail.caf';
				} else if (extras.title === "企业认证审核通过") {
					var soundUrl = '/static/audio/company_success.caf';
				} else if (extras.title === "企业认证审核失败") {
					var soundUrl = '/static/audio/company_fail.caf';
				}
			}
			let p0 = plus.audio.createPlayer(soundUrl);
			p0.play(function() {}, function(e) {
				if (p0) {
					p0.close();
					p0 = null;
				}
			})
		} else if (notificationEventType === 'notificationOpened') {
			console.log("opened");
			//这里处理被点击的情况；
			//清除这条消息
			jpushModule.removeLocalNotification({
				messageID: messageID,
			})

			let platform = uni.getStorageSync("platform")
			if (platform === 'android') {
				plus.runtime.setBadgeNumber(0);
			} else if (platform === 'ios') {
				clearIosBadge();
			}

			//跳转相应的页面
			toOpenHandle(extras);
		}
	});

	jpushModule.addCustomMessageListener(result => {
		console.log("result==", result);
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

	console.log("initPush done");
}


const clearIosBadge = () => {
	var UIApplication = plus.ios.import("UIApplication");
	var app = UIApplication.sharedApplication();
	//获取应用图标的数量
	var oldNum = app.applicationIconBadgeNumber();
	if (oldNum != 0) {
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

const workNotifyHandle = (extras) => {
	if (extras.title === "活信息审核失败") {
		uni.navigateTo({
			url: '/pagesPersonal/myReleaseWork/publishReleaseWork?o=n&tab=1',
		})
	} else if (extras.title === "活信息审核通过") {
		uni.navigateTo({
			url: '/pagesPersonal/myReleaseWork/publishReleaseWork?o=n&tab=0',
		})
	} else if (extras.title === "承接信息审核通过") {
		uni.navigateTo({
			url: '/pagesPersonal/myWork/publishWork?o=n&tab=0',
		})
	} else if (extras.title === "承接信息审核失败") {
		uni.navigateTo({
			url: '/pagesPersonal/myWork/publishWork?o=n&tab=1',
		})
	} else if (extras.title === "个人认证审核通过" || extras.title === "个人认证审核失败" || extras.title ===
		"企业认证审核通过" || extras.title === "企业认证审核失败") {
		uni.navigateTo({
			url: '/pages/personal/userInfo',
		})
	}
}

const opportunityHandle = (extras) => {
	if (extras.title === '接单提醒') {
		uni.navigateTo({
			url: '/pagesNew/details/sendDetails?id=' + extras.relationId + '&o=n',
		})
	}
}

const toOpenHandle = (extras) => {
	if (extras.notifyCode === '201') {
		opportunityHandle(extras)
	} else if (extras.notifyCode === '601') {
		uni.navigateTo({
			url: '/pages/index/index',
		})
	} else if (!!extras.notifyCode && !!extras.relationId) {
		if (extras.notifyCode.indexOf("19") === 0 || extras.notifyCode.indexOf("16") ===
			0) {
			mallNotifyHandle(extras.notifyCode, extras.relationId);
		}
	} else if (!extras.notifyCode) {
		workNotifyHandle(extras);
	}
}