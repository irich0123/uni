<template>
	<view class="container no-scroll
	import {
		active
	} from '@/utils/config';
	">
		<!-- #ifndef  H5-->
		<my-nav-bar title="评论对方" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view
				class="bg-white margin-top-sm margin-lr padding-tb flex align-center justify-start radius">
				<view class="margin-lr-sm flex align-center justify-center position-relative">
					<image class="gray-border-1 round" style="width: 80rpx;height: 80rpx;overflow: hidden;"
						:src="userDetailsInfo.avatar?userDetailsInfo.avatar:defaultUserAvatar" />

					<view class="position-relative text-xss position-absolute" style="top:24px;left:24px">
						<view class="color-white radius-x gray-border-1 flex align-center justify-center"
							style="width:30rpx;height:30rpx;background: #fb5318;"
							v-if="userDetailsInfo.userVerifyStatus === 2">个
						</view>
						<view class="color-white radius-x gray-border-1 flex align-center justify-center"
							style="width:30rpx;height:30rpx;background: #2078e4;"
							v-if="userDetailsInfo.userVerifyStatus === 3">企
						</view>
					</view>
				</view>
				<view class="flex flex-direction align-start justify-center">
					<view class="text-df text-black">{{ userDetailsInfo.realName }}</view>
					<view class="padding-top-xss text-ssm text-gray-4">
						历史评分：{{ userDetailsInfo.userAverageScoreAVG | formatQuantity }}</view>
				</view>
			</view>

			<view class="margin-tb-sm margin-lr bg-white radius padding">
				<view class="padding-tb" v-for="(item,index) in options[type].itemList" :key="index">
					<my-issue :init-score="item.value" :headTitleValue="item.label" :textareaShow="false"
						:stars-max="[1, 2, 3, 4, 5]" itShow="false" @scoreChange="scoreChange($event,index)" />
				</view>
			</view>
			<view class="margin-tb-sm margin-lr bg-white radius">
				<view class="radius padding">
					<textarea maxlength="-1" v-model="content" placeholder="请输入您的评价，不少于15个字"></textarea>
				</view>
			</view>
		</scroll-view>
		
		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<button class="bg-theme theme-border text-xl color-white radius-0" @click="submitEvaluate">提交</button>
		</view>
	</view>
</template>

<script>
	import myIssue from '../components/myIssue.vue'
	import {
		doEvaluate,
		getContractRecord
	} from "@/api/workinfo";
	import {
		getUserInfoByUserId
	} from "@/api/user";
	import {
		calculateMath
	} from "@/utils/myUtil";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from '@/utils/config';
	

	export default {
		name: "evaluate",
		components: {
			myIssue,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userData: {},

				contractId: null,
				type: 0, //0---甲方，发活方；1---乙方，接活方,

				content: '',

				defaultUserAvatar: null,
				userDetailsInfo: {
					avatar: null,
					realName: null,
					userVerifyStatus: null,
				},

				options: [{
						type: 0, //买家
						itemList: [{
								key: "attitudeScore",
								label: "态度友好",
								value: 0,
							},
							{
								key: "speedScore",
								label: "结账进度",
								value: 0,
							},
							{
								key: "productScore",
								label: "难易程度",
								value: 0,
							},
							{
								key: "priceScore",
								label: "价格合理",
								value: 0,
							}
						]
					},
					{
						type: 1, //供应商
						itemList: [{
								key: "attitudeScore",
								label: "服务态度",
								value: 0,
							},
							{
								key: "speedScore",
								label: "完成速度",
								value: 0,
							},
							{
								key: "productScore",
								label: "产品质量",
								value: 0,
							},
							{
								key: "priceScore",
								label: "价格合理",
								value: 0,
							}
						]
					}
				],

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
			formatQuantity(number) {
				return calculateMath(number, 0);
			}
		},
		onLoad(options) {
			this.userData = uni.getStorageSync('user')

			this.contractId = parseInt(options.contractId);
			this.type = parseInt(options.type); //0=表示发单方

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token')
			this.userData = uni.getStorageSync('user')

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
				let defaultResource = uni.getStorageSync("defaultResource");
				this.defaultUserAvatar = defaultResource[4].resourceUrl[0];
				//获取默认图片
				this.getContractRecord();
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
			//获取交易详情
			getContractRecord() {
				let paramsData = {
					id: this.contractId
				}
				let self = this;
				getContractRecord(paramsData).then(res => {
					if (res.retCode === 0) {
						if (self.type === 0 && self.userData.id !== res.data.contractInfo.firstPartUserId) {
							uni.showToast({
								icon: 'none',
								title: '抱歉，您未参与这个交易，不能评价对方',
								duration: 2000
							});
							setTimeout(() => {
								uni.navigateBack({
									delta: 1,
								})
							}, 2000);
						} else if (self.type === 1 && self.userData.id !== res.data.contractInfo
							.secondPartUserId) {
							uni.showToast({
								icon: 'none',
								title: '抱歉，您未参与这个交易，不能评价对方',
								duration: 2000
							});
							setTimeout(() => {
								uni.navigateBack({
									delta: 1,
								})
							}, 2000);
						} else {
							let userId = (self.type === 0 ? res.data.contractInfo.secondPartUserId : res.data
								.contractInfo.firstPartUserId);
							self.getUserInfoByUserId(userId);
						}
					}
				});
			},
			getUserInfoByUserId(userId) {
				if (!this.token) {
					this.toLogin();
					return;
				}
				let paramsData = {
					userId: userId,
				}
				console.log(paramsData)
				getUserInfoByUserId(paramsData).then(res => {
					if (res.retCode === 0) {
						this.userDetailsInfo = res.data
					}
				});
			},
			submitEvaluate() {
				if (!this.content) {
					uni.showToast({
						title: '请输入不少于15个字的评价！',
						icon: "none",
						duration: 3000
					})
					return
				}

				let paramsData = {
					contractId: this.contractId,
					content: this.content,
				};
				this.options[this.type].itemList.forEach(v => {
					paramsData[v.key] = v.value;
				});

				doEvaluate(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "评价成功！",
							icon: "none",
							duration: 2000
						})
						setTimeout(() => {
							uni.navigateBack({
								delta: 1
							})
						}, 2000)
					}
				});
			},
			scoreChange(e, index) {
				this.options[this.type].itemList[index].value = e;
				console.log("options", this.options);
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;

	}
</style>