const app = getApp();
let utils = getApp().utils;
Page({
    //设置数据
    data: {
        focusState: false,
        userInfo: {},
        test: app.globalData.shareTicket,
        noReadCount: 0,
        favCount: 0,
        shareState: true,
        testState: true,
        showMaster:true
    },
    onLoad: function (e) {
        wx.showShareMenu({
            withShareTicket: true
        })
    },
    onShow: function () {
        var that = this;
        //let userInfo = wx.getStorageInfoSync("userInfo");
        //获取userInfo
        utils.wxIsLogin(() => {
            that.loadData();
        });
        wx.showShareMenu({
            withShareTicket: true
        })
    },
    loadData: function () {
        wx.showLoading({
            title: '数据请求中',
        })
        var that = this;
        this.setData({showMaster:true});
        utils.getAjaxToken('/user/allInfo', {
            type: 1
        }, function (res) {
            that.data.userInfo = res;
            if (that.data.userInfo.cards["1000"] && that.data.userInfo.cards["1000"].itemContent.orgName && that.data.userInfo.cards["1000"].itemContent.post && that.data.userInfo.cards["1"] && that.data.userInfo.cards["1"].itemContent.value) {
                that.setData({
                    testState: false
                })
                if (!that.data.userInfo.user.originQRCodeURL) {
                    utils.getAjaxToken('/thirdService/uploadQRCode', {
                            "scene": "targetUKey=" + that.data.userInfo.user._key,
                            "page": "pages/card/details",
                            "type": 2
                        },
                        function (res) {
                            that.data.userInfo.user.originQRCodeURL = res
                            wx.setStorageSync("myUserInfo", that.data.userInfo);
                            // if (that.data.userInfo.cards["1000"] && that.data.userInfo.cards.itemContent[1000].orgName && that.data.userInfo.cards.itemContent[1000].post) {
                            //     that.data.shareState=false;
                            // }
                            wx.hideLoading();
                            that.setData({
                                userInfo: that.data.userInfo,
                                shareState: that.data.shareState,
                                showMaster:false
                            })
                        }, "POST")
                } else {
                    wx.setStorageSync("myUserInfo", that.data.userInfo);
                    //    if (that.data.userInfo.cards["1000"] && that.data.userInfo.cards.itemContent[1000].orgName && that.data.userInfo.cards.itemContent[1000].post) {
                    //                 that.data.shareState=false;
                    //             }
                    wx.hideLoading();
                    that.setData({
                        userInfo: that.data.userInfo,
                        shareState: that.data.shareState,
                        showMaster:false
                    })
                }
            } else {
                wx.showModal({
                    title: '提醒',
                    confirmColor: "#5095FA",
                    content: '先完善个人名片才能发名片哦',
                    success: function (res) {
                        if (res.confirm) {
                            wx.reLaunch({
                                url: '/pages/index/createCard?type=0'
                            })
                        }
                    }
                })
            }
            that.getNoreacCount();
            that.getFavCount()
        })
        //未读信息
    },
    shareCodeHanlder: function () {
        this.setData({
            focusState: true
        })
    },
    hideMasterHanlder: function () {
        this.setData({
            focusState: false
        })
    },
    modifyCard: function () {
        wx.navigateTo({
            url: '/pages/index/createCard?type=0'
        })
    },
    toCardInfo: function () {
        wx.navigateTo({
            url: '/pages/index/cardInfo'
        })
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
                "title": that.data.userInfo.user.nickName + "的名片",

                //?userid=" + this.data.userInfo.user._key,
                "path": "/pages/card/details?targetUKey=" + that.data.userInfo.user._key,
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

    },
    //未读信息
    getNoreacCount: function () {
        var _that = this;
        utils.getAjaxToken("/messageCenter/getMessageNotReadNum", {}, (data) => {
            var num = data == "success" ? 0 : data;
            _that.setData({
                "noReadCount": num
            })
        });

    },
    //收藏统计
    getFavCount: function () {
        var _that = this;
        utils.getAjaxToken("/friend/ToFriendNum", {}, (data) => {
            var num = data == "success" ? 0 : data;
            _that.setData({
                "favCount": num
            })
        });

    },
    toShare: function (e) {
        wx.navigateTo({
            url: '/pages/index/share?type=0'
        })
    },
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
        this.loadData();
    }
})