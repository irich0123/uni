<script>
	import {
		initApp
	} from '@/utils/init.js'
	//#ifdef APP-PLUS
	import {
		initPush
	} from '@/utils/push.js'
	//#endif

	export default {
		onLaunch: function() {
			console.log('App Launch')

			// #ifndef APP-PLUS
			initApp();
			// #endif

			// #ifdef APP-PLUS
			plus.navigator.closeSplashscreen();

			let agree = uni.getStorageSync('agree');
			if (!!agree) {
				initApp();

				uni.getSystemInfo({
					success: (resInfo) => {
						uni.setStorageSync("theme", resInfo.osTheme === 'light' ? 1 : 0);
					}
				})
				
				initPush();
			}
			// #endif
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {}
	}
</script>

<style>
	/*每个页面公共css */
	@import "@/common/main.css";

	page {
		background-color: transparent;
		height: 100vh;

		overflow: hidden;
	}

	@media (prefers-color-scheme: dark) {
		page {
			background-color: #000000;
		}
	}

	::v-deep iframe {
		/* #ifndef H5  */
		width: 780rpx !important; //解决webview滚动条的问题
		/* #endif  */
	}
</style>