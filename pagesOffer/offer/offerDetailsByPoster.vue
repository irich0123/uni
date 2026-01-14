<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="报价详情" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>

			<view class="bg-white margin-sm">
				<release-work-list-cell :releaseWork="releaseWork" :showStatusBar="false" />
			</view>

			<view class="bg-white padding-sm margin-sm radius-s">
				<user-bar-normal :user="offerUser" @onCall="phoneClick" :contactOn="true"
					:statisticsOn="true" />
			</view>

			<view class="bg-white margin-sm padding-lr-sm padding-top-sm gray-border-top text-df">
				<view class="gray-border-bottom">
					<view class="flex align-center justify-between text-df padding-tb-sm">
						<view class="color-black flex align-center">
							<view class="text-gray-4">数量：</view>
							<view>{{offer.count}}{{releaseWork.unit}}</view>
						</view>
						<view class="color-black flex align-center">
							<view class="text-gray-4">
								<text v-if="offer.priceType === 1">单价：</text>
								<text v-if="offer.priceType === 2">总价：</text>
							</view>
							<view>
								{{offer.price}}元
								<text v-if="offer.priceType === 1">/{{releaseWork.unit}}</text>
								<text v-if="offer.priceType === 2"></text>
							</view>
						</view>
					</view>
					<view class="flex align-center justify-between text-df padding-tb-sm">
						<view class="color-black flex align-center">
							<view class="text-gray-4">
								交期：
							</view>
							<view>
								{{offer.deliveryTime | formatDate}}
							</view>
						</view>
						<view class="color-black flex align-center">
							<view class="text-gray-4">
								加工方式：
							</view>
							<view>
								{{offer.workingWay}}
							</view>
						</view>
					</view>
					<view class="flex align-center justify-between text-df padding-tb-sm">
						<view class="color-black flex align-center">
							<view class="text-gray-4">
								发活方需冻结保证金：
							</view>
							<view>
								{{offer.depositRequire | formatPrice}}元
							</view>
						</view>
					</view>
				</view>
				<view class="gray-border-bottom">
					<view class="flex align-center justify-between text-df padding-tb-sm">
						<view class="color-black flex align-center">
							<view class="text-gray-4">
								样品标准：
							</view>
							<view>
								{{offer.sampleWay}}
							</view>
						</view>
					</view>
					<view class="flex align-center justify-between text-df padding-tb-sm">
						<view class="color-black flex align-center">
							<view class="text-gray-4">
								验收标准：
							</view>
							<view>
								{{offer.acceptanceType}}<text style="margin-left: 10rpx">{{offer.acceptanceDetails}}</text>
							</view>
						</view>
					</view>
					<view class="flex align-center justify-between text-df padding-tb-sm">
						<view class="color-black flex align-center">
							<view class="text-gray-4">
								验收方式：
							</view>
							<view>
								{{offer.acceptanceWay}}
							</view>
						</view>
					</view>
				</view>

				<view class="gray-border-bottom">
					<view class="flex align-center justify-between text-df padding-tb-sm">
						<view class="color-black flex align-center">
							<view class="text-gray-4">
								结算：
							</view>
							<view>
								{{offer.settlementWay}}
							</view>
						</view>
					</view>
					<view class="flex align-center justify-between text-df padding-tb-sm">
						<view class="color-black flex align-center">
							<view class="text-gray-4">
								样品运费：
							</view>
							<view>
								{{offer.sampleFreightWay}}
							</view>
						</view>
						<view class="color-black flex align-center">
							<view class="text-gray-4">
								大货运费：
							</view>
							<view>
								{{offer.goodsFreightWay}}
							</view>
						</view>
					</view>
				</view>
				<view class="gray-border-bottom">
					<view class="color-black flex align-center" v-if="offer.offerDesc">
						<view class="text-gray-4">
							备注：
						</view>
						<view>
							{{offer.offerDesc}}
						</view>
					</view>
				</view>

				<view class="padding-tb">
					<view class="text-gray-4" style="padding-bottom: 30rpx">
						样品图片：
					</view>
					<view class="flex flex-wrap margin-left-sm">
						<view v-for="(itemImage,indexImage) in offer.sampleImg" :key="indexImage"  @click="previewImage(offer,indexImage)">
							<image style="width: 210rpx;height: 210rpx;" class="margin-xs radius" :src="itemImage"></image>
						</view>
					</view>
				</view>
			</view>

			<view class="blank"></view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		calculateMath,
		formatTime,
		priceTranslate
	} from "@/utils/myUtil";
	import {
		getReleaseWorkDetailsByIdAnon,
		getWorkInfoOfferById
	} from "@/api/workinfo";
	import {
		getUserInfoByUserId,
	} from "@/api/user";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import UserBarNormal from "@/utils/yjg-user/user-bar-normal";
	import releaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";
	import {
		active
	} from '@/utils/config';
	
	export default {
		name: "offerDetails",
		components: {
			releaseWorkListCell,
			UserBarNormal,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				releaseWork: {},
				offer: {},
				offerUser: {},
				
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
			formatQuantity(number) {
				return calculateMath(number, 0);
			}
		},
		onLoad(options) {
			this.releaseWork.id = parseInt(options.releaseWorkId);
			this.offer.id = parseInt(options.offerId);
		},
		onShow() {
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

						self.getWorkInfoOfferById();
					}
				});
			},

			getWorkInfoOfferById() {
				let self = this;
				let param = {
					id: this.offer.id
				}
				getWorkInfoOfferById(param).then(res => {
					if (res.retCode === 0) {
						self.offer = res.data;

						if (self.offer.sampleImg) {
							self.offer.sampleImg = JSON.parse(self.offer.sampleImg)
						} else {
							self.offer.sampleImg = [];
						}
						
						self.getUserInfo(self.offer.userId);
					}
				});
			},
			
			getUserInfo(userId) {
				let self = this;
				getUserInfoByUserId({
					userId: userId
				}).then(res => {
					if (res.retCode === 0) {
						self.offerUser = res.data;
					}
				});
			},
			phoneClick(e) {
				uni.makePhoneCall({
					phoneNumber: e.mobile,
				}).catch(e=>{});
			},
			previewImage(item,index){
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
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.blank {
		height: 200rpx;
	}

</style>