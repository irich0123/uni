<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="入驻企业" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:'+ contentTop +'px;height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">

			<view class="flex flex-direction bg-white margin-tb radius-s" v-for="(item,index) in dataList" :key="index"
				@click="goToEnterpriseDetails(item.userId,item.companyName)">
				<view class="text-ssm text-gray-5 flex justify-end padding-top padding-lr">
					<view class="padding-right-xss">尾货<text
							class="text-theme text-xs margin-right-xxs">({{ item.commodityCnt }})</text></view>
					<view class="padding-right-xss">承接<text
							class="text-theme text-xs margin-right-xxs">({{ item.workOrderCnt }})</text></view>
					<view>外发<text class="text-theme text-xs margin-right-xxs">({{ item.releaseWorkCnt }})</text></view>
				</view>
				<view class="flex align-center gray-border-bottom padding-tb-ssm padding-left">
					<view class="padding-right-sm">
						<image style="width:70rpx;height:70rpx;border-radius:70rpx;"
							:src="item.logo?item.logo:item.cornerImgUrl" mode="aspectFill" />
					</view>
					<view class="text-black text-lg text-bold flex flex-direction">
						{{ item.companyName }}
					</view>
				</view>

				<view class="flex padding">
					<view v-if="item.imageList && item.imageList.length>0">
						<image :src="item.imageList[0]" mode="aspectFill" style="width:140rpx;height:140rpx;"
							class="radius" />
					</view>
					<view class="flex flex-direction margin-left-sm justify-between">
						<view class="text-black text-normal text-bold flex align-center padding-bottom-sm">
							<image style="width:60rpx;height:60rpx;border-radius:60rpx;" :src="item.userAvatar"
								mode="aspectFill" />
							<view class="margin-left-ssm">
								{{ item.contactName }}
							</view>
						</view>
						<view class="text-gray-4 text-ssm flex padding-tb-xss padding-left-xs">
							<view class="flex align-center" v-if="item.levelName">
								<view class="padding-right-xss">
									<image class="industry_image_box" :src="imgUrl+'/ic_item_certification.png'"
										mode="aspectFill" />
								</view>
								<view>
									{{ item.levelName }}
								</view>
							</view>
							<view>
								第{{ item.age + 1 }}年
							</view>
						</view>
						<view class="text-gray-4 text-ssm flex padding-tb-xss padding-left-xs">
							<view class="flex align-center" style="min-width: 100rpx;"
								v-if="item.industryName || item.companyType">
								<view class="padding-right-xss">
									<image class="industry_image_box" :src="imgUrl+'/index/trade.png'"
										mode="aspectFill" />
								</view>
								<view>
									{{ item.industryName }}
								</view>
								<view>
									{{ item.companyType }}
								</view>
							</view>
							<view class="flex align-center" style="min-width: 100rpx;" v-if="item.workerCnt">
								<view class="padding-right-xss">
									<image class="industry_image_box" :src="imgUrl+'/ic_item_workers.png'"
										mode="aspectFill" />
								</view>
								<view>
									{{ item.workerCnt }}
								</view>
							</view>
						</view>
						<view class="text-gray-4 text-ssm flex padding-tb-xss padding-left-xs">
							<view class="flex align-center" style="min-width: 100rpx;" v-if="item.reputation">
								<view class="padding-right-xss">
									<image class="industry_image_box" :src="imgUrl+'/ic_item_reputation.png'"
										mode="aspectFill" />
								</view>
								<view>
									信誉度 {{ item.reputation }}
								</view>

							</view>
						</view>
						<view class="text-gray-4 text-ssm flex padding-tb-xss padding-left-xs">
							<view class="flex align-center" style="min-width: 100rpx;" v-if="item.regionName">
								<view class="padding-right-xss">
									<image class="industry_image_box" :src="imgUrl+'/index/dizhi.png'"
										mode="aspectFill" />
								</view>
								<view>
									{{ item.regionName }}
								</view>
							</view>
						</view>
					</view>
				</view>

			</view>
			<text class="loading-text">{{
                    loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</text>
		</scroll-view>
	</view>
</template>

<script>
	import {
		filterEnterprise
	} from "@/api/user";
	import {
		imgUrl,
		active
	} from "@/utils/config";

	export default {
		name: "enterpriseList",
		data() {
			return {
				token: null,

				page: 1,
				size: 10,
				triggered: false,
				dataList: [],

				isLoading: false,
				loadingType: 2,
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
			this.token = uni.getStorageSync('token');

			this.initData();
		},
		onShow() {
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
					// userId: 64828,
				}
				let self = this;
				filterEnterprise(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.page === 1) {
							self.dataList.splice(0, self.dataList.length);
						}
						res.data.list.forEach(item => {
							if (item.logoUrl) {
								item.imageList = item.logoUrl.split(',');
								item.imageList = item.imageList.concat(item.comAuthImgs)
							} else {
								item.imageList = item.comAuthImgs
							}
							item.time = Math.floor(Math.random() * (10 - 4) + 4) * 1000
							self.dataList.push(item);
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
			//跳转到企业展台信息详情
			goToEnterpriseDetails(userId) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				uni.navigateTo({
					url: '/pagesCertification/enterprise/enterpriseDetails?userId=' + userId,
				})
			},
		},
		/**
		 * 用户点击右上角分享 ---小程序
		 */
		// #ifdef MP-WEIXIN
		onShareAppMessage: function(ops) {
			return {
				title: '云加工小程序',
				path: '/pages/index/index',
				imageUrl: this.imgUrl + '/share.png',
				success: function(res) {
					console.log("转发成功:" + JSON.stringify(res));
				},
				fail: function(res) {
					// 转发失败
					console.log("转发失败:" + JSON.stringify(res));
				}
			}
		},
		// #endif
	}
</script>

<style scoped lang="scss">
	@import "/static/css/loading.css";

	.industry_image_box {
		width: 24rpx;
		height: 24rpx;
	}

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

</style>