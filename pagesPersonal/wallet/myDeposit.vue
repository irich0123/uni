<template>
	<view class="container flex flex-direction no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="我的保证金" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<view :style="'padding-top:'+contentTop+'px;'">
			<view class="bg-theme padding-lr-lg">
				<view class="color-white text-lg padding-top-ssm">保证金余额</view>
				<view class="margin-top-xxl padding-bottom-xl">
					<text class="color-white padding-right-xs text-xxxl">￥</text>
					<text class="color-white text-xxxxl">{{ depositCount | formatPrice }}</text>
				</view>
				<view v-if="!!depositFrozenCount" class="margin-top-sm">
					<view class="color-white text-lg margin-top-ssm">被冻结保证(元)</view>
					<view>
						<text class="color-white padding-right-xs text-xxxl">￥</text>
						<text class="color-white text-xxxxl">{{ depositFrozenCount | formatPrice }}</text>
					</view>
				</view>
			</view>
		</view>
		<uni-list>
			<uni-list-item title="充保证金" @click="goToPayDeposit" :thumb="imgUrl+'/wallet/baozhengjin.png'"
				thumb-size="sm" />
		</uni-list>

		<!--        金豆明细-->
		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<view class="bg-white padding-lr-lg text-xl text-black margin-top-sm">
				<view class="padding-tb">流水明细</view>
			</view>
			<view class="bg-white padding-lr padding-tb-sm flex align-start justify-between" style="margin-top: 3rpx;"
				v-for="(item,index) in list" :key="index">
				<view class="flex-grow flex flex-direction">
					<view class="text-df text-gray-4">{{ item.details }}</view>
					<view class="text-lg color-black-4 margin-top-ssm flex align-start">
						<view>{{ item.amount | formatPrice }}</view>
						<view class="padding-lr-xss text-df">元</view>
					</view>
				</view>
				<view class="text-sm text-gray-4" style="letter-spacing: -1rpx;">
					{{ item.createTime | formatDate }}
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
	import {
		formatTime6,
		priceTranslate
	} from "@/utils/myUtil";
	import {
		getUserAccountInfoByUserId
	} from "@/api/user";
	import {
		getAccountRecordList
	} from "@/api/finance";
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import {
		imgUrl,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "myDeposit",
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

				depositCount: null,
				depositFrozenCount: null,

				totalDeposit: null,

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
					this.listHeight = uni.getWindowInfo().safeArea.height - 177 - 50 - 40;
					//#endif
					// #ifdef H5
					this.listHeight = uni.getWindowInfo().safeArea.height - 177 - 50 - (active === 'prod' ? 0 : 40);
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
			},
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
				this.loadUserData()
				this.loaddata();
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
			//跳转到充值保证金
			goToPayDeposit() {
				uni.navigateTo({
					url: "/pagesPersonal/pay/payFund?type=6"
				})
			},
			//获取用户个人信息
			loadUserData() {
				let self = this;
				getUserAccountInfoByUserId({
					userId: this.userData.id
				}).then(res => {
					if (res.retCode === 0) {
						self.depositCount = res.data.deposit
						self.depositFrozenCount = res.data.depositFrozenCount
					}
				});
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
			//获取保证金明细
			loaddata() {
				if (this.isLoading) {
					return;
				}
				this.isLoading = true;
				let paramsData = {
					page: this.page,
					size: this.size,
					type: 4, //余额(1),金豆(2),信誉度(3),保证金(4)
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
		},

	}
</script>

<style scoped lang="scss">
	@import "/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
		display: flex;

	}

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item {
		padding: 0 20rpx;
		margin-bottom: 2rpx;
		background-color: #fff !important;
	}

	::v-deep .uni-list-item:last-child {
		border-bottom: 0;
	}

	::v-deep .uni-list-item__container {
		background-color: #fff !important;
	}
	
	::v-deep .uni-list-item__icon {
		padding: 0 30rpx 0 20rpx;
		margin-right: 0;
	}

	::v-deep .uni-list-item__icon-img {
		height: 34rpx;
		width: 48rpx;
		padding-top: 6rpx;
	}

	::v-deep .uni-list-item__content-title {
		color: #999;
	}

	@media (prefers-color-scheme: dark) {
		::v-deep .uni-list-item {
			background-color: #1e1e1e;
		}
	}
</style>