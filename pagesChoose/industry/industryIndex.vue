<template>
	<view class="container no-scroll">
		<!-- #ifndef  H5-->
		<my-nav-bar title="更多行业" @action="navAction" @reSize="reSize" class="my-nav-bar" />
		<!-- #endif -->

		<scroll-view scroll-y class="bg-gray-1" :style="'padding-top:'+contentTop+'px;height:'+listHeight+'px;'">
			<view style="content: ''; overflow: hidden;"></view>

			<view class="flex justify-center flex-wrap margin-tb-sm">
				<view class="flex flex-direction align-center justify-center padding-tb margin-xss bg-white radius-s"
					style="width: calc(23%);" v-for="(item,index) in industryList" :key="index"
					@click="onMenuItem(item)">
					<image class="industry-item-img" :src="item.icon" mode="aspectFill" />
					<view class="text-sm margin-top-sm">{{ item.industry }}</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	// #ifndef H5
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif
	import {
		active
	} from "@/utils/config";
	
	export default {
		name: "industryIndex",
		components: {
			// #ifndef H5
			myNavBar
			// #endif
		},
		data() {
			return {
				industryList: [],
				statusbarHeight: 0,
				contentTop: 0,
				listHeight: 0,
			}
		},
		watch: {
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
				this.getIndustryAll();
			},
			getIndustryAll() {
				this.industryList = uni.getStorageSync("allIndustry");
			},
			onMenuItem(item) {
				uni.setStorageSync("industryId", item.id);
				uni.switchTab({
					url: '/pages/waifa/waifa',
				})
			}
		}
	}
</script>

<style scoped lang="scss">
	.industry-item-img {
		width: 44rpx;
		height: 44rpx;
	}

	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
</style>