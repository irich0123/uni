import {
	iapPayVerify
} from "@/api/finance";

export function h5OnBridgeReady(payData) {
	return new Promise((resolve, reject) => {
		WeixinJSBridge.invoke(
			'getBrandWCPayRequest', {
				"appId": payData.appid, //公众号名称，由商户传入
				"timeStamp": payData.timeStamp, //时间戳，自1970年以来的秒数
				"nonceStr": payData.nonce_str, //随机串
				"package": payData.package,
				"signType": 'MD5', //微信签名方式：
				"paySign": payData.sign //微信签名
			},
			function(result) {
				if (result.err_msg.indexOf("get_brand_wcpay_request:ok") > -1) {
					resolve()
				} else {
					uni.showToast({
						icon: 'error',
						title: '支付失败！',
						duration: 1500
					});
				}
			});
	})
}

export function mpWeixinMiniPay(payData) {
	return new Promise((resolve, reject) => {
		uni.requestPayment({
			provider: 'wxpay',
			timeStamp: String(payData.timeStamp),
			nonceStr: payData.nonce_str,
			package: payData.package,
			signType: 'MD5',
			paySign: payData.sign,
			success: () => {
				resolve();
			},
			fail: () => {
				uni.showToast({
					title: '支付失败',
					icon: "error",
					duration: 2000
				})
			}
		});
	})
}

export function appWeixinPay(payData) {
	return new Promise((resolve, reject) => {
		uni.requestPayment({
			"provider": "wxpay",
			"orderInfo": {
				"appid": payData.appid,
				"noncestr": payData.nonce_str,
				"package": payData.package, // 固定值
				"partnerid": payData.mch_id, // 微信支付商户号
				"prepayid": payData.prepay_id, // 统一下单订单号 
				"timestamp": parseInt(payData.timestamp), // 时间戳（单位：秒）
				"sign": payData
					.sign, // 签名，这里用的 MD5/RSA 签名
			},
			success: () => {
				resolve();
			},
			fail: () => {
				uni.showToast({
					title: '支付失败',
					icon: "error",
					duration: 2000
				})
			}
		})
	});
}

export function appAliPay(orderInfo) {
	return new Promise((resolve, reject) => {
		uni.requestPayment({
			"provider": "alipay",
			"orderInfo": orderInfo,
			success: () => {
				resolve();
			},
			fail(e) {
				uni.showToast({
					title: '支付失败',
					icon: "error",
					duration: 2000
				})
			}
		})
	});
}

export function iapValidatePaymentResult(data) {
	return new Promise((resolve, reject) => {
		iapPayVerify(data).then(res => {
			if (res.retCode === 0) {
				resolve(res.data);
			}
		}).catch(() => {
			resolve(null);
		});
	});
}


export function iapPay(_iap, payData, productId) {
	return new Promise(async (resolve, reject) => {
		// 请求苹果支付
		const transaction = await _iap.requestPayment({
			productid: productId,
			manualFinishTransaction: true,
			username: payData,
		});
		// 在此处请求开发者服务器，在服务器端请求苹果服务器验证票据
		let result = await iapValidatePaymentResult({
			orderNo: payData,
			receipt: transaction.transactionReceipt, // 不可作为订单唯一标识
		});

		// 验证成功后关闭订单
		if (result != null) {
			await _iap.finishTransaction(transaction);
			resolve();
		} else {
			uni.showToast({
				title: '支付失败',
				icon: "error",
				duration: 2000
			})
		}
	});
}

export function iapRestore(_iap, orderList) {
	return new Promise(async () => {
		// 检查上次用户已支付且未关闭的订单，可能出现原因：首次绑卡，网络中断等异常
		try {
			// 从苹果服务器检查未关闭的订单，可选根据 username 过滤，和调用支付时透传的值一致
			const transactions = await _iap.restoreCompletedTransactions({
				username: ""
			});
			if (!transactions.length) {
				return;
			}

			transactions.forEach(async (transaction) => {
				let payOrder = orderList.find(v => v.receipt === transaction
				.transactionReceipt);
				if (payOrder != null) {
					switch (transaction.transactionState) {
						case IapTransactionState.purchased:
							// 用户已付款，在此处请求开发者服务器，在服务器端请求苹果服务器验证票据
							let result = await validatePaymentResult({
								orderNo: payOrder.orderNo,
								receipt: transaction.transactionReceipt
							});

							// 验证通过，交易结束，关闭订单
							if (result != null) {
								await _iap.finishTransaction(transaction);
							}

							break;
						case IapTransactionState.failed:
							// 关闭未支付的订单
							await _iap.finishTransaction(transaction);
							break;
						default:
							break;
					}
				}
			})
		} catch (e) {
			uni.showModal({
				content: e.message,
				showCancel: false
			});
		}
	})
}