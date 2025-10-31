<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="我的钱包" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<view :style="'padding-top:'+contentTop+'px;'">
			<view class="bg-theme">
				<!-- #ifdef APP-PLUS  -->
				<uni-transition :duration="2000" :mode-class="modeClass" :show="transShow">
					<uni-notice-bar :show="isShowNotice" text="余额只能用于购买实物商品,不能用作其他用途!" @close="closeNotice"
						style="left:0;right:0;top:0;position:fixed;z-index: 10;" />
				</uni-transition>
				<!-- #endif  -->

				<view class="padding-tb padding-lr-lg">
					<view class="color-white text-lg margin-top-ssm">账户余额</view>
					<view class="margin-top-xl margin-bottom">
						<text class="color-white padding-right-xs text-xxxl">￥</text>
						<text class="color-white text-xxxxl">{{ balanceMoney | formatPrice }}</text>
					</view>
				</view>
			</view>
		</view>

		<view class="flex align-center justify-between bg-gray-1">
			<view class="flex-sub">
				<uni-list>
					<uni-list-item title="充值" @click="showPay" :thumb="imgUrl+'/wallet/chongzhi.png'" thumb-size="sm"
						:show-arrow="false" />
					<uni-list-item title="提现" @click="goToWithdraw" :thumb="imgUrl+'/wallet/tixian.png'" thumb-size="sm"
						:show-arrow="false" />
				</uni-list>
			</view>
			<view class="flex-sub">
				<uni-list>
					<uni-list-item title="银行卡信息" @click="goToBankCard" :thumb="imgUrl+'/wallet/yinhangka.png'"
						thumb-size="sm" :show-arrow="false" />
					<uni-list-item title="保证金" @click="goToDeposit" :thumb="imgUrl+'/wallet/baozhengjin.png'"
						thumb-size="sm" :show-arrow="false" />
				</uni-list>

			</view>
		</view>

		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<view class="bg-white padding-lr-lg text-xl text-black margin-top-sm">
				<view class="padding-tb">流水明细</view>
			</view>
			<view class="bg-white padding-lr padding-tb-sm flex align-start justify-between" style="margin-top: 3rpx;"
				v-for="(item,index) in list" :key="index">
				<view class="flex-grow flex flex-direction">
					<view class="item-title text-df text-gray-4">{{ item.details }}</view>
					<view class="text-normal text-black-4 margin-top-ssm flex align-start">
						<view>{{ item.amount | formatPrice }}</view>
						<view class="padding-lr-xss text-df">元</view>
					</view>
				</view>
				<view class="text-sm text-gray-4" style="letter-spacing: -1rpx;">
					{{ item.createTimeStamp | formatDate }}
				</view>
			</view>
			<text class="loading-text margin-top-sm">{{
			        loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
			    }}
			</text>
		</scroll-view>
	</view>
</template>

<script>
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import {
		formatTime6,
		priceTranslate
	} from "@/utils/myUtil";
	import {
		getUserAccountInfoByUserId,getPerDetailsInfo 
	} from "@/api/user";
	import {
		getAccountRecordList,
		getUserBankInfo
	} from "@/api/finance";
	import {
		imgUrl,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "myWallet",
		components: {
			UniList,
			UniListItem,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userData: {},

				list: [],
				triggered: false,
				page: 1,
				size: 10,

				isLoading: false,
				loadingType: 2,
				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

				balanceMoney: 0,

				isShowNotice: false,
				transShow: false,
				modeClass: ['fade', 'slide-top'],

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
					this.listHeight = uni.getWindowInfo().safeArea.height - 177 - 92 - 40;
					//#endif
					// #ifdef H5
					this.listHeight = uni.getWindowInfo().safeArea.height - 177 - 92 - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		filters: {
			formatDate(time) {
				return formatTime6(new Date(time));
			},
			formatPrice(number) {
				return priceTranslate(number);
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
				// #ifdef APP-PLUS
				this.aniHandle();
				// #endif
				this.loadData();
				this.loadUserData();
			},
			aniHandle() {
				this.transShow = true;
				setTimeout(() => {
					this.transShow = false;
				}, 5000)
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
			toCertificate() {
				uni.showToast({
					icon: 'none',
					title: "请完成个人认证后再操作",
					duration: 2000
				});
				setTimeout(() => {
					uni.navigateTo({
						url: '/pagesCertification/personal/index',
					})
				})
			},
			loadUserData() {
				let self = this;
				getPerDetailsInfo().then(res => {
					if (res.retCode === 0) {
						if (res.data) {
							uni.setStorageSync('user', res.data);
							self.userData = res.data;
							self.balanceMoney = res.data.balanceMoney;
						}
					}
				});
			},
			//跳转到保证金信息页面
			goToDeposit() {
				uni.navigateTo({
					url: '/pagesPersonal/wallet/myDeposit'
				})
			},
			//银行卡信息
			goToBankCard() {
				if (this.userData.verifyStatus < 1) {
					let self = this;
					uni.showModal({
						title: '小二提示',
						confirmText: '确认',
						showCancel: true,
						cancelText: "取消",
						confirmColor: '#fb5318',
						content: '请在完成个人认证后，再添加银行信息！',
						success: function(res1) {
							if (res1.confirm) {
								self.toCertificate();
							}
						},
					});
				} else {
					uni.navigateTo({
						url: '/pagesPersonal/bankCard/bankCardList'
					});
				}
			},
			//提现
			goToWithdraw() {
				if (this.userData.verifyStatus < 1) {
					let self = this;
					uni.showModal({
						title: '小二提示',
						confirmText: '确认',
						showCancel: true,
						cancelText: "取消",
						confirmColor: '#fb5318',
						content: '请在完成个人认证后，再添加银行信息！',
						success: function(res1) {
							if (res1.confirm) {
								self.toCertificate();
							}
						},
					});
				} else {
					getUserBankInfo().then(res => {
						if (res.retCode === 0) {
							if (res.data == null) {
								uni.showModal({
									title: '小二提示',
									confirmText: '立即添加',
									showCancel: true,
									cancelText: "取消",
									confirmColor: '#fb5318',
									content: '您还没有可用于提现的银行卡，请先添加一张储蓄卡',
									success: function(res1) {
										if (res1.confirm) {
											uni.navigateTo({
												url: '/pagesPersonal/bankCard/bankCardList'
											})
										}
									},
								});
							} else {
								uni.navigateTo({
									url: '/pagesPersonal/wallet/withDraw'
								})
							}
						}
					});
				}
			},
			//余额充值
			showPay() {
				uni.navigateTo({
					url: '/pagesPersonal/pay/payFund?type=1'
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

				let paramsData = {
					page: this.page,
					size: this.size,
					type: 1, //余额(1),金豆(2),信誉度(3),保证金(4)
				}
				let self = this;
				getAccountRecordList(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.page === 1) {
							self.list.splice(0, self.list.length);
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
			closeNotice() {
				this.transShow = !closeNotice;
			}
		},

	}
</script>

<style scoped lang="scss">
	@import "/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
	}

	::v-deep .uni-noticebar {
		padding: 0 24rpx !important;
	}

	::v-deep .uni-noticebar__content-text {
		font-size: 22rpx !important;
		color: #777777 !important;
	}

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item {
		padding: 0 20rpx;
		margin-bottom: 2rpx;
		background-color: white;
	}

	::v-deep .uni-list-item__container {
		padding: 16rpx 0 !important;
	}

	::v-deep .uni-list-item:last-child {
		border-bottom: 0;
	}

	::v-deep .uni-list-item__icon {
		padding: 0 10rpx 0 0;
		margin-right: 0;
	}

	::v-deep .uni-list-item__icon-img {
		height: 34rpx;
		width: 48rpx;
		padding-top: 6rpx;
	}

	@media (prefers-color-scheme: dark) {
		::v-deep .uni-list-item {
			background-color: #1e1e1e;
		}
	}

	.item-title {
		width: 70%;
		overflow: hidden;
		display: -webkit-box;
		text-overflow: ellipsis;
		word-wrap: break-word;
		white-space: normal !important;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
	}
</style>