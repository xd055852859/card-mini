// pages/card/groupDetail.js
const app = getApp();
let utils = getApp().utils;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        gId: 0,
        groupKey: 0,
        group: {},
        groupMemberList: [],
        groupArray: [],
        myOpenState: false,
        type: 0,
        userInfo: {},
        ownerState: false,
        iconArray: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        if (options.key) {
            this.data.groupKey = options.key;
        }
        if (options.type) {
            this.data.type = options.type;
        }
        if (options.gId) {
            this.data.gId = options.gId;
        }
        //GET /group/gId
        wx.showShareMenu({
            withShareTicket: true
        })
    },
    onShow: function () {
        var that = this;
        if (this.data.gId) {
            utils.wxIsLogin(() => {
                that.loadData();
            })
        } else {
            utils.wxIsLogin(() => {
                utils.getAjaxToken('/group/gId', {
                    "groupMapKey": this.data.groupKey
                }, function (res) {
                    that.data.gId = res;
                    that.loadData();
                })
            })
        }
        wx.showShareMenu({
            withShareTicket: true
        })
    },
    loadData: function () {
        var that = this;
        if (that.data.type == 1) {
            utils.getAjaxToken('/group/addGroupSecond', {
                "groupMapKey": that.data.groupKey,
                "gId": that.data.gId
            }, function (res) {
                that.searchGroup(that.data.gId);
            }, "POST")
        } else if (that.data.type == 2) {
            //POST /groupMember/addGroupMemberGId
            utils.getAjaxToken('/groupMember/addGroupMemberGId', {
                "gId": that.data.gId
            }, function (res) {
                that.searchGroup(that.data.gId);
            }, "POST")
        } else {
            that.searchGroup(that.data.gId);
        }

    },
    searchGroup: function (groupId) {
        var that = this;
        utils.getAjaxToken('/user/allInfo', {
            type: 1
        }, function (res) {
            that.data.userInfo = res;
            wx.setStorageSync("myUserInfo", that.data.userInfo);
            if (that.data.userInfo.cards["1000"] && that.data.userInfo.cards["1000"].itemContent.orgName && that.data.userInfo.cards["1000"].itemContent.post && that.data.userInfo.cards["1"].itemContent.value) {
                utils.getAjaxToken('/group', {
                    "gId": groupId
                }, function (res) {
                    that.data.iconArray = [];
                    that.data.groupMemberList = res[0].groupMemberList;
                    wx.setStorageSync("groupMemberList", that.data.groupMemberList)
                    that.data.groupMemberList.map((item, index) => {
                        //TODO  获取isOpen接口
                        if (item["userKey"] == that.data.userInfo.user._key) {
                            that.data.myOpenState = item.isOpen;
                        }
                        console.log(that.data.groupMemberList);
                        if (that.data.groupMemberList.length < 9 && that.data.groupMemberList.length > 3) {
                            if (index < 4) {
                                that.data.iconArray.push(item["avatar"]);
                            }
                            //POST /group/setGroupItem
                        } else if (that.data.groupMemberList.length > 9) {
                            if (index < 9) {
                                that.data.iconArray.push(item["avatar"]);
                            }
                            //POST /group/setGroupItem
                        }
                    })
                    if (that.data.groupMemberList.length < 4) {
                        that.data.iconArray.push(that.data.groupMemberList[0]["avatar"]);
                    }
                    utils.getAjaxToken('/group/setGroupItem', {
                        "gId": groupId,
                        "icon": that.data.iconArray
                    }, function (res) {}, "POST");
                    if (that.data.userInfo.user._key == res[0].c.ownerKey) {
                        that.data.ownerState = true;
                    }
                    var groupState = {
                        myOpenState: that.data.myOpenState,
                        ownerKey: res[0].c.ownerKey,
                        memberSum: res[0].memberSum
                    }
                    wx.setStorageSync("groupState", groupState);
                    that.data.orginGroupMemberList = that.data.groupMemberList;
                    that.setData({
                        userInfo: that.data.userInfo,
                        gId: groupId,
                        memberSum: res[0].memberSum,
                        icon: res[0].c.icon,
                        groupMemberList: that.data.groupMemberList,
                        ownerState: that.data.ownerState,
                        iconArray: that.data.iconArray
                    })
                })
            } else {
                wx.showModal({
                    title: '提示',
                    content: '请将名片信息编辑完整后加入群组',
                    showCancel: false,
                    confirmText: "前往",
                    confirmColor: "#5095FA",
                    success: function (res) {
                        if (res.confirm) {
                            wx.reLaunch({
                                url: '/pages/index/createCard?type=0',
                            })
                        }
                    }
                })
            }
        })
    },
    toGroupSet: function () {
        wx.navigateTo({
            url: '/pages/group/groupSet?gId=' + this.data.gId,
        })
    },
    toGroupDetail: function (e) {
        //获取当前用户的openState和对应用户openState
        var isOpen = 0;
        //TODO  需要有个修改openState的状态的接口
        if (e.currentTarget.dataset.isopen) {
            isOpen = 1
        }
        wx.navigateTo({
            url: '/pages/card/details?isOpen=' + isOpen + "&targetUKey=" + e.currentTarget.dataset.userid,
        })
    },
    searchGroupMember: function (e) {
        //GET /group/searchGroupMember
        var that = this;
        this.data.groupMemberList = [];
        if (e.detail.value) {
            utils.getAjaxToken('/group/searchGroupMember', {
                "gId": this.data.gId,
                "nickName": e.detail.value
            }, function (res) {
                that.data.groupMemberList = res[0].groupMemberList;
                that.setData({
                    userInfo: that.data.userInfo,
                    groupMemberList: that.data.groupMemberList
                })
            })
        } else {
            this.data.groupMemberList = this.data.orginGroupMemberList;
            this.setData({
                userInfo: this.data.userInfo,
                groupMemberList: this.data.groupMemberList
            })
        }
    },
    onShareAppMessage: function (options) {
        var that = this;
        if (options.from == 'button') {
            //POST /group/addGroupFirst
            return {
                "title": "群友通讯录,点击加入",
                "imageUrl": "../../images/shareGroup.png",
                //?userid=" + this.data.userInfo.user._key,
                "path": "/pages/group/groupDetail?gId=" + that.data.gId + "&type=2",
                //shareTcikets数组，每一项是一个shareTicket，对应一个转发对象
                "success": (res) => {}
            }
        }
    },
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
        this.loadData();
    }
})