<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="联系记录" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<wuc-tab :tab-list="tabBars" @change="onTabItemClick" textFlex :tabCur.sync="tabIndex"
			:style="'padding-top:'+contentTop+'px;'" select-class="text-theme"></wuc-tab>

		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<uni-list :border="false">
				<uni-list-item v-for="(item,index) in tabBars[tabIndex].list" :key="index" :show-arrow="false">
					<view class="flex flex-direction padding radius bg-white">
						<view
							class="flex align-center justify-between padding-bottom-xs padding-tb-ssm gray-border-bottom">
							<view></view>
							<view class="color-black text-sm">{{ item.createTime | formatDate }}</view>
						</view>

						<view class="flex align-center justify-start padding-tb-sm">
							<user-bar-normal class="flex-grow" :user="item.userDetailsInfo" :contactOn="true"
								@onCall="phoneClicked" />
						</view>
					</view>
				</uni-list-item>

			</uni-list>

			<text class="loading-text margin-top-sm">{{
                    loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</text>
		</scroll-view>
	</view>
</template>

<script>
	import uniList from '@/components/uni-list/uni-list.vue'
	import uniListItem from '@/components/uni-list-item/uni-list-item.vue'
	import wucTab from "@/components/wuc-tab/wuc-tab";
	import {
		filterCheckReleaseWork,
		filterCheckWorkOrder,
		filterContactReleaseWork,
		filterContactWorkOrder
	} from "@/api/workinfo";
	import {
		formatTime6
	} from "@/utils/myUtil";
	import UserBarNormal from "../../utils/yjg-user/user-bar-normal";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	

	export default {
		name: "contactedList",
		components: {
			UserBarNormal,
			uniList,
			uniListItem,
			wucTab,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				tabBars: [{
						name: '已联系',
						isLastPage: false,
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						list: [],
						fn0: () => this.filterContactReleaseWork(),
						fn1: () => this.filterContactWorkOrder(),
					},
					{
						name: '已查看',
						isLastPage: false,
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						list: [],
						fn0: () => this.filterCheckReleaseWork(),
						fn1: () => this.filterCheckWorkOrder(),
					}
				],
				tabIndex: 0,
				triggered: false,

				loadingType: 2,
				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

				token: null,
				id: null,

				defaultUserAvatar: null,
				type: null,

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
		filters: {
			formatDate(time) {
				return formatTime6(new Date(time));
			}
		},
		onLoad(options) {
			this.token = uni.getStorageSync('token');

			this.id = parseInt(options.id);
			this.type = parseInt(options.type);

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token');

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
				//获取默认图片
				let defaultResource = uni.getStorageSync("defaultResource");
				this.defaultUserAvatar = defaultResource[4].resourceUrl[0];

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
			//承接打电话
			phoneClicked(e) {
				uni.makePhoneCall({
					phoneNumber: e.mobile,
					fail: () => {}
				})
			},
			onTabItemClick(e) {
				this.tabIndex = e;
				if (this.tabBars[this.tabIndex].list.length === 0) {
					this.tabBars[this.tabIndex].page = 1;
					this.loadData();
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
				if (this.type === 1) {
					this.tabBars[this.tabIndex].fn1();
				} else if (this.type === 0) {
					this.tabBars[this.tabIndex].fn0();
				}
			},
			//获取外发信息联系记录列表
			filterContactReleaseWork() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let params = {
					workId: this.id,
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
				}
				let self = this;
				filterContactReleaseWork(params).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						res.data.list.forEach(item => {
							self.tabBars[self.tabIndex].list.push(item);
						});
						if (res.data.isLastPage) {
							self.loadingType = 2;
						} else {
							self.loadingType = 0;
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
			//获取外发信息查看记录列表
			filterCheckReleaseWork() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let params = {
					workId: this.id,
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
				}
				let self = this;
				filterCheckReleaseWork(params).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						res.data.list.forEach(item => {
							self.tabBars[self.tabIndex].list.push(item);
						});
						if (res.data.isLastPage) {
							self.loadingType = 2;
						} else {
							self.loadingType = 0;
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

			//获取承接信息联系记录列表
			filterContactWorkOrder() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let params = {
					workId: this.id,
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
				}
				let self = this;
				filterContactWorkOrder(params).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						res.data.list.forEach(item => {
							self.tabBars[self.tabIndex].list.push(item);
						});
						if (res.data.isLastPage) {
							self.loadingType = 2;
						} else {
							self.loadingType = 0;
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
			//获取承接信息查看记录列表
			filterCheckWorkOrder() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let params = {
					workId: this.id,
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
				}
				let self = this;
				filterCheckWorkOrder(params).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						res.data.list.forEach(item => {
							self.tabBars[self.tabIndex].list.push(item);
						});
						if (res.data.isLastPage) {
							self.loadingType = 2;
						} else {
							self.loadingType = 0;
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


	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item {
		margin-top: 20rpx;
		border-radius: 10rpx;
		padding: 0rpx !important;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
	}
</style>