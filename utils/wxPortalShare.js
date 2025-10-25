let jweixin = require('../components/jweixin/index.js');
import {
	getHomePageShareConfig
} from "../api/wx_api";

//公众号分享

export function wxShareInfoPage(paramData, token) {
	if (!token) { //非会员不能分享
		return;
	}
	let param = {
		infoId: paramData.infoId,
		infoType: paramData.infoType,
	}
	getWxShareConfig(param).then(res => {
		if (res.retCode === 0) {
			console.log(res.data);
			let appid = res.data.appId;
			let timestamp = res.data.timestamp;
			let nonceStr = res.data.nonceStr;
			let signature = res.data.signature;
			let icon = res.data.icon;
			let des = res.data.content;
			// 去微信签名用的Url 和这里实际展示的url可以不一样，所以做了一个转接页面就行了
			let url = res.data.url.split('#')[0] + 'static/html/redirect.html?app3Redirect=' +
				encodeURIComponent(res.data.url);
			let title = res.data.title;
			jweixin.config({
				debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				appId: appid, // 必填，公众号的唯一标识
				timestamp: timestamp, // 必填，生成签名的时间戳
				nonceStr: nonceStr, // 必填，生成签名的随机串
				signature: signature, // 必填，签名
				jsApiList: [
					'updateAppMessageShareData', //自定义“分享给朋友”及“分享到QQ”按钮的分享内容（1.4.0）
					'updateTimelineShareData', //自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容（1.4.0）
				] // 必填，需要使用的JS接口列表

			});
			jweixin.ready(function() {
				jweixin.updateTimelineShareData({
					title: paramData.title ? paramData.title : title,
					desc: des,
					link: url,
					imgUrl: paramData.icon ? paramData.icon : icon,
					success: function() {},
					cancel: function() {
						console.log("取消分享")
					}
				});
				jweixin.updateAppMessageShareData({
					title: paramData.title ? paramData.title : title,
					desc: des,
					link: url,
					imgUrl: paramData.icon ? paramData.icon : icon,
					// type: '', // 分享类型,music、video或link，不填默认为link
					// dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
					success: function() {},
					cancel: function() {
						console.log("取消分享")
					},
				});
			})
		}
	});
}

export function wxShareHomePage(paramData) {
	getHomePageShareConfig(paramData).then(res => {
		console.log("homeShare result==", res);
		if (res.retCode === 0) {
			let appId = res.data.appId;
			let timestamp = res.data.timestamp;
			let nonceStr = res.data.nonceStr;
			let signature = res.data.signature;
			let icon = res.data.icon;
			let des = res.data.content;
			// 去微信签名用的Url 和这里实际展示的url可以不一样，所以做了一个转接页面就行了
			let url = res.data.url + "#/pages/index/index" + (paramData ? "?" + paramData : "")
			let title = res.data.title;
			jweixin.config({
				debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				appId: appId, // 必填，公众号的唯一标识
				timestamp: timestamp, // 必填，生成签名的时间戳
				nonceStr: nonceStr, // 必填，生成签名的随机串
				signature: signature, // 必填，签名
				jsApiList: [
					'updateAppMessageShareData', //自定义“分享给朋友”及“分享到QQ”按钮的分享内容（1.4.0）
					'updateTimelineShareData', //自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容（1.4.0）
				] // 必填，需要使用的JS接口列表

			});
			jweixin.ready(function() {
				jweixin.updateTimelineShareData({
					title: title,
					link: url,
					imgUrl: icon,
					success: function() {},
					cancel: function() {
						console.log("取消分享")
					}
				});
				jweixin.updateAppMessageShareData({
					title: title,
					desc: des,
					link: url,
					imgUrl: icon,
					// type: '', // 分享类型,music、video或link，不填默认为link
					// dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
					success: function() {},
					cancel: function() {
						console.log("取消分享")
					},
				});
			})

		}
	});
}

module.exports = {
	wxShareInfoPage: wxShareInfoPage,
	wxShareHomePage: wxShareHomePage,
}