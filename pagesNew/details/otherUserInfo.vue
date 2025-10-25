<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="会员信息" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="bg-theme color-white text-df padding-tb-ssm flex align-center justify-between">
				<view class="tool-bar-left">
					<!--                <view class="user-tool-item">企业</view>-->
				</view>
				<view class="flex align-center justify-start">
					<view class="padding-lr-sm" @click.stop="gotoComments">评价</view>
					<view class="padding-lr-sm" @click.stop="gotoAlbum">相册
						<text class="padding-lr-ssm gray-border radius-l text-ssm margin-left-xxs"
							v-if="!!count.countAlbumItem">{{ count.countAlbumItem }}</text>
					</view>
				</view>
			</view>
			<view class="bg-theme padding-tb-xl flex flex-direction align-center justify-center"
				@longtap="gotoComplaint">
				<view class="position-relative">
					<image style="width: 120rpx;height: 120rpx;" class="round"
						:src="userInfoDetails.avatar?userInfoDetails.avatar:(imgUrl+'/awater.png')"></image>

					<view class="position-relative text-xss position-absolute" style="top:40px;left:40px">
						<view class="color-white radius-x gray-border-1 flex align-center justify-center"
							style="width:36rpx;height:36rpx;background: #fb5318;"
							v-if="userInfoDetails.userVerifyStatus === 2">个
						</view>
						<view class="color-white radius-x gray-border-1 flex align-center justify-center"
							style="width:36rpx;height:36rpx;background: #2078e4;"
							v-if="userInfoDetails.userVerifyStatus === 3">企
						</view>
					</view>
				</view>
				<view class="padding-top-ssm color-white text-xxl">{{ userInfoDetails.realName }}</view>
			</view>

			<view class="margin-top-sm text-df bg-white">
				<uni-list>
					<uni-list-item title="联系方式" :right-text="userInfoDetails.mobile" :show-arrow="false" />
					<uni-list-item title="性别" :right-text="userInfoDetails.sex | sexFilter(that)" :show-arrow="false" />
					<uni-list-item title="认证状态" :right-text="userInfoDetails.userVerifyStatus | statusFilter(that)"
						:show-arrow="false" />
					<uni-list-item title="注册时间" :right-text="userInfoDetails.createtime | formatTime(that)"
						:show-arrow="false" />
				</uni-list>
			</view>


			<view class="margin-top-sm text-df bg-white">
				<uni-list>
					<uni-list-item title="保证金" :right-text="userInfoDetails.depositCount | formatPrice"
						:show-arrow="false" />
					<uni-list-item title="信誉度" :right-text="userInfoDetails.reputationScore+''" :show-arrow="false" />
					<uni-list-item title="评价分" :right-text="'0'" :show-arrow="false" />
					<uni-list-item title="纠纷率" :right-text="userInfoDetails.rateOfDispute+''" :show-arrow="false" />
					<uni-list-item title="成单量" :right-text="userInfoDetails.orderCnt+''" :show-arrow="false" />
					<uni-list-item title="发单量" :right-text="userInfoDetails.releaseWorkCnt+''" :show-arrow="false" />
				</uni-list>
			</view>

			<view class="margin-top-sm bg-white text-df">
				<uni-list v-if="userInfoDetails.userVerifyStatus === 3">
					<uni-list-item title="公司名称" :right-text="userInfoDetails.companyName" :show-arrow="false" />
					<uni-list-item title="公司电话" :right-text="userInfoDetails.companyPhone" :show-arrow="false" />
					<uni-list-item title="公司地址" :right-text="userInfoDetails.companyAddress" :show-arrow="false" />
				</uni-list>
			</view>

			<view class="blank"></view>
		</scroll-view>
	</view>

</template>

<script>
	import UniList from "@/components/uni-list/uni-list";
	import UniListItem from "@/components/uni-list-item/uni-list-item";
	import {
		calculateMath,
		formatTime,
		priceTranslate,
		timestampToTime
	} from "@/utils/myUtil";
	import {
		getAllGenderEnum,
		getAllUserVerifyStatus
	} from "@/api/basic";
	import {
		countAlbums,
		getUserInfoByUserId
	} from "@/api/user";
	import {
		imgUrl,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "otherUserInfo",
		components: {
			UniList,
			UniListItem,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				that: this,
				id: null,
				userData: {},
				count: {
					countAlbum: 0,
					countAlbumItem: 0,
				},

				userInfoDetails: {},

				sexList: [],
				UserVerifyStatusList: [],

				imgUrl: imgUrl,
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
			formatTime(time) {
				return timestampToTime(time);
			},
			formatPrice(number) {
				return !!priceTranslate(number) ? priceTranslate(number) + " 元" : '0';
			},
			sexFilter(sex, that) {
				if (sex === null) {
					sex = 2;
				}
				const [obj] = that.sexList.filter(v => v.value === sex)
				return !!obj ? obj.label : '';
			},
			statusFilter(verifyStatus, that) {
				const [obj] = that.UserVerifyStatusList.filter(v => v.value === verifyStatus)
				return !!obj ? obj.label : '';
			},
		},
		onLoad(options) {
			this.userData = uni.getStorageSync("user");
			this.id = parseInt(options.userId);

			this.initData();
		},
		onShow() {
			this.userData = uni.getStorageSync("user");

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
				this.getGenderList();
				this.getUserAlbumCount();
			},
			getGenderList() {
				let self = this;
				getAllGenderEnum().then(res => {
					if (res.retCode === 0) {
						self.sexList = res.data;

						self.getUserVerifyStatus();
					}
				});
			},
			getUserVerifyStatus() {
				let self = this;
				getAllUserVerifyStatus().then(res => {
					if (res.retCode === 0) {
						self.UserVerifyStatusList.splice(0, self.UserVerifyStatusList.length);
						res.data.forEach(v => {
							self.UserVerifyStatusList.push(v);
						})

						self.getUserInfoByUserId();
					}
				});
			},
			getUserInfoByUserId() {
				let paramsData = {
					userId: this.id
				}
				let self = this;
				getUserInfoByUserId(paramsData).then(res => {
					if (res.retCode === 0) {
						self.userInfoDetails = res.data
					}
				});
			},
			getUserAlbumCount() {
				let paramsData = {
					ownerId: this.id,
					ownerType: 0, //个人相册
				};
				let self = this;
				countAlbums(paramsData).then(res => {
					if (res.retCode === 0) {
						self.count = res.data;
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
			gotoAlbum() {
				uni.navigateTo({
					url: '/pagesNew/album/albumList?ownerId=' + this.id + '&ownerType=0',
				})
			},
			gotoComments() {
				//todo 
				uni.showToast({
					icon: 'none',
					title: '暂无评价...',
					duration: 1500
				});
			},
			gotoComplaint() {
				if (this.id === this.userData.id) {
					return;
				}
				let self = this;
				uni.showModal({
					title: '小二提示',
					content: '确认要投诉此会员吗吗？',
					showCancel: true,
					cancelText: "取消",
					confirmText: '确认',
					confirmColor: '#fb5318',
					success: function(res) {
						if (res.confirm) {
							console.log('用户点击确定');
							uni.navigateTo({
								url: '/pages/personal/newComplaint?id=' + self.id + "&type=1",
							})
						}
					},
				})

			},
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

	.blank {
		min-height: 60rpx;
	}

	::v-deep .uni-list {
		margin: 20rpx 20rpx 0 20rpx;
		background-color: #ffffff;
		border-radius: 16rpx;
	}

	::v-deep .uni-list-item {
		padding: 0 20rpx !important;
		border-bottom: 1rpx solid #f2f2f2 !important;
	}

	::v-deep .uni-list-item__container {
		min-height: 70rpx;
	}

	::v-deep .uni-list-item__content-title {
		font-size: 28rpx !important;
		color: #666666 !important;
	}

	::v-deep .uni-list-item__extra-text {
		font-size: 28rpx !important;
		color: #333333 !important;
	}


	::v-deep .uni-icon-wrapper {
		// margin-right: -20rpx !important;
		color: #bbb !important;
	}

	@media (prefers-color-scheme: dark) {

		::v-deep .uni-list {
			background-color: #1e1e1e;
		}

		::v-deep .uni-list-item {
			border-bottom: 1rpx solid #000 !important;
		}

		::v-deep .uni-list-item__extra-text {
			color: #ccc !important;
		}

		::v-deep .uni-icon-wrapper {
			color: #333 !important;
		}
	}
</style>