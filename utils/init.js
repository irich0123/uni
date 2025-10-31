import {
	getDefaultResource,
	queryActionConsume
} from "@/api/common";
import {
	getAllReleaseWorkType,
	getReleaseWorkStatusEnum,
	getWorkOrderStatusEnum,
	getCommodityStatusEnum
} from '@/api/basic.js';

export const initApp = () => {

	let url = "https://img.yunjg.net";

	let defaultResource = [{
			resourceUrl: [url + "/default_resource/detail.png"]
		},
		{
			resourceUrl: [url + "/default_resource/work_order.png"]
		},
		{
			resourceUrl: [url + "/default_resource/work.png"]
		},
		{
			resourceUrl: [url + "/default_resource/work.png"]
		},
		{
			resourceUrl: [url + "/default_resource/awater.png"]
		},
	];

	uni.setStorageSync("defaultResource", defaultResource);

	let basicTime = uni.getStorageSync("basicDataTime");
	// let basicTime = null;
	if (!basicTime || basicTime < (new Date().getTime() - 1 * 3600 * 1000)) {
		_getActionConsumeList();
		_getDefaultResource();
		_getReleaseWorkTypeList();
		_getReleaseWorkStatusList();
		_getWorkOrderStatusList();
		_getCommodityStatusList();
		uni.setStorageSync("basicDataTime", new Date().getTime());
	}
}

const _getActionConsumeList = () => {
	queryActionConsume({}).then(res => {
		if (res.retCode === 0) {
			uni.setStorageSync("ActionConsume", res.data);
		} else {
			uni.setStorageSync("ActionConsume", []);
		}
	})
}

const _getDefaultResource = () => {
	getDefaultResource({}).then(res => {
		if (res.retCode === 0) {
			uni.setStorageSync("defaultResource", res.data);
		}
	});
}

const _getReleaseWorkTypeList = () => {
	getAllReleaseWorkType({}).then(res => {
		if (res.retCode === 0) {
			uni.setStorageSync("releaseWorkTypeList", res.data);
		}
	});
}

const _getReleaseWorkStatusList = () => {
	getReleaseWorkStatusEnum({}).then(res => {
		if (res.retCode === 0) {
			uni.setStorageSync("releaseWorkStatusList", res.data);
		}
	});
}

const _getWorkOrderStatusList = () => {
	getWorkOrderStatusEnum({}).then(res => {
		if (res.retCode === 0) {
			uni.setStorageSync("workOrderStatusList", res.data);
		}
	});
}

const _getCommodityStatusList = () => {
	getCommodityStatusEnum({}).then(res => {
		if (res.retCode === 0) {
			uni.setStorageSync("commodityStatusList", res.data);
		}
	});
}