//app.js
import utils from './utils/util';
App({
    onLaunch: function (options) {
        var _that = this;
        _that.utils = new utils(); //初始化
        // _that.utils.wxIsLogin();

    },
    globalData: {
        userInfo: null,
        location: "https://namecard.qingtime.cn/businessCard"
    },
    login: function (Url) {
        wx.request({
            //后台接口地址
            url: Url,
            data: {
                js_code: res.code,
                nickName: res_user.rawData.nickName,
                gender: res_user.rawData.gender,
                avatar: res_user.rawData.avatarUrl,
                os: os
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                wx.setStorageSync('openId', res.data.tmp.openid);

            }
        })
    }
})