// pages/index/share.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        type: 0,
        targetUKey: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.type = options.type;
        this.data.targetUKey = options.targetUKey
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        var that = this;
        if (this.data.type == 0) {
            this.data.userInfo = wx.getStorageSync("myUserInfo");
            this.data.targetUKey = this.data.userInfo.user._key
            this.setData({
                userInfo: this.data.userInfo
            })
        } else if (this.data.type == 1) {
            utils.getAjaxToken('/user/allInfo', {
                "targetUKey": this.data.targetUKey,
                "type": 2
            }, function (res) {
                that.data.userInfo  = res;
                that.setData({
                    userInfo: that.data.userInfo
                })
            })
        }
    },

    testCard: function () {
        if (this.data.userInfo.cards["1000"] && this.data.userInfo.cards["1000"].itemContent.orgName && this.data.userInfo.cards["1000"].itemContent.post && this.data.userInfo.cards["1"].itemContent.value) {
            this.setData({
                testState: false
            })
        } else {
            wx.showModal({
                title: '提醒',
                confirmColor: "#1cac1b",
                content: '先完善个人名片才能发名片哦',
                success: function (res) {
                    if (res.confirm) {
                        wx.navigateTo({
                            url: "/pages/index/createCard?type=0",
                        })
                    }
                }
            })
        }
    },
    onShareAppMessage: function (options) {
        //POST /group/addGroupFirst
        var that = this;
        if (options.from == 'button') {

            return {
                "title": this.data.userInfo.user.nickName + "的名片",

                //?userid=" + this.data.userInfo.user._key,
                "path": "/pages/card/details?targetUKey=" + this.data.targetUKey,
                //shareTcikets数组，每一项是一个shareTicket，对应一个转发对象
                "success": (res) => {
                }
            }
        }
        /* } else {
             wx.showModal({
                 title: '提醒',
                 confirmColor: "#1cac1b",
                 content: '先完善个人名片才能发名片哦',
                 success: function (res) {
                     if (res.confirm) {
                         wx.navigateTo({
                             url: "/pages/index/createCard?type=0",
                         })
                     }
                 }
             })
         }*/

    }
})