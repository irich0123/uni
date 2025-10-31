<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="承接发布" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>

			<uni-forms labelPosition="left" validateTrigger="bind" :modelValue="workOrder" border>
				<view class="bg-white radius margin-bottom-sm">
					<uni-forms-item label="需求：" name="title" required>
						<uni-easyinput type="textarea" v-model="workOrder.title" :clearable="false"
							placeholder="请输入我可以承接什么样的活,我擅长做什么样的产品" autoHeight maxlength="498" :inputBorder="false" />
					</uni-forms-item>
				</view>

				<!--        图片开始-->
				<view class="margin-bottom-sm radius-s bg-white flex flex-direction padding-tb-ssm padding-lr text-df">
					<view class="padding-tb-sm flex">
						<text class="text-theme margin-right-xxs text-bold">*</text>
						<text class="padding-right-sm">工厂或产品图片</text>
						<uni-icons type="help" size="18" @click="helpClicked(4)" :color="theme?'#333':'#ccc'" />
					</view>
					<upload-img-bar @changed="mediaChanged" :img-list="uploadImgList" :img-length-max="5"
						ref="uploadImgBar" />
				</view>
				<!--        图片结束-->

				<!--        加工时间地点开始-->
				<view class="bg-white radius margin-bottom-sm">
					<uni-forms-item label="行业：" required name="industry">
						<picker mode="selector" @change="industryChange" :value="industryIndex" :range="industryList">
							<view class="flex">
								<view class="text-black-4">{{ workOrder.industry }}</view>
								<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>

					<uni-forms-item label="有效期：" name="expireDate">
						<picker mode="date" :value="workOrder.expireDate" :start="expireStartTime" :end="expireEndTime"
							@change="expireDateChange">
							<view class="flex">
								<view class="text-black-4">{{ workOrder.expireDate }}</view>
								<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
							</view>
						</picker>
					</uni-forms-item>
				</view>

				<view class="bg-white radius margin-bottom-sm">
					<uni-forms-item label="展示城市：" name="whereShow" label-width="130">
						<template v-slot:help>
							<uni-icons size="18" type="help" @click="helpClicked(3)" :color="theme?'#333':'#ccc'" />
						</template>
						<template v-slot:default>
							<picker mode="selector" @change="whereShowChange" :value="whereShowIndex"
								:range="whereShowList">
								<view class="flex">
									<view class="text-black-4">{{ workOrder.whereShow }}</view>
									<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
								</view>
							</picker>
						</template>
					</uni-forms-item>

					<uni-forms-item label="所在城市：" required name="city" labelWidth="120" @click.native="loadCity"
						v-show="showCityOption">
						<uni-easyinput type="text" v-model="cityLabel.name" :clearable="false" disabled
							placeholder="请选择" :inputBorder="false" />
						<uni-icons type="forward" size="18" color="#cccccc"></uni-icons>
					</uni-forms-item>

				</view>
				<!--        加工时间地点结束-->

				<view class="bg-white radius margin-bottom-sm">
					<uni-forms-item label="备注：" name="desc">
						<uni-easyinput type="textarea" v-model="workOrder.desc" :clearable="false"
							placeholder="请输入工人数量、厂房面积、机械设备等" autoHeight maxlength="980" :inputBorder="false" />
					</uni-forms-item>
				</view>

				<view class="bg-white radius margin-bottom-sm">
					<uni-forms-item label="联系方式：" name="mobile">
						<uni-easyinput type="number" v-model="workOrder.mobile" :clearable="false" disabled
							:inputBorder="false" />
					</uni-forms-item>

					<uni-forms-item label="自动刷新：" name="isRefresh">
						<switch :checked="workOrder.isRefresh" color="#fb5318" @change="switchChange"></switch>
					</uni-forms-item>
				</view>

				<view class="blank"></view>

			</uni-forms>
		</scroll-view>

		<!--        底部按钮-->
		<view class="bg-white" style="width: 100%;position:fixed;left:0;bottom:0;z-index: 19;">
			<view class="bg-light-yellow text-sm flex align-center justify-start padding-tb-xss padding-lr">
				<checkbox-group @change="checkChanged">
					<checkbox :checked="isAgree" shape="square" :value="'1'" />
				</checkbox-group>
				<text class="text-theme padding-left-xs">本人确认以上信息真实有效，并愿承担相关法律责任</text>
			</view>
			<button class="bg-theme theme-border text-xl color-white radius-0" @click="submit">确认发布</button>
		</view>

		<mpvue-city-picker ref="mpvueCityPicker" :pickerValueDefault="cityPickerValueDefault"
			@onConfirm="onConfirmCity"></mpvue-city-picker>

	</view>

</template>

<script>
	import {
		imgUrl,active
	} from "@/utils/config";
	import UniForms from "../../components/uni-forms/uni-forms";
	import uniFormsItem from "../../components/uni-forms-item/uni-forms-item";
	import UniIcons from "../../components/uni-icons/uni-icons";
	import uploadImgBar from "../../utils/yjg-upload/upload-img-bar";
	import UniEasyInput from "../../components/uni-easyinput/uni-easyinput";
	import mpvueCityPicker from '../../components/mpvue-citypicker/src/mpvueCityPicker';
	import {
		deleteStringVal,
		parseActionConsume,
		formatTimeNoHour,
		parseShortAddress,
		shortArea,
		shortCity,
		shortProvince,
		regexDateStringToTimestamp
	} from "@/utils/myUtil";
	import provinceData from "../../components/mpvue-citypicker/src/city-data/province";
	import cityData from "../../components/mpvue-citypicker/src/city-data/city";
	import areaData from "../../components/mpvue-citypicker/src/city-data/area";

	import {
		getWorkOrderDetailsByIdAnon,
		postWorkOrder
	} from "@/api/workinfo";
	import UploadImgBar from "../../utils/yjg-upload/upload-img-bar";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "dowork",
		components: {
			uploadImgBar,
			UniForms,
			uniFormsItem,
			UniIcons,
			UniEasyInput,
			mpvueCityPicker,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				whereShowIndex: 0,
				whereShowList: ["同城", "本市", "本省", "自选地区"],
				showCityOption: false,

				workOrder: {
					id: null,
					no: null,
					title: null,
					industry: '',
					desc: null,
					expireDate: null,
					whereShow: '',
					mobile: '',
					isRefresh: false,
				},

				industryIndex: 0,
				industryList: [],

				expireStartTime: null,
				expireEndTime: null,

				isSubmitting: false,

				uploadImgList: [],

				isAgree: true,

				token: null,
				userData: {},
				cityShow: null,
				location: null,

				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,

				theme: null,

				cityLabel: {
					nane: null,
					code: null,
				},
				cityPickerValueDefault: [0, 0, 0],
			}
		},
		watch: {
			statusbarHeight: {
				//scroll-view 带uni-forms组件 需要另外+40, 否则ios真机底部按钮会被遮挡
				handler(newVal, oldVal) {
					//#ifndef H5
					this.contentTop = newVal + 40;
					this.listHeight = uni.getWindowInfo().safeArea.height - newVal + 40;
					//#endif
					// #ifdef H5
					this.listHeight = uni.getWindowInfo().safeArea.height - (active === 'prod' ? 0 : 40);
					// #endif
				},
				immediate: true
			}
		},
		onLoad(options) {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");
			this.cityShow = uni.getStorageSync('cityShow');
			this.location = uni.getStorageSync('locationMap');

			cityData.forEach(v => {
				v.unshift({
					label: '全省',
					value: null,
				})
			})

			areaData.forEach(v => {
				v.forEach(u => {
					u.unshift({
						label: '全市',
						value: null,
					})
				})
				v.unshift([{
					label: '',
					value: null,
				}])
			})


			if (!!options.id) {
				this.workOrder.id = parseInt(options.id);
			}

			if (!this.workOrder.id) {
				this.initCityPicker();
			}

			// #ifdef APP-PLUS
			this.theme = uni.getStorageSync("theme");
			// #endif

			//初始化基础数据
			this.getIndustryReal();

			this.generateTimeDuration();
			this.initForm();

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token');
			this.userData = uni.getStorageSync("user");
			this.cityShow = uni.getStorageSync('cityShow');
			this.location = uni.getStorageSync('locationMap');

			if (!this.token) {
				this.toLogin();
				return;
			}

			// #ifdef APP-PLUS
			uni.onThemeChange((res) => {
				this.theme = (res.theme === 'light' ? 1 : 0);
			})
			// #endif

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
				if (!!this.workOrder.id) {
					uni.setNavigationBarTitle({
						title: "承接信息编辑"
					});
					this.getWorkOrderById();
				} else {
					this.workOrder.mobile = this.userData.mobile;
				}
			},
			toLogin() {
				uni.showToast({
					icon: 'none',
					title: '请登录...',
					duration: 100
				});
				uni.navigateTo({
					url: '../login/login'
				})
			},
			helpClicked(index) {
				let message = "";
				if (index === 3) {
					message = "指定信息展示在哪个城市，比如您所在的城市";
				} else if (index === 4) {
					message = "上传工厂或产品图片，有力证明自己的生产加工能力，和买家快速建立信任！";
				}
				uni.showModal({
					title: '帮助信息',
					content: message,
					confirmText: 'OK',
					showCancel: false,
					confirmColor: "#fb5318",
				})
			},
			generateTimeDuration() {
				let day = 24 * 3600 * 1000;
				this.expireStartTime = formatTimeNoHour(new Date(new Date().getTime() + day));
				this.expireEndTime = formatTimeNoHour(new Date(new Date().getTime() + 30 * day));
				this.workOrder.expireDate = formatTimeNoHour(new Date(new Date().getTime() + 10 * day));
			},
			initForm() {
				if (this.industryIndex != null) {
					this.workOrder.industry = this.industryList[this.industryIndex];
				}
				if (this.whereShowIndex != null) {
					this.workOrder.whereShow = this.whereShowList[this.whereShowIndex];
				}
			},
			initCityPicker() {
				if (!this.cityLabel || !this.cityLabel.name) {
					let location = uni.getStorageSync('locationMap');
					if (location) {
						this.cityLabel.name = location.province + (location.city ? '-' + location.city : '') + (location
							.area ?
							'-' + location.area : '');
					}
					//初始化城市
					this.loadCityPickerDefault({
						province: location.province,
						city: location.city,
						area: location.area ? location.area : location.city,
					});
				}
			},
			industryChange(e) {
				this.industryIndex = e.detail.value;
				this.workOrder.industry = this.industryList[this.industryIndex];
			},

			whereShowChange(e) {
				this.whereShowIndex = e.detail.value;
				this.workOrder.whereShow = this.whereShowList[this.whereShowIndex];
				this.showCityOption = this.workOrder.whereShow.indexOf("自选") > -1;
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

				this.cityLabel.name = provinceData[cityPickerValueDefault[0]].label +
					'-' + cityData[cityPickerValueDefault[0]][cityPickerValueDefault[1]].label +
					'-' + areaData[cityPickerValueDefault[0]][cityPickerValueDefault[1]][cityPickerValueDefault[2]].label;
				this.cityLabel.code = areaData[cityPickerValueDefault[0]][cityPickerValueDefault[1]][
						cityPickerValueDefault[2]
					]
					.value;
			},
			loadCity() {
				this.$refs.mpvueCityPicker.show();
			},
			onConfirmCity(e) {
				this.cityPickerValueDefault = e.value;
				this.cityLabel.name = e.label;
				this.cityLabel.code = areaData[this.cityPickerValueDefault[0]][this.cityPickerValueDefault[1]][this
					.cityPickerValueDefault[2]
				].value;
			},
			getIndustryReal() {
				let industryList = uni.getStorageSync("allIndustry");
				if (!!industryList) {
					this.industryList = industryList.filter(v => !!v.id).map(v => v.industry);
				}
			},

			//根据承接id获取详情
			getWorkOrderById() {
				let paramsData = {
					id: this.workOrder.id,
				}
				let self = this;
				getWorkOrderDetailsByIdAnon(paramsData).then(res => {
					if (res.retCode === 0) {
						let workOrder = res.data;

						if (workOrder.industry) {
							this.industryIndex = this.industryList.findIndex(v => {
								return v === workOrder.industry
							});
							if (this.industryIndex == null) {
								this.industryList.push(workOrder.industry);
								this.industryIndex = this.industryList.length - 1;
							}
						}

						let whereShowArray = ["同城", "本市", "本省"];
						let whereShow = "";
						for (let i = 0; i < whereShowArray.length; i++) {
							let showAddress = self.parseAddress(whereShowArray[i], workOrder.addressDetails);

							if (showAddress === self.cityShow) {
								whereShow = whereShowArray[i];
								self.whereShowIndex = i;
								break;
							}
						}

						if (!whereShow) { //认为是自选
							whereShow = "自选地区";
							self.whereShowIndex = self.whereShowList.findIndex(v => v === whereShow);

							let arr = workOrder.addressDetails.split(",");
							if (arr.length > 0) {
								self.loadCityPickerDefault({
									province: arr[0],
									city: arr.length > 1 ? arr[1] : '',
									area: arr.length > 2 ? arr[2] : '',
								});
							}
							self.showCityOption = true;
						}

						workOrder.whereShow = whereShow;

						if (!workOrder.usefulTimeStamp || workOrder.usefulTimeStamp < new Date().getTime()) {
							workOrder.usefulTimeStamp = new Date().getTime();
						}
						workOrder.expireDate = formatTimeNoHour(new Date(workOrder.usefulTimeStamp));

						if (!!workOrder.img) {
							self.uploadImgList = JSON.parse(workOrder.img)
						}
						workOrder.mobile = self.userData.mobile;

						self.workOrder = workOrder;
					}
				});
			},

			//选择有效期
			expireDateChange(e) {
				this.workOrder.expireDate = e.detail.value;
			},

			//两小时自动刷新
			switchChange(e) {
				let self = this
				this.workOrder.isRefresh = !this.workOrder.isRefresh;
				let goldCount = parseActionConsume("信息自动两小时刷新", this.userData.userVerifyStatus, this.userData
					.withValidBeanCard);

				if (!!e.target.value) {
					uni.showModal({
						title: '小二提示',
						content: '开通每两小时刷新一次功能，将扣除' + (!!goldCount ? goldCount : 5) + '颗金豆，是否开通？',
						confirmText: '确认',
						cancelText: "取消",
						cancelColor: "#999999",
						confirmColor: "#fb5318",
						success: function(res) {
							if (res.confirm) {
								self.workOrder.isRefresh = true
							} else if (res.cancel) {
								self.workOrder.isRefresh = false
							}
						}
					})
				} else {
					self.workOrder.isRefresh = false
				}
			},
			//是否同意
			checkChanged(e) {
				if (!!e.detail.value && !!e.detail.value[0]) {
					this.isAgree = true;
				} else {
					this.isAgree = false;
				}
			},
			validate() {
				if (!this.workOrder.title) {
					uni.showToast({
						icon: 'none',
						title: '请输入相关承接信息',
						duration: 3000
					})
					return false;
				}

				//图片校验
				if (this.uploadImgList.length === 0) {
					uni.showToast({
						icon: 'none',
						title: '至少上传一张图片',
						duration: 3000
					})
					return false;
				}

				if (!this.isAgree) {
					uni.showToast({
						icon: 'none',
						title: '请勾选确认信息真实有效！',
						duration: 3000
					})
					return false;
				}
				return true;
			},
			submit() {
				if (!this.validate()) {
					return;
				}

				if (this.isSubmitting) {
					return
				}
				this.isSubmitting = true

				let paramsData = {
					id: this.workOrder.id,
					no: this.workOrder.no,
					title: this.workOrder.title,
					desc: this.workOrder.desc,
					industry: this.workOrder.industry,
					usefulTimeStamp: regexDateStringToTimestamp(this.workOrder.expireDate + 'T00:00:00'), //加10000是必须的
					mobile: this.workOrder.mobile,
					isRefresh: this.workOrder.isRefresh,
				}

				//这里的address 和 addressDetail需要前端自己计算
				if (this.workOrder.whereShow.indexOf("自选") > -1) {
					paramsData["addressDetails"] = shortProvince(provinceData[this.cityPickerValueDefault[0]].label) +
						(!cityData[this.cityPickerValueDefault[0]][this.cityPickerValueDefault[1]].value ? '' : (',' +
							shortCity(cityData[this.cityPickerValueDefault[0]][this.cityPickerValueDefault[1]].label))) +
						(!areaData[this.cityPickerValueDefault[0]][this.cityPickerValueDefault[1]][this
							.cityPickerValueDefault[2]
						].value ? '' : (',' +
							shortArea(areaData[this.cityPickerValueDefault[0]][this.cityPickerValueDefault[1]][this
								.cityPickerValueDefault[2]
							].label)));
					paramsData["address"] = parseShortAddress(this.workOrder.whereShow, paramsData["addressDetails"]);
				} else {
					if (!!this.location) {
						paramsData["addressDetails"] = shortProvince(this.location.province) +
							(this.location.city ? ',' + shortCity(this.location.city) : '') +
							(this.location.area ? ',' + shortArea(this.location.area) : '');
					}
					paramsData["address"] = this.cityShow;
				}

				paramsData['img'] = JSON.stringify(this.uploadImgList);

				let self = this
				postWorkOrder(paramsData).then(res => {
					if (res.retCode === 0) {
						uni.showToast({
							icon: 'none',
							title: '信息提交成功，待平台审核通过后，即会展出',
							duration: 3000
						})
						setTimeout(() => {
							uni.navigateBack({
								delta: 1,
							})
						}, 3000)
					} else {
						self.isSubmitting = false;
					}
				}).catch(() => {
					self.isSubmitting = false;
				});
			},
			parseAddress(whereShow, address) {
				let addressArray = address.split(",");

				let lastItem = addressArray[addressArray.length - 1];
				if (lastItem.indexOf("区") === lastItem.length - 1) {
					addressArray.splice(addressArray.length, 1);
				}

				if (addressArray.length >= 2) {
					if (addressArray[1].indexOf("市辖") > -1) {
						addressArray.splice(1, 1);
					}
				}

				let supperCities = ["北京", "上海", "天津", "重庆"];
				if (supperCities.indexOf(addressArray[0].substring(0, 2)) > -1) {
					return addressArray[0].substring(0, 2);
				}

				let result = addressArray[addressArray.length - 1];

				switch (addressArray.length) {
					case 1:
						result = addressArray[0];
						break
					case 2:
						switch (whereShow) {
							case "同城":
							case "本市":
								result = addressArray[1];
								break;
							case "本省":
								result = addressArray[0];
								break;
							default:
								break;
						}
						break;
					case 3:
						switch (whereShow) {
							case "同城":
								result = addressArray[2];
								break;
							case "本市":
								result = addressArray[1];
								break;
							case "本省":
								result = addressArray[0];
								break;
							default:
								break;
						}
						break;
					default:
						break;
				}
				return deleteStringVal(result);
			},
			mediaChanged(e) {
				this.uploadImgList.splice(0, this.uploadImgList.length);
				e.list.forEach(v => {
					this.uploadImgList.push(v);
				})
			},
		},

		/**
		 * 用户点击右上角分享 ---小程序
		 */
		onShareAppMessage: function(ops) {
			return {
				title: '云加工小程序',
				path: '/pages/index/index',
				imageUrl: this.imgUrl + '/share.png',
				success: function(res) {
					console.log("转发成功:" + JSON.stringify(res));
				},
				fail: function(res) {
					// 转发失败
					console.log("转发失败:" + JSON.stringify(res));
				}
			}
		},
	}
</script>

<style scoped lang="scss">
	::v-deep .uni-easyinput {

		.uni-easyinput__content {
			border-radius: 6rpx;
			display: flex;

			.uni-easyinput__content-input {
				font-size: 28rpx;

				.uni-input-wrapper {

					.uni-input-placeholder {
						font-size: 28rpx;
					}
				}

				color: #191919;
			}

			.uni-easyinput__content-textarea {
				min-width: 450rpx;
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

		.blank {
			height: 240rpx;
		}
	}

	/* #ifdef MP-WEIXIN  */
	::v-deep checkbox .wx-checkbox-input {
		border-color: #fb5318 !important;
		color: #fb5318 !important;
		border-radius: 8rpx;
	}

	::v-deep checkbox {
		transform: scale(0.65);
	}

	/* #endif  */

	/* #ifndef MP-WEIXIN  */
	/* checkbox 边框颜色 */
	::v-deep uni-checkbox .uni-checkbox-input {
		border-color: #fb5318 !important;
		transform: scale(0.45);
		padding: 6rpx !important;
		border-radius: 80rpx !important;
	}

	/* checkbox 选中后的边框颜色 */
	::v-deep uni-checkbox .uni-checkbox-input-checked {
		border-color: #fb5318 !important;
	}

	/* checkbox 选中后的样式 */
	::v-deep uni-checkbox .uni-checkbox-input.uni-checkbox-input-checked {
		background-color: #fb5318 !important;
		border-color: #fb5318 !important;
		background-clip: content-box !important;
		padding: 6rpx !important;
	}

	/* checkbox 选中后的图标样式*/
	::v-deep uni-checkbox .uni-checkbox-input.uni-checkbox-input-checked::before {
		display: none !important;
	}

	/* #endif  */
</style>