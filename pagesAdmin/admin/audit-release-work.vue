<template>
	<view class="main no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="外发信息审核" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<wuc-tab :tab-list="tabBars" @change="onTabItemClick" textFlex :tabCur.sync="tabIndex"
			:style="'padding-top:'+contentTop+'px;'" select-class="text-theme" />

		<scroll-view class="bg-gray-1" scroll-y :style="'height:'+listHeight+'px;'" @scrolltolower="loadMoreData"
			refresher-enabled="true" :refresher-triggered="triggered" @refresherrefresh="onRefresh"
			@refresherrestore="onRestore" refresher-background="transparent">

			<!-- 列表 -->
			<view v-for="(item,idx) in tabBars[tabIndex].list" :key="idx" class="margin-lr-sm">
				<view class="bg-white margin-top radius-x" @click="toDetail(item)">
					<release-work-list-cell :release-work="item" :show-admin-bar="true" :show-footer="false">
						<view class="btn-line flex align-center justify-end">
							<view class="btn flex align-center" @click.stop="handleOk(item)"
								v-if="item.verifyStatus===1 || item.verifyStatus===2">
								<uni-icons type="checkmarkempty" size="14" color="#555"
									style="height: 1;margin-right: 10rpx" />
								通过
							</view>
							<view class="btn flex align-center" @click.stop="handleFail(item)"
								v-if="item.verifyStatus===1 || item.verifyStatus===3">
								<uni-icons type="closeempty" size="14" color="#555"
									style="height: 1;margin-right: 10rpx" />
								不通过
							</view>
						</view>
					</release-work-list-cell>
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
				<view class="padding-xl text-df text-black-4 gray-border-bottom">
					{{messageContent}}
				</view>
				<view class="flex text-df gray-border-top margin-top-sm">
					<view class="flex-sub text-gray-2 padding-tb-df text-center" @tap="hideOkModal">取消</view>
					<view class="flex-sub text-theme padding-tb-df gray-border-left text-center"
						@tap="confirmOkModal">{{messageBtn}}</view>
				</view>
			</view>
		</uni-popup>

		<uni-popup ref="dialogFail">
			<view class="cu-dialog bg-white">
				<view class="flex justify-center padding-tb-df gray-border-bottom">
					<view class="text-theme text-df">{{messageTitle}}</view>
				</view>
				<uni-forms labelPosition="left" border :modelValue="remark" label-width="100">
					<uni-forms-item label="选择理由">
						<picker class="flex flex-sub justify-end" mode="selector" @change="remarkChange"
							range-key="name" :range="remarkList">
							<view class="flex align-center">
								<view class="text-black-4 radius-s padding-sm">
									{{ remark.name }}
								</view>
								<uni-icons type="forward" size="18" color="#cccccc" style="line-height: 1;" />
							</view>
						</picker>
					</uni-forms-item>
					<uni-forms-item label="具体原因">
						<uni-easyinput type="textarea" v-model="remark.description" style="width: 100%;" />
					</uni-forms-item>
				</uni-forms>
				<view class="flex text-df gray-border-top margin-top-sm">
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
	import ReleaseWorkListCell from "@/utils/yjg-list-cell/release-work-list-cell";
	import uniForms from '@/components/uni-forms/uni-forms'
	import uniFormsItem from '@/components/uni-forms-item/uni-forms-item'
	import uniEasyInput from '@/components/uni-easyinput/uni-easyinput'
	import UniIcons from "@/components/uni-icons/uni-icons";

	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		filterReleaseWork,
		filterAuditRemark,
		auditReleaseWorkOk,
		auditReleaseWorkFail
	} from '@/api/admin'
	import { active } from '@/utils/config';

	export default {
		components: {
			ReleaseWorkListCell,
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

				//审核中(1), 已拒绝(2),已通过(3),已过期(4),已删除(5),已确定报价(6),已下架(7), 已完成(8);
				tabBars: [{
						name: '待审核',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [1, 2],
						list: [],
					},
					{
						name: '已完成',
						loadingType: 2,
						isLoading: false,
						page: 1,
						size: 10,
						statusList: [3],
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

				remarkList: [],
				remark: {
					name: '请选择',
				},

				curReleaseWork: null,
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
				this.queryAuditRemark();
			},
			queryAuditRemark() {
				let self = this;
				let param = {
					type: 0,
					page: 1,
					size: 100,
				}
				filterAuditRemark(param).then(res => {
					if (res.retCode === 0) {
						self.remarkList = res.data.list;

						self.loadData();
					}
				});
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
				this.auditOk(this.curReleaseWork);
			},
			confirmFailModal() {
				if(!this.remark.description || this.remark.description.length===0){
					uni.showToast({
						title: '请选择或输入具体原因',
						icon: 'none',
						duration: 3000,
					})
					return;
				}
				this.auditFail(this.curReleaseWork);
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
				filterReleaseWork(param).then(res => {
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
				if (v.img && v.img.indexOf("[") > -1 && v.img.indexOf("]") > -1) {
					v.img = JSON.parse(v.img);
				}
			},
			handleFail(item) {
				this.curReleaseWork = item;
				this.$refs.dialogFail.open();
			},
			handleOk(item) {
				this.curReleaseWork = item;
				this.$refs.dialogOk.open();
				this.messageContent = "确认通过审核吗？"
			},
			remarkChange(e) {
				this.remark = this.remarkList[e.detail.value];
			},
			auditOk(item) {
				let self = this;
				let index = this.tabBars[this.tabIndex].list.findIndex(v => v.id === item.id);
				auditReleaseWorkOk({
					id: item.id
				}).then(res => {
					if (res.retCode === 0) {
						if (index > -1) {
							self.handleMedia(res.data);
							self.tabBars[self.tabIndex].list.splice(index, 1);
							self.curReleaseWork = null;
							self.hideOkModal();
						}
					}
				});
			},
			auditFail(item) {
				let self = this;
				let index = this.tabBars[this.tabIndex].list.findIndex(v => v.id === item.id);
				auditReleaseWorkFail({
					id: item.id,
					remarks: this.remark.description
				}).then(res => {
					if (res.retCode === 0) {
						if (index > -1) {
							self.handleMedia(res.data);
							self.tabBars[self.tabIndex].list.splice(index, 1, res.data);
							self.curReleaseWork = null;
							self.remark = {}
							self.hideFailModal();
						}
					}
				});
			},
			toDetail(item) {
				uni.navigateTo({
					url: '/pagesNew/details/sendDetails?fromAdmin=1&id=' + item.id
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