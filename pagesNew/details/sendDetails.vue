<template>
	<view class="container">
		<view-pager :pageDataFun="pageDataFun" :params="param" @change="idChanged" v-if="!singlePage">
			<release-work-detail :nodeId="param.id" :key="param.id" :from-admin="param.fromAdmin"
				:direct-open="param.o" />
		</view-pager>
		<release-work-detail :nodeId="param.id" :key="param.id" :from-admin="param.fromAdmin" :direct-open="param.o"
			v-if="singlePage" />
	</view>
</template>

<script>
	import releaseWorkDetail from "./release-work-detail";
	import viewPager from "../components/view-pager.vue";
	import {
		filterReleaseWork,
		getReleaseWorkDetailsByIdAnon
	} from "@/api/workinfo";
	import {
		createInfoShareRecord,
		infoInfoShare,
	} from "@/api/user";
	import {
		getInfoPageShareConfigMini
	} from "@/api/wx_api";
	//#ifdef H5
	import {
		wxShareInfoPage,
	} from "@/utils/wxPortalShare.js";
	//#endif

	export default {
		name: "sendDetails",
		components: {
			viewPager,
			releaseWorkDetail
		},
		data() {
			return {
				token: null,
				pageDataFun: filterReleaseWork,
				param: {},
				singlePage: true,
				releaseWork: {},
				userData: {},

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
					fromAdmin: query.fromAdmin == null ? 0 : parseInt(query.fromAdmin),
					infoShareId: !!query.infoShareId ? parseInt(query.infoShareId) : null,
				}
			}

			if (!this.param.o && !this.token) {
				this.toLogin();
			} else {
				this.getReleaseWorkByIdAnon();
			}
		},
		methods: {
			idChanged(nodeId) {
				this.param.id = nodeId;
				this.getReleaseWorkByIdAnon();
			},

			getReleaseWorkByIdAnon() {
				let paramsData = {
					id: this.param.id,
				}
				let self = this;
				getReleaseWorkDetailsByIdAnon(paramsData).then(res => {
					if (res.retCode === 0) {
						self.releaseWork = res.data;

						if (!!self.releaseWork.img) {
							self.releaseWork.img = JSON.parse(self.releaseWork.img);
						} else {
							self.releaseWork.img = [];
						}

						// #ifdef H5
						if (!!self.token) {
							wxShareInfoPage({
								infoId: self.releaseWork.id,
								pageType: 0, //1---承接，0---外发
								url: location.href.split('#')[0],
							});
						}
						// #endif

						//公众号或小程序 分享成功被用户点击
						if (self.param.infoShareId) {
							self.infoShareClicked();
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
			infoShareClicked() {
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
			createInfoShareRecord() {
				let paramsData = {
					infoId: this.releaseWork.id, //信息ID
					infoOwner: this.infoShare.infoOwner, //信息发布者ID
					type: 0, //信息类型
					infoSharer: this.infoShare.infoSharer, //信息分享者的ID
				}

				createInfoShareRecord(paramsData).then(res => {
					if (res.retCode === 0) {}
				});
			},
		},

		/**
		 * 用户点击右上角分享 ---小程序 mini
		 */
		// #ifdef MP-WEIXIN
		onShareAppMessage: function() {
			let self = this;

			const promise = new Promise(resolve => {
				let pa = {
					infoId: this.param.id,
					infoSharer: this.userData ? this.userData.id : null,
					pageType: 0, //外发详情(0),承接详情(1),商品详情(2),首页(3);
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
		onShareTimeline() { //不支持promise
			return {
				title: this.releaseWork.title,
				query: {
					o: 's',
					type: 0,
					id: this.releaseWork.id,
				},
				imageUrl: (this.releaseWork.img && this.releaseWork.img.length > 0) ? this.releaseWork.img[0] : '',
			}
		},
		// #endif
	}
</script>

<style scoped lang="scss">
</style>