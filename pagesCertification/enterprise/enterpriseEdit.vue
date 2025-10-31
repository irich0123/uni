<template>
	<view class="container flex flex-direction no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="企业编辑" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<uni-forms :model-value="formData" label-position="left" validateTrigger="bind" border label-width="100">
				<view class="bg-white radius margin-bottom-sm">
					<view @click.stop="loadCompanyType">
						<uni-forms-item label="企业类型" name="companyType" required>
							<picker mode="selector" class="margin-left-ssm flex align-center"
								@change="companyTypeChange" :value="companyTypeIndex" :range-key="'label'"
								:range="companyTypeList">
								<view class="flex align-center">
									<view class="text-black-4">{{ formData.companyType }}</view>
									<uni-icons type="forward" size="20" color="#cccccc" style="line-height:1;" />
								</view>
							</picker>
						</uni-forms-item>
					</view>

					<view @click.stop="beforeSelectImage">
						<uni-forms-item label="企业logo" name="logo" required>
							<view class="flex align-center">
								<image class="margin-lr-sm radius-xs" style="height: 90rpx;"
									:src="formData.logo?formData.logo:(imgUrl+'/nologo_enterprise.png')"
									mode="heightFix" />
								<uni-icons type="forward" size="20" color="#cccccc" style="line-height:1;" />
							</view>
						</uni-forms-item>
					</view>

					<view>
						<uni-forms-item label="企业名称" name="companyName" required>
							<uni-easyinput type="text" v-model="formData.companyName" placeholder="请输入企业名称"
								:clearable="false" :inputBorder="false" />
						</uni-forms-item>
					</view>

					<uni-forms-item label="企业简介" name="companyDesc" required>
						<uni-easyinput type="textarea" v-model="formData.companyDesc" :autoHeight="true"
							:maxlength="980" :clearable="false" placeholder="请输入企业简介" :inputBorder="false" />
					</uni-forms-item>
				</view>
				<view class="bg-white radius margin-bottom-sm">
					<uni-forms-item label="企业人数" name="workCnt" required>
						<picker mode="selector" class="margin-left-ssm flex align-center" @change="workerCntChange"
							:value="workerCntIndex" :range-key="'label'" :range="workerCntList">
							<view class="flex align-center">
								<view class="text-black-4">{{ formData.workerCnt }}</view>
								<uni-icons type="forward" size="20" color="#cccccc" style="line-height:1;" />
							</view>
						</picker>
					</uni-forms-item>

					<view>
						<uni-forms-item label="行业" name="industryName">
							<uni-easyinput type="text" v-model="formData.industryName" placeholder="请输入行业"
								:inputBorder="false" />
						</uni-forms-item>
					</view>

					<view @click.stop="loadCity">
						<uni-forms-item label="所在城市" name="regionName" required>
							<view class="flex align-center">
								{{cityLabel}}
								<uni-icons type="forward" size="20" color="#cccccc" style="line-height:1;" />
							</view>
						</uni-forms-item>
					</view>

					<uni-forms-item label="详细地址" name="companyAddress" required>
						<uni-easyinput type="textarea" v-model="formData.companyAddress" placeholder="请输入乡村镇街道及门牌号"
							:clearable="false" :autoHeight="true" :inputBorder="false" />
					</uni-forms-item>
				</view>

				<view class="bg-white radius margin-bottom-sm">
					<uni-forms-item label="负责人" name="userName">
						<uni-easyinput type="text" v-model="formData.userName" disabled :inputBorder="false" />
					</uni-forms-item>

					<uni-forms-item label="电话" name="companyPhone" required>
						<uni-easyinput type="text" v-model="formData.companyPhone" placeholder="请输入公司电话"
							:clearable="false" :inputBorder="false" />
					</uni-forms-item>
				</view>
			</uni-forms>
			<view style="min-height:120rpx"></view>
		</scroll-view>

		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<button class="bg-theme text-xl color-white radius-0" :disabled="submitDisabled"
				@click="updateEnterpriseInfo">提交
			</button>
		</view>

		<mpvue-city-picker ref="mpvueCityPicker" :pickerValueDefault="cityPickerValueDefault"
			@onConfirm="onConfirmCity"></mpvue-city-picker>

	</view>
</template>

<script>
	import {
		baseUrl,
		regex,
		active,
		imgUrl
	} from "@/utils/config";
	import UniIcons from "../../components/uni-icons/uni-icons";
	import uniForms from '../../components/uni-forms/uni-forms'
	import uniFormsItem from '../../components/uni-forms-item/uni-forms-item'
	import uniEasyInput from '../../components/uni-easyinput/uni-easyinput'
	import mpvueCityPicker from '@/components/mpvue-citypicker/src/mpvueCityPicker';
	import {
		getPerEnterpriseInfo,
		updateEnterpriseInfo
	} from "@/api/user";
	import {
		getCompanyStaffCntEnum,
		getCompanyTypeEnum
	} from "@/api/basic";
	import provinceData from "../../components/mpvue-citypicker/src/city-data/province";
	import cityData from "../../components/mpvue-citypicker/src/city-data/city";
	import areaData from "../../components/mpvue-citypicker/src/city-data/area";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		imgCompress,
		compressImage,
		getImageInfo,
		uploadImg
	} from "@/api/upload.js";
	//#ifdef APP-PLUS
	import {
		checkCamera,
		checkAlbum
	} from '@/utils/android_permission.js'
	//#endif

	export default {
		name: "enterpriseEdit",
		components: {
			UniIcons,
			uniFormsItem,
			uniEasyInput,
			mpvueCityPicker,
			uniForms,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				userAvatar: null,
				token: null,
				userData: null,

				selector: "selector",

				formData: {
					id: null,
					logo: null,
					companyName: null,
					industryName: null,
					companyAddress: '',
					companyPhone: '',
					companyDesc: '',
					userName: '',
					userId: null,
					workerCnt: null,
					companyType: null,
				},

				workerCntList: [],
				workerCntIndex: null,

				companyTypeList: [],
				companyTypeIndex: null,

				cityValue: null,
				cityLabel: '',
				cityPickerValueDefault: [0, 0, 0],
				cityPickerValueArray: [],

				submitDisabled: true,

				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: { //cityPicker包装有问题，所以才这样写
			'formValue': function(val) {
				let picker = val.picker;
				let form = val.form;
				this.submitDisabled = !(!!form.logo &&
					!!form.companyName &&
					!!form.companyPhone && ((new RegExp(regex.mobile)).test(form.companyPhone) || (new RegExp(regex
						.directLine)).test(form.companyPhone)) &&
					!!form.companyType &&
					!!form.workerCnt &&
					!!form.companyDesc &&
					!!picker.cityLabel &&
					!!form.companyAddress);
			},
			statusbarHeight: {
				handler(newVal, oldVal) {
					//#ifndef H5
					this.contentTop = newVal + 40;
					this.listHeight = uni.getWindowInfo().safeArea.height - newVal + 40;
					//#endif
					// #ifdef H5
					this.contentTop = 0;
					this.listHeight = uni.getWindowInfo().safeArea.height - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		computed: {
			'formValue': function() {
				const {
					cityLabel
				} = this;
				const {
					logo,
					companyName,
					companyPhone,
					companyDesc,
					companyAddress,
					companyType,
					workerCnt
				} = this.formData;
				return {
					picker: {
						cityLabel
					},
					form: {
						logo,
						companyName,
						companyPhone,
						companyDesc,
						companyAddress,
						companyType,
						workerCnt
					}
				};
			}
		},
		onLoad(options) {
			this.userData = uni.getStorageSync("user");

			// #ifdef H5
			this.listHeight = uni.getWindowInfo().safeArea.height;
			// #endif

			this.id = parseInt(options.enterpriseId);

			if (this.id) {
				this.initData();
			}
		},
		onShow() {
			this.token = uni.getStorageSync('token')

			if (!this.token) {
				this.toLogin();
				return;
			}

			if (!!this.userData.id) {
				this.formData.userName = this.userData.realName;
				this.formData.userId = this.userData.id;
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
				this.getCompanyStaffCntAll()
			},
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 1500
				});
				setTimeout(() => {
					uni.navigateTo({
						url: '/pages/login/login'
					})
				}, 1500);
			},

			loadCity() {
				this.$refs.mpvueCityPicker.show();
			},
			onConfirmCity(e) {
				this.cityPickerValueDefault = e.value;
				this.cityLabel = e.label;
				this.cityValue = e.value[0];
			},
			loadCityPickerDefault(locationMap) {
				let cityPickerValueDefault = [];
				if (locationMap.province) {
					let provinceId = provinceData.findIndex(item => {
						return item.label.indexOf(locationMap.province) > -1;
					});
					if (provinceId < 0) {
						provinceId = 0;
					}
					cityPickerValueDefault.push(provinceId);
					if (locationMap.city) {
						let cityId = cityData[provinceId].findIndex(item => {
							return item.label.indexOf(locationMap.city) > -1;
						});
						if (cityId == null || cityId < 0) {
							cityId = 0;
						}
						cityPickerValueDefault.push(cityId);
						if (!locationMap.area) {
							locationMap.area = locationMap.city;
						}
						if (locationMap.area) {
							let areaId = areaData[provinceId][cityId].findIndex(item => {
								return item.label.indexOf(locationMap.area) > -1;
							});
							if (areaId == null || areaId < 0) {
								areaId = 0;
							}
							cityPickerValueDefault.push(areaId);
						} else {
							cityPickerValueDefault.push(0);
						}
					} else {
						cityPickerValueDefault.push(0);
						cityPickerValueDefault.push(0);
					}
				} else {
					cityPickerValueDefault.push(0);
					cityPickerValueDefault.push(0);
					cityPickerValueDefault.push(0);
				}

				this.cityPickerValueDefault = cityPickerValueDefault;
			},
			//保存企业信息
			updateEnterpriseInfo() {
				let paramsData = {
					logo: this.formData.logo,
					companyName: this.formData.companyName,
					workerCnt: this.formData.workerCnt,
					companyType: this.formData.companyType,
					industryName: this.industryName,
					regionName: this.cityLabel.replace(/-/g, ","),
					companyAddress: this.formData.companyAddress,
					companyPhone: this.formData.companyPhone,
					companyDesc: this.formData.companyDesc
				}
				updateEnterpriseInfo(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							title: "成功",
							icon: "none",
							duration: 1500
						});
						setTimeout(() => {
							uni.setStorageSync("needRefresh", 1);
							uni.navigateBack({
								delta: 1,
							})
						}, 1500);
					}
				});
			},
			getEnterpriseDetailsById() {
				let self = this;
				getPerEnterpriseInfo().then(res => {
					if (res.retCode === 0) {
						//处理选项值
						let result = res.data;
						if (!!result && result.regionName.indexOf(",") > -1) {
							self.cityLabel = result.regionName.replace(/\,/g, "-");
							let tmpArray = self.cityLabel.split("-");
							if (tmpArray.length) {
								let locationMap = {
									province: tmpArray[0],
									city: tmpArray[1],
									area: tmpArray[2] ? tmpArray[2] : tmpArray[1],
								};
								self.loadCityPickerDefault(locationMap);
							}
						} else {
							let locationMap = uni.getStorageSync("locationMap");

							if (locationMap) {
								self.loadCityPickerDefault(locationMap);
								self.cityLabel = locationMap.province + (locationMap.city ? '-' +
									locationMap
									.city : '') + (locationMap.area ? '-' + locationMap.area : '');
							}
						}
						if (result.companyType) {
							self.formData.companyType = result.companyType;
							self.companyTypeIndex = self.companyTypeList.findIndex(v => {
								return v.label === result.companyType
							});
						}

						if (result.workerCnt) {
							self.formData.workerCnt = result.workerCnt;
							self.workerCntIndex = self.workerCntList.findIndex(v => {
								return v.label === result.workerCnt
							});
						}

						self.formData.userName = !result.userName ? self.formData.userName : result
							.userName;
						self.formData.userId = !result.userId ? self.formData.userId : result.userId;
						self.formData.logo = result.logo;
						self.formData.companyName = result.companyName;
						self.formData.industryName = result.industryName;
						self.formData.companyAddress = result.companyAddress;
						self.formData.companyPhone = result.companyPhone;
						self.formData.companyDesc = result.companyDesc;
						self.formData.id = result.id;
					}
				});
			},
			beforeSelectImage() {
				//#ifndef APP-PLUS
				this.selectImage();
				//#endif
				//#ifdef APP-PLUS
				let platform = uni.getStorageSync("platform");
				if (platform === 'ios') {
					this.selectImage();
				} else if (platform === 'android') {
					let self = this;
					uni.showActionSheet({
						itemList: ['拍摄', '从相册选择'],
						success: function(res) {
							if (res.tapIndex === 0) {
								let permission = uni.getStorageSync("permission");
								if (!permission || !permission.camera) {
									uni.showModal({
										title: '提示',
										content: '在上传企业Logo时，需要调用摄像头拍照功能，请确认同意，否则将无法使用此项功能',
										showCancel: false,
										confirmText: '我知道了',
										success: function(res0) {
											if (res0.confirm) {
												if (checkCamera()) {
													self.selectImage(["camera"])
												}
											}
										}
									});

								} else if (permission.camera === -1) {
									uni.showToast({
										title: '您已拒绝使用您的摄像头功能！',
										icon: 'none',
										duration: 2000,
									})
								} else if (permission.camera === 1) {
									self.selectImage(['camera']);
								}
							} else if (res.tapIndex === 1) {
								let permission = uni.getStorageSync("permission");
								if (!permission || !permission.storage) {
									uni.showModal({
										title: '提示',
										content: '在上传企业Logo时，需要调用您的本地存储功能，请确认同意，否则将无法使用此项功能',
										showCancel: false,
										confirmText: '我知道了',
										success: function(res0) {
											if (res0.confirm) {
												if (checkAlbum()) {
													self.selectImage(["album"])
												}
											}
										}
									});

								} else if (permission.storage === -1) {
									uni.showToast({
										title: '您已拒绝使用您的本地存储功能！',
										icon: 'none',
										duration: 2000,
									})
								} else if (permission.storage === 1) {
									self.selectImage(['album']);
								}
							}
						}
					})
				}
				//#endif
			},

			//选择企业logo
			selectImage(sourceType) {
				if (!sourceType) {
					sourceType = ['album', 'camera'];
				}

				let self = this
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: sourceType,
					success: function(res) {
						let filePathArray = res.tempFilePaths
						let fileArray = res.tempFiles
						// #ifdef H5
						if (filePathArray.length > 1) {
							filePathArray = filePathArray.slice(0, 1)
							fileArray = fileArray.slice(0, 1)
						}
						// #endif
						self.handleEachFile(filePathArray, fileArray)
					},
					fail: function(res) {
						//#ifdef APP-PLUS
						console.log(res);
						if (res.errMsg.indexOf("No Permission") > -1) {
							if (sourceType.length === 1) {
								let permission = uni.getStorageSync("permission");
								if (!permission) {
									permission = {};
								}
								if (sourceType[0] === 'album') {
									permission.storage = 0;
								}else if(sourceType[0] === 'camera'){
									permission.camera = 0;
								}
								uni.setStorageSync("permission",permission);
							}
						}
						//#endif
					}
				})
			},
			async handleEachFile(filePathArray, fileArray) {
				for (let i = 0; i < filePathArray.length; i++) {
					let imgFilePath = filePathArray[i];
					// #ifdef H5
					const file = await imgCompress(imgFilePath, (imgFilePath.size > 1024 * 1024 * 0.5) ? 0.2 :
						0.8);
					this.uploadImage(file);
					// #endif
					// #ifndef H5 
					const scale = await getImageInfo(imgFilePath);
					if (!scale) {
						this.uploadImage(imgFilePath);
					} else {
						const file = await compressImage(imgFilePath, scale);
						this.uploadImage(file);
					}
					// #endif
				}
			},

			//图片上传
			async uploadImage(data) {
				const imgData = await uploadImg(data);
				if (imgData && imgData.length > 0) {
					this.formData.logo = imgData[0].webPath;
				}
			},

			getCompanyStaffCntAll() {
				let self = this;
				getCompanyStaffCntEnum().then(res => {
					if (res.retCode === 0) {
						self.workerCntList.splice(0, self.workerCntList.length);
						res.data.forEach(item => {
							self.workerCntList.push({
								label: item.name,
								value: item.code,
							})
						});

						self.getCompanyTypeList();
					}
				});
			},
			//获取所有企业类型列表
			getCompanyTypeList() {
				let self = this;
				getCompanyTypeEnum().then(res => {
					if (res.retCode === 0) {
						self.companyTypeList.splice(0, self.companyTypeList
							.length);
						res.data.forEach(item => {
							self.companyTypeList.push({
								label: item.name,
								value: item.code,
							})
						});

						self.getEnterpriseDetailsById();
					}
				});
			},

			//选择企业人数
			workerCntChange(e) {
				this.workerCntIndex = e.detail.value
				this.formData.workerCnt = this.workerCntList[this.workerCntIndex].label;
			},
			//选择企业类型
			companyTypeChange(e) {
				this.companyTypeIndex = e.detail.value;
				this.formData.companyType = this.companyTypeList[this.companyTypeIndex].label;
			},

		},
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;

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
						padding: 10rpx 0;

						.uni-forms-item__label {
							padding-left: 20rpx;
							font-size: 28rpx;

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

	::v-deep .uni-easyinput {
		.uni-easyinput__content {
			border-radius: 6rpx;
			display: flex;

			.uni-easyinput__content-input {
				font-size: 28rpx;
				padding: 0 20rpx;
				width: 400rpx;

				.uni-input-wrapper {

					.uni-input-placeholder {
						font-size: 28rpx;
					}
				}
			}

			.uni-easyinput__content-textarea {
				width: 400rpx;
				min-height: 100rpx;
				padding: 16rpx 20rpx;

				.uni-textarea-wrapper {
					min-height: 120rpx;

					.uni-textarea-placeholder {
						font-size: 28rpx;
					}

					.uni-textarea-textarea {
						font-size: 28rpx;
					}
				}
			}
		}

		.is-disabled {
			padding-right: 0 !important;
			text-align: right;
			text-align: -webkit-right;
			background-color: transparent !important;
			color: #999999;
		}
	}
</style>