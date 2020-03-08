// pages/group/changeMaster.js
let utils = getApp().utils;
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        groupMemberList: [],
        outArray: [],
        gId: 0,
        group: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.gId = options.gId;
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    chooseMaster: function (e) {
        this.data.ownerKey = e.currentTarget.dataset.userid;
        this.data.group.map((item, index) => {
            if (index == e.currentTarget.dataset.id) {
                item.state = item.state ? false : true
            }
        })
        this.setData({
            group: this.data.group
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */

    onShow: function () {
        //显示出除了管理员的数据
        this.data.groupMemberList = wx.getStorageSync("groupMemberList");
        this.data.ownerKey = wx.getStorageSync("groupState").ownerKey;
        this.data.groupMemberList.map((item, index) => {
            if (item.userKey != this.data.ownerKey) {
                this.data.group.push(item);
            }

        })
        this.setData({
            group: this.data.group
        })

    },
    saveMaster: function () {
        var that = this;
        this.data.group.map((item, index) => {
            if (item.state) {
                this.data.outArray.push(item.userKey)
            }
        })
        wx.showModal({
            title: '移除群成员',
            confirmColor: "#5095FA",
            content: '确定要移除这些群成员吗',
            success: function (res) {
                if (res.confirm) {
                    //DELETE /groupMember
                    utils.getAjaxToken('/groupMember', { "gId": that.data.gId, "targetUKeyList": that.data.outArray }, function (res) {
                        wx.navigateBack({
                            delta: 1
                        })
                    }, "DELETE");
                }
            }
        })

    }
})