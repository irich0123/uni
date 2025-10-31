<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="商机订阅" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:'+ contentTop +'px;height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">
			<view style="content: ''; overflow: hidden;"></view>

			<view class="margin-bottom-sm margin-lr-sm text-df">
				<uni-swipe-action>
					<uni-list>
						<uni-list-item v-for="(item,index) in list" :key="index" :show-arrow="false">
							<uni-swipe-action-item :options="option" @click="swipeClick($event,index,item.id)">
								<view class="flex-grow flex align-center justify-between padding-tb-lg padding-lr">
									<view>{{item.subscribeName}}</view>
									<view>{{item.createTime | formatDate}}</view>
								</view>
							</uni-swipe-action-item>
						</uni-list-item>
					</uni-list>
				</uni-swipe-action>

				<text class="loading-text margin-top-sm">{{
			        loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
			    }}
				</text>
			</view>
		</scroll-view>

		<view class="bg-white" style="width: 100%;position:fixed;left:0;bottom:0;z-index: 19;">
			<button class="bg-theme text-xl color-white radius-0" @click="toAdd">添加关键词</button>
		</view>

		<uni-popup ref="dialogInput" type="dialog" :mask-click="false">
			<uni-popup-dialog-text-area mode="input" :value="keyword" placeholder="请输入您感兴趣的关键词" title="关键词输入"
				class="flex flex-direction align-center justify-center" :with-title="false"
				@confirm="addConfirmed"></uni-popup-dialog-text-area>
		</uni-popup>
	</view>
</template>

<script>
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import uniPopupDialogTextArea from '@/components/uni-popup/uni-popup-dialog-text-area.vue'
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import uniSwipeAction from "@/components/uni-swipe-action/uni-swipe-action";
	import uniSwipeActionItem from "@/components/uni-swipe-action-item/uni-swipe-action-item";
	import {
		filterSubscribeKeyword,
		createSubscribeKeyword,
		deleteSubscribeKeyword
	} from "@/api/common";
	import {
		formatTime6
	} from "@/utils/myUtil";
	import {
		imgUrl,
		active
	} from "@/utils/config";
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';

	export default {
		name: "mySubscribe",
		components: {
			UniListItem,
			uniPopup,
			uniPopupDialogTextArea,
			UniList,
			uniSwipeAction,
			uniSwipeActionItem,
			myNavBar
		},
		data() {
			return {
				token: null,
				userData: {},

				option: [{
					text: '删除',
					style: {
						backgroundColor: '#fb5318'
					}
				}],

				page: 1,
				size: 10,
				list: [],
				triggered: false,

				keyword: "",

				loadingType: 2,
				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

				active: active,
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
		filters: {
			formatDate(time) {
				return formatTime6(new Date(time));
			},
		},
		onLoad() {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync("user");

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync("user");

			if (!this.token) {
				this.toLogin();
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
					duration: 1000
				});
				uni.navigateTo({
					url: '/pages/login/login'
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
			loadData() {
				if (this.isLoading) {
					return;
				}
				this.isLoading = true;
				let self = this;
				let param = {
					page: this.page,
					size: this.size,
					userId: this.userData.id,
				}
				filterSubscribeKeyword(param).then(res => {
					if (res.retCode === 0) {
						if (self.page === 1) {
							self.list.splice(0, self
								.list.length);
						}
						res.data.list.forEach(item => {
							self.list.push(item);
						});
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
				})
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
			swipeClick(e, index, id) {
				let self = this
				if (e.content.text === '删除') {
					uni.showModal({
						title: '提示',
						content: '确认要删除订阅关键词 ' + this.list[index].subscribeName + ' 吗?',
						success: async (res1) => {
							if (res1.confirm) {
								deleteSubscribeKeyword({
									id: id
								}).then(res => {
									if (res.retCode === 0) {
										self.list.splice(index, 1);
									}
								});
							}
						}
					});
				}
			},
			toAdd() {
				this.$refs.dialogInput.open();
			},
			addConfirmed(fn, e) {
				let self = this;
				createSubscribeKeyword({
					subscribeName: e
				}).then(res => {
					if (res.retCode === 0) {
						self.list.unshift(res.data);
						fn();
					}
				});
			}
		},
	}
</script>

<style scoped lang="scss">
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
		background-color: white;
		padding: 0rpx !important;

	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
	}

	::v-deep .uni-popup__wrapper-box {
		width: 100% !important;
		display: flex;
		justify-content: center;
	}


	::v-deep .uni-dialog-input {
		background-color: #eeeeee;
		padding: 20rpx;
		border-radius: 10rpx;
		font-size: 30rpx;
	}

	::v-deep .uni-button-color {
		color: #fb5318 !important;
	}
</style>