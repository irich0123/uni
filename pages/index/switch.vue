<template>
</template>

<script>
	export default {
		onLoad(options) {
			let smsLogId = options.s; //发短信推广后打开的链接
			if (!!smsLogId) {
				//报告这个号码推广成功
				this.miniOpened(parseInt(smsLogId));
			} else {
				this.restart();
			}
		},
		methods: {
			miniOpened(smsLogId) {
				let self = this;
				let url = 'https://match.018i.cn/api/main/biz/log/mini/open';
				console.log(url);
				uni.request({
					url: url,
					method: 'POST',
					data: {
						id: smsLogId
					},
					header: {
						"content-type": "application/json"
					},
					success: (res) => {
						if (res.statusCode === 200) {
							console.log(1);
							self.restart();
						}
					},
					fail: (err) => {
						self.restart();
					},
				})
			},
			restart() {
				uni.reLaunch({
					url: '/pages/index/index',
				})
			}
		}
	}
</script>

<style>
</style>