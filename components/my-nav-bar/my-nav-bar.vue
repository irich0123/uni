<template>
	<view class="container" :style="'height:'+(statusbarHeight+40)+'px;'">
		<view class="index-header" :class="clearTitle?'':'bg-theme-title'">
			<view :style="'height:'+statusbarHeight+'px;width:100%'"></view>
			<view class="flex align-center action-bar" :style="'width:' +menubarLeftPosition+'px'">
				<!-- #ifdef MP-WEIXIN -->
				<view class="flex back-icon align-center" @click="toBack">
				<!-- #endif -->
					<!-- #ifndef MP-WEIXIN -->
					<view class="flex back-icon align-center flex-sub" @click="toBack">
					<!-- #endif -->
						<uni-icons type="back" color="#777" size="22" style="line-height: 1;padding-left: 10rpx;" v-if="clearTitle"></uni-icons>
						<uni-icons type="back" color="white" size="22" style="line-height: 1;padding-left: 10rpx;" v-else></uni-icons>
					</view>
					<!-- #ifdef MP-WEIXIN -->
					<view class="flex-twice text-xl color-white padding-left-xs title">{{title}}</view>
					<!-- #endif -->
					<!-- #ifndef MP-WEIXIN -->
					<view class="flex-twice text-center text-xl color-white title" v-if="!clearTitle">{{title}}</view>
					<!-- #endif -->
					<!-- #ifdef APP-PLUS -->
					<view class="flex-sub flex justify-end padding-right margin-right-sm">
					<!-- #endif -->
						<!-- #ifndef APP-PLUS -->
						<view class="flex-sub flex justify-end">
						<!-- #endif -->
							<image class="margin-right-xs" style="height:50rpx" v-if="imgBtnSrc1" :src="imgBtnSrc1"
								mode="heightFix" @click="btnClicked(1)" />
							<image class="margin-right-xs" style="height:50rpx" v-if="imgBtnSrc2" :src="imgBtnSrc2"
								mode="heightFix" @click="btnClicked(2)" />
						</view>
					</view>
				</view>
			</view>
		</view>

</template>

<script>
	import {
		imgUrl
	} from '@/utils/config.js';

	export default {
		name: "myNavBar",
		data() {
			return {
				imgUrl: imgUrl,
				statusbarHeight: 0,
				menubarLeftPosition: 375,
			}
		},
		props: {
			title: {
				type: String,
				default: '',
			},
			imgBtnSrc1: {
				type: String,
				default: ''
			},
			imgBtnSrc2: {
				type: String,
				default: ''
			},
			clearTitle: {
				type: Boolean,
				default: false
			}
		},
		mounted() {
			this.getSystemStatusBarHeight();
		},
		methods: {
			getSystemStatusBarHeight() {
				// #ifdef APP-PLUS
				this.statusbarHeight = plus.navigator.getStatusbarHeight();
				// #endif

				// #ifdef MP-WEIXIN
				var rec = uni.getMenuButtonBoundingClientRect();
				this.statusbarHeight = rec.top - (40 - rec.height) / 2;
				this.menubarLeftPosition = rec.left;
				// #endif

				// #ifdef H5
				this.statusbarHeight = 0;
				// #endif

				this.toSize();
			},
			toBack() {
				this.$emit("action", {
					action: 'back'
				});
			},
			toSize() {
				this.$emit("reSize", {
					value: this.statusbarHeight
				});
			},
			btnClicked(index) {
				this.$emit("action", {
					action: 'btn' + index
				});
			}
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
	}

	.action-bar {
		min-height: 40px;
	}

	.title {
		display: -webkit-box;
		text-overflow: ellipsis;
		word-wrap: break-word;
		white-space: normal !important;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		line-height: 1;
	}
</style>