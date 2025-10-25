<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="申请延迟交货" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>

			<uni-forms label-position="left" border label-width="90">
				<view class="margin-top-sm bg-white">
					<uni-forms-item label="签约时间：">
						<view class="text-black">{{ createTime | formatDate }}</view>
					</uni-forms-item>

					<uni-forms-item label="交货时间：">
						<view class="text-black">{{ deliveryTime | formatDate }}</view>
					</uni-forms-item>

					<uni-forms-item label="延期日期：">
						<picker mode="date" :disabled="!isVendor" :value="postponeDate" :start="startTime"
							:end="endTime" @change="bindDateChange">
							<view class="flex align-center">
								<view class="text-black">{{ postponeDate }}</view>
								<uni-icons type="forward" size="20" color="#999999" v-show="isVendor"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="赔付金额：" label-width="120">
						<uni-easyinput type="digit" v-model="compensationMoney" :clearable="false"
							placeholder="我愿意赔付对方金额" :inputBorder="false" />
						<view class="margin-left-ssm text-black">元</view>
					</uni-forms-item>

				</view>
				<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;"
					v-if="isVendor">
					<button class="bg-white theme-border text-xl color-white radius-0" v-if="showCancelBtn"
						@click="operateDelayApply(0)">撤销</button>
					<button class="bg-theme theme-border text-xl color-white radius-0" @click="uploadDelayApply"
						v-else>确认</button>
				</view>
				<view class="bg-white flex" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;" v-else>
					<button class="bg-theme theme-border text-xl color-white radius-0 flex-sub"
						@click="operateDelayApply(1)">同意</button>
					<button class="bg-white theme-border text-xl color-white radius-0 flex-sub"
						@click="operateDelayApply(2)">不同意</button>
				</view>
			</uni-forms>
		</scroll-view>
	</view>

</template>

<script>
	import UniForms from "@/components/uni-forms/uni-forms";
	import uniFormsItem from "@/components/uni-forms-item/uni-forms-item";
	import UniIcons from "@/components/uni-icons/uni-icons";
	import UniEasyInput from "@/components/uni-easyinput/uni-easyinput";
	import {
		formatTime,
		formatTimeNoHour,
		regexDateStringToTimestamp
	} from "@/utils/myUtil";
	import {
		getContractRecord,
		operateDelayApply,
		checkDelayApply,
		uploadDelayApply
	} from "@/api/workinfo";
	import {
		regex,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "applyPostpone",
		components: {
			UniForms,
			uniFormsItem,
			UniIcons,
			UniEasyInput,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userData: {},
				type: null,

				id: null,
				createTime: null,
				deliveryTime: null,
				postponeDate: null,
				delayTime: null,
				compensationMoney: null,
				startTime: '',
				endTime: '',
				isVendor: false,

				showCancelBtn: false,

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
		},
		onLoad(options) {
			this.userData = uni.getStorageSync('user')

			this.id = parseInt(options.contractId);
			this.type = parseInt(options.type);

			this.isVendor = !!this.type;

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync('user')

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
				this.getContractRecord();
			},

			//获取交易详情
			getContractRecord() {
				let paramsData = {
					id: this.id
				}
				let self = this;
				getContractRecord(paramsData).then(res => {
					if (res.retCode === 0) {
						self.createTime = res.data.contractInfo.createTime;
						self.deliveryTime = res.data.contractInfo.deliveryTime;

						self.checkDelayApply()
					}
				});
			},

			generateTimeDuration() {
				let day = 24 * 3600 * 1000;
				this.startTime = formatTimeNoHour(new Date(new Date().getTime() + day));
				this.endTime = formatTimeNoHour(new Date(new Date().getTime() + 30 * day));
				this.postponeDate = formatTimeNoHour(new Date(new Date().getTime() + 7 * day));
			},
			//操作“延期申请”  同意/拒绝/撤销
			operateDelayApply(operateType) {
				if (!this.token) {
					this.toLogin();
					return;
				}

				let self = this;
				let contentModal = ''
				if (operateType === 0) {
					contentModal = '确定撤销延迟申请吗？'
				} else if (operateType === 1) {
					contentModal = '确定同意延迟申请吗？'
				} else if (operateType === 2) {
					contentModal = '确定不同意延迟申请吗？'
				} else {
					return
				}
				uni.showModal({
					title: "系统提示",
					content: contentModal,
					showCancel: true,
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#ff5100',
					success: function(res1) {
						if (res1.confirm) {
							let paramsData = {
								contractId: self.id,
								operateType: operateType
							}
							uni.showLoading({});
							operateDelayApply(paramsData).then(res => {
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
											delta: 1,
										})
									}, 2000);
								}
							}).catch(() => {
								uni.hideLoading()
							});
						}
					}
				})
			},
			//查看延期申请
			checkDelayApply() {
				let paramsData = {
					contractId: this.id
				}
				let self = this;
				checkDelayApply(paramsData).then(res => {
					if (res.retCode === 0) {
						if (res.data) { //有申请
							if (self.userData.id === res.data.userId) {
								self.postponeDate = formatTimeNoHour(new Date(res.data.delayTime));
								self.compensationMoney = res.data.compensationMoney / 1000;
								//可以修改和撤销
								self.showCancelBtn = true;
							} else {
								if (!self.isVendor) {
									uni.showToast({
										icon: 'none',
										title: '数据错误！',
										duration: 3000
									});
									setTimeout(() => {
										uni.navigateBack({
											delta: 1,
										})
									}, 3000);
								}
							}
						}
					}
				}).catch(err => {
					if (err.message.indexOf("信息不存在") > -1) {
						if (!self.isVendor) {
							uni.showToast({
								icon: 'none',
								title: '无延期申请！',
								duration: 3000
							});
							setTimeout(() => {
								uni.navigateBack({
									delta: 1,
								})
							}, 3000);
						} else {
							self.generateTimeDuration()
						}
					}
				});
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
			validate() {
				if (!this.compensationMoney) {
					uni.showToast({
						title: "请输入赔偿金额",
						icon: "none",
						duration: 3000
					})
					return false;
				}
				if (!new RegExp(regex.decimal_positive).test(this.compensationMoney)) {
					uni.showToast({
						title: "赔偿金额不能为负数！",
						icon: "none",
						duration: 3000
					})
					return false;
				}
				return true;
			},
			//延期申请提交
			uploadDelayApply() {
				if (!this.token) {
					this.toLogin();
					return;
				}
				if (!this.validate()) {
					return;
				}
				let paramsData = {
					contractId: this.id,
					delayTime: regexDateStringToTimestamp(this.postponeDate + "T00:00:00"),
					compensationMoney: this.compensationMoney * 1000
				}
				uni.showLoading({});
				uploadDelayApply(paramsData).then(res => {
					uni.hideLoading();
					if (res.retCode === 0) {
						uni.showToast({
							title: "延期申请提交成功！",
							icon: "none",
							duration: 2000
						})
						setTimeout(() => {
							uni.navigateBack({
								delta: 1
							})
						}, 2000)
					}
				}).catch(() => {
					uni.hideLoading()
				});
			},
			bindDateChange(e) {
				this.postponeDate = e.detail.value;
			},
			toDate(number) {
				let n = number * 1000;
				let date = new Date(n);
				let Y = date.getFullYear() + '-';
				let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
				let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
				return (Y + M + D)
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;

		::v-deep .uni-forms {
			background-color: transparent;
			margin: 20rpx;

			.uni-forms-item {
				display: flex;
				flex-direction: column;
				font-size: 28rpx;
				padding: 20rpx 0;
				background-color: transparent !important;

				.uni-forms-item__box {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;

					.uni-forms-item__inner {
						width: 100%;
						display: flex;
						flex-direction: row;
						align-items: center;
						justify-content: space-between;
						padding: 10rpx 0;

						.uni-forms-item__label {
							padding-left: 20rpx;
							font-size: 28rpx;

							.label-icon {
								margin-right: 5px;
								margin-top: -1px;
							}

							.is-required {
								padding-right: 4rpx;
							}
						}

						.uni-forms-item__content {
							display: flex;
							align-items: center;
							justify-content: flex-end;
							padding-right: 20rpx;

						}
					}
				}
			}
		}

	}

	::v-deep .uni-easyinput {

		.uni-easyinput__content {
			border-radius: 6rpx;
			display: flex;

			.uni-easyinput__content-input {
				font-size: 28rpx;

				.uni-input-wrapper {

					.uni-input-placeholder {
						font-size: 28rpx;
					}
				}
			}

			.uni-easyinput__content-textarea {
				min-width: 450rpx;
				min-height: 100rpx;
				padding: 16rpx 20rpx;

				.uni-textarea-wrapper {
					min-height: 120rpx;

					.uni-textarea-placeholder {
						font-size: 28rpx;
					}

					.uni-textarea-textarea {
						font-size: 28rpx;
					}
				}
			}
		}

		.is-disabled {
			padding-right: 0 !important;
			text-align: right;
			text-align: -webkit-right;
			background-color: transparent !important;
			color: #999999;
		}
	}
</style>