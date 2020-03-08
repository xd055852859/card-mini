// pages/index/cardInfo.js
const app = getApp();
let utils = getApp().utils;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        user: {},
        cards: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onShow: function () {
      this.loadData();
    },
    loadData(){
        var that = this;
        utils.getAjaxToken('/user/allInfo', {
            type: 1
        }, function (res) {
            that.data.userInfo = res;
            wx.setStorageSync("myUserInfo", that.data.userInfo);
            that.data.user = that.data.userInfo.user;
            that.data.cards = that.data.userInfo.cards;
            that.setData({user: that.data.user, cards: that.data.cards})
        })
    },
    modifyNewCard: function (e) {
        wx.redirectTo({
            url: '/pages/index/newCard?cardId=' + e.currentTarget.dataset.id
        })
    },
    toNewCard: function () {
        wx.redirectTo({url: '/pages/index/newCard'})
    },
    modifyCard: function () {
        wx.redirectTo({url: '/pages/index/createCard?type=1'})
    },
    onPullDownRefresh:function(){
        wx.stopPullDownRefresh();
        this.loadList();
    }
})