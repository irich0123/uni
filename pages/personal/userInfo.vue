<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="个人资料" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<uni-list>
				<uni-list-item title="头像" :show-arrow="false"> <!--  @click="onChangeAvatar" -->
					<template v-slot:right>
						<image class="avatar" :src="(userData && userData.avatar)?userData.avatar:defaultUserAvatar" />
					</template>
				</uni-list-item>
				<uni-list-item title="姓名" :right-text="userData.realName" :show-arrow="false" />
				<uni-list-item title="性别" :right-text="userData.sex | sexFilter(that)" :show-arrow="false" />
				<uni-list-item title="联系方式" :right-text="userData.mobile" :show-arrow="false" />
			</uni-list>

			<!-- #ifdef APP-PLUS -->
			<uni-list v-if="bindStatus">
				<uni-list-item :title="bindTo" :right-text="bindOperate" @click="toUnbind" />
			</uni-list>
			<!-- #endif  -->

			<uni-list>
				<uni-list-item title="相册" @click="goToMyAlbum">
					<template v-slot:right>
						<text v-if="count.countAlbum" class="text-gray-4">相册{{ count.countAlbum}}个</text>
						<text v-if="count.countAlbumItem" class="text-gray-4">，照片{{ count.countAlbumItem }}张</text>
					</template>
				</uni-list-item>
			</uni-list>

			<uni-list>
				<uni-list-item title="个人认证" :right-text="userData.verifyStatusName" @click="personalAudit" />
				<uni-list-item title="企业认证" :right-text="userData.comVerifyStatusName" @click="companyAudit" />
			</uni-list>

			<uni-list>
				<uni-list-item title="支付密码" @click="goToSetPassword">
					<template v-slot:right>
						<text v-if="userData.hasAccountPsw" class="text-gray-4">修改</text>
						<text v-else class="text-gray-4">设置</text>
					</template>
				</uni-list-item>
				<uni-list-item title="地址管理" @click="goToAddress">
					<template v-slot:right>
						<text v-if="userData.hasDefaultAddress" class="text-gray-4">编辑</text>
						<text v-else class="text-gray-4">添加</text>
					</template>
				</uni-list-item>
			</uni-list>

			<uni-list>
				<uni-list-item title="企业信息公开" :show-arrow="false">
					<template v-slot:right>
						<switch color="#fb5318" :checked="isShowCompanyInfo" @change="switchChange" />
					</template>
				</uni-list-item>
				<uni-list-item :title="userData.companyName" @click="goToEnterpriseDetailsById" />
				<uni-list-item title="所在城市" :right-text="userData.companyRegionName" :show-arrow="false" />
				<uni-list-item title="详细地址" :right-text="userData.companyAddress" :show-arrow="false" />
				<uni-list-item title="公司电话" :right-text="userData.companyPhone" :show-arrow="false" />
			</uni-list>

			<view style="min-height: 50rpx">&nbsp;</view>
		</scroll-view>
	</view>
</template>

<script>
	import UniList from '@/components/uni-list/uni-list.vue'
	import UniListItem from '@/components/uni-list-item/uni-list-item.vue'
	import {
		getAllGenderEnum,
		getUserAuditStatusEnum,
		getThirdPartyLoginType
	} from "@/api/basic";
	import {
		countAlbums,
		getMyValidThirdPartyBindInfo,
		getPerDetailsInfo,
		updateEnterpriseInfo,
		thirdPartyUnBind
	} from "@/api/user";
	import {
		imgUrl,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "userInfo",
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

				isShowCompanyInfo: false, //是否显示企业展台信息
				defaultUserAvatar: '', //默认头像

				token: null,
				userData: {},

				count: {
					countAlbum: 0,
					countAlbumItem: 0,
				},

				userAuditStatusList: [],

				sexList: [],

				bindType: null,
				bindStatus: null,
				bindTo: null,
				bindOperate: null,

				thirdPartyLoginTypeList: [],

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
			sexFilter(sex, that) {
				const [obj] = that.sexList.filter(v => v.value === sex)
				return !!obj ? obj.label : '';
			},
		},
		created() {
			this.userData = uni.getStorageSync("user")
			
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
			initData() {
				let defaultResource = uni.getStorageSync("defaultResource");
				this.defaultUserAvatar = defaultResource[4].resourceUrl[0];

				this.getGenderList();
				this.getUserAlbumCount();
			},
			getLoginType() {
				let self = this;
				getThirdPartyLoginType({}).then(res => {
					if (res.retCode === 0) {
						self.thirdPartyLoginTypeList.splice(0, self.thirdPartyLoginTypeList.length);
						res.data.forEach(v => {
							if (v.label === "weixin") {
								v.label = "微信";
							} else if (v.label === "qq") {
								v.label = "QQ";
							} else if (v.label === "apple") {
								v.label = "苹果账户"
							}
							self.thirdPartyLoginTypeList.push(v);
						});

						self.getMyThirdPartyBindInfo();
					}
				});
			},
			getGenderList() {
				let self = this;
				getAllGenderEnum().then(res => {
					if (res.retCode === 0) {
						self.sexList = res.data;

						self.getUserAuditStatusEnum();
					}
				});
			},

			getUserAlbumCount() {
				let paramsData = {
					ownerId: this.userData.id,
					ownerType: 0, //个人相册
				};
				let self = this;
				countAlbums(paramsData).then(res => {
					if (res.retCode === 0) {
						self.count = res.data;
					}
				});
			},
			goToMyAlbum() {
				if (!!this.userData.userVerifyStatus && this.userData.userVerifyStatus > 1) {
					//必须是个人认证过的
					uni.navigateTo({
						url: '/pagesNew/album/albumList?ownerId=' + this.userData.id + '&ownerType=0',
					})
				} else {
					uni.showModal({
						title: '小二提示',
						showCancel: false,
						content: '抱歉，此功能仅对认证会员开放，请先完成个人认证',
						confirmText: '我知道了',
					});
				}
			},
			//跳转到认证
			personalAudit() {
				uni.navigateTo({
					url: '../../pagesCertification/personal/index?action=' + ((this.userData.verifyStatus !== 1) ?
						'edit' : 'view'),
				})
			},
			companyAudit() {
				uni.navigateTo({
					url: '../../pagesCertification/enterprise/index?action=' + ((this.userData.comVerifyStatus !==
							1) ?
						'edit' : 'view'),
				})
			},
			//企业信息是否公开
			switchChange(e) {
				let paramsData = {
					switches: e.target.value ? 1 : 0,
				}
				updateEnterpriseInfo(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "更新成功",
							icon: "none",
							duration: 500
						})
					}
				});
			},
			//跳转到企业展台信息详情
			goToEnterpriseDetailsById() {
				uni.navigateTo({
					url: '/pagesCertification/enterprise/enterpriseDetails?type=1',
				})
			},
			//跳转到支付密码设置
			goToSetPassword() {
				if (!!this.userData.hasAccountPsw) {
					uni.navigateTo({
						url: '/pagesPersonal/pay/updatePayPassword'
					})
				} else {
					uni.navigateTo({
						url: '/pagesPersonal/pay/setPayPassword'
					})
				}
			},
			//跳转到地址管理
			goToAddress() {
				uni.navigateTo({
					url: '/pagesChoose/address/index'
				})

			},
			//获取个人资料信息
			getUserInfo() {
				let self = this;
				getPerDetailsInfo().then(res => {
					if (res.retCode === 0) {
						self.isShowCompanyInfo = !!res.data.enterpriseSwitches;
						self.userData = res.data

						if (null != self.userData.verifyStatus) {
							self.userData.verifyStatusName = self.userAuditStatusList.find(v => v.value === self
								.userData.verifyStatus).label;
						}
						if (null != self.userData.comVerifyStatus) {
							self.userData.comVerifyStatusName = self.userAuditStatusList.find(v => v.value === self
								.userData.comVerifyStatus).label;
						}

						self.getLoginType();
					}
				});
			},
			getUserAuditStatusEnum() {
				let self = this;
				getUserAuditStatusEnum().then(res => {
					if (res.retCode === 0) {
						self.userAuditStatusList.splice(0, self.userAuditStatusList.length);
						res.data.forEach(v => {
							self.userAuditStatusList.push(v);
						})

						self.getUserInfo();
					}
				});
			},
			getMyThirdPartyBindInfo() {
				let self = this;
				getMyValidThirdPartyBindInfo().then(res => {
					if (res.retCode === 0) {
						let info = res.data;
						self.bindType = info.type;

						let index = self.thirdPartyLoginTypeList.findIndex(v => v.value === info.type);
						if (index > -1) {
							self.bindTo = self.thirdPartyLoginTypeList[index].label;
							self.bindOperate = "解绑";
							self.bindStatus = 1;
						} else {
							self.bindStatus = null;
						}
					}
				});
			},
			toUnbind() {
				let self = this;
				uni.showModal({
					title: '小二提醒',
					content: '确认要解绑第三方登录码？',
					cancelText: '取消',
					confirmText: '确定',
					confirmColor: '#fb5318',
					success: function(res1) {
						if (res1.confirm) {
							if (!!self.bindStatus) {
								thirdPartyUnBind({
									type: self.bindType
								}).then(res => {
									if (res.retCode === 0) {
										self.bindStatus = null;
									}
								});
							}
						}
					}
				})
			}
		},
		/**
		 * 页面相关事件处理函数--监听用户下拉动作
		 */
		onPullDownRefresh() {
			this.initData();
			this.$nextTick(() => {
				uni.stopPullDownRefresh()
			})
		},
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;
	}

	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 65rpx;
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

	::v-deep .uni-list-item__extra {

		text {
			font-size: 28rpx !important;
			color: #333333 !important;
		}
	}

	::v-deep .uni-icon-wrapper {
		color: #bbb !important;
		line-height: 1;

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