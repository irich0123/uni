<template>
	<view class="container">
		<view-pager :pageDataFun="pageDataFun" :params="param" @change="idChanged" v-if="!singlePage">
			<commodity-detail :node-id="param.id" :key="param.id" :fromAdmin="param.fromAdmin" :direct-open="param.o"/>
		</view-pager>
		<commodity-detail :node-id="param.id" :key="param.id" :fromAdmin="param.fromAdmin" :direct-open="param.o"
			v-if="singlePage" />
	</view>
</template>

<script>
	import commodityDetail from "./commodity-detail";
	import viewPager from "../components/view-pager.vue";
	import {
		filterCommodity,
		getCommodityById,
		getCommodityShareContent,
	} from "@/api/mall";
	import {
		getInfoPageShareConfigMini
	} from "@/api/wx_api";

	export default {
		name: "mallDetails",
		components: {
			viewPager,
			commodityDetail
		},
		data() {
			return {
				token: null,
				pageDataFun: filterCommodity,
				param: {},
				singlePage: true,
				commodity: {},
				userData: {},
			}
		},
		onLoad(query) {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");

			if (!!query.p) {
				this.singlePage = false;
				this.param = JSON.parse(decodeURIComponent(query.p));
				this.param["fromAdmin"] = this.param.fromAdmin == null ? 0 : 1;
			} else {
				this.singlePage = true;
				this.param = {
					id: query.id != null ? parseInt(query.id) : null,
					o: query.o == null ? '' : query.o,
					fromAdmin: query.fromAdmin == null ? 0 : parseInt(query.fromAdmin),
				}
			}

			this.getCommodityDetailsById();
		},
		methods: {
			idChanged(nodeId) {
				this.param.id = nodeId;
				this.getCommodityDetailsById();
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
			getCommodityDetailsById() {
				let paramsData = {
					id: this.param.id,
				}
				let self = this;
				getCommodityById(paramsData).then(res => {
					if (res.retCode === 0) {
						let commodity = res.data;

						if (!!commodity.photos) {
							commodity.photos = JSON.parse(commodity.photos);
						} else {
							commodity.photos = [];
						}
						self.commodity = commodity;

						// #ifdef H5
						self.getShareConfig()
						// #endif
					}
				});
			},
			getShareConfig() {
				let jweixin = require('@/components/jweixin/index.js');
				let self = this;
				let url = location.href.split('#')[0]
				let paramsData = {
					id: this.commodity.id,
					projectName: 'YJG',
					url: url,
				}
				getCommodityShareContent(paramsData).then(res => {
					if (res.retCode === 0) {
						let des = res.data.desc
						let url = res.data.url
						jweixin.config({
							debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
							appId: res.data.config.appId, // 必填，公众号的唯一标识
							timestamp: res.data.config.timestamp, // 必填，生成签名的时间戳
							nonceStr: res.data.config.nonceStr, // 必填，生成签名的随机串
							signature: res.data.config.signature, // 必填，签名
							jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData',
								'onMenuShareAppMessage', 'onMenuShareTimeline'
							] // 必填，需要使用的JS接口列表

						});
						jweixin.ready(function() {
							//分享到微信朋友圈（即将废弃。可以获取到用户是分享还是取消）
							jweixin.onMenuShareTimeline({
								title: self.commodity.title,
								desc: des,
								link: url,
								imgUrl: self.commodity.photos.length > 0 ? self.commodity.photos[
									0] : null,
								success: function() {},
								cancel: function() {}
							})
							//分享到微信朋友（即将废弃。可以获取到用户是分享还是取消）
							jweixin.onMenuShareAppMessage({
								title: self.commodity.title, // 分享标题
								desc: des, // 分享描述
								link: url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
								imgUrl: self.commodity.photos.length > 0 ? self.commodity.photos[
									0] : null, // 分享图标
								// type: '', // 分享类型,music、video或link，不填默认为link
								// dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
								success: function() {},
								cancel: function() {},
							});
						})
					}
				});
			},
		},
		/**
		 * 用户点击右上角分享 ---小程序
		 */
		// #ifdef MP-WEIXIN
		onShareAppMessage: function(ops) {
			let self = this;

			const promise = new Promise(resolve => {
				let pa = {
					infoId: this.param.id,
					infoSharer: this.userData ? this.userData.id : null,
					pageType: 2, //外发详情(0),承接详情(1),商品详情(2),首页(3);
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
				promise
			}
		},
		onShareTimeline() {
			return {
				title: this.commodity.title,
				query: {
					o: 's',
					type: 2,
					id: this.commodity.id,
				},
				imageUrl: (this.commodity.photos && this.commodity.photos.length > 0) ? this.commodity.photos[0] : '',
			}
		},
		// #endif
	}
</script>

<style scoped lang="scss">
</style>