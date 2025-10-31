<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="意见反馈" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="bg-white text-df margin-sm radius">
				<view class="text-black text-lg text-bold padding-tb-sm padding-lr">请选择问题类型</view>
				<radio-group @change="radioChange">
					<view class="flex align-center justify-between margin-lr padding-tb gray-border-bottom"
						v-for="(item,index) in optionList" :key="index">
						<view>{{ item.label }}</view>
						<view>
							<radio color="#fb5318" :value="index+''" :checked="index === optionIndex" />
						</view>
					</view>
				</radio-group>
			</view>

			<view class="bg-white padding-tb-lg padding-lr margin-bottom-sm margin-lr-sm radius">
				<view class="text-black text-lg text-bold margin-bottom-sm">详细描述</view>
				<view class="radius-s gray-border bg-white padding-top padding-lr">
					<textarea maxlength="200" placeholder="请输入不少于20字的描述" v-model="remark" />
					<view class="text-right text-df padding-bottom">
						{{ number }}
						<text class="text-gray-4">/{{ descLengthMax }}</text>
					</view>
				</view>
			</view>

			<view class="margin-bottom-sm margin-lr bg-white padding radius-s">
				<view class="text-black text-lg text-bold margin-bottom-sm">请提供相关图片或照片</view>
				<view class="radius-s">
					<upload-img-bar @changed="mediaChanged" class="margin-top-sm" :img-list="uploadImgList"
						:img-length-max="10" ref="uploadImgBar" />
				</view>
			</view>

			<view class="blank"></view>
		</scroll-view>

		<view class="bg-white" style="width: 100%;position:fixed;left:0;bottom:0;z-index: 19;">
			<button class="bg-theme text-xl color-white radius-0" :disabled="disableSubmitBtn" @click="submitData">提交</button>
		</view>
	</view>
</template>

<script>
	import uploadImgBar from "@/utils/yjg-upload/upload-img-bar";
	import {
		getAdviceOptionEnum
	} from '@/api/basic';
	import {
		createAdvice
	} from '@/api/common';
	
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	
	import {
		active
	} from "@/utils/config";
	
	export default {
		name: "newAdvice",
		components: {
			uploadImgBar,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,

				optionList: [],
				optionIndex: 0,

				remark: '',

				uploadImgList: [],

				imgLengthMax: 10, //最多上次的图片数
				descLengthMax: 200, //最多说明文字数,

				disableSubmitBtn: true,

				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		computed: {
			number() {
				if (this.remark.length > this.descLengthMax) {
					return 200
				} else {
					return this.remark.length
				}
			},
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
				this.disableSubmitBtn = !(val.remark.length > 20 && val.optionIndex != null);
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
		onLoad() {
			this.initData();
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

			initData() {
				this.getAdviceOptionEnum();
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

			getAdviceOptionEnum() {
				let self = this;
				getAdviceOptionEnum().then(res => {
					if (res.retCode === 0) {
						self.optionList.splice(0, self.optionList.length);
						res.data.forEach(item => {
							self.optionList.push(item);
						})
					}
				});
			},
			radioChange: function(evt) {
				this.optionIndex = parseInt(evt.target.value);
			},
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
					questionType: this.optionList[this.optionIndex].label,
					questionDetail: this.remark,
					questionImgs: JSON.stringify(this.uploadImgList),
				}
				createAdvice(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: '感谢您的意见反馈！',
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
			mediaChanged(e) {
				this.uploadImgList.splice(0, this.uploadImgList.length);
				e.list.forEach(v => {
					this.uploadImgList.push(v);
				})
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.blank {
		min-height: 120rpx;
	}
</style>