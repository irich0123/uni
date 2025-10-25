<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="收到报价" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view class="bg-gray-1" scroll-y :style="'padding-top:'+ contentTop +'px;height:'+listHeight+'px;'"
			@scrolltolower="loadMoreData" refresher-enabled="true" :refresher-triggered="triggered"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore" refresher-background="transparent">
		
			<view class="bg-white margin-sm">
				<release-work-list-cell :releaseWork="releaseWork" :showStatusBar="false" />
			</view>

			<uni-list>
				<uni-list-item class="margin-lr-sm" v-for="(item,index) in list" :key="index" :show-arrow="false">
					<view class="bg-white padding-sm" style="margin-bottom: 2rpx;">
						<user-bar-normal :user="item.userDetailsInfo" :contact-on="true" @onCall="phoneClick"
							:statisticsOn="true" />
					</view>

					<view class="bg-white padding-lr-sm">
						<view class="flex align-center justify-between text-df padding-tb-ssm text-black">
							<view class="color-black flex align-center justify-between">
								<view class="text-gray-4">数量：</view>
								<view>
									{{item.count}}{{releaseWork.unit}}
								</view>
							</view>
							<view class="color-black flex align-center justify-between">
								<view class="text-gray-4">
									<text v-if="item.priceType === 1">单价：</text>
									<text v-if="item.priceType === 2">总价：</text>
								</view>
								<view>
									{{item.price}}元
									<text v-if="item.priceType === 1">/{{releaseWork.unit}}</text>
									<text v-if="item.priceType === 2"></text>
								</view>
							</view>
						</view>
						<view class="flex align-center justify-between text-df padding-tb-ssm">
							<view class="color-black flex align-center justify-between">
								<view class="text-gray-4">交期：</view>
								<text>{{item.deliveryTime | formatDate}}</text>
							</view>
							<view class="color-black flex align-center justify-between">
								<view class="text-gray-4">加工方式：</view>
								<text>{{item.workingWay}}</text>
							</view>
						</view>
						<view class="flex align-center justify-between text-df padding-tb-ssm">
							<view class="text-gray-4">发活方需冻结保证金：</view>
							<view>{{item.depositRequire | formatPrice}}元</view>
						</view>
						<view class="flex align-center justify-between text-df padding-tb-ssm">
							<view class="text-gray-4">样品标准：</view>
							<text>{{item.sampleWay}}</text>
						</view>
						<view class="flex align-center justify-between text-df padding-tb-ssm">
							<view class="text-gray-4">验收标准：</view>
							<view><text>{{item.acceptanceType}}</text><text>{{item.acceptanceDetails}}</text></view>
						</view>
						<view class="flex align-center justify-between text-df padding-tb-ssm">
							<view class="text-gray-4">验收方式：</view>
							<view>{{item.acceptanceWay}}</view>
						</view>
						<view class="flex align-center justify-between text-df padding-tb-ssm">
							<view class="text-gray-4">结算：</view>
							<view>{{item.settlementWay}}</view>
						</view>
						<view class="flex align-center justify-between text-df padding-tb-ssm">
							<view class="color-black flex align-center justify-between">
								<view class="text-gray-4">样品运费：</view>
								<view>{{item.sampleFreightWay}}</view>
							</view>
							<view class="color-black flex align-center justify-between">
								<view class="text-gray-4">大货运费：</view>
								<view>{{item.goodsFreightWay}}</view>
							</view>
						</view>
						<view class="flex align-center justify-between text-df padding-tb-ssm" v-if="item.offerDesc">
							<view class="text-gray-4">备注：</view>
							<view>{{item.offerDesc}}</view>
						</view>

						<view class="flex align-center justify-between text-df padding-tb-ssm"
							v-if="item.sampleImg.length>0">
							<view>样品图片：</view>
							<view class="flex flex-wrap">
								<view v-for="(aItem, index0) in item.sampleImg" :key="index0"
									@click="previewImage(item,index0)">
									<image style="width: 210rpx;height: 210rpx;" class="margin-xs radius"
										:src="aItem" />
								</view>
							</view>
						</view>
					</view>
				</uni-list-item>
			</uni-list>

			<text class="loading-text">{{
				loadingType === 0 ? contentText.contentdown : (loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
			}}
			</text>
		</scroll-view>
	</view>
</template>

<script>
	import {
		getReleaseWorkDetailsByIdAnon,
		filterWorkInfoOffer
	} from '@/api/workinfo';
	import {
		calculateMath,
		formatTime,
		priceTranslate
	} from "@/utils/myUtil";
	import releaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";
	import UserBarNormal from "@/utils/yjg-user/user-bar-normal";
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import {
		regex,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "list",
		components: {
			releaseWorkListCell,
			UserBarNormal,
			UniList,
			UniListItem,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				releaseWork: {
					id: null,
					type: null, //信息类型
				},

				page: 1,
				size: 10,
				list: [],
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
		filters: {
			formatDate(time) {
				return formatTime(time);
			},
			formatPrice(number) {
				return priceTranslate(number);
			},
		},
		onLoad(options) {
			this.releaseWork.id = parseInt(options.releaseWorkId)
		},
		onShow() {
			this.token = uni.getStorageSync('token');

			this.getDetailsByReleaseWorkId()
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
			phoneClick(event) {
				uni.makePhoneCall({
					phoneNumber: event.mobile,
				}).catch(e => {});
			},
			//根据id获取活信息详情
			getDetailsByReleaseWorkId() {
				let self = this;
				let paramsData = {
					id: this.releaseWork.id
				}
				getReleaseWorkDetailsByIdAnon(paramsData).then(res => {
					if (res.retCode === 0) {
						self.releaseWork = res.data;
						if (self.releaseWork.img) {
							self.releaseWork.img = JSON.parse(self.releaseWork.img);
						} else {
							self.releaseWork.img = [];
						}

						self.loadData();
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
			loadData() {
				if (this.isLoading) {
					return;
				}
				this.isLoading = true;

				let paramsData = {
					page: this.page,
					size: this.size,
					status: this.status,
					workInfoId: this.releaseWork.id,
				}
				let self = this;
				filterWorkInfoOffer(paramsData).then(res => {
					if (res.retCode === 0) {
						let list = res.data.list;
						if (self.page === 1) {
							self.list.splice(0, self.list.length);
						}
						list.forEach(item => {
							if (item.sampleImg) {
								item.sampleImg = JSON.parse(item.sampleImg);
							} else {
								item.sampleImg = [];
							}
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
			previewImage(item, index) {
				uni.previewImage({
					urls: item.sampleImg,
					current: index,
					loop: true,
				})
			}
		},
	}
</script>

<style scoped lang="scss">
	@import "/static/css/loading.css";

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
	}

	::v-deep .uni-list-item {
		padding: 0rpx !important;
	}
</style>