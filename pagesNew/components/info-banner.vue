<template>
	<view class="container">
		<view class="swiper" v-if="imgUrls.length === 0">
			<image class="img" :src="advPic" :mode="'aspectFill'" />
		</view>
		<swiper class="swiper" v-else :indicator-dots="true" :autoplay="true" interval="5000" duration="1000">
			<swiper-item v-for="(item,index) in imgUrls" :key="index" @tap="toPreview(imgUrls,index)">
				<image class="img" :src="item" :mode="'aspectFill'" />
			</swiper-item>
		</swiper>
	</view>
</template>,

<script>
	export default {
		name: "infoBanner",
		data() {
			return {}
		},
		props: {
			advPic: {
				type: String,
				default: "",
			},
			imgUrls: {
				type: Array,
				default: []
			}
		},
		methods: {
			//图片大图预览
			toPreview(img, index) {
				uni.previewImage({
					urls: img,
					current: index,
					loop: true,
				})
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