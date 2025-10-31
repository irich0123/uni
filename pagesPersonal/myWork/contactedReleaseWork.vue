<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="已联系外发" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<wuc-tab :tab-list="tabBars" @change="onTabItemClick" textFlex :tabCur.sync="tabIndex"
			:style="'padding-top:'+contentTop+'px;'" select-class="text-theme"></wuc-tab>

		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">
			
			<view class="margin-top-ssm" v-for="(item,index1) in tabBars[tabIndex].list" :key="index1" @click.stop="toItemDetail(item)">
				<release-work-list-cell :showAdminBar="true" :release-work="item.releaseWorkResponse"
					@onPhoneCall="phoneCall" />
			</view>
			<text class="loading-text margin-top-sm">{{
                    tabBars[tabIndex].loadingType === 0 ? contentText.contentdown : (tabBars[tabIndex].loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</text>
		</scroll-view>
	</view>
</template>

<script>
	import wucTab from "@/components/wuc-tab/wuc-tab";
	import {
		filterContactReleaseWork,
		filterWorkInfoOffer,
		filterMyContract
	} from "@/api/workinfo";
	import ReleaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	

	export default {
		name: "contactedReleaseWork",
		components: {
			ReleaseWorkListCell,
			wucTab,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				tabBars: [{
						name: '已联系',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						status: true,
						list: [],
						fn: () => this.getMyContactedList(),
					},
					{
						name: '已报价',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						status: 0,
						list: [],
						fn: () => this.getMyOfferedList(),
					},
					{
						name: '已成交',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [-1, 0, 1, 2, 3, 4, 5, 6],
						list: [],
						fn: () => this.getMyContractedList(),
					}
				],
				tabIndex: 0,
				triggered: false,

				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

				token: null,
				userData: {},

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
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync('user')
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
				} else if (e.action === 'btn1') {
					this.newWorkOrder();
				}
			},
			reSize(e) {
				this.statusbarHeight = e.value;
			},

			initData() {
				this.tabBars[this.tabIndex].fn();
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
			//打电话
			phoneCall(e) {
				uni.makePhoneCall({
					phoneNumber: e.item.mobile,
					fail: () => {}
				})
			},
			//跳转到外发详情页
			toItemDetail(item) {
				uni.navigateTo({
					url: '../../pagesNew/details/sendDetails?id=' + (this.tabIndex === 0 ? item.workId : item
						.workInfoId) + '&fromAdmin=1',
				})
			},
			onTabItemClick(e) {
				this.tabIndex = e;
				if (this.tabBars[this.tabIndex].list.length === 0) {
					this.tabBars[this.tabIndex].page = 1;
					this.tabBars[this.tabIndex].fn();
				}
			},
			loadMoreData() {
				if (this.tabBars[this.tabIndex].loadingType === 0) {
					this.tabBars[this.tabIndex].loadingType = 1;
					setTimeout(() => {
						this.tabBars[this.tabIndex].page++;
						this.tabBars[this.tabIndex].fn();
					}, 300);
				}
			},
			//获取我联系的外发信息
			getMyContactedList() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;

				let paramsData = {
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
					deleteFlag: !this.tabBars[this.tabIndex].status,
					userId: this.userData.id,
				}
				let self = this;
				filterContactReleaseWork(paramsData).then(res => {
					if (res.retCode === 0) {
						let contactedReleaseWorkList = res.data.list;
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						contactedReleaseWorkList.forEach(item => {
							if (item.releaseWorkResponse.count) {
								item.releaseWorkResponse.count = Number(item.releaseWorkResponse.count);
							}
							if (item.releaseWorkResponse.img) {
								item.releaseWorkResponse.img = JSON.parse(item.releaseWorkResponse.img);
							} else {
								item.releaseWorkResponse.img = [];
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
			//获取我联系的外发信息
			getMyOfferedList() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;

				let paramsData = {
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
					status: this.tabBars[this.tabIndex].status,
					userId: this.userData.id,
				}
				let self = this;
				filterWorkInfoOffer(paramsData).then(res => {
					if (res.retCode === 0) {
						let offeredReleaseWorkList = res.data.list;
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						offeredReleaseWorkList.forEach(item => {
							if (item.releaseWorkResponse.count) {
								item.releaseWorkResponse.count = Number(item.releaseWorkResponse.count);
							}
							if (item.releaseWorkResponse.img) {
								item.releaseWorkResponse.img = JSON.parse(item.releaseWorkResponse.img);
							} else {
								item.releaseWorkResponse.img = [];
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
			//获取我的交易
			getMyContractedList() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;

				let paramsData = {
					secondPartUserId: this.userData.id,
					statusList: this.tabBars[this.tabIndex].statusList,
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size
				}

				let self = this;
				filterMyContract(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}

						res.data.list.forEach(item => {
							if (item.releaseWorkResponse.img) {
								item.releaseWorkResponse.img = JSON.parse(item.releaseWorkResponse.img);
							} else {
								item.releaseWorkResponse.img = [];
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
				this.tabBars[this.tabIndex].fn();
			},
			onRestore() {
				this.triggered = false;
			},
		},
	}
</script>

<style scoped lang="scss">
	@import "@/static/css/tabBar.css";
	@import "@/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

</style>