<template>
	<view class="container">
		<!-- #ifdef APP-PLUS-->
		<my-nav-bar :title="title" @action="navAction" @reSize="reSize" class="my-nav-bar" v-if="!!title" />
		<!-- #endif -->
		<view v-if="toUrl" :style="'padding-top:'+contentTop+'px;'">
			<web-view :webview-styles="webviewStyles" :src="toUrl"></web-view>
		</view>
	</view>
</template>


<script>
	// #ifdef APP-PLUS
	import myNavBar from '@/components/my-nav-bar/my-nav-bar.vue';
	// #endif

	export default {
		name: "webView",
		components: {
			// #ifdef APP-PLUS
			myNavBar
			// #endif
		},
		data() {
			return {
				webviewStyles: {
					scrollIndicator: 'none'
				},
				toUrl: null,
				title: '',
				statusbarHeight: 0,
				contentTop: 0,
			}
		},
		watch: {
			statusbarHeight: {
				handler(newVal, oldVal) {
					//#ifdef APP-PLUS
					this.contentTop = newVal + 40;

					let pages = getCurrentPages();
					let page = pages[pages.length - 1];
					var currentWebview = page.$getAppWebview();

					var wv = currentWebview.children()[0];
					wv.setStyle({ //设置web-view距离顶部的距离以及自己的高度，单位为px
						top: newVal + 40,
						height: uni.getWindowInfo().safeArea.height - newVal - 10,
					})
					//#endif
				},
			}
		},
		onLoad(options) {
			this.toUrl = decodeURIComponent(options.url);
			this.title = options.title;
		},
		onShow() {

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
		}
	}
</script>

<style scoped lang="scss">
	.container {
		width: 100%;
		height: 100%;
	}
</style>