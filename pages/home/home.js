//index.js
//获取应用实例
Page({
  onLoad: function (e) {
  
    setTimeout(function(){
      wx.switchTab({
        url: "../index/index",
      })

    },1000)
  },
  onTap: function () {
    wx.switchTab({
      url: "../index/index",
    })
  }
})
