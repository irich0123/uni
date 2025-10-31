<template>
	<view class="container">
		<QSwiper :swiperItems="advertiseList" :swiperHeight="swiperHeight" autoplay circular :interval="6000"
			@advClick="advClicked" />
	</view>
</template>


<script>
	import {
		getAdvertVersionCode,
		queryAdverInfo,
	} from '@/api/common.js'
	import QSwiper from '@/components/QS-Swiper/QS-Swiper.vue'
	export default {
		name: "advert-panel",
		components: {
			QSwiper
		},
		data() {
			return {
				swiperHeight: '175rpx',
				advertiseList: [],
			}
		},
		props: {
			city: {
				type: String,
				default: '上海',
			}
		},
		watch: {
			city: {
				handler(newVal, oldVal) {
					if (!oldVal || this.advertiseList.length === 0) {
						this.getAdvertList();
					} else if (newVal && newVal !== oldVal) {
						if (this.advertiseList.length === 0) {
							this.getAdvertVersionCode();
						} else {
							this.getAdvertList();
						}
					}
				},
			},
			advertiseList: {
				handler(newVal) {
					if (newVal && newVal.length > 0) {
						this.$emit('withData', true);
					}
				},
				immediate: true,
				deep: true,
			}
		},
		mounted() {
			let advertiseList = uni.getStorageSync("advertList");

			if (!advertiseList || advertiseList.length === 0) {
				this.getAdvertList();
			} else {
				this.advertiseList = advertiseList;
				this.getAdvertVersionCode();
			}
		},
		methods: {
			//获取广告版本号
			getAdvertVersionCode() {
				let advertLoadTime = uni.getStorageSync('advertLoadTime');
				let oldVersion = uni.getStorageSync("advert_version");

				if (!advertLoadTime || !this.advertiseList || ((new Date().getTime()) - advertLoadTime) > 60 * 60 *
					1000) { //超时
					let self = this;
					getAdvertVersionCode({}).then(res => {
						if (res.retCode === 0 && !!res.data) {
							if (!oldVersion || parseInt(oldVersion) < parseInt(res.data)) {
								self.getAdvertList();
							}
						}
					});
				}

			},

			getAdvertList() {
				let a = this.city
				if (!a || a === '上海[定位失败]') {
					a = '上海'
				}
				let paramsData = {
					showCity: a,
					isShow: 1
				}
				let self = this;
				queryAdverInfo(paramsData).then(res => {
					if (res.retCode === 0) {
						let list = res.data
						if (list.length > 0) {
							self.advertiseList = [];

							list.forEach((item) => {
								item.type = 'image'
								self.advertiseList.push(item);
							})

							uni.setStorageSync("advertList", self.advertiseList);
							uni.setStorageSync("advertLoadTime", new Date().getTime());
						}
					}
				});
			},
			advClicked(e) {
				// #ifdef MP-WEIXIN
				if (e.path && e.path.indexOf("{") > -1 && e.path.indexOf("}") > -1) {
					let mini = JSON.parse(e.path);
					if (mini.appId && mini.page) {
						uni.navigateToMiniProgram({
							appId: mini.appId,
							path: mini.page,
							fail: () => {}
						})
					}
				} else if (e.url) {
					e.url = e.url.replace('http://', 'https://')
					uni.navigateTo({
						url: '/pages/common/webview?url=' + e.url,
					})
				}
				// #endif
			}
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
	}
</style>