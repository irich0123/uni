<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="联系客服" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="margin-sm text-df" v-if="!!serviceList.length">
				<uni-list>
					<uni-list-item :show-arrow="false" v-for="(item,index) in serviceList" :key="index"
						:title="item.name" :note="item.note">
						<template v-slot:right>
							<text @longpress="copyValue(item.identity)"
								class="text-lg text-black-5">{{item.identity}}</text>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import {
		queryServiceConfig
	} from "@/api/common";
	import {
		active
	} from '@/utils/config';
	import {
		getCustomerServiceTypeEnum
	} from "@/api/basic";
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';

	export default {
		name: "StickList",
		components: {
			UniList,
			UniListItem,
			myNavBar
		},
		data() {
			return {
				serviceList: [],
				typeList: [],

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
			filterType(type, that) {
				const [obj] = that.statusList.filter(v => v.value === type)
				return !!obj ? obj.label : '';
			},
		},
		onLoad(query) {
			// #ifdef H5
			this.listHeight = uni.getWindowInfo().safeArea.height;
			// #endif

			this.initData();
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
				this.getCustomerServiceType();
			},
			getCustomerServiceType() {
				let self = this;
				getCustomerServiceTypeEnum().then(res => {
					if (res.retCode === 0) {
						self.typeList = res.data;
					}

					self.listService();
				});
			},
			listService() {
				let self = this;
				let param = {
					status: 1,
				}
				queryServiceConfig(param).then(res => {
					if (res.retCode === 0) {
						self.serviceList = res.data;
						self.serviceList.forEach(v => {
							const [obj] = self.typeList.filter(u => u.value === v.type);
							let dayList = JSON.parse(v.weekDays);

							v.name = (!!obj ? obj.label : '') + '客服';
							v.note = v.startWorkTime + ":00~" + v.endWorkTime + ":00 ";

							let arrWeek = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

							let arr = [];
							let start = "";
							let end = "";

							for (let i = 0; i < dayList.length; i++) {
								if (!!dayList[i]) {
									if (!start) {
										start = arrWeek[i];
									} else {
										end = arrWeek[i];
									}
									if (i == 6) {
										if (!!start) {
											arr.push({
												start: start,
												end: end,
											})
										}
									}
									// console.log(i, start, end);
								} else {
									if (!start) {
										continue;
									} else {
										arr.push({
											start: start,
											end: end,
										})

										start = "";
										end = "";
									}
								}
							}

							arr.forEach(m => {
								if (m.end) {
									v.note += m.start + "~" + m.end + ", "
								} else {
									v.note += m.start + ", "
								}
							})

							v.note = v.note.substr(0, v.note.length - 2)

						})
					}
				});
			},
			copyValue(code) {
				uni.setClipboardData({
					data: code,
					success: function() {
						console.log('success');
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
	}

	::v-deep .uni-list {
		background-color: transparent !important;
	}

	::v-deep .uni-list-item__container {
		padding: 0rpx !important;
		margin: 20rpx 0 20rpx 0 !important;
	}

	::v-deep .uni-list-item {
		padding: 20rpx !important;
		background-color: white;
		margin-bottom: 2rpx;

		&:first-child {
			border-top-left-radius: 10rpx;
			border-top-right-radius: 10rpx;
		}

		&:last-child {
			border-bottom-left-radius: 10rpx;
			border-bottom-right-radius: 10rpx;
		}
	}

	::v-deep .uni-list-item__content-title {
		font-size: 30rpx;
		color: #777;
	}


	@media (prefers-color-scheme: dark) {
		::v-deep .uni-list-item {
			background-color: #1e1e1e;
		}
	}
</style>