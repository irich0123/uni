//图片上传
import {
	baseUrl
} from '@/utils/config'

export function uploadImg(filePath) {

	let header = {};

	header["appType"] = uni.getStorageSync("appType");
	header["token"] = uni.getStorageSync("token")

	// #ifdef APP-PLUS
	header["appversion"] = plus.runtime.version; //苹果Hyper版本号
	// #endif
	// #ifdef H5 || MP-WEIXIN
	header["appversion"] = "h5";
	// #endif


	let self = this;
	uni.showLoading({});
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			// url: baseUrl + '/uploadapi/upload',
			url: baseUrl + '/uploadapi/unify/upload/image',
			filePath: filePath,
			name: 'file',
			header: header,
			method: 'POST',
			success: function(res) {
				uni.hideLoading();
				console.log(res);
				if (res.statusCode === 200) {
					let resp = res.data;
					// #ifdef H5 || MP-WEIXIN || APP-PLUS
					resp = JSON.parse(resp);
					// #endif
					if (resp.retCode === 0) {
						resolve(resp.data);
					} else {
						let resCode = resp.retCode.toString()
						if (resCode.indexOf('401') > -1) {
							uni.showToast({
								title: '请登录',
								icon: 'none',
								duration: 3000
							})
							uni.removeStorageSync('token')
							uni.removeStorageSync("user");
							setTimeout(() => {
								uni.navigateTo({
									url: '/pages/login/login'
								})
							}, 1000)
						} else {
							uni.showToast({
								icon: 'none',
								title: resp.data.message,
								duration: 3000
							})
						}
					}
				} else {
					uni.showToast({
						title: '接口请求失败！' + res.statusCode,
						icon: 'none',
						duration: 2000
					})
				}
			},
			fail: function(err) {
				uni.hideLoading();
				console.log("网络错误：", err)
				uni.showToast({
					title: JSON.stringify(err),
					icon: 'none',
					duration: 3000
				})
			},
			complete: () => {}
		})

	});
}

// H5 图片压缩
export function imgCompress(src, quality) {
	return new Promise((resolve, reject) => {
		uni.getImageInfo({
			src,
			success(res) {
				console.log('压缩前', res)
				let canvasWidth = res.width //图片原始长宽
				let canvasHeight = res.height
				let base = canvasWidth / canvasHeight;
				if (canvasWidth > 500) {
					canvasWidth = 500
					canvasHeight = Math.floor(canvasWidth / base);
				}
				let img = new Image()
				img.src = res.path
				let canvas = document.createElement('canvas');
				let ctx = canvas.getContext('2d')
				canvas.width = canvasWidth
				canvas.height = canvasHeight
				canvas.toDataURL("image/jpg", quality)
				ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)
				canvas.toBlob(function() {
					let imgSrc = canvas.toDataURL("image/jpg", quality);
					resolve(imgSrc)
				}, "image/jpg", quality)
			}
		})
	})
}

//mp-weixin支持, H5不支持
export function compressImage(src, scale) {
	return new Promise((resolve, reject) => {
		uni.compressImage({
			src: src,
			width: scale,
			heigh: scale,
			success: res => { //压缩后的图片上传
				resolve(res.tempFilePath);
			},
			fail: () => { //压缩失败，原图上传
				resolve(src);
			},
		})
	})
}

export function getImageInfo(src) {
	return new Promise((resolve, reject) => {
		uni.getImageInfo({
			src: src,
			success: function(image) {
				if (image.width > 1000 || image.height > 1000) {
					var scaleX = 100000 / image.width;
					var scaleY = 100000 / image.height;
					var scale = (scaleX > scaleY ? scaleY : scaleX).toFixed(3) + '%';
					resolve(scale);
				} else {
					resolve(0);
				}
			}
		})
	})
}