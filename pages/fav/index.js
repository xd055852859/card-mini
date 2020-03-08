// pages/fav/index.js
let utils = getApp().utils
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _that = this;
    wx: wx.setNavigationBarTitle({ title: '谁收藏了我' })
    utils.wxIsLogin(() => {
      utils.getAjaxToken("/friend/toList", {}, (data) => {
        _that.setData({ "dataList": data })
      })
    })
  },
  changCardHanlder: function(e) {
    var _that = this;
    let id = e.target.dataset.id;
    wx.showModal({
      title: '',
      content: '确认要交换名片吗',
      success: function (res) {
        if (res.confirm) {
          utils.getAjaxToken("/friend/applyExchange", { targetUKey: id }, (data) => {
            if (data == "success") {
              wx.showToast({
                title: '申请成功',
                icon: 'success',
                duration: 2000
              });
              var nDate = _that.data.dataList;
              
              for (var i = 0; i < nDate.length; i++) {
                if (nDate[i].d._key == id) {
                 nDate[i].isFriend=1;
                  _that.setData({ "dataList": nDate })
                  break;
                }
              }
            }
          }, "POST")
        }
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var _that = this;
    utils.wxIsLogin(() => {
      utils.getAjaxToken("/friend/applyExchange", {}, (data) => {
        _that.setData({ "dataList": data })
      })
    })
    wx.stopPullDownRefresh()
  }
})