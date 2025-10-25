<template>
	<view class="main no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="商品审核" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<wuc-tab :tab-list="tabBars" @change="onTabItemClick" textFlex :tabCur.sync="tabIndex"
			:style="'padding-top:'+contentTop+'px;'" select-class="text-theme" />

		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'" @scrolltolower="loadMoreData"
			refresher-enabled="true" :refresher-triggered="triggered" @refresherrefresh="onRefresh"
			@refresherrestore="onRestore" refresher-background="transparent">
			<!-- 列表 -->
			<view v-for="(item,idx) in tabBars[tabIndex].list" :key="idx" class="margin-lr-sm">
				<view class="bg-white margin-top radius-x padding" @click="toDetail(item)">
					<commodity-list-cell :commodity="item" :show-admin-bar="true" :show-footer="false">
						<view class="btn-line flex align-center justify-end">
							<view class="btn flex align-center" @click.stop="handleOk(item)"
								v-if="item.status===0 || item.status===3">
								<uni-icons type="checkmarkempty" size="14" color="#555"
									style="height: 1;margin-right: 10rpx" />
								通过
							</view>
							<view class="btn flex align-center" @click.stop="handleFail(item)"
								v-if="item.status===0 || item.status===2">
								<uni-icons type="closeempty" size="14" color="#555"
									style="height: 1;margin-right: 10rpx" />
								不通过
							</view>
						</view>
					</commodity-list-cell>
				</view>
			</view>
			<text class="loading-text margin-top-sm">{{
                    tabBars[tabIndex].loadingType === 0 ? contentText.contentdown : (tabBars[tabIndex].loadingType === 1 ? contentText.contentrefresh : contentText.contentnomore)
                }}
			</text>
		</scroll-view>

		<uni-popup ref="dialogOk">
			<view class="cu-dialog bg-white">
				<view class="flex justify-center padding-tb-df gray-border-bottom">
					<view class="text-theme text-df">{{messageTitle}}</view>
				</view>
				<view class="padding-xl text-sm text-black-4 gray-border-bottom">
					{{messageContent}}
				</view>
				<view class="flex text-df gray-border-top">
					<view class="flex-sub text-gray-2 padding-tb-df text-center" @tap="hideOkModal">取消</view>
					<view class="flex-sub text-theme padding-tb-df gray-border-left text-medium text-center"
						@tap="confirmOkModal">{{messageBtn}}</view>
				</view>
			</view>
		</uni-popup>

		<uni-popup ref="dialogFail">
			<view class="cu-dialog bg-white">
				<view class="flex justify-center padding-tb-df gray-border-bottom">
					<view class="text-theme text-df">{{messageTitle}}</view>
				</view>
				<uni-forms labelPosition="left" border :modelValue="remark" style="padding:0 30rpx">
					<uni-forms-item label="具体原因">
						<uni-easyinput type="textarea" v-model="remark.description" style="width: 100%;" />
					</uni-forms-item>
				</uni-forms>
				<view class="flex text-df gray-border-top">
					<view class="flex-sub text-gray-2 padding-tb-df text-center" @tap="hideFailModal">取消</view>
					<view class="flex-sub text-theme padding-tb-df gray-border-left text-center"
						@tap="confirmFailModal">{{messageBtn}}</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import wucTab from '@/components/wuc-tab/wuc-tab'
	import CommodityListCell from "@/utils/yjg-list-cell/commodity-list-cell";
	import uniForms from '@/components/uni-forms/uni-forms'
	import uniFormsItem from '@/components/uni-forms-item/uni-forms-item'
	import uniEasyInput from '@/components/uni-easyinput/uni-easyinput'
	import UniIcons from "@/components/uni-icons/uni-icons";

	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		filterCommodity,
		auditCommodity,
	} from '@/api/admin'
	import {
		active
	} from '@/utils/config';

	export default {
		components: {
			CommodityListCell,
			wucTab,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,

				//    待审核(0), 待付款(1), 展示中(2),
				// 审核失败(3), 手动下架(4), 已过期(5),
				// 已删除(6), 已失效(7), 待退款(8),
				// 前端进行中(9),前端待付款(10),前端审核中(11),前端已完成(12),自动下架(13);
				tabBars: [{
						name: '待审核',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [0, 3],
						list: [],
					},
					{
						name: '已完成',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [2],
						list: [],
					}
				],
				tabIndex: 0,
				triggered: false,

				contentText: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "这是底线..."
				},

				messageTitle: '系统提示',
				messageContent: '',
				messageBtn: '确定',

				remark: {},

				curCommodity: null,
			}
		},
		watch: {
			statusbarHeight: {
				handler(newVal, oldVal) {
					//#ifndef H5
					this.contentTop = newVal + 40;
					this.listHeight = uni.getWindowInfo().safeArea.height - this.contentTop;
					//#endif
					// #ifdef H5
					this.contentTop = 0;
					this.listHeight = uni.getWindowInfo().safeArea.height - this.contentTop - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		onLoad() {
			this.init();
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
			init() {
				this.loadData(this.tabIndex);
			},
			onTabItemClick(index) {
				this.tabIndex = index;
				if (this.tabBars[this.tabIndex].list.length === 0) {
					this.tabBars[this.tabIndex].page = 1;
					this.loadData()
				}
			},
			hideOkModal() {
				this.$refs.dialogOk.close();
			},
			hideFailModal() {
				this.$refs.dialogFail.close();
			},
			confirmOkModal() {
				this.auditOk(this.curCommodity);
			},
			confirmFailModal() {
				this.auditFail(this.curCommodity);
			},
			loadMoreData() {
				if (this.tabBars[this.tabIndex].loadingType === 0) {
					this.tabBars[this.tabIndex].loadingType = 1;
					setTimeout(() => {
						this.tabBars[this.tabIndex].page++;
						this.loadData();
					}, 300);
				}
			},
			loadData() {
				if (this.tabBars[this.tabIndex].isLoading) {
					return;
				}
				this.tabBars[this.tabIndex].isLoading = true;

				let self = this;
				let param = {
					page: this.tabBars[this.tabIndex].page,
					size: this.tabBars[this.tabIndex].size,
					statusList: this.tabBars[this.tabIndex].statusList,
				}
				filterCommodity(param).then(res => {
					if (res.retCode === 0) {
						if (self.tabBars[self.tabIndex].page === 1) {
							self.tabBars[self.tabIndex].list.splice(0, self.tabBars[self.tabIndex]
								.list.length);
						}

						res.data.list.forEach(v => {
							self.handleMedia(v);
							self.tabBars[self.tabIndex].list.push(v);
						})

						if (res.data.isLastPage) {
							self.tabBars[self.tabIndex].loadingType = 2;
						} else {
							self.tabBars[self.tabIndex].loadingType = 0;
						}
					}
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				}).catch(() => {
					self.tabBars[self.tabIndex].isLoading = false;
					setTimeout(() => {
						self.onRestore()
					}, 300)
				});
			},
			onRefresh() {
				if (this.triggered) return;
				this.triggered = true;

				this.tabBars[this.tabIndex].page = 1;
				this.tabBars[this.tabIndex].list = [];
				this.loadData();
			},
			onRestore() {
				this.triggered = false;
			},
			handleMedia(v) {
				if (v.shortAddress) {
					v.shortAddress = v.shortAddress.replace(/,/g, ' ')
				}
				if (v.unitPriceBreakdown) {
					v.unitPriceBreakdown = JSON.parse(v.unitPriceBreakdown)
				}
				if (v.photos) {
					v.photos = JSON.parse(v.photos);
				} else {
					v.photos = [];
				}
			},
			handleFail(item) {
				this.curCommodity = item;
				this.$refs.dialogFail.open();
			},
			handleOk(item) {
				this.curCommodity = item;
				this.$refs.dialogOk.open();
				this.messageContent = "确认通过审核吗？"
			},
			auditOk(item) {
				let self = this;
				let index = this.tabBars[this.tabIndex].list.findIndex(v => v.id === item.id);
				auditCommodity({
					id: item.id,
					auditStatus: 1,
				}).then(res => {
					if (res.retCode === 0) {
						if (index > -1) {
							self.handleMedia(res.data);
							self.tabBars[self.tabIndex].list.splice(index, 1);
							self.curCommodity = null;
							self.hideOkModal();
						}
					}
				});
			},
			auditFail(item) {
				let self = this;
				let index = this.tabBars[this.tabIndex].list.findIndex(v => v.id === item.id);
				auditCommodity({
					id: item.id,
					auditStatus: 0,
					errorMessage: this.remark.description
				}).then(res => {
					if (res.retCode === 0) {
						if (index > -1) {
							self.handleMedia(res.data);
							self.tabBars[self.tabIndex].list.splice(index, 1, res.data);
							self.curCommodity = null;
							self.remark = {}
							self.hideFailModal();
						}
					}
				});
			},
			toDetail(item) {
				uni.navigateTo({
					url: '/pagesNew/details/mallDetails?fromAdmin=1&id=' + item.id
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	@import "@/static/css/loading.css";

	.main {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.tab-nav {
		height: 80upx;
		line-height: 80upx;
	}

	.tab-active {
		border-width: 4upx;
	}

	.swiper-box {
		width: 100%;
		height: 100%;
	}

	.btn-line {
		width: 100%;
		border-top: 1rpx solid #dedede;
		margin-top: 10rpx;
		padding-top: 20rpx;

		.btn {
			padding: 10rpx 24rpx;
			border-radius: 40rpx;
			font-size: 26rpx;
			margin-left: 20rpx;
			border: 2rpx #999999 solid;
		}
	}

	::v-deep .uni-forms-item {
		padding: 10rpx 30rpx !important;
	}
</style>