<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="地址管理" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<uni-list>
				<uni-list-item v-for="(item,index) in list" :key="index" :show-arrow="false">
					<view
						class="bg-white flex align-center justify-between padding-tb-ssm margin-lr padding-lr-sm margin-top radius">
						<address-list-cell :address="item" :trash="true" style="width:100%" @onDelete="onDelete"
							@onItem="onItem" />
					</view>
				</uni-list-item>
			</uni-list>

			<text class="loading-text">{{
                loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
            }}
			</text>

			<view class="blank"></view>
		</scroll-view>

		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<button class="bg-theme text-xl color-white radius-0" @click="newAddress">添加地址</button>
		</view>
	</view>
</template>

<script>
	import UniIcons from "@/components/uni-icons/uni-icons";
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import addressListCell from "@/utils/yjg-list-cell/address-list-cell";
	import {
		filterAddress,
		deleteAddress
	} from "@/api/user";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	import {
		active
	} from "@/utils/config";

	export default {
		name: "index",
		components: {
			UniList,
			UniIcons,
			UniListItem,
			addressListCell,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userData: {},

				list: [],
				page: 1,
				size: 10,
				triggered: false,

				isLoading: false,
				loadingType: 2,
				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

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
					this.listHeight = uni.getWindowInfo().safeArea.height - newVal;
					//#endif
					// #ifdef H5
					this.listHeight = uni.getWindowInfo().safeArea.height - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		onLoad() {
			this.userData = uni.getStorageSync("user")
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
				this.loadData()
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
			//编辑
			onItem(e) {
				uni.navigateTo({
					url: '/pagesChoose/address/addressDetails?id=' + e.id
				})
			},
			//添加
			newAddress() {
				uni.navigateTo({
					url: '/pagesChoose/address/addressDetails'
				})
			},
			loadMoreData() {
				if (this.loadingType === 0) {
					this.loadingType = 1;
					setTimeout(() => {
						this.page++;
						this.loadData();
					}, 300);
				}
			},
			//获取地址信息列表
			loadData() {
				if (this.isLoading) {
					return;
				}
				this.isLoading = true;
				let paramsData = {
					page: this.page,
					size: this.size,
					userId: this.userData.id,
					status: 1,
				}
				let self = this;
				filterAddress(paramsData).then(res => {
					if (res.retCode === 0) {
						let rows = res.data.list
						if (self.page === 1) {
							self.list.splice(0, self.list.length);
						}
						rows.forEach(row => {
							self.list.push(row);
						})
						if (res.data.isLastPage) {
							self.loadingType = 2;
						} else {
							self.loadingType = 0;
						}
					}
					self.isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				}).catch(() => {
					self.isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				});
			},
			onRefresh() {
				if (this.triggered) return;
				this.triggered = true;

				this.page = 1;
				this.list = [];
				this.loadData();
			},
			onRestore() {
				this.triggered = false;
			},
			onDelete(e) {
				let self = this
				uni.showModal({
					title: "小二提示",
					content: '确定要删除这条地址信息吗？',
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							let param = {
								id: e.id,
							}
							deleteAddress(param).then(res => {
								if (res.retCode === 0) {
									let index = self.list.findIndex(v => {
										return v.id === e.id
									});
									if (index > -1) {
										if (!!self.list[index].isDefaultAddress) {
											self.page = 1;
											self.initData();
										} else {
											self.list.splice(index, 1);
										}
									}
								}
							});
						}
					}
				});
			},
		},
	}
</script>

<style scoped lang="scss">
	@import "@/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
	}

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item {
		padding: 0 0 0 0 !important;
	}


	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
	}

	::v-deep .uni-list-item__content {
		text-align: left;
	}
</style>