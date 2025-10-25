<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar :title="title" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			
			<uni-forms :modelValue="accountBank" labelPosition="left" border labelWidth="120">
				<view class="bg-white margin-bottom-sm radius">
					<uni-forms-item label="持卡人：" name="accountHolder" required>
						<uni-easyinput type="text" v-model="accountBank.accountHolder" :clearable="false" disabled
							placeholder="请输入姓名" :inputBorder="false" />
					</uni-forms-item>
					<uni-forms-item label="银行名称：" name="accountBankName" required>
						<uni-easyinput type="text" v-model="accountBank.accountBankName" :clearable="false"
							placeholder="请输入银行名称" :inputBorder="false" style="flex-grow: 1;"/>
					</uni-forms-item>
					<uni-forms-item label="银行卡号：" name="accountBankNo" required>
						<uni-easyinput type="number" v-model="accountBank.accountBankNo" :clearable="false"
							placeholder="请输入银行卡号" :inputBorder="false" style="flex-grow: 1;" />
					</uni-forms-item>
					<uni-forms-item label="首选卡：" name="primary">
						<switch color="#fb5318" :checked="accountBank.primary===1" @change="switchPrimary" />
					</uni-forms-item>
				</view>
			</uni-forms>
		</scroll-view>
		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<button class="bg-theme text-xl color-white radius-0" @click="submit"
				:disabled="btnDisabled">保存</button>
		</view>
	</view>
</template>

<script>
	import UniIcons from '@/components/uni-icons/uni-icons.vue'
	import {
		createAccountBank,
		getAccountBankById,
		updateAccountBank
	} from "@/api/finance";
	import UniForms from "@/components/uni-forms/uni-forms";
	import UniFormsItem from "@/components/uni-forms-item/uni-forms-item";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	

	export default {
		name: "addressDetails",
		components: {
			UniFormsItem,
			UniForms,
			UniIcons,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userData: {},
				accountBank: {
					id: null,
					accountHolder: null,
					accountBankName: null,
					accountBankNo: null,
					primary: 0,
					status: 1
				},

				btnDisabled: true,

				title: '',
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
			accountBank: {
				handler(val) {
					this.btnDisabled = !(!!val.accountHolder && !!val.accountBankName && !!val.accountBankNo);
				},
				deep: true
			},
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
		onLoad(options) {
			this.token = uni.getStorageSync("token")
			this.userData = uni.getStorageSync("user");

			this.accountBank.id = parseInt(options.id);
			if (!this.accountBank.id) {
				this.accountBank.accountHolder = this.userData.realName;
			}

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync("token")
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
				let title = '银行卡'
				if (!!this.accountBank.id) {
					this.getAccountBankById()
					title = '银行卡-修改'
				} else {
					title = '银行卡-添加'
				}
				// #ifdef H5
				uni.setNavigationBarTitle({
					title: title
				});
				// #endif
				// #ifndef H5
				this.title = title;
				// #endif
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
			//获取地址详情
			getAccountBankById() {
				let paramsData = {
					id: this.accountBank.id
				}
				let self = this;
				getAccountBankById(paramsData).then(res => {
					if (res.retCode === 0) {
						self.accountBank = res.data;
						self.accountBank.accountHolder = self.userData.realName;

					}
				});
			},
			submit() {
				if (this.accountBank.id) {
					updateAccountBank(this.accountBank).then(res => {
						if (res.retCode === 0) {
							uni.showToast({
								title: '修改成功！',
								icon: "none",
								duration: 1500
							})
							setTimeout(() => {
								uni.setStorageSync("needRefresh", 1)
								uni.navigateBack({
									delta: 1
								})
							}, 1500)
						}
					});
				} else {
					createAccountBank(this.accountBank).then(res => {
						if (res.retCode === 0) {
							uni.showToast({
								title: '添加成功！',
								icon: "none",
								duration: 1500
							})
							setTimeout(() => {
								uni.setStorageSync("needRefresh", 1)
								uni.navigateBack({
									delta: 1
								})
							}, 1500)
						}
					});
				}
			},
			switchPrimary() {
				if (this.accountBank.primary === null || this.accountBank.primary === 0) {
					this.accountBank.primary = 1;
				} else {
					this.accountBank.primary = 0;
				}
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;
		display: flex;

		::v-deep .uni-forms {
			background-color: transparent;
			margin: 20rpx;

			.uni-forms-item {
				display: flex;
				flex-direction: column;
				font-size: 28rpx;
				padding: 10rpx 0;
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