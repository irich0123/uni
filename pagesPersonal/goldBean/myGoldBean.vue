<template>
	<view class="container flex flex-direction no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="我的金豆" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<view :style="'padding-top:'+contentTop+'px;'">
			<view class="padding-lr-lg padding-tb bg-theme">
				<view class="color-white text-lg margin-bottom">金豆(颗)</view>
				<view class="color-white text-xxxxl">{{ beanCount | formatQuantity }}</view>
			</view>
		</view>

		<view class="flex align-center justify-between bg-gray-1">
			<view class="flex-sub">
				<uni-list>
					<uni-list-item title="充金豆" @click="goToBeanGoods" :thumb="imgUrl+'/personal/beans.png'"
						thumb-size="sm" :show-arrow="false" />
					<uni-list-item title="金豆兑换码" @click="toInput" :thumb="imgUrl+'/personal/exchange.png'"
						thumb-size="sm" :show-arrow="false" />
				</uni-list>
			</view>
			<view class="flex-sub">
				<uni-list>
					<uni-list-item title="换礼品" @click="gotoGiftStore" :thumb="imgUrl+'/ic_gift.png'" v-if="false"
						thumb-size="sm" :show-arrow="false" />
				</uni-list>
			</view>
		</view>

		<!--        金豆明细-->
		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'" @scrolltolower="loadMoreData"
			refresher-enabled="true" :refresher-triggered="triggered" @refresherrefresh="onRefresh"
			@refresherrestore="onRestore" refresher-background="transparent">

			<view class="bg-white padding-lr-lg text-xl text-black margin-top-sm">
				<view class="padding-tb">金豆明细</view>
			</view>

			<view class="bg-white padding-lr padding-tb-sm flex align-start justify-between" style="margin-top: 3rpx;"
				v-for="(item,index) in list" :key="index">
				<view class="flex-grow flex flex-direction">
					<view class="item-title text-df text-gray-4">{{ item.details }}</view>
					<view class="text-normal text-black-4 margin-top-ssm flex align-start">
						{{ item.amount | formatQuantity }}
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

		<uni-popup ref="dialogInput" type="dialog" :mask-click="false">
			<uni-popup-dialog-text-area mode="input" :value="code" placeholder="请输入有效金豆兑换码" title="兑换码输入"
				:beforeClose="true" class="flex flex-direction align-center justify-center" :with-title="false"
				@confirm="submitCheck" @close="inputClose"></uni-popup-dialog-text-area>
		</uni-popup>
	</view>
</template>

<script>
	import {
		calculateMath,
		formatTime6,
		priceTranslate
	} from "@/utils/myUtil";
	import {
		getModuleConfig
	} from "@/api/common";
	import {
		getUserAccountInfoByUserId,
		beanCouponExchange
	} from "@/api/user";
	import {
		getBeanPriceRule,
		getAccountRecordList
	} from "@/api/finance";
	import {
		active
	} from '@/utils/config';
	
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import uniPopupDialogTextArea from '@/components/uni-popup/uni-popup-dialog-text-area.vue'
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import {
		imgUrl
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "myGoldBean",
		components: {
			UniList,
			UniListItem,
			uniPopup,
			uniPopupDialogTextArea,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				beanCount: 0,

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
				isShowGiftStore: false,

				code: null,

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
					this.listHeight = uni.getWindowInfo().safeArea.height - 145 - 92 - 40;
					//#endif
					// #ifdef H5
					this.listHeight = uni.getWindowInfo().safeArea.height - 145 - 92 - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		filters: {
			formatDate(time) {
				return formatTime6(new Date(time));
			},
			formatQuantity(number) {
				return calculateMath(number, 0);
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
				this.loadData()
				this.loadUserData()
				//判断是否显示金豆商城
				this.getStoreStatus()
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

			//获取用户个人信息
			loadUserData() {
				let self = this;
				getUserAccountInfoByUserId({
					userId: this.userData.id
				}).then(res => {
					if (res.retCode === 0) {
						self.beanCount = res.data.beans;
					}
				});
			},
			getStoreStatus() {
				let self = this;
				getModuleConfig().then(res => {
					if (res.retCode === 0) {
						self.isShowGiftStore = !!res.data.giftStoreStatue;
					}
				});
			},
			gotoGiftStore() {
				uni.navigateTo({
					url: '/pagesGiftStore/giftStore/giftList'
				})
			},
			//金豆充值
			goToFund() {
				uni.navigateTo({
					url: '/pagesPersonal/pay/payBeanGoods'
				})
			},
			//金豆卡购买
			goToBeanGoods() {
				uni.navigateTo({
					url: '/pagesPersonal/pay/payBeanGoods?type=0'
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
					type: 2  //    余额(1),金豆(2),信誉度(3),保证金(4);
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
			toInput() {
				this.$refs.dialogInput.open();
			},
			submitCheck(fn, e) {
				let self = this;
				beanCouponExchange({
					code: e
				}).then(res => {
					if (res.retCode === 0) {
						fn();
						self.page = 1;
						self.initData();
					}
				}).catch(e => {
					if (e.message.indexOf("不存在") > -1) {
						uni.showToast({
							title: "无效兑换码！",
							icon: "none",
							duration: 1500,
						})
					}
				});
			},
			inputClose(fn) {
				this.code = "";
				fn();
			}

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
		padding: 0 20rpx;
		background-color: white;
		margin-bottom: 2rpx;
	}

	::v-deep .uni-list-item:last-child {
		border-bottom: 0;
	}

	::v-deep .uni-list-item__icon {
		padding: 0 30rpx 0 20rpx;
		margin-right: 0;
	}

	::v-deep .uni-list-item__icon-img {
		height: 48rpx !important;
		width: 48rpx !important;
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