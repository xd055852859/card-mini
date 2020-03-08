// pages/card/index.js

let utils = getApp().utils
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      'http://cdn-icare.qingtime.cn/a1ce4bf7-976d-4fda-b969-1dcd7fa551a3.jpg?imageMogr2/auto-orient/format/jpeg',
      'http://cdn-icare.qingtime.cn/fe31a267-cf8c-491f-ad24-302a3eae45e0.jpg?imageMogr2/auto-orient/format/jpeg',
      'http://cdn-icare.qingtime.cn/657ffee5-e8eb-4d63-813d-358053fa5d00.jpg?imageMogr2/auto-orient/format/jpeg'
    ],
    indicatorDots: false,
    interval: 5000,
    duration: 1000,
    dataList: [],
    moveXY: { startX: 0, endX: 0},
    showMaster:true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: 'loading...',
    })
    var _that=this;
  wx:wx.setNavigationBarTitle({title: '名片夹' })
  utils.wxIsLogin(()=>{
    utils.getAjaxToken("/friend/list", {},(data)=>{
      _that.setData({ "dataList": data,"showMaster":false});
      wx.hideLoading();
    })
  })
  },
  bindScanHanlder:function(){
    wx.scanCode({
      success: (res) => {       
        wx.navigateTo({
          url: "/" + res.path
        })  
  
      }
    })
  },
  onShow: function (e) {
    var _that=this;
    if (this.data.dataList.length > 0) {
      _that.setData({ "showMaster": false });
      wx.hideLoading();
    }else{
      wx.showLoading({
        title: 'loading...',
      })
      utils.getAjaxToken("/friend/list", {}, (data) => {
        _that.setData({ "dataList": data, "showMaster": false });
        wx.hideLoading();
      })
    }
  },
  changCardHanlder:(e)=>{
  var _that=this;
  let id=e.target.dataset.id;
  wx.showModal({
    title: '',
    content: '确认要申请交换名片吗',
    success:function(res){
      if(res.confirm){
        utils.getAjaxToken("/friend/applyExchange", {targetUKey:id}, (data) => {
          if(data=="success"){
            wx.showToast({
              title: '申请成功',
              icon: 'success',
              duration: 2000
            })
          }
        },"POST")
      }
    }
  })
  },
  touchEnd: function (e) {
    if (e.changedTouches.length == 1) {
      var clientX = e.changedTouches[0].clientX;
      var startX = this.data.moveXY.startX;
      var t_key = e.currentTarget.dataset.index;
      var moveDis = (clientX - startX) < -35 ? -70 : 0;
     
      var nDate = this.data.dataList;
      if (clientX!=startX){
        for (var i = 0; i < nDate.length; i++) {
          if (nDate[i].d._key == t_key) {
            // nDate[i].styleTxt = "padding-left:" + (-moveDis) + "px;left:" + moveDis + "px;";
            nDate[i].styleTxt = "left:" + moveDis + "px;";
            break;
          }
        }
        this.setData({ "dataList": nDate })
      }
    }
  },
  touchStart: function (e) {
    this.setData({ "moveXY.startX": e.touches[0].clientX })
  },
 
  touchMove: function (e) {
    var curX = e.touches[0].clientX;
    var fstX = this.data.moveXY.startX;
    var t_key = e.currentTarget.dataset.index;
    var moveS = (curX - fstX) < -65 ? -70 : (curX - fstX);
    moveS = moveS > 0 ? 0 : moveS;
    var nDate = this.data.dataList;
    for (var i = 0; i < nDate.length; i++) {
      if (nDate[i].d._key == t_key) {
        //nDate[i].styleTxt = "padding-left:" + (-moveS) + "px;left:" + moveS + "px;";
        nDate[i].styleTxt = "left:" + moveS + "px;";
        break;
      }
    }
    this.setData({ "dataList": nDate })
  },
  //删除
  deleteHanlder: function (e) {
    var _that = this;
    let id = e.target.dataset.index;
    wx.showModal({
      title: '',
      content: '确认要删除吗',
      success: function (res) {
        if (res.confirm) {
          utils.getAjaxToken("/friend", { "targetUKey": id }, (data) => {
            if (data == "success") {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              });
              var nDate = _that.data.dataList;
              for (var i = 0; i < nDate.length; i++) {
                if (nDate[i].d._key == id) {
                  nDate.splice(i, 1);
                  _that.setData({ "dataList": nDate })
                  break;
                }
              }
            }
          }, "DELETE")
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
      utils.getAjaxToken("/friend/list", {}, (data) => {
        _that.setData({ "dataList": data })
      })
    })
    wx.stopPullDownRefresh()
  }

 

})