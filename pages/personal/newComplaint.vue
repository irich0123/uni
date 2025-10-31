<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar :title="title" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>

			<uni-transition class="top-notify-tips" :duration="2000" :mode-class="modeClass" :styles="transformClass"
				:show="transShow">
				<uni-notice-bar :style="'top:'+contentTop+'px;position:fixed'" :showClose="true" :show="isShowNotice"
					text="请依照事实发起投诉，恶意投诉将会受处罚或封号！" @close="closeNotice" />
			</uni-transition>

			<view class="bg-white padding margin-sm radius-s">
				<user-bar-normal v-if="!!type && !!actionList[type-1].userData" :user="actionList[type-1].userData" />
			</view>

			<view class="bg-white margin-bottom-sm margin-lr-sm radius-s" v-if="type===2 && work===0">
				<release-work-list-cell :release-work="actionList[type-1].data" :show-status-bar="false" />
			</view>

			<view class="bg-white margin-bottom-sm margin-lr-sm radius-s" v-if="type===2 && work===1">
				<work-order-list-cell :work-order="actionList[type-1].data" :show-status-bar="false" />
			</view>

			<view class="bg-white margin-bottom-sm margin-lr-sm radius-s padding" v-if="type===3">
				<commodity-list-cell :commodity="actionList[type-1].data" :show-status-bar="false" />
			</view>

			<view class="bg-white text-df margin-bottom-sm margin-lr-sm radius-s" v-if="!!type">
				<radio-group @change="radioChange" :disabled="readOnly">
					<view class="flex align-center justify-between margin-lr padding-tb gray-border-bottom"
						v-for="(item,index) in actionList[type-1].options" :key="index">
						<view>{{ item.content }}</view>
						<view>
							<radio color="#fb5318" :value="index+''" :checked="index === optionIndex" />
						</view>
					</view>
				</radio-group>
			</view>

			<view class="bg-white padding-tb-lg padding-lr margin-bottom-sm margin-lr-sm radius-s">
				<view class="text-black text-lg text-bold margin-bottom-sm">
					<text class="text-theme margin-right-xxs">*</text>详细描述
				</view>
				<uni-easyinput type="textarea" v-model="remark" :clearable="false" placeholder="请输入详细说明文字" autoHeight
					maxlength="500" :inputBorder="false" />
			</view>

			<view class="blank"></view>
		</scroll-view>

		<!--        底部按钮开始-->
		<view class="bg-white" style="width: 100%;position:fixed;left:0;bottom:0;z-index: 19;">
			<button class="bg-theme text-xl color-white radius-0" :disabled="disableSubmitBtn"
				@click="submitData">提交</button>
		</view>
	</view>
</template>

<script>
	import {
		getReleaseWorkDetailsByIdAnon,
		getWorkOrderDetailsByIdAnon
	} from "@/api/workinfo";
	import {
		getUserInfoByUserId,
	} from "@/api/user";
	import {
		getCommodityById
	} from '@/api/mall';
	import {
		getAllComplaintConfig,
		createComplaint,
		updateComplaint,
		getComplaint
	} from "@/api/common";
	import ReleaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";
	import WorkOrderListCell from "@/utils/yjg-list-cell/work-order-list-cell";
	import CommodityListCell from "@/utils/yjg-list-cell/commodity-list-cell";
	import UserBarNormal from "@/utils/yjg-user/user-bar-normal";
	import uniNoticeBar from "@/components/uni-notice-bar/uni-notice-bar";
	import uniTransition from "@/components/uni-transition/uni-transition";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	
	export default {
		name: "newComplaint",
		components: {
			ReleaseWorkListCell,
			WorkOrderListCell,
			CommodityListCell,
			UserBarNormal,
			uniNoticeBar,
			uniTransition,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				isShowNotice: false,
				transShow: false,
				modeClass: ['fade', 'slide-top'],
				maskClass: {
					'position': 'fixed',
					'bottom': 0,
					'top': 0,
					'left': 0,
					'right': 0,
					'background-color': 'rgba(0, 0, 0, 0.4)'
				},
				transformClass: {
					'position': 'fixed',
					'bottom': 0,
					'top': 0,
					'left': 0,
					'right': 0,
					/* #ifndef APP-NVUE */
					'display': 'flex',
					/* #endif */
				},

				token: null,
				userData: {},

				complaintId: null,
				id: null,

				remark: null,
				optionIndex: 0,
				content: null,
				type: null, //类型（1：个人 2：加工信息 3：商品）
				work: null, //0=外发 1=承接
				disableSubmitBtn: true,

				actionList: [{
						title: '投诉用户',
						type: 1,
						userData: {},
						data: {},
						fn: () => this.loadUserData(),
						options: [],
					},
					{
						title: ['投诉外发', '投诉承接'],
						type: 2,
						userData: {},
						data: {},
						fn: [() => this.getReleaseWorkById(), () => this.getWorkOrderById()],
						options: [],
					},
					{
						title: '投诉商品',
						type: 3,
						userData: {},
						data: {},
						fn: () => this.getCommodityDetailsById(),
						options: [],
					}
				],
				readOnly: false,

				title: '',

				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		computed: {
			submitValue: function() {
				let {
					remark,
					optionIndex
				} = this;
				return {
					remark,
					optionIndex
				};
			}
		},
		watch: {
			submitValue: function(val) {
				this.disableSubmitBtn = !(!!val.remark && val.optionIndex != null);
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
			this.userData = uni.getStorageSync("user");

			this.complaintId = parseInt(options.complaintId);
			this.id = parseInt(options.id);
			this.type = parseInt(options.type);

			if (options.work != null) {
				this.work = parseInt(options.work);
			}

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync("token");

			if (!this.token) {
				this.toLogin();
				return;
			}

			if (!!uni.getStorageSync("needRefresh")) {
				uni.removeStorageSync("needRefresh");
				this.initData();
			}

			this.initAnimation();
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

			initAnimation() {
				let tipComplaintForceCloseTime = uni.getStorageSync("tipComplaintForceCloseTime");
				//超过二十个小时或者tipShareForceCloseTime为空的时候，都需要显示分享提示
				if (!tipComplaintForceCloseTime || (new Date().getTime() - tipComplaintForceCloseTime) > 24 * 60 * 60 *
					1000) {
					this.isShowNotice = true
					this.aniHandle();
				}
			},
			aniHandle() {
				this.transShow = true;
				setTimeout(() => {
					this.transShow = false;
				}, 5000)
			},
			//关闭分享信息显示
			closeNotice() {
				this.isShowNotice = false
				uni.setStorageSync('tipComplaintForceCloseTime', new Date().getTime())
			},

			initData() {
				if (!this.complaintId) {
					this.getAllComplaintConfig();
				} else {
					this.getComplaint();
				}
			},
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1000
				});
				uni.redirectTo({
					url: '/pages/login/login'
				})
			},
			//获取投诉文字模板
			getAllComplaintConfig() {
				let self = this;
				getAllComplaintConfig().then(res => {
					if (res.retCode === 0) {
						self.actionList[self.type - 1].options.splice(0, self.actionList[self.type - 1].options
							.length);
						res.data.forEach(item => {
							if (item.type === self.type.toString()) {
								self.actionList[self.type - 1].options.push(item);
							}
						})

						if (!self.complaintId) {

							if (self.type === 1) {
								self.title = self.actionList[0].title;
								self.actionList[self.type - 1].fn();
							} else if (self.type === 2) {
								self.title = self.actionList[1].title[self.work];
								self.actionList[self.type - 1].fn[self.work]();
							} else if (self.type == 3) {
								self.title = self.actionList[2].title;
								self.actionList[self.type - 1].fn();
							}
							// #ifdef H5
							uni.setNavigationBarTitle({
								title: self.title,
							})
							// #endif
						} else {
							self.optionIndex = self.actionList[self.type - 1].options.findIndex(v => v.content ==
								self.content);

						}
					}
				});
			},
			getComplaint() {
				let self = this;
				getComplaint({
					id: this.complaintId
				}).then(res => {
					if (res.retCode === 0) {
						self.id = res.data.targetId;
						self.type = parseInt(res.data.type);
						self.remark = res.data.remark;
						self.content = res.data.content;
						if (self.type === 1) {
							self.actionList[self.type - 1].userData = res.data.userBeComplaint;
							self.title = self.actionList[self.type - 1].title;
						} else if (self.type === 2) {
							if (res.data.orderNo.indexOf("00") === 0) {
								self.work = 0;
								self.handleReleaseWorkResult(res.data.releaseWork);
							} else if (res.data.orderNo.indexOf("01") === 0) {
								self.work = 1;
								self.handleWorkOrderResult(res.data.workOrder);
							}
							self.title = self.actionList[self.type - 1].title[self.work];
						} else if (self.type == 3) {
							self.handleCommodityResult(res.data.commodity);
							self.title = self.actionList[self.type - 1].title;
						}

						// #ifdef H5
						uni.setNavigationBarTitle({
							title: self.title,
						})
						// #endif

						self.getAllComplaintConfig();
					}
				});
			},
			loadUserData() {
				let self = this;
				let param = {
					userId: this.id,
				}
				getUserInfoByUserId(param).then(res => {
					if (res.retCode === 0) {
						if (res.data) {
							self.actionList[self.type - 1].userData = res.data;
						}
					}
				});
			},
			//确认投诉
			submitData() {
				if (null == this.optionIndex) {
					uni.showToast({
						title: '请选择投诉原因',
						icon: "none",
						duration: 1500
					})
					return
				}
				let paramsData = {
					id: !!this.complaintId ? this.complaintId : null,
					type: this.type.toString(),
					targetId: (this.type !== 3 ? this.actionList[this.type - 1].userData.id : this.actionList[this
						.type - 1].data.id), //用户编号
					orderNo: (this.type === 2 ? this.actionList[this.type - 1].data.no : (this.type === 3 ? this
						.actionList[this.type - 1].data : null)),
					content: this.actionList[this.type - 1].options[this.optionIndex].content,
					remark: this.remark,
				}
				if (!this.complaintId) {
					createComplaint(paramsData).then(res => {
						if (res.retCode === 0) {
							uni.showToast({
								title: '投诉提交成功！请等待平台处理',
								icon: "none",
								duration: 2000
							})
							uni.setStorageSync("needRefresh", 1);
							setTimeout(() => {
								uni.navigateBack({
									delta: 1
								})
							}, 2000)
						}
					});
				} else {
					updateComplaint(paramsData).then(res => {
						if (res.retCode === 0) {
							uni.showToast({
								title: '投诉提交成功！请等待平台处理',
								icon: "none",
								duration: 2000
							})
							uni.setStorageSync("needRefresh", 1);
							setTimeout(() => {
								uni.navigateBack({
									delta: 1
								})
							}, 2000)
						}
					});
				}
			},

			radioChange: function(evt) {
				this.optionIndex = parseInt(evt.target.value);
			},
			//根据id获取活信息详情
			getReleaseWorkById() {
				let paramsData = {
					id: this.id,
				}
				let self = this;
				getReleaseWorkDetailsByIdAnon(paramsData).then(res => {
					if (res.retCode === 0) {
						this.handleReleaseWorkResult(res.data);
					}
				});
			},
			handleReleaseWorkResult(releaseWork) {
				if (!!releaseWork.img) {
					releaseWork.img = JSON.parse(releaseWork.img);
				} else {
					releaseWork.img = [];
				}

				if (!!releaseWork.count) {
					releaseWork.count = parseInt(releaseWork.count);
				} else {
					releaseWork.count = 0;
				}

				this.actionList[this.type - 1].data = releaseWork;
				this.actionList[this.type - 1].userData = releaseWork.userDetailsInfo;
			},
			//根据承接id获取详情
			getWorkOrderById() {
				let paramsData = {
					id: this.id,
				}
				let self = this;
				getWorkOrderDetailsByIdAnon(paramsData).then(res => {
					if (res.retCode === 0) {
						this.handleWorkOrderResult(res.data);
					}
				});
			},
			handleWorkOrderResult(workOrder) {
				if (!!workOrder.img) {
					workOrder.img = JSON.parse(workOrder.img);
				} else {
					workOrder.img = [];
				}

				this.actionList[this.type - 1].data = workOrder;
				this.actionList[this.type - 1].userData = workOrder.userDetailsInfo;
			},
			getCommodityDetailsById() {
				let paramsData = {
					id: this.id
				}
				let self = this;
				getCommodityById(paramsData).then(res => {
					if (res.retCode === 0) {
						self.handleCommodityResult(res.data);
					}
				});
			},
			handleCommodityResult(commodity) {
				commodity.totalPrice = parseFloat(commodity.unitPriceMin) * parseFloat(commodity
					.qtyInStock);

				if (!!commodity.photos) {
					commodity.photos = JSON.parse(commodity.photos);
				} else {
					commodity.photos = [];
				}

				if (commodity.unitPriceBreakdown) {
					commodity.unitPriceBreakdown = JSON.parse(commodity.unitPriceBreakdown)
				}
				this.actionList[this.type - 1].data = commodity;
				this.actionList[this.type - 1].userData = commodity.userDetailsInfo;
			},
		}
	}
</script>

<style scoped lang="scss">
	@import "@/static/css/noticeBar.css";

	.container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	::v-deep .uni-easyinput {
		border-radius: 10rpx;
		padding: 0 10rpx;
	}

	.blank {
		min-height: 120rpx;
	}

	::v-deep .uni-textarea-wrapper {
		margin: 20rpx;
		padding: 10rpx;
	}

	::v-deep .uni-textarea-textarea {
		font-size: 28rpx;
	}
	
	::v-deep .uni-easyinput__content-textarea {
		padding: 16rpx;
	}
</style>