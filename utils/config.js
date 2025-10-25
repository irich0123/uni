const localEnv = 1; //0=开发环境 1=生产环境

module.exports = {
	active: localEnv === 0 ? 'debug' : 'prod',
	baseUrl: localEnv === 0 ? "https://api.nx.yunjg.net" : "https://server.yunjg.net",
	h5WebUrl: "https://web.yunjg.net/wxyunjg/#/",
	imgUrl: "https://img.yunjg.net/wxyunjg_img",
	webUrl: "https://web.yunjg.net",

	luxury: 1,

	regex: {
		mobile: '^1[3-9][0-9]\\d{8}$',
		directLine: '^\\d{3,4}[-]\\d{8}$',
		sms: '^\\d{4}$',
		id: '^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0-3][0-9])([0][1-9]|[1][0-2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$',
		hex: '^\\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\\s*)+$',
		decimal_begin_with_dot: '^\\.', //不能以小数点开头
		decimal_two_digit: '^\\d*?(\\.(\\d{0,2})?){0,1}?$', //最多两位小数
		decimal_positive: '^[0-9]+\\d*(\\.\\d{0,2})?$|^0?\\.\\d{0,2}$',
		digit_positive: '^[1-9]\\d*$',
		digit_non_negative: '^[0-9]\\d*$',
	},

	//    系统赠送(0) , 微信(1) , 支付宝(2), 余额(3), 金豆(4),
	//小程序内支付(5), 苹果内购(6), 平台结算(7),微信公众号支付(8),NATIVE支付(9);
	payWayConfig: [{
			key: 'wx-app',
			name: '微信支付',
			payType: 1,
			img: 'https://img.yunjg.net/wxyunjg_img/mall/wechat.png',
			active: false,
		},
		{
			key: 'ali-app',
			name: '支付宝',
			payType: 2,
			img: 'https://img.yunjg.net/wxyunjg_img/mall/ic_zhifubao.png',
			active: false,
		},
		{
			key: 'balance',
			name: '余额支付',
			payType: 3,
			img: 'https://img.yunjg.net/wxyunjg_img/mall/balance.png',
			active: false,
		},
		{
			key: 'bean',
			name: '金豆支付',
			payType: 4,
			img: 'https://img.yunjg.net/wxyunjg_img/mall/bean.png',
			active: false,
		},
		{
			key: 'wx-mini',
			name: '微信支付',
			payType: 5,
			img: 'https://img.yunjg.net/wxyunjg_img/mall/wechat.png',
			active: false,
		},
		{
			key: 'ios-iap',
			name: '苹果应用内支付',
			payType: 6,
			img: 'https://img.yunjg.net/wxyunjg_img/mall/iap.png',
			active: false,
		},
		{
			key: 'wx-h5',
			name: '微信支付',
			payType: 8,
			img: 'https://img.yunjg.net/wxyunjg_img/mall/wechat.png',
			active: false,
		}
	],

	publicKey: "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDk9FZNqlY+a7b6d3eRSYhvwVrFaRk6MpakUBflHlVyHN/XG9KFWfn3L+uHbB8wgVT5WmwLQmnyxdrLOhXmJtK79XK2NCYnu3V1RQFU9/DRXXOiwyC9QhVikUBPq730VgnTt1B2hYSNH21HhwMEHQkAQy7azKoi05COnq48OYFOsQIDAQAB",
};