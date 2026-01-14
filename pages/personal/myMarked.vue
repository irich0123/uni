<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="我的收藏" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<wuc-tab :tab-list="tabBars" @change="onTabItemClick" textFlex :tabCur.sync="tabIndex"
			:style="'padding-top:'+contentTop+'px;'" select-class="text-theme" />

		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<!--列表开始-->
			<uni-swipe-action>
				<uni-list :border="false">
					<uni-list-item v-for="(item,index) in tabBars[tabIndex].list" :key="index" :show-arrow="false">
						<uni-swipe-action-item :options="option" @click="swipeClick($event,tabIndex,item.id)">
							<view v-if="tabIndex === 0" style="width:100%" @click="toItemDetail(item)">
								<release-work-list-cell :release-work="item"
									@onPhoneCall="releaseCallPhone(item,index)" />
							</view>
							<view v-if="tabIndex === 1" style="width:100%" @click="toItemDetail(item)">
								<work-order-list-cell :work-order="item" @onPhoneCall="workCallPhone" />
							</view>
							<view v-if="tabIndex === 2" style="width:100%" class="padding bg-white"
								@click="toItemDetail(item)">
								<commodity-list-cell :commodity="item" />
							</view>
						</uni-swipe-action-item>
					</uni-list-item>
				</uni-list>
			</uni-swipe-action>
			<text class="loading-text margin-top-sm">{{
                    tabBars[tabIndex].loadingType === 0 ? contentText.contentdown : (tabBars[tabIndex].loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</text>
			<!--列表结束-->
		</scroll-view>

		<uni-popup ref="dialogInput" type="dialog">
			<uni-popup-dialog-tip mode="input" title="小二提示" :value="tips" @close="dialogInputCancel"
				@confirm="dialogInputConfirm">
			</uni-popup-dialog-tip>
		</uni-popup>
	</view>
</template>

<script>
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import uniPopupDialogTip from '@/components/uni-popup/uni-popup-dialog-tip.vue'
	import uniSwipeAction from "@/components/uni-swipe-action/uni-swipe-action";
	import uniSwipeActionItem from "@/components/uni-swipe-action-item/uni-swipe-action-item";
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import ReleaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";
	import WorkOrderListCell from "@/utils/yjg-list-cell/work-order-list-cell";
	import {
		getMarkedList0,
		cancelMarkReleaseWork,
		cancelMarkWorkOrder,
		getMarkedList1,
		contactReleaseWork,
		contactWorkOrder,
	} from "@/api/workinfo";
	import {
		getMarkedList2,
		setCommodityMarkedOff
	} from "@/api/mall";
	import {
		parseActionConsume
	} from '@/utils/myUtil.js';
	import wucTab from "@/components/wuc-tab/wuc-tab";
	import CommodityListCell from "@/utils/yjg-list-cell/commodity-list-cell";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	
	export default {
		name: "myMarked",
		components: {
			CommodityListCell,
			ReleaseWorkListCell,
			UniListItem,
			UniList,
			uniPopup,
			wucTab,
			uniPopupDialogTip,
			WorkOrderListCell,
			uniSwipeAction,
			uniSwipeActionItem,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userData: {},
				tips: "",

				option: [{
					text: '取消',
					style: {
						backgroundColor: '#fb5318',
					}
				}],

				tabBars: [{
						name: '找外发',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						list: [],
						fn: () => this.getReleaseWorkList(),
					},
					{
						name: '找工厂',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						list: [],
						fn: () => this.getWorkOrderList(),
					},
					{
						name: '找尾货',
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
					this.listHeight = uni.getWindowInfo().safeArea.height - this.contentTop;
					//#endif
					// #ifdef H5
					this.contentTop = 0;
					this.listHeight = uni.getWindowInfo().safeArea.height - this.contentTop - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		onLoad() {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");

			if (!this.token) {
				this.toLogin();
				return;
			}

			if (!!uni.getStorageSync("needRefresh")) {
				uni.removeStorageSync("needRefresh");
				this.initData();
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
				this.loadData();
			},
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1500
				});
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/login/login'
					})
				}, 1500);
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
			loadData(){
				this.tabBars[this.tabIndex].fn();
			},
			//我收藏的外发
			getReleaseWorkList() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let paramsData = {
					pageNum: this.tabBars[this.tabIndex].page,
					pageSize: this.tabBars[this.tabIndex].size
				}
				let self = this;
				getMarkedList0(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						res.data.list.forEach(item => {
							if (!!item.count) {
								item.count = parseInt(item.count);
							} else {
								item.count = 0;
							}
							if (item.img) {
								item.img = JSON.parse(item.img);
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

			//我收藏的承接
			getWorkOrderList() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let paramsData = {
					pageNum: this.tabBars[this.tabIndex].page,
					pageSize: this.tabBars[this.tabIndex].size
				}
				let self = this;
				getMarkedList1(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						res.data.list.forEach(item => {
							if (!!item.count) {
								item.count = parseInt(item.count);
							} else {
								item.count = 0;
							}
							if (item.img) {
								item.img = JSON.parse(item.img);
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


			//我收藏的尾货
			getCommodityList() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let paramsData = {
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
					status: 1,
					userId: this.userData.id,
				}
				let self = this;
				getMarkedList2(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						res.data.list.forEach(item => {
							if (item.unitPriceBreakdown) {
								item.unitPriceBreakdown = JSON.parse(item.unitPriceBreakdown);
							}
							if (item.photos) {
								item.photos = JSON.parse(item.photos);
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

			//承接打电话
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
			//查看活信息详情
			toItemDetail(item) {
				console.log(1);
				if (this.tabIndex === 0) {
					if (item.verifyStatus !== 3) {
						uni.showToast({
							title: '此信息已下架！',
							icon: 'none',
							duration: 2000,
						})
						return;
					}
					uni.navigateTo({
						url: '/pagesNew/details/sendDetails?id=' + item.id,
					})
				} else if (this.tabIndex === 1) {
					if (item.verifyStatus !== 3) {
						uni.showToast({
							title: '此信息已下架！',
							icon: 'none',
							duration: 2000,
						})
						return;
					}
					uni.navigateTo({
						url: '/pagesNew/details/workDetails?id=' + item.id,
					})
				} else if (this.tabIndex === 2) {
					if (item.status !== 2) {
						uni.showToast({
							title: '此信息已下架！',
							icon: 'none',
							duration: 2000,
						})
						return;
					}
					uni.navigateTo({
						url: '/pagesNew/details/mallDetails?cId=' + item.id
					})
				}
			},
			//打电话
			releaseCallPhone(item, index) {
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

				this.currentReleaseWork = {
					item: item,
					index: index
				};
				if (!!uni.getStorageSync("gold_bean_tipped")) {
					this.checkGoldBeanThenCall();
				} else {
					this.confirmDialogShow();
				}

			},

			checkGoldBeanThenCall() {
				let self = this;
				let params = {
					id: this.currentReleaseWork.item.id,
				}
				contactReleaseWork(params).then(res => {
					if (res.retCode === 0) {
						let item = self.tabBars[self.tabIndex].list[self.currentReleaseWork.index];
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
								} else if (res.cancel) {
									console.log('用户点击取消');
								}
							},
						})
					}
				});
			},

			//状态切换
			onTabItemClick(e) {
				this.tabIndex = e;
				if (this.tabBars[this.tabIndex].list.length === 0) {
					this.tabBars[this.tabIndex].page = 1;
					this.loadData();
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

			swipeClick(e, index, id) {
				let self = this
				if (e.content.text === '取消') {
					uni.showModal({
						title: '提示',
						content: '是否取消收藏?',
						success: (res1) => {
							if (res1.confirm) {
								if (self.tabIndex === 0) {
									this.cancelMark0(id);
								} else if (index === 1) {
									this.cancelMark1(id);
								} else {
									this.cancelMark2(id);
								}
							}
						}
					});
				}
			},
			cancelMark0(id) {
				let self = this;
				cancelMarkReleaseWork({
					workInfoId: id,
					workType: 1
				}).then(res => {
					if (res.retCode === 0) {
						let idx = self.tabBars[self.tabIndex].list.findIndex(v => v.id === id);
						if (idx > -1) {
							self.tabBars[self.tabIndex].list.splice(idx, 1);
						}
					}
				});
			},
			cancelMark1(id) {
				let self = this;
				cancelMarkWorkOrder({
					workInfoId: id,
					workType: 2
				}).then(res => {
					if (res.retCode === 0) {
						let idx = self.tabBars[self.tabIndex].list.findIndex(v => v.id === id);
						if (idx > -1) {
							self.tabBars[self.tabIndex].list.splice(idx, 1);
						}
					}
				});
			},
			cancelMark2(id) {
				let self = this;
				setCommodityMarkedOff({
					commodityId: id
				}).then(res => {
					if (res.retCode === 0) {
						let idx = self.tabBars[self.tabIndex].list.findIndex(v => v.id === id);
						if (idx > -1) {
							self.tabBars[self.tabIndex].list.splice(idx, 1);
						}
					}
				});
			},
		},
	}
</script>

<style scoped lang="scss">
	@import "../../static/css/tabBar.css";
	@import "../../static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item {
		margin-top: 20rpx;
		border-radius: 20rpx;
		padding: 0rpx !important;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
	}


	::v-deep .uni-swipe_box {
		background-color: transparent;

		&>uni-view {
			flex-grow: 1;
		}
	}

	::v-deep .uni-swipe_button-group {
		margin: 0;
		border-radius: 0rpx !important;
	}

	::v-deep .uni-swipe_button-group uni-view {
		border-radius: 20rpx;
	}

	::v-deep .uni-swipe_button-group .uni-swipe_button {
		border-radius: 20rpx;
	}
</style>