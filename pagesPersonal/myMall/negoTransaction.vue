<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="取消订单" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<!--        是否收到货样式开始-->
			<view class="bg-white text-df margin-top-sm margin-lr-sm radius-s">
				<radio-group @change="radioChange">
					<view class="flex align-center justify-between margin-lr padding-tb gray-border-bottom"
						v-for="(item,index) in items" :key="item.value">
						<view>{{ item.name }}</view>
						<view>
							<radio color="#fb5318" :value="index+''" :checked="index === isGoodsReceived" />
						</view>
					</view>
				</radio-group>
			</view>
			<!--        是否收到货样式结束-->

			<!--        取消订单的原因开始-->
			<view class="bg-white margin-top-sm margin-lr-sm padding radius-s">
				<textarea maxlength="-1" placeholder="请输入取消订单的原因" v-model="reason" />
			</view>
			<!--        取消订单的原因结束-->

			<!--        输入赔偿金额开始-->
			<view
				class="bg-white flex align-center justify-between text-df padding margin-top-sm margin-lr-sm radius-s">
				<view>承诺赔偿对方：</view>
				<view class="flex align-center justify-start">
					<view class="input_box">
						<input type="number" placeholder="请输入赔偿金额" v-model="money" />
					</view>
					<text class="margin-left-ssm">元</text>
				</view>
			</view>
			<view class="flex align-center justify-start text-xs padding-tb-ssm padding-lr margin-lr-sm">
				<view>因本方主动取消订单，请酌情赔偿对方损失。</view>
			</view>

			<view class="blank"></view>
		</scroll-view>

		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<button class="bg-theme text-xl color-white radius-0" @click="confirmReparationClaimTransaction">确定</button>
		</view>
	</view>
</template>

<script>
	import {
		regex,active
	} from "@/utils/config";
	import {
		getReparationByTransactionId,
		reparationClaimTransaction
	} from "@/api/mall";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	let firstReg = (new RegExp(regex.decimal_begin_with_dot)); //不能以小数点开头
	let reg1 = (new RegExp(regex.decimal_two_digit)); //小数点后只能有两位只能输入数字

	export default {
		name: "negoTransaction",
		components: {
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				items: [{
						value: '0',
						name: '未收到货物',
						checked: 'true'
					},
					{
						value: '1',
						name: '已收到货物',

					},
				],
				isGoodsReceived: 0, //是否收到货
				money: '',
				id: null,
				payBy: null,
				payTo: null,
				isAcceptedByOpposite: false,
				reason: '',
				reparationId: null,
				isSubmit: true,

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
		onLoad(options) {
			this.id = parseInt(options.id);
			this.payBy = parseInt(options.payBy);
			this.payTo = parseInt(options.payTo);

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync("token")

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
				this.getReparationByTransactionId();
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
			//根据交易id获取赔偿协议
			getReparationByTransactionId() {
				let paramsData = {
					id: this.id,
					operatorType: 0,
					buyerId: this.payBy,
					sellerId: this.payTo,
				}
				let self = this;
				getReparationByTransactionId(paramsData).then(res => {
					if (res.retCode === 0) {
						self.money = res.data.money / 1000
						self.isGoodsReceived = res.data.isGoodsReceived
						self.isAcceptedByOpposite = res.data.isAcceptedByOpposite
						self.reason = res.data.reason
						self.reparationId = res.data.id
					}
				});
			},

			validate() {
				if (firstReg.test(this.money)) {
					uni.showToast({
						icon: 'none',
						title: '输入的赔偿金额第一位不能为小数点',
						duration: 3000
					})
					return false;
				}
				if (!reg1.test(this.money)) {
					uni.showToast({
						icon: 'none',
						title: '赔偿金额只能输入数字和一位小数点且小数点只保留两位',
						duration: 3000
					})
					return false;
				}
				if (!((new RegExp(regex.decimal_positive)).test(this.money))) {
					uni.showToast({
						icon: 'none',
						title: '请输入正数',
						duration: 3000
					})
					return false;
				}
				return true;
			},
			//确认提交取消订单赔偿
			confirmReparationClaimTransaction() {
				if (!this.isSubmit) {
					return
				}
				this.isSubmit = true;

				if (!this.validate()) {
					return;
				}

				let self = this;

				let paramsData = {
					transactionId: this.id,
					initiatorId: this.payBy,
					reason: this.reason,
					isGoodsReceived: this.isGoodsReceived,
					money: this.money * 1000,
					payBy: this.payBy,
					payTo: this.payTo,
					isAcceptedByOpposite: this.isAcceptedByOpposite,
					id: this.reparationId,
				}
				reparationClaimTransaction(paramsData).then(res => {
					self.isSubmit = false
					if (res.retCode === 0) {
						uni.showToast({
							title: res.data,
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
					self.isSubmit = false;
				});
			},
			radioChange: function(evt) {
				this.isGoodsReceived = parseInt(evt.target.value);
			},
		}
	}
</script>

<style scoped lang="scss">
	.input_box {
		border-radius: 10rpx;
		background: #EEEEEE;
		height: 70rpx;
		line-height: 70rpx;

		input {
			line-height: 70rpx;
			height: 70rpx;
			border-radius: 10rpx;
			padding-right: 20rpx;
			padding-left: 10rpx;
		}
	}

	.container {
		width: 100%;
		height: 100%;
	}



	::v-deep uni-textarea,
	textarea {
		background-color: #f2f2f2 !important;
		border-radius: 10rpx;
		padding: 10rpx;
		font-size: 28rpx;
		width: 630rpx;
	}

	@media (prefers-color-scheme: dark) {

		::v-deep uni-textarea,
		textarea {
			background-color: #000 !important;
		}

		::v-deep .uni-input-wrapper,
		input {
			background-color: #000 !important;
		}
	}


	::v-deep .uni-input-wrapper,
	input {
		background-color: #f2f2f2;
		text-align: right;
		font-size: 28rpx;
	}
</style>