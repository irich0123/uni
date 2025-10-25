<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="合同内容" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<!--        外发活基本信息开始-->
		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>

			<view>
				<view class="bg-white flex align-center justify-between text-normal padding gray-border-bottom">
					<view class="text-gray-5">合同编号：</view>
					<view class="text-black-4">{{ contractDetails.contractNo }}</view>
				</view>
				<view class="bg-white flex align-center justify-between text-normal padding">
					<view class="text-gray-5">订单编号：</view>
					<view class="text-black-4">{{ contractDetails.workInfoNo }}</view>
				</view>
				<view class="bg-white padding radius flex align-start margin-top-sm">
					<view style="width:160rpx;height:160rpx;">
						<image class="radius-s" style="width:160rpx;height:160rpx;" :src="(contractDetails.releaseWorkResponse.img && contractDetails.releaseWorkResponse.img.length > 0)?
						contractDetails.releaseWorkResponse.img[0]:releaseWorkBannerImg"></image>
					</view>
					<view class="flex flex-direction flex-grow margin-left-sm">
						<view class="text-black margin-bottom-ssm text-normal text-bold" style="overflow: hidden;line-height: 1.5;min-height: 80rpx;display: -webkit-box;text-overflow: ellipsis;
						word-wrap: break-word;white-space: normal !important;-webkit-line-clamp: 2;-webkit-box-orient: vertical;">
							{{ contractDetails.releaseWorkResponse.title }}
						</view>
						<view class="text-df color-black">
							<view class="flex justify-between">
								<view class="margin-bottom-ssm text-gray-5">
									<text>单价：</text>
									<text class="margin-right-xs"
										v-if="!!contractDetails.releaseWorkResponse.unitPrice">
										{{ contractDetails.releaseWorkResponse.unitPrice | formatPrice}}元
									</text>
									<text class="margin-right-xs" v-else>待议</text>
								</view>
								<view class="margin-bottom-ssm text-gray-5">
									<text>数量：</text>
									<text class="margin-right-xs" v-if="!!contractDetails.releaseWorkResponse.count">
										{{ contractDetails.releaseWorkResponse.count | formatQuantity }}{{ contractDetails.releaseWorkResponse.unit }}
									</text>
									<text class="margin-right-xs" v-else>待议</text>
								</view>
							</view>
							<view class="flex justify-between">
								<view class="margin-bottom-ssm text-gray-5">
									<text>交期：</text>
									<text class="margin-right-xs">
										{{ contractDetails.releaseWorkResponse.deliveryTimeStamp | formatDate }}
									</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<!--        外发活基本信息结束-->

			<!--        发活方和接活方信息开始-->
			<view class="margin-tb-sm bg-white">
				<view class="text-xl text-bold padding-tb padding-lr-lg">发活方</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">姓名：</view>
					<view>{{ contractDetails.firstPartUserName }}</view>
				</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">联系电话：</view>
					<view>{{ contractDetails.firstPartUserMobile }}</view>
				</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">身份证号：</view>
					<view>{{ contractDetails.firstPartUserCardNo }}</view>
				</view>
			</view>
			<view class="margin-tb-sm bg-white">
				<view class="text-xl text-bold padding-tb padding-lr-lg">接活方</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">姓名：</view>
					<view>{{ contractDetails.secondPartUserName }}</view>
				</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">联系电话：</view>
					<view>{{ contractDetails.secondPartUserMobile }}</view>
				</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">身份证号：</view>
					<view>{{ contractDetails.secondPartUserCardNo }}</view>
				</view>
			</view>
			<view class="margin-tb-sm bg-white">
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">数量：</view>
					<view>{{ contractDetails.count | formatQuantity}}{{ contractDetails.releaseWorkResponse.unit }}
					</view>
				</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">报价：</view>
					<view>
						{{ contractDetails.price | formatPrice }}元
						<text v-if="contractDetails.priceType === 1">/单价</text>
						<text v-if="contractDetails.priceType === 2">/总价</text>
					</view>
				</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">加工方式：</view>
					<view>{{ contractDetails.workingWay }}</view>
				</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">交货日期：</view>
					<view>{{ contractDetails.deliveryTime | formatDate }}</view>
				</view>
			</view>
			<view class="margin-tb-sm bg-white">
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">发活方保证金：</view>
					<view>{{ contractDetails.firstPartDepositRequire | formatPrice }}元</view>
				</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">接活方保证金：</view>
					<view>{{ contractDetails.secondPartDepositRequire | formatPrice }}元</view>
				</view>
			</view>
			<view class="margin-tb-sm bg-white">
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">样品：</view>
					<view>{{ contractDetails.sampleWay }}</view>
				</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top"
					v-if="contractDetails.sampleWay === '无需样品'">
					<view class="text-gray-5">验收标准：</view>
					<view>{{ contractDetails.acceptanceDetails }}</view>
				</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top"
					v-if="contractDetails.sampleWay !== '无需样品'">
					<view class="text-gray-5">验收标准：</view>
					<view>{{ contractDetails.acceptanceType }}
						<text style="margin-left: 10rpx">{{ contractDetails.acceptanceDetails }}</text>
					</view>
				</view>
				<!--            <view class="user_box_cell">-->
				<!--                <view class="text-gray-5">质量级别：</view>-->
				<!--                <view>{{contractDetails.acceptanceDetails}}</view>-->
				<!--            </view>-->
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">验收方式：</view>
					<view>{{ contractDetails.acceptanceWay }}</view>
				</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">结算：</view>
					<view>{{ contractDetails.settlementWay }}</view>
				</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top"
					v-if="contractDetails.settlementWay === '账期'">
					<view class="text-gray-5">账期天数：</view>
					<view>{{ contractDetails.accountPeriod }}天</view>
				</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top"
					v-if="contractDetails.sampleWay !== '无需样品'">
					<view class="text-gray-5">样品运费：</view>
					<view>{{ contractDetails.sampleFreightWay }}</view>
				</view>
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">大货运费：</view>
					<view>{{ contractDetails.goodsFreightWay }}</view>
				</view>
			</view>
			<view class="margin-tb-sm bg-white">
				<view class="flex align-center justify-between text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">说明：</view>
					<view>{{ contractDetails.offerDesc?contractDetails.offerDesc:''}}</view>
				</view>
				<view class="text-df padding-tb margin-lr-lg gray-border-top">
					<view class="text-gray-5">样品图片：</view>
					<view class="margin-tb-sm flex-wrap">
						<view v-for="(item, index0) in contractDetails.sampleImg" :key="index0" class="column_image">
							<image :src="item"></image>
						</view>
					</view>
				</view>
			</view>
			<!--        发活方和接活方信息结束-->
			<view class="blank"></view>
		</scroll-view>
		<!--        底部按钮开始-->
		<view class="bg-white" style="width: 100%;position:fixed;left:0;bottom:0;z-index: 19;"
			v-if="(this.type===1 && contractDetails.statusCode === '010')">
			<button class="bg-theme theme-border text-xl color-white radius-0" @click="confirm">确认合同</button>
		</view>
		<!--        底部按钮结束-->
	</view>
</template>

<script>
	import {
		calculateMath,
		formatTime,
		priceTranslate
	} from "@/utils/myUtil";
	import {
		confirmContract,
		getContractRecord
	} from "@/api/workinfo";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	

	export default {
		name: "contractDetails",
		components: {
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,

				id: null,
				contractDetails: {
					releaseWorkResponse: {}
				},
				releaseWorkBannerImg: null,
				type: null, // //type=0 ---- 甲方，发活方；type=1 ---乙方，接活方
				change: false,

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
				return formatTime(new Date(time));
			},
			formatPrice(number) {
				return priceTranslate(number);
			},
			formatQuantity(number) {
				return calculateMath(number, 0);
			}
		},
		onLoad(options) {
			this.id = parseInt(options.id);
			this.type = parseInt(options.type);

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
				//获取默认图片
				let defaultResource = uni.getStorageSync("defaultResource");
				this.releaseWorkBannerImg = defaultResource[0].resourceUrl[0];

				this.getContractRecord();
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
			confirm() {
				let paramsData = this.contractDetails;
				paramsData["change"] = this.change;

				uni.showModal({
					title: "系统提示",
					content: '是否确认签约合同？',
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							confirmContract(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										icon: 'none',
										title: '操作成功',
										duration: 2000
									});
									setTimeout(() => {
										let pages = getCurrentPages();
										let prevPage = pages[pages.length - 2];
										let object = 1;
										prevPage.$vm.otherFun(object);

										uni.navigateBack({
											delta: 1
										})
									}, 2000)
								}
							});
						}
					}
				})
			},
			//获取合同详情
			getContractRecord() {
				let paramsData = {
					id: this.id
				}
				let self = this;
				getContractRecord(paramsData).then(res => {
					if (res.retCode === 0) {

						let contract = res.data.contractInfo

						if (contract) {
							contract.firstPartUserCardNo = contract.firstPartUserCardNo.replace(/(\d{12})\d{6}/,
								'$1******')
							contract.secondPartUserCardNo = contract.secondPartUserCardNo.replace(/(\d{12})\d{6}/,
								'$1******')

							if (contract.sampleImg) {
								contract.sampleImg = JSON.parse(contract.sampleImg)
							} else {
								contract.sampleImg = [];
							}

							let releaseWorkResponse = contract.releaseWorkResponse
							if (releaseWorkResponse) {
								if (releaseWorkResponse.img) {
									releaseWorkResponse.img = JSON.parse(releaseWorkResponse.img)
								} else {
									releaseWorkResponse.img = [];
								}
							}
						}
						self.contractDetails = contract;
					}
				});
			},

		}
	}
</script>

<style scoped lang="scss">
	.container {
		height: 100%;
		width: 100%;
	}

	.column_image {
		width: 210rpx;
		height: 210rpx;
		margin-right: 10rpx;
		margin-bottom: 20rpx;

		image {
			display: block;
			width: 100%;
			height: 100%;
		}
	}

	.blank {
		height: 120rpx;
	}
</style>