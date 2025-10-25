<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="投诉详情" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="text-ssm text-gray-5 margin-sm">
				投诉发起
			</view>
			<view>
				<view class="bg-white padding" v-if="complaint.type===1">
					<user-bar-normal :user="complaint.userBeComplaint" detailColor="gray" />
				</view>
				<release-work-list-cell v-if="!!complaint.type && complaint.type===2 && !!complaint.releaseWork"
					:show-status-bar="false" :show-footer="false" :release-work="complaint.releaseWork" />
				<work-order-list-cell v-if="!!complaint.type && complaint.type===2 && !!complaint.workOrder"
					:show-status-bar="false" :show-footer="false" :work-order="complaint.workOrder" />
				<view v-if="!!complaint.type && complaint.type===3" class="padding bg-white">
					<commodity-list-cell :show-status-bar="false" :commodity="complaint.commodity" />
				</view>
			</view>
			<view class="bg-white padding-tb-sm margin-tb-sm text-normal radius">
				<view class="padding-tb margin-lr flex align-center justify-between">
					<view>
						发起时间：
					</view>
					<view>{{ complaint.createTime | formatDate }}</view>
				</view>
				<view class="padding-tb margin-lr flex align-center justify-between gray-border-top">
					<view>
						投诉编号：
					</view>
					<view>{{ complaint.id }}</view>
				</view>
				<view class="padding-tb margin-lr flex align-center justify-between gray-border-top">
					<view>
						状态：
					</view>
					<view>{{complaint.status | filterStatus(that)}}
					</view>
				</view>
				<view class="padding-tb margin-lr flex align-center justify-between gray-border-top">
					<view>
						投诉对象：
					</view>
					<view v-if="complaint.type===1">投诉用户</view>
					<view v-if="complaint.type===2 && !!complaint.releaseWork">外发信息</view>
					<view v-if="complaint.type===2 && !!complaint.workOrder">承接信息</view>
					<view v-if="complaint.type===3">尾货商品</view>
				</view>
				<view class="padding-tb margin-lr flex align-center justify-between gray-border-top">
					<view>
						投诉原因：
					</view>
					<view>{{ complaint.content }}</view>
				</view>
				<view class="padding-tb margin-lr flex align-center justify-between gray-border-top">
					<view>
						理由：
					</view>
					<view>{{ complaint.remark || '未填写' }}</view>
				</view>
			</view>
			<view class="text-ssm text-gray-5 margin-sm">
				平台处理结果
			</view>
			<view class="text-normal radius bg-white" v-if="logList.length===0">
				<view class="padding margin-tb-sm flex align-center justify-between gray-border-top">
					<view>当前状态：</view>
					<view>处理中</view>
				</view>
			</view>
			<view v-else v-for="(item,index) in logList" :key="index" class="bg-white padding-tb-sm margin-tb-sm text-normal radius">
				<view class="padding-tb margin-lr flex align-center justify-between">
					<view>处理时间：</view>
					<view>{{ item.updateTime | formatDate }}</view>
				</view>
				<view class="padding-tb margin-lr flex align-center justify-between gray-border-top">
					<view>处理结果：</view>
					<view v-if="item.result===1">有效投诉</view>
					<view v-if="item.result===2">恶意投诉</view>
					<view v-if="item.result===3">无效投诉</view>
				</view>
				<view class="padding-tb margin-lr flex align-center justify-between gray-border-top">
					<view>处理说明：</view>
					<view>{{ item.remark }}</view>
				</view>
				<view class="padding-tb margin-lr flex align-center justify-between gray-border-top" v-if="item.result!==3">
					<view>投诉方奖惩：</view>
					<view v-if="item.result===1">已发奖励</view>
					<view v-if="item.result===2">已被处罚</view>
					<view v-if="item.result===3">无</view>
				</view>
				<view class="padding-tb margin-lr flex align-center justify-between gray-border-top" v-if="item.result===1">
					<view>被投诉方奖惩：</view>
					<view>已作相应处罚</view>
				</view>
			</view>
		</scroll-view>

		<view class="bg-white" style="width: 100%;position:fixed;left:0;bottom:0;z-index: 19;" v-if="complaint.status===1">
			<button class="bg-theme theme-border text-xl color-white radius-0" @click.stop="toEdit">编辑</button>
		</view>
	</view>
</template>

<script>
	import {
		calculateMath,
		formatTime6,
		priceTranslate
	} from "@/utils/myUtil";
	import CommodityListCell from "@/utils/yjg-list-cell/commodity-list-cell";
	import WorkOrderListCell from "@/utils/yjg-list-cell/work-order-list-cell";
	import ReleaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";
	import UserBarNormal from "@/utils/yjg-user/user-bar-normal";
	import {
		getComplaint,
		listComplaintLog
	} from "@/api/common";
	import {
		getComplaintStatus
	} from "@/api/basic";
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	import {
		active
	} from '@/utils/config';
	
	export default {
		name: "complaintDetails",
		components: {
			CommodityListCell,
			WorkOrderListCell,
			ReleaseWorkListCell,
			UserBarNormal,myNavBar
		},
		data() {
			return {
				that: this,

				token: null,

				complaint: {
					id: null,
					type: null,
				},
				statusList: [],
				logList: [],

				commodityComplaintData: null,
				
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
			filterStatus(type, that) {
				const [obj] = that.statusList.filter(v => v.value === type)
				return !!obj ? obj.label : '';
			},
		},
		onLoad(options) {
			this.complaint.id = parseInt(options.id);
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
				this.getComplaintStatusEnum()
			},
			getComplaintStatusEnum() {
				let self = this;
				getComplaintStatus().then(res => {
					if (res.retCode === 0) {
						self.statusList.splice(0, self.statusList.length);
						res.data.forEach(v => {
							self.statusList.push(v);
						})

						self.getComplaint();
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
			//根据投诉信息id获取投诉信息详情
			getComplaint() {
				let self = this;
				getComplaint({
					id: this.complaint.id
				}).then(res => {
					if (res.retCode === 0) {
						res.data.type = parseInt(res.data.type);
						if (res.data.type === 1) {
							self.complaint = res.data;
						} else if (res.data.type === 2) {
							if (res.data.orderNo.indexOf("00") === 0) {
								self.handleReleaseWorkResult(res.data);
							} else if (res.data.orderNo.indexOf("01") === 0) {
								self.handleWorkOrderResult(res.data);
							}
						} else if (res.data.type == 3) {
							self.handleCommodityResult(res.data);
						}

						self.listComplaintLog();
					}
				});
			},
			listComplaintLog() {
				let self = this;
				let param = {
					complaintId: this.complaint.id,
					createId: 0, //表示管理信息
				}
				listComplaintLog(param).then(res => {
					if (res.retCode === 0) {
						self.logList = res.data;
					}
				});
			},
			handleReleaseWorkResult(complaint) {
				let releaseWork = complaint.releaseWork;

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

				this.complaint = complaint;
			},
			handleWorkOrderResult(complaint) {
				let workOrder = complaint.workOrder;

				if (!!workOrder.img) {
					workOrder.img = JSON.parse(workOrder.img);
				} else {
					workOrder.img = [];
				}

				this.complaint = complaint;
			},
			handleCommodityResult(complaint) {
				let commodity = complaint.commodity;

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

				this.complaint = complaint;
			},
			toEdit() {
				uni.navigateTo({
					url: '../../pages/personal/newComplaint?complaintId=' + this.complaint.id,
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
</style>