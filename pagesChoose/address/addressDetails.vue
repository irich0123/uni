<template>
	<view class="container flex flex-direction no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar :title="title" @action="navAction" @reSize="reSize" />
		<!-- #endif -->
		
		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>
			<view class="margin-sm padding-ssm radius-s bg-white">
				<view class="text-df text-black padding-tb gray-border-bottom flex align-center justify-between">
					<input type="text" placeholder="请输入姓名" v-model="userName" />
				</view>
				<view class="text-df text-black padding-tb gray-border-bottom flex align-center justify-between">
					<input type="number" placeholder="请输入手机号码" v-model="mobile" />
					<uni-icons type="staff" size="24" color="#cccccc"></uni-icons>
				</view>
				<view class="text-df text-black padding-tb gray-border-bottom flex align-center justify-between"
					@click="loadCity">
					<input type="text" disabled placeholder="请选择省市区" v-model="cityLabel" />
					<uni-icons type="forward" size="22" color="#cccccc"></uni-icons>
				</view>

				<view class="text-df text-black padding-tb gray-border-bottom flex align-center justify-between">
					<textarea placeholder="请填写您的详细地址(门牌号码)" v-model="addressDetails"></textarea>
				</view>

				<view class="text-df text-black padding-tb flex align-center justify-between">
					<view>
						设为默认地址
					</view>
					<view class="switch">
						<switch color="#fb5318" :checked="isDefault" @change="switch1Change" />
					</view>

				</view>
			</view>

			<view class="blank"></view>

		</scroll-view>
		
		<view class="bg-white" style="width: 100%;position: fixed;left: 0;bottom: 0;z-index: 19;">
			<button class="bg-theme theme-border text-xl color-white radius-0" @click="submitAddress"
				:disabled="btnDisabled">保存</button>
		</view>

		<mpvue-city-picker ref="mpvueCityPicker" theme-color="#fb5318" :pickerValueDefault="cityPickerValueDefault"
			@onConfirm="onConfirmCity" />
	</view>
</template>

<script>
	import UniIcons from '../../components/uni-icons/uni-icons.vue'
	import mpvueCityPicker from '../../components/mpvue-citypicker/src/mpvueCityPicker';
	import areaData from "../../components/mpvue-citypicker/src/city-data/area";
	import cityData from "../../components/mpvue-citypicker/src/city-data/city";
	import provinceData from "../../components/mpvue-citypicker/src/city-data/province";
	import {
		createAddress,
		getAddressDetailById,
		updateAddress
	} from "@/api/user";
	import {
		regex,active
	} from "@/utils/config";
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "addressDetails",
		components: {
			UniIcons,
			mpvueCityPicker,
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				token: null,
				userName: '',

				mobile: '',
				addressDetails: '',
				isDefault: true,
				id: null,
				btnDisabled: true,

				cityValue: null,
				cityLabel: null,
				cityPickerValueDefault: [0, 0, 0],
				cityPickerValueArray: [],

				title: "",
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
			'allInputField': function(val) {
				this.btnDisabled = !(!!val.userName && !!val.mobile && (new RegExp(regex.mobile)).test(val.mobile) &&
					!!val.addressDetails && !!val.cityLabel);
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
				immediate: true,
			}
		},
		computed: {
			'allInputField': function() { //同时监控多个输入表单
				const {
					userName,
					mobile,
					cityLabel,
					addressDetails
				} = this;
				return {
					userName,
					mobile,
					cityLabel,
					addressDetails
				};
			}
		},
		onLoad(options) {
			this.id = parseInt(options.id);

			this.initData();
		},
		onShow() {
			this.token = uni.getStorageSync('token')

			if (!this.token) {
				this.toLogin();
			}

			// #ifdef H5
			uni.setNavigationBarTitle({
				title: !!this.id ? '修改地址' : '添加地址',
			});
			// #endif
			// #ifndef H5
			this.title = !!this.id ? '修改地址' : '添加地址';
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
				if (!!this.id) {
					this.getAddressDetailById()
				} else {
					this.initCity();
				}
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
			initCity() {
				let location = uni.getStorageSync('locationMap');
				if (location) {
					this.cityLabel = location.province + (location.city ? '-' + location.city : '') + (location.area ?
						'-' + location.area : '');
				}
				//初始化城市
				this.loadCityPickerDefault({
					province: location.province,
					city: location.city,
					area: location.area ? location.area : location.city,
				});
			},
			//获取地址详情
			getAddressDetailById() {
				let paramsData = {
					id: this.id
				}
				let self = this;
				getAddressDetailById(paramsData).then(res => {
					if (res.retCode === 0) {
						self.cityLabel = res.data.addr.replace(/\,/g, "-");
						let tmpArray = self.cityLabel.split("-");
						if (tmpArray.length) {
							let locationMap = {
								province: tmpArray[0],
								city: tmpArray[1],
								area: tmpArray[2] ? tmpArray[2] : tmpArray[1],
							};
							self.loadCityPickerDefault(locationMap);
						}

						self.userName = res.data.realName
						self.addressDetails = res.data.addressDetail
						self.mobile = res.data.mobile
						self.isDefault = res.data.isDefaultAddress === 1;
					}
				});
			},
			//数据校验
			verification() {
				if (!this.userName) {
					uni.showToast({
						title: '请输入收件人姓名',
						icon: "none",
						duration: 1500
					})
					return false;
				}
				if (!(new RegExp(regex.mobile)).test(this.mobile)) {
					uni.showToast({
						title: '请输入正确格式的收件人电话',
						icon: "none",
						duration: 1500
					})
					return false;
				}
				if (!this.cityLabel) {
					uni.showToast({
						title: '请选择您的省市区',
						icon: "none",
						duration: 1500
					})
					return false;
				}

				if (!this.addressDetails) {
					uni.showToast({
						title: '请输入您的详细地址',
						icon: "none",
						duration: 1500
					})
					return false;
				}
				return true;
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
			loadCity() {
				this.$refs.mpvueCityPicker.show();
			},
			onConfirmCity(e) {
				this.cityPickerValueDefault = e.value;
				this.cityLabel = e.label;
				this.cityValue = e.value[0];
			},
			submitAddress() {
				if (!this.verification()) {
					return
				}
				let paramsData = {
					addr: this.cityLabel,
					realName: this.userName,
					addressDetail: this.addressDetails,
					mobile: this.mobile,
					isDefaultAddress: this.isDefault ? 1 : 0
				}
				if (this.id) {
					paramsData['id'] = this.id
					updateAddress(paramsData).then(res => {
						if (res.retCode === 0) {
							uni.showToast({
								title: '修改成功！',
								icon: "none",
								duration: 1500
							})
							setTimeout(() => {
								uni.setStorageSync("needRefresh", 1)
								uni.navigateBack({
									delta: 1
								})
							}, 1500)
						}
					});
				} else {
					createAddress(paramsData).then(res => {
						if (res.retCode === 0) {
							uni.showToast({
								title: '添加成功！',
								icon: "none",
								duration: 1500
							})
							setTimeout(() => {
								uni.setStorageSync("needRefresh", 1)
								uni.navigateBack({
									delta: 1
								})
							}, 1500)
						}
					});
				}
			},
			switch1Change: function(e) {
				this.isDefault = e.target.value;
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;
	}

	::v-deep .uni-input-placeholder,
	.uni-textarea-placeholder {
		color: #aaaaaa;
	}
</style>