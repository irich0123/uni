<template>
	<view class="container">
		<!-- #ifndef  H5-->
		<my-nav-bar title="取消原因" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="bg-white padding-top padding-lr margin-top-ssm margin-bottom-sm" v-if="!!isShowMoney">
				<view class="text-normal text-bold text-black">
					赔付金额：
				</view>
				<view class="gray-border-top flex align-center justify-between text-normal padding-tb-sm margin-top">
					我愿意赔付对方：
					<uni-easyinput type="number" v-model="compensatorMoney" :clearable="false" :inputBorder="false" />
					<view class="margin-left-ssm">元</view>
				</view>
			</view>
			<view class="bg-white padding-tb padding-lr">
				<view class="text-normal text-bold text-black">
					取消原因：
				</view>
			</view>
			<view class="bg-white text-df padding-lr">
				<radio-group @change="radioChange">
					<view class="flex justify-between align-center margin-lr padding-tb gray-border-top text-normal"
						v-for="(item,index) in items" :key="index">
						<view>{{ item.reason }}</view>
						<radio color="#fb5318" :value="item.reason" :checked="item.reason === reason" />
					</view>
				</radio-group>
			</view>
			<view class="bg-white padding margin-top-sm">
				<view class="text-normal text-bold text-black">
					补充说明：
				</view>
				<view class="margin-tb radius">
					<uni-easyinput type="textarea" v-model="reasonOther" :clearable="false" placeholder="请输入想要补充的内容"
						autoHeight maxlength="980" :inputBorder="false" />
				</view>
			</view>
			<view style="min-height: 160rpx;margin-top: 100rpx;"></view>
		</scroll-view>

		<!--        底部按钮开始-->
		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<view class="bg-light-yellow text-sm flex align-center justify-start padding-tb-ssm padding-lr">
				<text class="text-theme margin-top-xss padding-left-xs">注：非对方原因取消订单，将扣除您一定的信誉度</text>
			</view>
			<button class="bg-theme text-xl color-white radius-0" @click="cancelContractApply">确认取消交易</button>
		</view>
		<!--        底部按钮结束-->
	</view>
</template>

<script>
	import {
		cancelContractApply
	} from "@/api/workinfo";
	import {
		getCancelContractReasonList
	} from "@/api/common";
	import UniEasyInput from "@/components/uni-easyinput/uni-easyinput";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "cancelReason",
		components: {
			UniEasyInput,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				id: null,

				items: [],
				reason: '',
				reasonOther: '',
				processType: null, //processType : deposit :保证金  ,metal:材料,sample:打样,product:产品,compact: 签约
				reasonType: null, //reasonType : 1 甲方    2 乙方
				responsibleUserUserType: null, //责任人 1甲方  2 乙方
				isShowMoney: null, //是否显示输入赔偿金，1---显示
				compensatorMoney: null, //输入的赔偿金

				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
			statusbarHeight: {
				handler(newVal, oldVal) {
					this.contentTop = newVal + 40;
					this.listHeight = uni.getWindowInfo().safeArea.height - newVal;
				}
			}
		},
		onLoad(options) {
			// #ifdef H5
			this.listHeight = uni.getWindowInfo().safeArea.height;
			// #endif

			this.id = parseInt(options.contractId);
			this.processType = options.processType;
			this.reasonType = parseInt(options.reasonType);
			this.isShowMoney = parseInt(options.isShowMoney);

			//获取取消原因
			this.getReasonList();
		},
		onShow() {
			this.token = uni.getStorageSync('token');

			if (!this.token) {
				this.toLogin();
				return;
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
			//提交取消
			cancelContractApply() {
				if (!this.reason) {
					uni.showToast({
						title: "请选择取消原因！",
						icon: "none",
						duration: 3000
					})
					return
				}
				if (this.reason === '其他(对方)' || this.reason === '其他(我方)') {
					if (!this.reasonOther) {
						uni.showToast({
							title: "请输入补充说明！",
							icon: "none",
							duration: 3000
						})
						return
					}
				}
				let params = {
					contractId: this.id,
					reason: this.reason + ',' + this.reasonOther,
					responsibleUserUserType: this.responsibleUserUserType,
				}
				if (!!this.isShowMoney) {
					params['compensationMoney'] = this.compensatorMoney * 1000
				}
				cancelContractApply(params).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: '取消成功！',
							icon: "none",
							duration: 2000
						})
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
				});
			},
			//获取取消原因
			getReasonList() {
				let paramsData = {
					processType: this.processType,
					reasonType: this.reasonType
				}
				let self = this;
				getCancelContractReasonList(paramsData).then(res => {
					if (res.retCode === 0) {
						if (res.data) {
							if (self.reasonType === 'deposit') {
								self.items = res.data.breakReason
							} else {
								self.items = res.data
							}
						}
					}
				});
			},
			radioChange: function(evt) {
				console.log(evt)
				for (let i = 0; i < this.items.length; i++) {
					if (this.items[i].reason === evt.target.value) {
						this.reason = this.items[i].reason;
						this.responsibleUserUserType = this.items[i].type
						break;
					}
				}
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;
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