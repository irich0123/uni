<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="我的卡券" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<wuc-tab :tab-list="tabBars" @change="onTabItemClick" textFlex :tabCur.sync="tabIndex"
			:style="'padding-top:'+contentTop+'px;'" select-class="text-theme"></wuc-tab>

		<!--        信息列表开始-->
		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<view v-for="(item,index) in tabBars[tabIndex].list" :key="index" class="margin-lr-xs">
				<view v-if="tabIndex===0" class="margin-top" style="position: relative;height:426rpx;">
					<image style="width:100%;height:410rpx;" mode="widthFix"
						:src="backImgList[item.cardTypeId-1].img[item.activated]" />
					<view style="z-index: 2;position: absolute;left: 30rpx;top: 30rpx;width: 90%;">
						<view class="text-white text-df">编号：{{ item.cardNo }}</view>
						<view class="flex align-center justify-between" style="margin-top: 180rpx;">
							<view>
								<view class="text-xxl text-white flex">
									<text>{{ tabBars[tabIndex].name }}</text>
									<text>•</text>
									<text>{{ item.cardSignName }}</text>
									<text>{{ item.price | formatPrice }}元</text>
								</view>
								<view class="flex text-df text-white">
									<view v-if="item.activated">有效期
										{{ item.effectiveTime | formatDate }} ~
										{{ item.invalidTime | formatDate }}
									</view>
									<view v-if="!item.activated">失效期
										{{ item.activeInvalidTime | formatDate }}
									</view>
								</view>
							</view>
							<view class="status-class color-black" v-if="item.activated">{{item.status?'已激活':'已失效'}}
							</view>
							<view class="status-class color-black" v-else @click="activateCardById(item.id)">
								立即激活
							</view>
						</view>
					</view>
				</view>
				<view v-if="tabIndex===1" class="margin-top flex flex-direction">
					<view class="bg-white radius-l flex flex-direction">
						<view
							class="flex gray-border-bottom padding-lr-lg padding-top-lg padding-bottom-sm justify-between">
							<view class="text-center flex-sub">
								<view class="text-theme" style="font-size: 46rpx;">{{ item.days }}天</view>
								<view class="text-ssm text-black">置顶券</view>
							</view>
							<view class="flex-treble padding-left gray-border-left">
								<view class="text-black text-lg padding-bottom-sm">置顶券</view>
								<view class="text-ssm text-gray-3">有效期至{{ item.invaliadtime | formatDate }}</view>
							</view>
						</view>
						<view class="bg-white padding-tb-sm padding-lr-lg text-sm text-gray-3">
							{{ item.address }}地区使用
						</view>
					</view>
				</view>
			</view>
			<span class="loading-text margin-top-sm">{{
                    tabBars[tabIndex].loadingType === 0 ? contentText.contentdown : (tabBars[tabIndex].loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</span>
		</scroll-view>

		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;" v-if="tabIndex===0">
			<button class="bg-theme text-xl color-white radius-0" @click="getToPay">购买</button>
		</view>
	</view>

</template>

<script>
	import wucTab from "../../components/wuc-tab/wuc-tab";
	import {
		formatTime,
		priceTranslate
	} from "@/utils/myUtil";
	import {
		getMyBeanCardList,
		getMyStickCoupons,
		getMyTailCardList
	} from "@/api/finance";
	import {
		imgUrl,active
	} from '@/utils/config.js';
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "cardList",
		components: {
			wucTab,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userData: {},

				isShowStick: false,
				isShow: false,
				isEndShow: false,
				userId: '',
				page: 1,
				size: 10,

				backImgList: [{
						name: '金豆卡',
						timeType: 1,
						img: [
							imgUrl + "/bg_yueka_n.png",
							imgUrl + "/bg_yueka_p.png"
						],
					},
					{
						name: '金豆卡',
						timeType: 2,
						img: [
							imgUrl + "/bg_jika_n.png",
							imgUrl + "/bg_jika_p.png"
						],
					},
					{
						name: '金豆卡',
						timeType: 3,
						img: [
							imgUrl + "/bg_nianka_n.png",
							imgUrl + "/bg_nianka_p.png"
						],
					},
					{
						name: '尾货通卡',
						timeType: 1,
						img: [
							imgUrl + "/ic_month_tail_n.png",
							imgUrl + "/ic_month_tail_p.png"
						],
					},
					{
						name: '尾货通卡',
						timeType: 2,
						img: [
							imgUrl + "/ic_season_tail_n.png",
							imgUrl + "/ic_season_tail_p.png"
						],
					},
					{
						name: '尾货通卡',
						timeType: 3,
						img: [
							imgUrl + "/ic_year_tail_n.png",
							imgUrl + "/ic_year_tail_p.png"
						],
					}
				],
				tabBars: [{
						name: '金豆卡',
						isLastPage: false,
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						list: [],
						fn: () => this.getMyBeanCardList(),
					},
					// {
					// 	name: '尾货通卡',
					// 	isLastPage: false,
					// 	loadingType: 2,
					// 	isLoading: false,
					// 	page: 1,
					// 	size: 10,
					// 	list: [],
					// 	fn: () => this.getMyTailCardList(),
					// },
					{
						name: '券',
						isLastPage: false,
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						list: [],
						fn: () => this.getMyStickCoupons(),
					},
				],
				tabIndex: 0,
				triggered: false,
				
				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

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
				return formatTime(time);
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
			//未激活的卡跳转到激活页面
			activateCardById(id) {
				uni.navigateTo({
					url: './activateCard?id=' + id + '&type=' + this.tabIndex,
				})
			},
			//购买金豆卡
			getToPay() {
				uni.navigateTo({
					url: '../pay/payBeanGoods?type=' + (this.tabIndex),
				})
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
			//获取我的置顶券
			getMyStickCoupons() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let self = this;
				let param = { //这里是假的，也要传，因为后端接口还是用的老的
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
					status: 1, //可用
				}
				getMyStickCoupons(param).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						res.data.list.forEach(item => {
							self.tabBars[self.tabIndex].list.push(item);
						});
						if (res.data.isLastPage) {
							self.tabBars[self.tabIndex].loadingType = 2;
						} else {
							self.tabBars[self.tabIndex].loadingType = 0;
						}
						self.tabBars[self.tabIndex].isLoading = false;
						setTimeout(() => {
							self.onRestore()
						}, 300)
					}
				}).catch(() => {
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				});
			},
			//获取我的尾货通卡列表
			getMyTailCardList() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let param = {
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
				}
				let self = this;
				getMyTailCardList(param).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						res.data.list.forEach(item => {
							if (!!item.activeTime) {
								item.activated = 1;
							} else {
								item.activated = 0;
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
			//获取我的金豆卡列表
			getMyBeanCardList() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;
				let param = {
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
					status: 1,
				}
				let self = this;
				getMyBeanCardList(param).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex].list
								.length);
						}
						res.data.list.forEach(item => {
							if (!!item.activeTime) {
								item.activated = 1;
							} else {
								item.activated = 0;
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
			onTabItemClick(e) {
				this.tabIndex = e;
				if (this.tabBars[this.tabIndex].list.length === 0) {
					this.tabBars[this.tabIndex].fn();
				}
			},
		},
	}
</script>

<style scoped lang="scss">
	@import "@/static/css/bottomButtonBar.scss";
	@import "/static/css/tabBar.css";
	@import "@/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.blank {
		height: 112rpx;
	}

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item__content {
		text-align: left;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
		margin: 0 0 20rpx 0 !important;
	}

	::v-deep .uni-list-item {
		padding: 0rpx !important;
	}

	.status-class {
		width: 160rpx;
		height: 60rpx;
		line-height: 60rpx;
		text-align: center;
		font-size: 26rpx;
		background: silver;
		border-radius: 50px;
	}

	.stick-box {
		margin-top: 30rpx;
		background: #e7e7e7;
		display: flex;
		flex-direction: column;
		height: auto;
		border-radius: 20rpx;

		.stick_top_box {
			display: flex;
			flex-direction: row;
			background: #fff;
			padding: 40rpx;
			padding-bottom: 20rpx;
			border-bottom: 1px #eee dashed;
			border-radius: 20rpx;
			position: relative;

			.stick_top_left_box {
				text-align: center;

				.left_one {
					font-size: 46rpx;
					color: #ff5100;
				}

				.left_two {
					font-size: 24rpx;
					color: #3c3e49;
				}
			}

			.stick_top_right_box {
				margin-left: 150rpx;
				position: absolute;
				bottom: 11px;

				.right_name {
					line-height: 80rpx;
					color: #333333;
					font-size: 32rpx;
				}

				.right_time {
					color: #aaaaaa;
					font-size: 24rpx;
				}
			}
		}


	}
</style>