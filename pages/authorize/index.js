// pages/authorize/index.js
let utils = getApp().utils
Page({

  /**
   * 页面的初始数据
   */
  data: {
  gotoUrl:"",
  showMaster:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var url = options.url&&decodeURIComponent(options.url)||"";
    this.setData({"gotoUrl":url})
  },
  getUserHanlder:function(e){
   var _that=this;
   _that.setData({"showMaster":false})

    if (e.detail.errMsg == "getUserInfo:ok"){
      let rawData = JSON.parse(e.detail.rawData);      
      let Url = utils.options.DATABACE_API_URL + "/user";
      let os = wx.getSystemInfoSync().system.split(" ")[0] == "iOS" ? 1 : 2;
      wx.login({
        success: function (res) {
          if (res.code) {
                wx.request({ //后台接口请求
                  url: Url,
                  data: {
                    js_code: res.code,
                    nickName:rawData.nickName,
                    gender: rawData.gender,
                    avatar: rawData.avatarUrl,
                    os: os
                  },
                  method: 'POST',
                  header: { 'content-type': 'application/json' },
                  success: function (res) {
                    wx.showLoading({ title: 'loading...'})
                    wx.setStorageSync('openId', res.data.tmp.openid);
                    wx.setStorageSync('session_key', res.data.tmp.session_key);
                    wx.setStorageSync('token', res.data.token);
                    wx.setStorageSync('userInfo', rawData);
                    utils.createCode();//生成二维码
                   // callback && callback();
                    wx.hideLoading();
                    var toUrl = _that.data.gotoUrl == "" ? "/pages/index/index" : _that.data.gotoUrl;
                    toUrl == "/pages/index/index" ? wx.switchTab({ url: toUrl }) : wx.redirectTo({ url: toUrl});
                    
                  },
                  fail:function(res){
                    wx.showLoading({
                      title: '网络请求超时',
                    })
                  }
                }) 
                    
          }
        }
      })



    }else{
      _that.setData({ "showMaster": true })
    }
  },


})