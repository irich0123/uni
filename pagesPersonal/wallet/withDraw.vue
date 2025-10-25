<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="提现" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<uni-list>
				<uni-list-item :title="accountBank.accountBankName" :note="accountBank.accountBankNo | formatBankNo"
					:thumb="imgUrl+'/wallet/yinhangka.png'" thumb-size="sm" :show-arrow="false">
					<template v-slot:right>
						<picker mode="selector" v-if="bankList.length>1" @change="bankChange" :value="id"
							:range-key="'name'" :range="bankList">
							<uni-icons size="26" color="#777777" type="forward"></uni-icons>
						</picker>
					</template>
				</uni-list-item>
			</uni-list>

			<!--        输入金额开始-->
			<view class="bg-white padding-lg margin-top">
				<view class="text-lg text-gray-4">
					提现金额
				</view>

				<view class="flex align-center padding-tb-xl color-black gray-border-bottom" style="font-size: 72rpx;">
					<view class="text-black">
						￥
					</view>
					<view>
						<input class="text-black" type="digit" placeholder="0.00" v-model="money" step="0.01"
							style="font-size:72rpx;height:100rpx;line-height:100rpx;" />
					</view>
				</view>

				<!--        总金额-->
				<view class="padding-top flex align-center justify-between text-lg">
					<view class="text-theme">
						<text class="text-df text-gray-4">可用余额：</text>{{ balanceMoney | formatPrice }}元
					</view>
					<view class="text-df color-blue" @click.stop="totalWithdraw">
						全部提现
					</view>
				</view>
			</view>
		</scroll-view>

		<!--        按钮开始-->
		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<button class="bg-theme text-xl color-white radius-0" @click="withDrawSubmit" :disabled="disableSubmitBtn">
				确认提现
			</button>
		</view>

	</view>
</template>

<script>
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import UniIcons from "@/components/uni-icons/uni-icons";
	import {
		regex,
		imgUrl,active
	} from "@/utils/config";
	import {
		getUserAccountInfoByUserId
	} from "@/api/user";
	import {
		getAccountBankList,
		getUserBankInfo,
		withDrawCash
	} from "@/api/finance";
	import {
		priceTranslate
	} from "@/utils/myUtil";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "withDraw",
		components: {
			UniIcons,
			UniList,
			UniListItem,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				accountBank: {
					id: null,
					accountBankNo: null,
					accountHolder: null,
					accountBankName: null,
					status: null,
					primary: null,
				},

				token: null,
				balanceMoney: null,

				money: null,

				bankList: [],
				disableSubmitBtn: true,

				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		filters: {
			formatPrice(number) {
				return priceTranslate(number);
			},
			formatBankNo(bankNo) {
				if (!bankNo) {
					return "";
				}
				return bankNo;
			}
		},
		watch: {
			submitData: {
				handler(val) {
					if (parseFloat(val.money) < 0) {
						uni.showToast({
							title: '提现金额必须大于0',
							icon: "none",
							duration: 1500
						});
						this.disableSubmitBtn = true;
						return
					}
					if (val.money && !new RegExp(regex.decimal_two_digit).test(val.money)) {
						uni.showToast({
							icon: 'none',
							title: '最多2位小数',
							duration: 1500
						});
						this.disableSubmitBtn = true;
						return;
					}

					this.disableSubmitBtn = !(val.accountId && val.money && (parseFloat(val.money) * 1000) <= this
						.balanceMoney);
				},
				deep: true,
				immediate: true,
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
		computed: {
			submitData: function() {
				let result = {};
				result.accountId = this.accountBank.id;
				result.money = this.money;
				return result;
			}
		},
		onLoad() {
			this.token = uni.getStorageSync("token")
			this.userData = uni.getStorageSync("user");
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
				this.id = this.userData.id;

				this.loadUserData();
				this.getPrimaryBank();

				this.getBankList();
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
						if (res.data) {
							self.balanceMoney = res.data.balanceMoney;
						}
					}
				});
			},

			getBankList() {
				let self = this;
				getAccountBankList().then(res => {
					if (res.retCode === 0) {
						self.bankList.splice(0, self.bankList.length);
						res.data.forEach(item => {
							item["name"] = item.accountBankName + ' 尾号' + item.accountBankNo.substring(item
								.accountBankNo.length - 4)
							self.bankList.push(item);
						})
					}
				});
			},
			bankChange(e) {
				this.accountBank = this.bankList[e.detail.value];
			},
			//提现
			withDrawSubmit() {
				if (!(new RegExp(regex.decimal_two_digit)).test(this.money)) {
					uni.showToast({
						title: '提现金额最多两位小数',
						icon: "none",
						duration: 2000
					})
					return
				}

				if (Number(this.money) < 0) {
					uni.showToast({
						title: '提现金额必须大于0',
						icon: "none",
						duration: 2000
					})
					return
				}

				let self = this;

				uni.showModal({
					title: '小二提示',
					confirmText: '确认',
					showCancel: true,
					cancelText: "取消",
					confirmColor: '#fb5318',
					content: '预计48小时内到账，确认要提现吗？',
					success: function(res1) {
						if (res1.confirm) {
							let paramsData = {
								accountBankId: self.accountBank.id,
								money: Number(self.money) * 1000,
							}
							withDrawCash(paramsData).then(res => {
								if (res.retCode === 0) {
									uni.showToast({
										title: '提交成功！',
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
				});
			},
			//全部提现按钮
			totalWithdraw() {
				this.money = Number(this.balanceMoney / 1000).toFixed(2);
			},
			//获取用户银行卡信息
			getPrimaryBank() {
				let self = this;
				getUserBankInfo().then(res => {
					if (res.retCode === 0) {
						if (res.data == null) {
							uni.showModal({
								title: '小二提示',
								confirmText: '立即添加',
								showCancel: true,
								cancelText: "取消",
								confirmColor: '#fb5318',
								content: '您还没有可用于提现的银行卡，请先添加一张储蓄卡',
								success: function(res1) {
									if (res1.confirm) {
										uni.navigateTo({
											url: '/pagesPersonal/bankCard/bankCardList'
										})
									}
								},
							});
						} else {
							self.accountBank = res.data;

						}
					}
				});
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;
		display: flex;

		.uni-list {
			background-color: transparent !important;

			.uni-list-item {
				padding: 30rpx 20rpx;
				background-color: #fff;

				.uni-list-item__container {
					padding-rgiht: 0;
				}
			}

			@media (prefers-color-scheme: dark) {
				.uni-list-item {
					background-color: #1e1e1e;
				}
			}
		}
	}

	::v-deep .uni-list-item__content-title {
		color: #ccc;
	}

	::v-deep .uni-list-item__icon {
		padding: 0 30rpx 0 20rpx !important;
		margin-right: 0;
	}

	::v-deep .uni-list-item__icon-img {
		height: 34rpx !important;
		width: 48rpx !important;
	}
</style>