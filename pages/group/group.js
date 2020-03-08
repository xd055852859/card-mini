// pages/card/group.js
const app = getApp();
let utils = getApp().utils;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        initState: 0,
        userInfo: {},
        groupId: 0,
        groupArray: [],
        groupKey: "",
        iconArray:[],
        testState:true,
        showMaster:true
    },
    onLoad: function (options) {
        wx.showShareMenu({
            withShareTicket: true
        })
    },
    onShow: function () {
        //搜索群列表
        //GET /group/list
        var that = this;
        utils.wxIsLogin(() => {
            that.loadList();
        });
        wx.showShareMenu({
            withShareTicket: true
        })
    },
    loadList: function () {
        var that = this;
        wx.showLoading({
            title: '数据请求中',
        })
        this.setData({showMaster:true});
        this.data.userInfo = wx.getStorageSync("myUserInfo");
        this.data.groupArray = [];
        utils.getAjaxToken('/group/list', {}, function (res) {
            if (res.length > 0) {                
                for (var i in res) {
                    that.data.groupArray.push({ "gId": res[i].d.gId, "icon": res[i].d.icon, ownerKey: res[i].d.ownerKey, "memberSum": res[i].memberSum });
                }
                wx.hideLoading();
                that.setData({
                    initState: 1,
                    groupArray: that.data.groupArray,
                    showMaster:false
                })
            }else{
                wx.hideLoading();
                that.setData({
                    initState: 0,
                    groupArray: that.data.groupArray,
                    showMaster:false
                })
            }
            if(!wx.getStorageSync("groupKey")){           
                utils.getAjaxToken('/group/addGroupFirst', {}, function (res) {
                    wx.setStorageSync("groupKey",res);
                    that.data.groupKey = res;
                }, "POST");
            }else{
                that.data.groupKey = wx.getStorageSync("groupKey")
            }
        })
    },
    toGroupDetail: function (e) {
        let gId = e.currentTarget.dataset.gid;
        wx.navigateTo({
            url: '/pages/group/groupDetail?gId=' + gId,
        })
    },

    testCard: function () {
        if (this.data.userInfo.cards["1000"] && this.data.userInfo.cards["1000"].itemContent.orgName && this.data.userInfo.cards["1000"].itemContent.post && this.data.userInfo.cards["1"].itemContent.value) { 
            this.setData({
                testState:false
            })
        } else {
            wx.showModal({
                title: '提醒',
                confirmColor: "#5095FA",
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
        var that = this;
        var key = ""
        if (options.from == 'button') {
            //POST /group/addGroupFirst
            return {
                "title": "群友通讯录,点击加入",
                "imageUrl": "../../images/shareGroup.png",
                //?userid=" + this.data.userInfo.user._key,
                "path": "/pages/group/groupDetail?key=" + that.data.groupKey + "&type=1",
                //shareTcikets数组，每一项是一个shareTicket，对应一个转发对象
                "success": (res) => {
                    wx.getShareInfo({
                        shareTicket: res.shareTickets[0],
                        success: function (res) {
                            wx.request({
                                url: app.globalData.location + '/thirdService/decryptData', //仅为示例，并非真实的接口地址
                                data: {
                                    "encryptedData": res.encryptedData,
                                    "iv": res.iv,
                                    "sessionKey": wx.getStorageSync("session_key")
                                },
                                method: "GET",
                                header: {
                                    'content-type': 'application/json' // 默认值
                                },
                                success: function (res) {
                                    let gId = res.data.result.openGId
                                    //POST
                                    utils.getAjaxToken('/group/addGroupSecond', { "groupMapKey": that.data.groupKey, "gId": gId }, function (res) {
                                        wx.removeStorageSync(that.data.groupKey);
                                        that.setData({
                                            groupId: gId
                                        })
                                        //自动加入
                                        wx.navigateTo({
                                            url: "/pages/group/groupDetail?key=" + that.data.groupKey
                                        })
                                    }, "POST")
                                    //POST /group/addGroupSecond
                                }
                            })
                        }
                    })
                }
            }

        }
    },
    onPullDownRefresh:function(){
        wx.stopPullDownRefresh();
        this.loadList();
    }
})