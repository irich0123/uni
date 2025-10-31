<template>
	<view class="container no-scroll" v-if="enterpriseData">
		<!-- #ifndef  H5-->
		<my-nav-bar title="企业展台" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<view :style="'padding-top:'+contentTop+'px;'">
			<view class="flex align-center justify-center" style="width:100%;height:458rpx;"
				:style="'background-image:url('+enterpriseData.backgroundUrl+');background-size:100% 100%'">
				<image class="gray-border-1 round margin-right-sm margin-left-xl" style="width: 100rpx;height: 100rpx;"
					:src="enterpriseData.logo?enterpriseData.logo:(imgUrl+'/nologo_enterprise.png')" />
				<view class="flex-grow color-white">
					<view class="text-xl">{{ enterpriseData.companyName }}</view>
					<view class="flex">
						<view v-if="enterpriseData.industryName" class="margin-right-xs">
							{{ enterpriseData.industryName }}
						</view>
						<view v-if="enterpriseData.companyType" class="margin-right-xs">{{ enterpriseData.companyType }}
						</view>
						<view v-if="enterpriseData.workerCnt" class="margin-right-xs">{{ enterpriseData.workerCnt }}
						</view>
					</view>
				</view>
			</view>

			<wuc-tab :tab-list="tabBars" @change="tabBarClicked" textFlex :tabCur.sync="tabIndex"
				:style="'position:fixed;top:'+(contentTop+229)+'px;z-index:9;width:100%'"
				select-class="text-theme"></wuc-tab>

			<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:47px;height:'+listHeight+'px;'"
				@scrolltolower="loadMoreData" :refresher-enabled="tabIndex>0" :refresher-triggered="triggered"
				@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

				<view class="margin-sm padding-top-xs" v-if="tabIndex === 0">
					<bw-swiper v-if="swiperList && swiperList.length>0" :swiperList="swiperList" :swiperType="true"
						:w_h="2"></bw-swiper>
					<view class="bg-white">
						<view
							class="margin-top-sm margin-bottom margin-left gray-border-bottom padding-tb flex align-start justify-between">
							<view class="flex flex-direction align-start">
								<view class="text-df text-black text-bold">
									公司简介
								</view>
								<view class="text-df text-gray-5 padding-top-xss">
									<text>{{ enterpriseData.companyDesc?enterpriseData.companyDesc:'暂无简介'}}</text>
								</view>
							</view>
							<view v-if="fromMyInfo" @click="goToEnterpriseEdit(enterpriseData.id)">
								<uni-icons color="#999999" type="forward" size="22"></uni-icons>
							</view>
						</view>
						<view class="margin-left gray-border-bottom padding-tb">
							<view class="text-df text-black text-bold">
								公司地址
							</view>
							<view class="text-df text-gray-5 padding-top-xss">
								{{ enterpriseData.regionName }}
							</view>
							<view class="text-df text-gray-5">
								{{ enterpriseData.companyAddress }}
							</view>
						</view>
						<view class="margin-left gray-border-bottom padding-tb flex align-center justify-between"
							@click.stop="goToAlbum(enterpriseData.userId)">
							<view class="text-df text-black text-bold">相册</view>
							<view>
								<uni-icons color="#999999" type="forward" size="22"></uni-icons>
							</view>
						</view>
						<view class="margin-lr padding-tb flex align-center justify-between">
							<view class="text-df text-black text-bold">
								联系人
							</view>
							<image class="round" style="width:80rpx;height:80rpx;"
								:src="enterpriseData.userAvatar?enterpriseData.userAvatar:defaultUserAvatar"></image>
						</view>
					</view>
					<view class="_blank">&nbsp;</view>
				</view>

				<view class="margin-sm" v-for="(base,idx) in tabBars" :key="idx" v-if="tabIndex>0">
					<view v-for="(item,index) in base.list" :key="index" @click.stop="onItemClick(item)">
						<view v-if="tabIndex===1">
							<release-work-list-cell :release-work="item" @onPhoneCall="releaseCallPhone(item,index)" />
						</view>
						<view v-if="tabIndex===2">
							<work-order-list-cell :work-order="item" @onPhoneCall="workCallPhone" />
						</view>
						<view v-if="tabIndex===3" class="padding bg-white">
							<commodity-list-cell :commodity="item" />
						</view>
					</view>
				</view>
				<text class="loading-text margin-top-sm" v-if="tabIndex>0">{{
						tabBars[tabIndex].loadingType === 0 ? contentText.contentdown : (tabBars[tabIndex].loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
					}}
				</text>
			</scroll-view>
		</view>

		<!-- 提交信息 -->
		<uni-popup ref="dialogInput" type="dialog">
			<uni-popup-dialog-tip mode="input" title="小二提示" :value="tips" @close="dialogInputCancel"
				@confirm="dialogInputConfirm">
			</uni-popup-dialog-tip>
		</uni-popup>
	</view>
</template>

<script>
	import {
		imgUrl,
		active
	} from '@/utils/config'
	import bwSwiper from '../components/bw-swiper.vue'
	import wucTab from '@/components/wuc-tab/wuc-tab'
	import UniIcons from '@/components/uni-icons/uni-icons.vue'
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import uniPopupDialogTip from '@/components/uni-popup/uni-popup-dialog-tip.vue'
	import {
		filterCommodity,
	} from "@/api/mall";
	import {
		contactReleaseWork,
		contactWorkOrder,
		filterReleaseWork,
		filterWorkOrder
	} from "@/api/workinfo";
	import {
		getEnterpriseInfoByUserId,
		getPerEnterpriseInfo,
	} from "@/api/user";
	import ReleaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";
	import WorkOrderListCell from "@/utils/yjg-list-cell/work-order-list-cell";
	import CommodityListCell from "@/utils/yjg-list-cell/commodity-list-cell";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "enterpriseDetails",
		components: {
			CommodityListCell,
			WorkOrderListCell,
			ReleaseWorkListCell,
			UniIcons,
			bwSwiper,
			uniPopup,
			uniPopupDialogTip,
			wucTab,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				tabBars: [{
						name: '公司概况',
					},
					{
						name: '外发活',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						list: [],
						fn: () => this.filterReleaseWork(),

					},
					{
						name: '承接',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						list: [],
						fn: () => this.filterWorkOrder(),
					},
					{
						name: '尾货通',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						list: [],
						fn: () => this.getCommodityList(),
					}
				],
				tabIndex: 0,
				triggered: false,

				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

				currentReleaseWork: null,

				swiperList: [],
				token: null,
				userData: {},
				tips: "",
				userId: null,

				enterpriseData: null,

				imageList: [],
				count: 0, //相册

				defaultUserAvatar: null,
				fromMyInfo: false,
				enterpriseName: '企业展台详情',

				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
			statusbarHeight: {
				handler(newVal, oldVal) {
					//#ifndef H5
					this.contentTop = newVal + 40;
					this.listHeight = uni.getWindowInfo().safeArea.height - newVal - 229 - 47;
					//#endif
					// #ifdef H5
					this.contentTop = 40;
					this.listHeight = uni.getWindowInfo().safeArea.height - newVal - 229 - 47 - (active === 'prod' ? 0 :
						40);
					// #endif
				},
				immediate: true
			}
		},
		onLoad(options) {
			this.userData = uni.getStorageSync("user");

			this.userId = parseInt(options.userId);
			this.fromMyInfo = options.type === '1';

			if (!this.fromMyInfo) {
				this.tabBars.splice(3, 1);
			}

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token')

			if (!this.token) {
				this.toLogin();
				return;
			}
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

			initData() {
				//获取默认图片
				let defaultResource = uni.getStorageSync("defaultResource");
				this.defaultUserAvatar = defaultResource[4].resourceUrl[0];

				if (this.fromMyInfo) {
					this.getMyEnterpriseDetails()
				} else {
					this.getEnterpriseDetailsByUserId()
				}
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
			//跳转到企业编辑
			goToEnterpriseEdit(id) {
				uni.navigateTo({
					url: '/pagesCertification/enterprise/enterpriseEdit?enterpriseId=' + id
				})
			},
			//个人资料页获取企业详情
			getMyEnterpriseDetails() {
				let self = this;
				getPerEnterpriseInfo().then(res => {
					if (res.retCode === 0) {
						let result = res.data;
						self.enterpriseName = result.companyName
						self.enterprise_handle(result);
						self.enterpriseData = result
					}
				});
			},
			//根据id获取企业展台信息详情
			getEnterpriseDetailsByUserId() {
				let paramsData = {
					userId: this.userId,
				}
				let self = this;
				getEnterpriseInfoByUserId(paramsData).then(res => {
					if (res.retCode === 0) {
						let result = res.data;
						self.enterpriseName = result.companyName
						self.enterprise_handle(result);
						self.enterpriseData = res.data;
					}
				});
			},

			//状态切换
			tabBarClicked(e) {
				this.tabIndex = e;
				if (this.tabIndex > 0) {
					if (this.tabBars[this.tabIndex].list.length === 0) {
						this.tabBars[this.tabIndex].page = 1;
						this.loadData();
					}
				}
			},
			loadMoreData() {
				if (this.tabBars[this.tabIndex].loadingType === 0) {
					this.tabBars[this.tabIndex].loadingType = 1;
					setTimeout(() => {
						this.tabBars[this.tabIndex].page++;
						this.loadData();
					}, 300);
				}
			},
			loadData() {
				this.tabBars[this.tabIndex].fn();
			},
			getCommodityList() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let paramsData = {
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
					sellerId: this.userId,
					status: 2
				}
				let self = this;
				filterCommodity(paramsData).then(res => {
					if (res.retCode === 0) {
						let list = res.data.list;
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						list.forEach(item => {
							if (item.unitPriceBreakdown) {
								item.unitPriceBreakdown = JSON.parse(item.unitPriceBreakdown)
							}
							if (item.photos) {
								item.photos = JSON.parse(item.photos);
							} else {
								item.photos = [];
							}
							self.tabBars[self.tabIndex].list.push(item);
						});

						if (res.data.isLastPage) {
							self.tabBars[self.tabIndex].loadingType = 2;
						} else {
							self.tabBars[self.tabIndex].loadingType = 0;
						}
					}
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				}).catch(() => {
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				});
			},
			//根据条件获取承接信息
			filterWorkOrder() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let paramsData = {
					userId: this.userId,
					verifyStatus: 3,
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size
				}
				let self = this;
				filterWorkOrder(paramsData).then(res => {
					if (res.retCode === 0) {
						let list = res.data.list;
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						list.forEach(item => {
							if (item.img) {
								item.img = JSON.parse(item.img);
							} else {
								item.img = [];
							}

							self.tabBars[self.tabIndex].list.push(item);
						});
						if (res.data.isLastPage) {
							self.tabBars[self.tabIndex].loadingType = 2;
						} else {
							self.tabBars[self.tabIndex].loadingType = 0;
						}
					}
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				}).catch(() => {
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				});
			},
			onRefresh() {
				if (this.triggered) return;
				this.triggered = true;

				this.tabBars[this.tabIndex].page = 1;
				this.tabBars[this.tabIndex].list = [];
				this.loadData();
			},
			onRestore() {
				this.triggered = false;
			},
			//承接信息拨打电话
			workCallPhone(item) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				if (item.userId === this.userData.id) {
					uni.showToast({
						title: "不能拨打您自己的电话！",
						icon: "none",
						duration: 2000
					})
					return;
				}

				let params = {
					id: item.id
				}
				contactWorkOrder(params).then(res => {
					if (res.retCode === 0) {
						if (res.data) {
							item.hasContacted = true;
							uni.makePhoneCall({
								phoneNumber: res.data
							}).catch(e => {});
						}
					}
				});
			},

			//根据条件获取外发信息
			filterReleaseWork() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let paramsData = {
					userId: this.userId,
					verifyStatus: 3, //展示中
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size
				}
				let self = this;
				filterReleaseWork(paramsData).then(res => {
					if (res.retCode === 0) {
						let list = res.data.list;
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						list.forEach(item => {
							if (item.count) {
								item.count = Number(item.count);
							}
							if (item.img) {
								item.img = JSON.parse(item.img);
							} else {
								item.img = [];
							}

							self.tabBars[self.tabIndex].list.push(item);
						});

						if (res.data.isLastPage) {
							self.tabBars[self.tabIndex].loadingType = 2;
						} else {
							self.tabBars[self.tabIndex].loadingType = 0;
						}
					}
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				}).catch(() => {
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				});
			},
			//获取活信息详情
			onItemClick(item) {
				if (this.tabIndex === 1) {
					if (!this.token) {
						this.toLogin();
						return;
					}
					item.hasChecked = true;
					setTimeout(() => {
						uni.navigateTo({
							url: '/pagesNew/details/sendDetails?id=' + item.id,
						})
					}, 500)
				} else if (this.tabIndex === 2) {
					if (!this.token) {
						this.toLogin();
						return;
					}
					item.hasChecked = true;

					setTimeout(() => {
						uni.navigateTo({
							url: '/pagesNew/details/workDetails?id=' + item.id,
						})
					}, 500)
				} else if (this.tabIndex === 3) {
					uni.navigateTo({
						url: '/pagesNew/details/mallDetails?cId=' + item.id
					})
				}
			},
			//外发信息拨打电话
			releaseCallPhone(item, index) {
				if (!this.token) {
					this.toLogin();
				} else {
					this.currentReleaseWork = {
						item: item,
						index: index
					};
					if (!!uni.getStorageSync("gold_bean_tipped")) {
						this.checkGoldBeanThenCall();
					} else {
						this.confirmDialogShow();
					}
				}
			},
			checkGoldBeanThenCall() {
				let self = this;
				let params = {
					id: this.currentReleaseWork.item.id,
				}
				contactReleaseWork(params).then(res => {
					if (res.retCode === 0) {
						let item = self.tabBars[this.tabIndex].list[self.currentReleaseWork.index];
						item.hasContacted = true;
						self.currentReleaseWork = {};
						uni.makePhoneCall({
							phoneNumber: res.data
						}).catch(e => {});
					}
				}).catch(res => {
					if (res.message.indexOf("金豆不足") > -1) {
						uni.showModal({
							title: '系统提示',
							content: '金豆数不足,现在去补充金豆吗？',
							showCancel: true,
							confirmText: '确认',
							success: function(res) {
								if (res.confirm) {
									uni.navigateTo({
										url: '/pagesPersonal/pay/payBeanGoods',
									})
								}
							},
						})
					}
				});
			},
			enterprise_handle(result) {
				this.userId = result.userId;
				this.count = 0;

				uni.setNavigationBarTitle({
					title: this.enterpriseName
				});

				// if (result.logo) {
				// 	this.imageList.push(result.logo);
				// }

				if (result.officeImgs) {
					result.officeImgs = JSON.parse(result.officeImgs);
					if (!!result.officeImgs) {
						result.officeImgs.forEach(v => {
							this.imageList.push(v);
						});
					}
				}

				if (result.businessImgs) {
					result.businessImgs = JSON.parse(result.businessImgs);
					if (!!result.businessImgs) {
						result.businessImgs.forEach(v => {
							this.imageList.push(v);
						});
					}
				}

				if (result.productImgs) {
					result.productImgs = JSON.parse(result.productImgs);
					if (!!result.productImgs) {
						result.productImgs.forEach(v => {
							this.imageList.push(v);
						});
					}
				}

				if (result.qualificationImgs) {
					result.qualificationImgs = JSON.parse(result.qualificationImgs);
					if (!!result.qualificationImgs) {
						result.qualificationImgs.forEach(v => {
							this.imageList.push(v);
						});
					}
				}

				if (result.simpleRoomImgs) {
					result.simpleRoomImgs = JSON.parse(result.simpleRoomImgs);
					if (!!result.simpleRoomImgs) {
						result.simpleRoomImgs.forEach(v => {
							this.imageList.push(v);
						});
					}
				}

				if (result.workShopImgs) {
					result.workShopImgs = JSON.parse(result.workShopImgs);
					if (!!result.workShopImgs) {
						result.workShopImgs.forEach(v => {
							this.imageList.push(v);
						});
					}
				}

				this.swiperList = [];
				this.imageList.forEach(item => {
					this.swiperList.push({
						img: item,
					});
				});

				if (this.swiperList.length > 5) {
					this.swiperList.splice(5, this.swiperList.length);
				}
				// this.count = this.imageList.length;

			},
			//跳转到企业实力
			goToAlbum(userId) {
				if (this.fromMyInfo) {
					uni.navigateTo({
						url: '../../pagesNew/album/albumList?ownerId=' + this.enterpriseData.id +
							'&ownerType=0&viewByMyself=' +
							(this.enterpriseData.userId === this.userData.id ? 1 : 0),
					})
				} else {
					uni.navigateTo({
						url: '/pagesCertification/enterprise/albumShow?userId=' + userId,
					})
				}
			},


			confirmDialogShow() {
				let goldCount = parseActionConsume("发起联系外发信息", this.userData.userVerifyStatus, this.userData
					.withValidBeanCard);

				if (!!goldCount) {
					this.tips = "拨打电话会扣除金豆" + goldCount + "颗，确认要拨打电话吗？系统智能计费，同一条信息不会重复收费！"
					this.$refs.dialogInput.open()
				} else {
					this.checkGoldBeanThenCall();
				}
			},
			dialogInputConfirm(done, value) {
				done();
				if (!!value && value > 0) {
					uni.setStorageSync("gold_bean_tipped", value);
				};
				this.checkGoldBeanThenCall()
			},
			dialogInputCancel(done) {
				done();
				this.currentReleaseWork = {};
			},
		},
	}
</script>

<style scoped lang="scss">
	@import "@/static/css/tabBar.css";
	@import "/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;

		.base_info_box {
			margin: 0 20rpx;

			.info-company {
				background: white;

				.company-resume {
					margin: 20rpx 30rpx 0 50rpx;
					border-bottom: 2rpx solid #e7e7e7;
					padding: 30rpx 0;
					display: flex;
					flex-flow: row;
					align-items: center;
					background: white;

					.company-resume-left {
						display: flex;
						flex-flow: column;
						align-items: flex-start;

						.info_tile {
							font-size: 30rpx;
							color: #333333;
							font-weight: bold;
						}

						.info_desc {
							padding-top: 20rpx;
							font-size: 28rpx;
							color: #666666;
							min-height: 80rpx
						}
					}

					.company-resume-right {
						margin-left: auto;
						padding-left: 20rpx;
						display: flex;
						flex-flow: column;
						align-items: center;
					}
				}

				.info_box_row {
					margin: 0rpx 30rpx 0 50rpx;
					border-bottom: 2rpx solid #e7e7e7;
					padding: 30rpx 0;
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					align-items: center;

					.info_tile {
						font-size: 30rpx;
						color: #333333;
						font-weight: bold;
					}

					.info_desc {
						padding-top: 20rpx;
						font-size: 28rpx;
						color: #666666;
						min-height: 80rpx;

						&>text {
							padding: 0 10rpx;
						}
					}

					.info_box_image_row {
						width: 100rpx;
						height: 100rpx;

						image {
							width: 100%;
							height: 100%;
							border-radius: 50rpx;
						}
					}
				}
			}
		}

		.empty-block {
			flex-grow: 1;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;

			image {
				width: 500rpx;
				height: 315rpx;
			}

			.prompt {
				color: #777;
				padding-top: 30rpx;
				font-size: 28rpx;
				margin-bottom: 150rpx;
			}
		}
	}

	._blank {
		min-height: 100rpx;
	}
</style>