<template>
	<view class="container">
		<view-pager :pageDataFun="pageDataFun" :params="param" @change="idChanged" :single-page="singlePage">
			<work-order-detail :node-id="param.id" :key="param.id" :from-admin="param.fromAdmin" v-if="showInfo"
				:direct-open="param.o" />
		</view-pager>
	</view>
</template>

<script>
	import workOrderDetail from "./work-order-detail";
	import viewPager from "../components/view-pager.vue";
	import {
		filterWorkOrder,
		getWorkOrderDetailsByIdAnon
	} from "@/api/workinfo";
	import {
		infoInfoShare,
		createInfoShareRecord,
	} from "@/api/user";
	import {
		getWorkInfoShareContent,
		getInfoPageShareConfigMini
	} from "@/api/wx_api";

	export default {
		name: "workDetails",
		components: {
			viewPager,
			workOrderDetail
		},
		data() {
			return {
				token: null,
				pageDataFun: filterWorkOrder,
				param: {},
				singlePage: true,
				workOrder: {},
				userData: {},

				showInfo: false,
				infoShare: {},
			}
		},
		onLoad(query) {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");

			if (!!query.p) {
				this.singlePage = false;
				this.param = JSON.parse(decodeURIComponent(query.p));
			} else {
				this.singlePage = true;
				this.param = {
					id: query.id != null ? parseInt(query.id) : null,
					o: query.o == null ? '' : query.o,
					fromAdmin: !query.fromAdmin ? 0 : parseInt(query.fromAdmin),
					infoShareId: query.infoShareId != null ? parseInt(query.infoShareId) : null,
				}
			}

			if (!this.param.o && !this.token) {
				this.toLogin();
			} else {
				this.getWorkOrderByIdAnon();
			}
		},
		methods: {
			idChanged(nodeId) {
				this.param.id = nodeId;
				this.getWorkOrderByIdAnon();
			},
			getWorkOrderByIdAnon() {
				let paramsData = {
					id: this.param.id,
				}
				let self = this;
				getWorkOrderDetailsByIdAnon(paramsData).then(res => {
					if (res.retCode === 0) {
						self.showInfo = true;

						self.workOrder = res.data;

						if (!!self.workOrder.img) {
							self.workOrder.img = JSON.parse(self.workOrder.img);
						} else {
							self.workOrder.img = [];
						}

						// #ifdef H5
						self.getShareConfig()
						// #endif

						//公众号或小程序 分享成功被用户点击
						if (self.param.infoShareId) {
							self.getInfoShare();
						}
					}
				});
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
			//获取公众号分享配置文件
			getShareConfig() {
				let jweixin = require('@/components/jweixin/index.js');
				let self = this
				let paramsData = {
					infoId: this.workOrder.id,
					pageType: 1, //1---承接，0---外发
					infoSharer: this.userData ? this.userData.id : null,
					projectName: 'YJG',
					url: location.href.split('#')[0],
				}
				getWorkInfoShareContent(paramsData).then(res => {
					if (res.retCode === 0) {
						let title = res.data.title
						let icon = res.data.icon
						let des = res.data.content
						let url = res.data.url
						jweixin.config({
							debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
							appId: res.data.appId, // 必填，公众号的唯一标识
							timestamp: res.data.timestamp, // 必填，生成签名的时间戳
							nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
							signature: res.data.signature, // 必填，签名
							jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData',
								'onMenuShareAppMessage', 'onMenuShareTimeline'
							] // 必填，需要使用的JS接口列表

						});
						jweixin.ready(function() {
							//分享到微信朋友圈（即将废弃。可以获取到用户是分享还是取消）
							jweixin.onMenuShareTimeline({
								title: title,
								desc: des,
								link: url,
								imgUrl: icon,
								success: function() {},
								cancel: function() {}
							})
							//分享到微信朋友（即将废弃。可以获取到用户是分享还是取消）
							jweixin.onMenuShareAppMessage({
								title: title, // 分享标题
								desc: des, // 分享描述
								link: url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
								imgUrl: icon, // 分享图标
								// type: '', // 分享类型,music、video或link，不填默认为link
								// dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
								success: function() {},
								cancel: function() {},
							});
						})
					}
				});
			},

			getInfoShare() {
				let self = this;
				infoInfoShare({
					id: this.param.infoShareId
				}).then(res => {
					if (res.retCode === 0) {
						self.infoShare = res.data;

						self.createInfoShareRecord();
					}
				});
			},
			//公众号分享成功被用户点击
			createInfoShareRecord() {
				let paramsData = {
					infoId: this.workOrder.id, //信息ID
					infoOwner: this.infoShare.infoOwner, //信息发布者ID
					type: 1, //信息类型
					infoSharer: this.infoShare.infoSharer, //信息分享者的ID
				}
				paramsData['openId'] = uni.getStorageSync('openId');

				createInfoShareRecord(paramsData).then(res => {
					if (res.retCode === 0) {}
				});
			},
		},
		/**
		 * 用户点击右上角分享 ---小程序 mini
		 */
		// #ifdef MP-WEIXIN
		onShareAppMessage: function(ops) {
			let self = this;

			let title = "朋友！帮我点一下，平台有金豆赠送啦！";
			let path = '/pages/index/index';

			const promise = new Promise(resolve => {
				let pa = {
					infoId: this.param.id,
					infoSharer: this.userData ? this.userData.id : null,
					pageType: 1, //外发详情(0),承接详情(1),商品详情(2),首页(3);
				}
				getInfoPageShareConfigMini(pa).then(res => {
					if (res.retCode === 0) {
						resolve({
							title: res.data.title,
							path: res.data.path,
							imageUrl: res.data.img ? res.data.img : '',
						})
					}
				});
			});
			return {
				title: title,
				path: path,
				promise
			}
		},
		onShareTimeline() {
			return {
				title: this.workOrder.title,
				query: {
					o: 's',
					type: 1
				},
				imageUrl: (this.workOrder.img && this.workOrder.img.length > 0) ? this.workOrder.img[0] : '',
			}
		},
		// #endif
	}
</script>

<style scoped lang="scss">
</style>