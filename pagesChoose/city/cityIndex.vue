<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="城市选择" @action="navAction" @reSize="reSize" />
		<!-- #endif -->

		<view class="bg-white flex" :style="'padding-top:'+contentTop+'px;'">
			<view class="flex-grow" :style="{height: windowHeight}">
				<scroll-view scroll-y="true" style="width:100%;height:100%;" scroll-with-animation
					:scroll-into-view="cityId">
					<view id="top"></view>
					<!--            系统定位的城市开始-->
					<view class="text-df color-black padding-left padding-tb-sm gray-border-bottom"
						@click="cityLocateTap">
						<text class="text-gray-4 margin-right-sm">定位城市</text>
						<text class="text-theme margin-left-sm">{{ gpsCity.showName }}</text>
					</view>
					<!--            系统定位的城市结束-->

					<!--            历史城市开始-->
					<view class="padding-top-ssm bg-white text-df gray-border-bottom" v-if="showHistoryBox">
						<view class="padding-tb-ssm text-gray-4 padding-left flex align-center justify-between">
							<view>历史城市</view>
							<view class="flex align-center" @click.stop="deleteHistory">
								<image class="new_img" :src="imgUrl+'/index/empty.png'"></image>
								<view class="margin-left-xxs">清空</view>
							</view>
						</view>

						<view class="flex flex-wrap">
							<text class="text-center padding-tb-ssm bg-white radius-s margin-bottom-sm margin-left-sm"
								style="width: 200rpx;" v-for="(item,index) in historyCityList" :key="index"
								data-types="history" @click.stop="cityTap(item)">{{ item.showName }}
							</text>
						</view>
					</view>
					<!--            历史城市结束-->

					<!--            热门城市开始-->
					<view class="padding-top-ssm bg-white text-df gray-border-bottom">
						<view class="padding-tb-ssm text-gray-4 padding-left flex align-center justify-between">热门城市
						</view>
						<view class="flex flex-wrap">
							<text
								class="text-center padding-tb-ssm bg-white radius-s margin-bottom-sm margin-left-sm text-df"
								style="width: 200rpx;" v-for="(item,index) in hotCityList" :key="index"
								@click.stop="cityTap(item)">{{ item.showName }}
							</text>
						</view>
					</view>
					<!--            热门城市结束-->

					<view>
						<view class="flex flex-direction" v-for="(item,index) in cityList" :key="index">
							<view class="padding-left text-df text-gray-4 padding-tb-ssm" :id="item.letter">
								{{ item.letter }}
							</view>
							<view
								class="padding-tb-sm gray-border-bottom color-black padding-left-lg text-df flex flex-direction text-gray-4"
								@click.stop="cityTap(itemChild)" v-for="(itemChild,itemIndex) in item.data"
								:key="itemIndex">
								{{ itemChild.showName }}
							</view>
						</view>
					</view>
				</scroll-view>
			</view>

			<scroll-view scroll-y class="flex flex-direction margin-lr-sm align-center" style="width:80rpx"
				:style="{height: windowHeight}">
				<view class="text-ssm color-blue text-center padding-top-sm" v-for="(item,index) in letterList"
					:key="index" @click.stop="letterTap(item)">
					{{ item }}
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import cityArray from '@/utils/cityList.js'
	import {
		getWxLocationConfig
	} from "@/api/push";
	import {
		parseRegionByFullAddress,
		parseRegionByShortAddress,
		parseRegionSimple
	} from "@/api/api";
	import {
		getHotCityList
	} from "@/api/common";
	import {
		shortProvince,
		shortCity,
		deleteStringVal
	} from "@/utils/myUtil";
	import {
		imgUrl
	} from '@/utils/config'
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "cityIndex",
		components: {
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				windowHeight: '',
				cityList: [],
				cityId: '',
				newObj: {},
				hotCityList: [],
				historyCityList: [],
				gpsCity: {
					showName: "正在定位...",
					cityName: '',
				},
				showHistoryBox: false,
				//下面是字母排序
				letterList: ["0", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R",
					"S", "T", "U", "V", "W", "X", "Y", "Z"
				],

				oldCityShow: null,
				locateSuccess: false,

				imgUrl: imgUrl,
				statusbarHeight: 0,
				contentTop: 0,
			}
		},
		watch: {
			statusbarHeight: {
				handler(newVal, oldVal) {
					//#ifndef H5
					this.contentTop = newVal + 40;
					//#endif
				},
				immediate: true
			}
		},
		onLoad() {
			this.oldCityShow = uni.getStorageSync("cityShow");

			//动态获取屏幕高度
			this.windowHeight = (uni.getSystemInfoSync().windowHeight - this.contentTop) + 'px'

			this.cityList = cityArray.cities;

			this.historyCityList = uni.getStorageSync("historyCity");
			if (!this.historyCityList) {
				this.historyCityList = [];
			}

			this.showHistoryBox = this.historyCityList != null && this.historyCityList.length > 0;

			this.getHotCity();
			this.parseRegionOnIp();
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
			parseRegionOnIp() {
				let self = this;
				parseRegionSimple({}).then(res => {
					if (res.retCode === 0) {
						self.locateSuccess = true;

						let region = {
							province: res.data.province,
							city: res.data.city,
							area: res.data.district,
						}

						let cityShow = self.getCityShow(region);

						if (!!cityShow) {
							self.gpsCity.showName = cityShow;
							// self.gpsCity["location"] = location;
						} else {
							self.locationFailHandle();
						}
					}
				});
			},

			getCityShow(region) {
				console.log(region);
				let showNameStr = '';
				if (region.province.indexOf("市") > -1) {
					showNameStr = region.province
				} else if (!!region.city && region.city.indexOf("市辖") > -1) {
					showNameStr = region.province;
				} else if (!!region.area) {
					if (region.area.indexOf("区") > -1) { //包含区
						showNameStr = region.province + "," + region.city
					} else {
						showNameStr = region.province +
							(!!region.city ? (',' + region.city) : '') +
							(!!region.area ? (',' + region.area) : '');
					}
				} else {
					showNameStr = region.province +
						(!!region.city ? (',' + region.city) : '');
				}
				showNameStr = deleteStringVal(showNameStr)
				let cityArr = showNameStr.split(',');
				return cityArr[cityArr.length - 1];
			},

			cityLocateTap() {
				if (!this.locateSuccess) {
					uni.navigateBack({
						delta: 1,
					})
				} else {
					console.log(this.gpsCity);
					if (this.gpsCity.showName) {
						uni.setStorageSync("cityShow", this.gpsCity.showName);
						uni.setStorageSync("needRefresh", 1);
						// this.parseRegionByFullAddress(this.gpsCity.location);
						uni.navigateBack({
							delta: 1,
						})
					}
				}
			},
			//点击城市
			cityTap(item) {
				let city = item.showName;

				if (!!item.cityName && !item.location) {
					let arr = item.cityName.split(",");
					let location = {};
					if (arr.length === 1) {
						location["province"] = arr[0];
						location["city"] = null;
						location["area"] = null;
					} else if (arr.length === 2) {
						location["province"] = arr[0];
						location["city"] = arr[1];
						location["area"] = null;
					} else if (arr.length === 3) {
						location["province"] = arr[0];
						location["city"] = arr[1];
						location["area"] = arr[2];
					}
					item["location"] = location;
				}

				if (item.showName) {
					let self = this;
					let param = {
						cityName: city,
					}
					//说明是选出来的城市
					let tmpArray = item.showName.split(",");
					param.divisionType = tmpArray.length - 1;
					parseRegionByShortAddress(param).then(res => {
						if (res.retCode === 0) {
							item["location"]["code"] = res.data
							self.historyCityHandle(item);
							uni.setStorageSync("needRefresh", 1);
							uni.switchTab({
								url: '/pages/index/index'
							})
						}
					});
				} else {
					this.historyCityHandle(city);
					uni.setStorageSync("needRefresh", 1);
					uni.navigateBack({
						delta: 1,
					})
				}
			},
			historyCityHandle(item) {
				if (item.showName !== this.oldCityShow) {
					uni.setStorageSync("workOrderList_refresh", 1);
					uni.setStorageSync("releaseWorkList_refresh", 1);
				}
				uni.setStorageSync("cityShow", item.showName);
				uni.setStorageSync("locationMap", item.location);

				let idx = this.historyCityList.findIndex(v => {
					return v.showName === item.showName
				});
				if (idx === -1) {
					this.historyCityList.push(item);
				}
				uni.setStorageSync("historyCity", this.historyCityList);
			},
			//删除历史城市
			deleteHistory() {
				this.historyCityList.splice(0, this.historyCityList.length);
				uni.setStorageSync("historyCity", this.historyCityList);
				this.showHistoryBox = false
			},
			//获取热门城市
			getHotCity() {
				let self = this;
				getHotCityList().then(res => {
					if (res.retCode === 0) {
						res.data.data.hotCity.forEach(item => {
							item = item.replace(/S/g, "");
							item = item.replace(/D/g, "");
							let arr = item.split(":")
							let location = {};
							if (arr.length === 1) {
								location["province"] = arr[0];
								location["city"] = null;
								location["area"] = null;
							} else if (arr.length === 2) {
								location["province"] = arr[1];
								location["city"] = arr[0];
								location["area"] = null;
							} else if (arr.length === 3) {
								location["province"] = arr[2];
								location["city"] = arr[1];
								location["area"] = arr[0];
							}
							self.hotCityList.push({
								showName: arr[0],
								location: location,
							})
						});
					}
				});
			},

			parseRegionByFullAddress(location) {
				if (!location) {
					return;
				}

				let fullAddress = location.province + (location.city ? ',' + location.city : '') + (location.area ? ',' +
					location.area : '');
				let params = {
					fullAddress: fullAddress,
				}
				parseRegionByFullAddress(params).then(res => {
					if (res.retCode === 0) {
						location["code"] = res.data;
						uni.setStorageSync("locationMap", location);
						let short = deleteStringVal(this.getCityShow(this.gpsCity.location));
						uni.setStorageSync("cityShow", short);
						if (short !== this.oldCityShow) {
							uni.setStorageSync("workOrderList_refresh", 1);
							uni.setStorageSync("releaseWorkList_refresh", 1);
						}

						uni.setStorageSync("needRefresh", 1);

						uni.navigateBack({
							delta: 1,
						})
					}
				});
			},
			//点击城市字母
			letterTap(e) {
				if (e === '0') {
					this.cityId = "top";
				} else {
					this.cityId = e;
				}
			},

			locationFailHandle() {
				this.gpsCity.showName = "定位失败！"
				this.locateSuccess = false;
			},
		},
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.new_img {
		width: 30rpx;
		height: 30rpx;
	}
</style>