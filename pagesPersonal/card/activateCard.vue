<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="激活" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			
			<view class="radius-s">
				<uni-list>
					<uni-list-item title="类型" :show-arrow="false" :right-text="card.cardSignName" />
					<uni-list-item title="购买日期" :show-arrow="false" :right-text="card.createTime | formatDate" />
					<uni-list-item title="编号" :show-arrow="false" :right-text="card.cardNo " />
					<uni-list-item title="价格" v-if="!!card.price" :show-arrow="false"
						:right-text="card.price | formatPrice" />
				</uni-list>

				<uni-list>
					<uni-list-item title="生效日期">
						<template v-slot:right>
							<picker mode="date" :value="validDate" :start="validStartDate" :end="validEndDate"
								@change="onDatePicker">
								<text class="text-black-4 text-df">{{ validDate }}</text>
							</picker>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
		</scroll-view>
		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<button class="bg-theme text-xl color-white radius-0" @click="submit">激活</button>
		</view>

	</view>
</template>

<script>
	import {
		formatTime6,formatTimeNoHour,
		priceTranslate,regexDateStringToTimestamp
	} from "@/utils/myUtil";
	import {
		activeBeanCard,
		activeTailCard,
		getBeanCardById,
		getTailCardById
	} from "@/api/finance";
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	
	export default {
		name: "activateCard",
		components: {
			UniList,
			UniListItem,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				card: {
					id: null,
					cardNo: null,
					price: null,
					cardTypeId: null,
					cardSignName: null,
				},
				type: null, //1金豆卡，2尾货通卡

				validStartDate: '',
				validEndDate: '',
				validDate: '',

				token: null,

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
			formatPrice(number) {
				return priceTranslate(number);
			},
		},
		onLoad(options) {
			this.type = parseInt(options.type);
			this.card.id = parseInt(options.id);

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token')

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
				this.generateTimeDuration();
				if (this.type === 0) {
					uni.setNavigationBarTitle({
						title: "激活金豆卡",
					})
					this.getBeanCardInfo();
				} else {
					uni.setNavigationBarTitle({
						title: "激活尾货通卡",
					})
					this.getTailCardInfo();
				}
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
			getBeanCardInfo() {
				let self = this;
				let paramData = {
					id: this.card.id,
				}
				getBeanCardById(paramData).then(res => {
					if (res.retCode === 0) {
						self.card = res.data;
					}
				});
			},
			getTailCardInfo() {
				let self = this;
				let paramData = {
					id: this.card.id,
				}
				getTailCardById(paramData).then(res => {
					if (res.retCode === 0) {
						self.card = res.data;
					}
				});
			},
			generateTimeDuration() {
				// 	let now = dayjs(new Date().getTime());
				// 	this.validDate = now.format("YYYY-MM-DD");
				// 	this.validStartDate = this.validDate;
				// 	this.validEndDate = now.add(3, 'month').format("YYYY-MM-DD");
				let now  = new Date();
				this.validDate = formatTimeNoHour(now);
				this.validStartDate = this.validDate;
				let end = new Date(now.setMonth(now.getMonth() + 3));
				this.validEndDate = formatTimeNoHour(end);
			},
			//选择有效期
			onDatePicker(e) {
				this.validDate = e.detail.value
			},

			submit() {
				if (this.type === 0) {
					this.activeBeanCard();
				} else {
					this.activeTailCard();
				}
			},

			activeBeanCard() {
				let paramsData = {
					id: this.card.id,
					effectiveTime: regexDateStringToTimestamp(this.validDate + "T00:00:00"),
				}
				activeBeanCard(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							icon: 'none',
							title: '激活成功',
							duration: 2000
						});
						setTimeout(() => {
							uni.setStorageSync("needRefresh", 1);
							uni.navigateBack({
								delta: 1
							})
						}, 2000);
					}
				});
			},
			activeTailCard() {
				let paramsData = {
					id: this.card.id,
					effectiveTime: regexDateStringToTimestamp(this.validDate + "T00:00:00"),
				}
				activeTailCard(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							icon: 'none',
							title: '激活成功',
							duration: 2000
						});
						setTimeout(() => {
							uni.setStorageSync("needRefresh", 1);
							uni.navigateBack({
								delta: 1
							})
						}, 2000);
					}
				});
			},
		}
	}
</script>

<style scoped lang="scss">
	@import "@/static/css/bottomButtonBar.scss";

	.container {
		width: 100%;
		height: 100%;

		.info-content {
			font-size: 28rpx;

			.blank {
				height: 112rpx;
			}
		}
	}


	::v-deep .uni-list {
		margin: 20rpx 20rpx 0 20rpx;
		background-color: #ffffff;
		border-radius: 16rpx;
	}

	::v-deep .uni-list-item {
		padding: 0 20rpx !important;
		border-bottom: 1rpx solid #f2f2f2 !important;
	}

	::v-deep .uni-list-item__container {
		min-height: 70rpx;
	}

	::v-deep .uni-list-item__content-title {
		font-size: 28rpx !important;
		color: #666666 !important;
	}

	::v-deep .uni-list-item__extra-text {
		font-size: 28rpx !important;
		color: #333333 !important;
	}


	::v-deep .uni-icon-wrapper {
		// margin-right: -20rpx !important;
		color: #bbb !important;
	}

	@media (prefers-color-scheme: dark) {

		::v-deep .uni-list {
			background-color: #1e1e1e;
		}

		::v-deep .uni-list-item {
			border-bottom: 1rpx solid #000 !important;
		}

		::v-deep .uni-list-item__extra-text {
			color: #ccc !important;
		}
		
		::v-deep .uni-icon-wrapper {
			color: #333 !important;
		}
	}
</style>