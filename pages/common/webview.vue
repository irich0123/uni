<template>
	<view class="container">
		<view v-if="toUrl">
			<web-view :webview-styles="webviewStyles" :src="toUrl"></web-view>
		</view>
	</view>
</template>


<script>
export default {
    name: "webView",
    data() {
        return {
            webviewStyles: {
				scrollIndicator: 'none'
            },
            toUrl: null
        }
    },
    onLoad(options) {
        this.toUrl = decodeURIComponent(options.url);
        // uni.setNavigationBarTitle({
        //     title: options.name
        // })
    }
}
</script>

<style scoped lang="scss">
	
	.container {
		width: 100%;
		height: 100%;
	}

</style>
