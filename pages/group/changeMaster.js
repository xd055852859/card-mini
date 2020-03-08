// pages/group/changeMaster.js
let utils = getApp().utils;
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        groupMemberList: [],
        ownerKey: 0,
        gId: 0
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
        this.data.groupMemberList.map((item, index) => {
            if (index == e.currentTarget.dataset.id) {
                item.state = true
            } else {
                item.state = false
            }
        })
        this.setData({
            groupMemberList: this.data.groupMemberList
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
            if (item.userKey == this.data.ownerKey) {
                this.data.groupMemberList.splice(index,1);
            } else {
                item.state = false
            }
        })

        this.setData({
            groupMemberList: this.data.groupMemberList
        })

    },
    saveMaster:function(){
        var that = this;
        utils.getAjaxToken('/group/groupOwnerChange', {"gId":this.data.gId, "targetUKey":this.data.ownerKey},function(res){
            var groupState = wx.getStorageSync("groupState");
            groupState.ownerKey =that.data.ownerKey;
            wx.setStorageSync("groupState",groupState);
            wx.navigateBack({
                delta: 1
            })
        },"POST");
    }
})