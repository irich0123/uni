<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar :title="title" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<uni-forms label-position="left" :modelValue="stickApply" border label-width="100" border>
				<view class="bg-white radius margin-bottom-sm">
					<uni-forms-item label="状态：" v-if="!!stickApply.id" style="padding:0;">
						<view>{{stickApply.status | filterStatus(that)}}</view>
					</uni-forms-item>

					<uni-forms-item label="置顶城市：" style="padding:0;">
						<view>{{stickApply.addressDetails}}</view>
					</uni-forms-item>

					<uni-forms-item label="展示位置：" style="padding:0;">
						<picker mode="selector" class="margin-left-ssm flex align-center" @change="siteChange"
							:value="siteIndex" :range="siteList" :range-key="'label'">
							<view class="flex align-center">
								<view>{{ !!siteList[siteIndex]?siteList[siteIndex].label:'' }}</view>
								<uni-icons type="forward" size="22" color="#999999"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="开始时间：" style="padding:0;">
						<picker mode="date" class="margin-left-ssm flex align-center" :value="selectedDate"
							:start="startDate" :end="endDate" @change="dateChange" :disabled="!canBeEdit">
							<view class="flex align-center">
								<view>{{ selectedDate | formatDate}}</view>
								<uni-icons type="forward" size="22" color="#999999"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="置顶天数：" style="padding:0;">
						<uni-number-box v-model="day" :disabled="!canBeEdit" :min="7" :max="1000" @change="changeDay" />
						<text>天</text>
					</uni-forms-item>

					<uni-forms-item label="总费用：" style="padding:0;">
						<view class="text-theme text-lg">{{totalPrice}}</view>
						<text class="padding-left-xs">元</text>
					</uni-forms-item>
				</view>

			</uni-forms>
			<view class="blank"></view>
		</scroll-view>

		<!--        底部按钮开始-->
		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<button class="bg-theme theme-border text-xl text-white radius-0"
				@click="submitStickApply">确认{{!stickApply.id?'提交':'修改'}}</button>
		</view>
		<!--        底部按钮结束-->
	</view>

</template>

<script>
	import UniForms from "@/components/uni-forms/uni-forms";
	import uniFormsItem from "@/components/uni-forms-item/uni-forms-item";
	import UniIcons from "@/components/uni-icons/uni-icons";
	import {
		formatTimeNoHour,
		formatTime
	} from "@/utils/myUtil";
	import {
		getReleaseWorkDetailsByIdAnon,
		getWorkOrderDetailsByIdAnon,
	} from "@/api/workinfo";
	import {
		getStickUnitPrice,
		createStickAppy,
		updateStickAppy,
		getStickApplyStatusEnum,
		getStickApplyTypeEnum,
		infoStickAppy
	} from "@/api/stick";
	import uniNumberBox from "../components/uni-number-box.vue"
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	

	export default {
		name: "stickApply",
		components: {
			UniForms,
			uniFormsItem,
			UniIcons,
			uniNumberBox,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				that: this,

				token: null,

				infoId: null,
				infoType: null, //0---承接；1---外发

				stickApply: {
					id: null,
					address: "",
					addressDetails: '',
					industry: null,
					type: null,
				},


				statusList: [],

				siteIndex: 0,
				siteList: [],

				startDate: formatTimeNoHour(new Date()),
				endDate: formatTimeNoHour(new Date(new Date().getTime() + 365 * 24 * 3600 * 1000)),
				selectedDate: formatTimeNoHour(new Date()),

				unitPrice: 0, //置顶单价
				day: 7,

				canBeEdit: true,
				title: '',

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
			filterStatus(type, that) {
				const [obj] = that.statusList.filter(v => v.value === type)
				return !!obj ? obj.label : '';
			},
		},
		computed: {
			//计算整批出售的货物总价
			totalPrice() {
				return (this.day * this.unitPrice).toFixed(2);
			},
		},
		onLoad(options) {
			this.infoId = parseInt(options.infoId);
			this.infoType = parseInt(options.infoType);
			this.stickApply.id = parseInt(options.id);

			this.initData();

		},
		onShow() {
			this.token = uni.getStorageSync('token');

			if (!this.token) {
				this.toLogin();
				return;
			}

			this.selectedDate = this.startDate;

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
				if (!!this.stickApply.id) {
					this.title = '置顶修改';
					this.getStickApply();
				} else {
					this.getStickApplyType();
					this.title = '添加置顶';
				}

				// #ifdef H5 
				uni.setNavigationBarTitle({
					title: this.title,
				})
				// #endif
			},
			getStickApply() {
				let self = this;
				infoStickAppy({
					id: this.stickApply.id
				}).then(res => {
					if (res.retCode === 0) {
						self.stickApply = res.data;
						self.infoId = self.stickApply.relationId;
						if (self.stickApply.starttime < new Date().getTime()) {
							self.stickApply.starttime = new Date().getTime();
						}
						self.selectedDate = formatTimeNoHour(new Date(self.stickApply.starttime));
						self.startDate = formatTimeNoHour(new Date(Math.min(new Date().getTime(), self.stickApply
							.starttime)));
						self.endDate = formatTimeNoHour(new Date(Math.min(new Date().getTime(), self.stickApply
							.starttime) + 365 * 24 * 3600 * 1000));
						self.day = Math.round((self.stickApply.endtime - self.stickApply.starttime) / (24 * 60 *
							60 * 1000));
						if (self.day < 0) {
							self.day = 7;
						}

						if (self.stickApply.releaseWork) {
							self.infoType = 0;
						} else if (self.stickApply.workOrder) {
							self.infoType = 1;
						}
						self.getStickApplyType();
					}
				});
			},
			getStickApplyType() {
				let self = this;
				getStickApplyTypeEnum().then(res => {
					if (res.retCode === 0) {
						self.siteList.splice(0, self.siteList.length);
						res.data.forEach(v => {
							if (self.infoType == 0) {
								if (v.label.indexOf("外发") > -1) {
									self.siteList.push(v);
								}
							} else if (self.infoType == 1) {
								if (v.label.indexOf("承接") > -1) {
									self.siteList.push(v);
								}
							}
						})

						self.getStickApplyStatusEnum();
					}
				});
			},
			getStickApplyStatusEnum() {
				let self = this;
				getStickApplyStatusEnum().then(res => {
					if (res.retCode === 0) {
						self.statusList.splice(0, self.statusList.length);
						res.data.forEach(v => {
							self.statusList.push(v);
						})

						self.getWorkInfo();
					}
				});
			},
			getWorkInfo() {
				if (this.infoType === 0) {
					this.getReleaseWorkById();
				} else if (this.infoType === 1) {
					this.getWorkOrderById();
				}
			},
			//根据id获取活信息详情
			getReleaseWorkById() {
				let paramsData = {
					id: this.infoId,
				}
				let self = this;
				getReleaseWorkDetailsByIdAnon(paramsData).then(res => {
					if (res.retCode === 0) {
						self.stickApply.address = res.data.address;
						self.stickApply.addressDetails = res.data.addressDetails;
						self.stickApply.industry = res.data.industry;

						self.getStickUnitPrice();
					}
				});
			},
			//根据承接id获取详情
			getWorkOrderById() {
				let paramsData = {
					id: this.infoId,
				}
				let self = this;
				getWorkOrderDetailsByIdAnon(paramsData).then(res => {
					if (res.retCode === 0) {
						self.stickApply.address = res.data.address;
						self.stickApply.addressDetails = res.data.addressDetails;
						self.stickApply.industry = res.data.industry;

						self.getStickUnitPrice();
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
			changeDay(value) {
				this.day = value
			},
			siteChange(e) {
				let oldSiteIndex = this.siteIndex;
				this.siteIndex = parseInt(e.detail.value);
				if (oldSiteIndex !== this.siteIndex) {
					this.getStickUnitPrice();
				}
			},
			dateChange(e) {
				this.selectedDate = e.detail.value;
			},
			//提交置顶申请
			submitStickApply() {
				let self = this;
				let paramsData = {
					id: !!this.stickApply.id ? this.stickApply.id : null,
					type: this.siteList[this.siteIndex].value,
					relationId: this.infoId,
					industry: this.stickApply.industry,
					addressDetails: this.stickApply.addressDetails,
					address: this.stickApply.address,
					starttime: new Date(this.selectedDate).getTime(),
					endtime: new Date(this.selectedDate).getTime() +
						this.day * 24 * 3600 * 1000,
				}

				if (!this.stickApply.id) {
					createStickAppy(paramsData).then(res => {
						if (res.retCode === 0) {
							self.successHandle(res);
						}
					});
				} else {
					updateStickAppy(paramsData).then(res => {
						if (res.retCode === 0) {
							self.successHandle(res);
						}
					});
				}
			},

			successHandle(res) {
				if (res.data.status === 1) { //审核通过
					uni.showModal({
						title: '小二提示',
						content: '您的置顶申请已提交成功，现在去支付置顶费吗',
						cancelText: '稍等一会',
						confirmText: '确认',
						confirmColor: '#fb5318',
						success: function(res1) {
							if (res1.confirm) {
								uni.redirectTo({
									url: '/pagesPersonal/pay/payStickApply?id=' + res.data.id,
								})
							} else if (res1.cancel) {
								uni.setStorageSync("needRefresh", 1);
								uni.navigateBack({
									delta: 1
								})
							}
						},
					})
				} else {
					uni.showToast({
						title: '提交成功',
						icon: 'none',
						duration: 1000
					})
					uni.navigateBack({
						delta: 1
					})
				}
			},
			//获取置顶单价
			getStickUnitPrice() {
				let position = null;
				if (this.siteIndex === 0) {
					position = 1;
				} else if (this.siteIndex === 1) {
					position = 2;
				}
				let paramsData = {
					addressDetail: this.stickApply.addressDetails, //注意这里参数没有带s
					address: this.stickApply.address,
					position: position,
				}
				let self = this;
				getStickUnitPrice(paramsData).then(res => {
					if (res.retCode === 0) {
						self.unitPrice = res.data / 1000;
					}
				});
			},
		},

	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;

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
						padding: 16rpx 0;

						.uni-forms-item__label {
							padding-left: 20rpx;
							font-size: 28rpx;
							color: #333333;

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
</style>