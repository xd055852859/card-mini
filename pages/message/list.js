// pages/message/list.js
let utils = getApp().utils
Page({

  /**
   * 页面的初始数据
   */
  data: {
  dataList:[],
  moveXY: { startX: 0, endX: 0 }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  wx.setNavigationBarTitle({
    title: '消息中心',
  });
  },
  touchEnd:function(e){
    if (e.changedTouches.length == 1) {
      var clientX = e.changedTouches[0].clientX;
      var startX = this.data.moveXY.startX;
      var t_key = e.currentTarget.dataset.index;
      var moveDis = (clientX - startX) < -35 ? -70 : 0;
      var nDate = this.data.dataList;
      if (clientX != startX) {
      for (var i = 0; i < nDate.length; i++) {
        if (nDate[i].c._key == t_key) {
         // nDate[i].styleTxt = "padding-left:" + (-moveDis) + "px;left:" + moveDis + "px;";
         nDate[i].styleTxt = "left:" + moveDis + "px;";
          break;
        }
      }
      this.setData({ "dataList": nDate })
      }
    }
  },
  touchStart:function(e){
    this.setData({ "moveXY.startX": e.touches[0].clientX})
  },
  touchMove:function(e){
    var curX = e.touches[0].clientX;
    var fstX = this.data.moveXY.startX;    
    var t_key = e.currentTarget.dataset.index;
    var moveS = (curX - fstX) < -65 ? -70 : (curX - fstX);
    moveS = moveS > 0 ? 0 : moveS;
    var nDate = this.data.dataList;
    for (var i = 0; i < nDate.length; i++) {
      if (nDate[i].c._key == t_key) {
      //nDate[i].styleTxt = "padding-left:" + (-moveS) + "px;left:" + moveS + "px;";
        nDate[i].styleTxt = "left:" + moveS + "px;";
        break;
      }
    }
    this.setData({ "dataList": nDate })
  },
  //删除
  deleteHanlder:function(e){
    var _that = this;
    let id = e.target.dataset.index;
    wx.showModal({
      title: '',
      content: '确认要删除吗',
      success: function (res) {
        if (res.confirm) {
          utils.getAjaxToken("/messageCenter/deleteSingleMessage", {"messageKey": id }, (data) => {
            if (data == "success") {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              });
              var nDate = _that.data.dataList;
              for (var i = 0; i < nDate.length; i++) {
                if (nDate[i].c._key == id) {
                 nDate.splice(i,1);
                 _that.setData({"dataList":nDate})
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
    var _that = this;
    utils.wxIsLogin(() => {
      utils.getAjaxToken("/messageCenter/list", { "type": 1 }, (data) => {
        _that.setData({ "dataList": data })
      });
    });

    utils.getAjaxToken("/messageCenter/setIsReadStatus", { "type": 1, time: new Date().getTime() }, (data) => {  
    }, "POST");
  },
  backCardHanlder:function(e){
    var _that = this;
    let id = e.target.dataset.id;
    wx.showModal({
      title: '',
      content: '确认要回递名片吗',
      success: function (res) {
        if (res.confirm) {
          utils.getAjaxToken("/friend/collect", { targetUKey: id,"isDealMsg":1 }, (data) => {
            if (data == "success") {
              wx.showToast({
                title: '处理成功',
                icon: 'success',
                duration: 2000
              });
              var nDate = _that.data.dataList;

              for (var i = 0; i < nDate.length; i++) {
                if (nDate[i].c.fromUKey == id) {
                  nDate[i].c.status = 1;
                }
              }
              _that.setData({ "dataList": nDate })
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
  wx.stopPullDownRefresh()
  }

})