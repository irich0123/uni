//#ifdef APP-PLUS
import {
	requestAndroidPermission
} from "@/js_sdk/wa-permission/permission";
//#endif

export const checkCamera = () => {
	let self = this;
	requestAndroidPermission("android.permission.CAMERA").then(res => {
		let permission = uni.getStorageSync("permission");
		if (!permission) {
			permission = {};
		}
		permission.camera = res;
		uni.setStorageSync("permission", permission);
		console.log("per=",permission);
		return (res === 1);
	})
}

export const checkAlbum = () => {
	let self = this;
	requestAndroidPermission("android.permission.WRITE_EXTERNAL_STORAGE").then(res => {
		let permission = uni.getStorageSync("permission");
		if (!permission) {
			permission = {};
		}
		permission.storage = res;
		uni.setStorageSync("permission", permission);
		console.log("per=",permission);
		return (res === 1);
	})
}
