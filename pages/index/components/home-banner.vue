<template>
	<view class="container">
		<swiper class="swiper" indicator-dots autoplay interval="5000" circular indicator-active-color="#ffffff">
			<swiper-item v-for="(item,index) in bannerList" :key="index">
				<image class="img" :src="item.resourceUrl" mode="scaleToFill" />
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import {
		getBannerList,
	} from "@/api/common";
	export default {
		name: "home-banner",
		data() {
			return {
				bannerList: [],
			}
		},
		props: {
			city: {
				type: String,
				default: '上海',
			}
		},
		mounted() {
			this.getBannerList();
		},
		methods: {
			//获取轮播图的数据
			getBannerList() {
				let bannerLoadTime = uni.getStorageSync('bannerLoadTime');
				// let bannerList = uni.getStorageSync("bannerList");
				let bannerList = [];
			
				if (!bannerLoadTime || ((new Date().getTime()) - bannerLoadTime) > 60 * 60 * 1000 || !bannerList ||
					bannerList.length === 0) { //超时 或数组为空
					let params = {
						bannerType: 1,
						cityName: this.city,
					}
					let self = this;
					getBannerList(params).then(res => {
						if (res.retCode === 0) {
							self.bannerList.splice(0, self.bannerList.length);
							res.data.forEach(v => {
								self.bannerList.push(v);
							})
							uni.setStorageSync("bannerList", self.bannerList);
							uni.setStorageSync("bannerLoadTime", new Date().getTime());
						}
					});
				} else {
					this.bannerList = bannerList;
				}
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;

		.swiper {
			height: 456rpx;
			
			.img {
				width: 100%;
				height: 456rpx;
			}
		}

	}
</style>