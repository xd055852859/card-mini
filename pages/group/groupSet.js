// pages/group/groupSet.js
const app = getApp();
let utils = getApp().utils;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        openState: false,
        ownerState: false,
        avatar: "",
        gId: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.gId = options.gId;
    },
    onShow: function () {
        //获取isOpen
        if (wx.getStorageSync("groupState").ownerKey == wx.getStorageSync("myUserInfo").user._key) {
            this.data.ownerState = true;
        }
        this.setData({
            avatar: wx.getStorageSync("myUserInfo").user.avatar,
            openState: wx.getStorageSync("groupState").myOpenState,
            ownerState: this.data.ownerState,
            memberSum: wx.getStorageSync("groupState").memberSum
        })
    },
    toChangeMaster: function () {
        wx.redirectTo({
            url: '/pages/group/changeMaster?gId=' + this.data.gId
        })
    },
    toOutMember: function () {
        wx.redirectTo({
            url: '/pages/group/outMember?gId=' + this.data.gId
        })
    },
    changeOpen: function (e) {
        this.data.openState = e.detail.value;
    },
    saveGroup: function () {
        var that = this;
        //POST /groupMember/setIsOpen
        utils.getAjaxToken('/groupMember/setIsOpen', { "gId": this.data.gId, "isOpen": this.data.openState }, function (res) {
            wx.navigateBack({
                delta: 2
            })
        }, "POST")

    },
    outGroup: function () {
        //DELETE /groupMember/exit
        var that = this;
        wx.showModal({
            title: '退出群组',
            confirmColor: "#5095FA",
            content: '确定要退出本群吗',
            success: function (res) {
                if (res.confirm) {
                    if (!that.data.ownerState) {
                        utils.getAjaxToken('/groupMember/exit', { "gId": that.data.gId }, function (res) {
                            wx.switchTab({
                                url: "/pages/group/group",
                            })
                        }, "DELETE")
                    } else {
                        if (that.data.memberSum < 2) {
                            //DELETE /groupMember/dismissGroup
                            utils.getAjaxToken('/groupMember/dismissGroup', { "gId": that.data.gId }, function (res) {
                                wx.switchTab({
                                    url: "/pages/group/group",
                                })
                            }, "DELETE")
                        } else {
                            wx.showModal({
                                title: '信息提示',
                                showCancel: false,
                                confirmColor: "#5095FA",
                                content: "群主必须移交管理员后才可退群",
                            })
                        }
                    }
                }
            }
        })
    }
})