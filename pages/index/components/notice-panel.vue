<template>
	<view class="container flex align-center bg-white padding-tb-ssm">
		<view class='margin-left-sm margin-right-xs' style="margin-top: 8rpx;">
			<image style="width: 140rpx;height: 30rpx;margin-bottom: 6rpx;" :src="speakerImg" />
		</view>
		<scroll-view>
			<view class="marquee_box">
				<view class="marquee_text text-sm">
					<text space="nbsp">{{ xScrollText }}</text>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		imgUrl,
	} from '@/utils/config'
	import {
		getNoticeList,
	} from "@/api/common";
	export default {
		name: "notice-panel",
		data() {
			return {
				theme: 1,
				imgUrl: imgUrl,
				xScrollText: '',
				textLength: '',
				speakerImg: imgUrl + '/index/ic_one_nrjx.png',
			}
		},
		watch: {
			theme: {
				handler(newVal, oldVal) {
					if (newVal !== oldVal) {
						this.changeTheme();
					}
				},
				immediate: true,
			}
		},
		mounted() {
			// #ifdef APP-PLUS
			this.theme = uni.getStorageSync("theme");
			// #endif
			
			this.getNoticeList();
		},
		methods: {
			getNoticeList() {
				let self = this;
				getNoticeList({}).then(res => {
					if (res.retCode === 0) {
						let contentStr = '';
						for (let i = 0; i < res.data.length; i++) {
							contentStr += res.data[i].content + '          '
						}
						let length = contentStr.length * 30;
						self.xScrollText = contentStr;
						self.textLength = length;
					}
				});
			},
			changeTheme() {
				if (!this.theme) {
					this.speakerImg = this.speakerImg.split(".png")[0] + "-dark.png";
				} else {
					this.speakerImg = this.speakerImg.replace("-dark", "");
				}
				this.$forceUpdate();
			},
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
	}
	
	.marquee_box {
		.marquee_text {
			white-space: nowrap;
			position: relative;
			animation: myfirst 120s linear infinite;
		}
	
		@keyframes myfirst {
			0% {
				margin-left: 750rpx;
			}
	
			100% {
				margin-left: -17000rpx;
			}
		}
	
	}
</style>