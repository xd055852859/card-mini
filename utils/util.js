class myUtil {
  options = {
    DATABACE_API_URL: "https://namecard.qingtime.cn/businessCard",

    DATABACE_API_URL_PAY: "https://namecard.qingtime.cn/third/smallProgramPay"
  }
  formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
  formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
  }
  getStorageSync = (key, bool = true) => {
    //isremove默认true
    // let isRemove = bool ? false : true;
    try {
      let value = wx.getStorageSync(key)
      if (value) {
        if (bool) {
          wx.removeStorageSync(key)
        }
        return value;
      }
      return "";
    } catch (e) {
      return "";
    }
  }
  //登录
  wxIsLogin = (callback, url = "/pages/index/index") => {
    var _that = this;
    var openId = (wx.getStorageSync('openId'))
    if (!openId || openId == "") {
      wx.redirectTo({
        url: '/pages/authorize/index?url=' + encodeURIComponent(url),
      })

      let Url = _that.options.DATABACE_API_URL + "/user";
      let os = wx.getSystemInfoSync().system.split(" ")[0] == "iOS" ? 1 : 2;
      console.log(os);
      // wx.login({
      //   success: function (res) {
      //     if (res.code) {

      // wx.getUserInfo({
      //   withCredentials: true, //是否带上登录态信息
      //   success: function (res_user) {
      //     let rawData = JSON.parse(res_user.rawData);
      //     wx.request({ //后台接口请求
      //       url: Url,
      //       data: {
      //         js_code: res.code,
      //         nickName:rawData.nickName,
      //         gender: rawData.gender,
      //         avatar: rawData.avatarUrl,
      //         os: os
      //       },
      //       method: 'POST',
      //       header: { 'content-type': 'application/json' },
      //       success: function (res) {
      //         wx.showLoading({ title: 'loading...'})
      //         wx.setStorageSync('openId', res.data.tmp.openid);
      //         wx.setStorageSync('session_key', res.data.tmp.session_key);
      //         wx.setStorageSync('token', res.data.token);
      //         wx.setStorageSync('userInfo', res_user);
      //         _that.createCode();//生成二维码
      //         callback && callback();
      //         wx.hideLoading();
      //       }
      //     })
      //   }, fail: function () {
      //     _that.getAuthorization(callback);
      //   }
      //       // })
      //     }
      //   }
      // })
    } else {
      callback && callback()

    }
  }
  //请求数据
  getAjaxToken = (url, parms, callback, method = "GET") => {
    let _that = this;
    let usertoken = this.getStorageSync("token", false);
    parms.token = !parms.token ? usertoken : parms.token
    parms.perPage = !parms.perPage ? 10 : parms.perPage
    if (usertoken && usertoken != "") {
      wx.request({
        url: _that.options.DATABACE_API_URL + url, //仅为示例，并非真实的接口地址
        data: parms,
        method: method,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(data) {
          if (data.data.msg == "OK" || data.msg == "OK") {

            callback && callback(data.data.result || data.data.data || "success");
            wx.hideLoading();
          } else {
            wx.redirectTo({
              url: '/pages/authorize/index?url=' + encodeURIComponent('/pages/index/index'),
            })
          };
        },
        fail: function(res) {
          // wx.showLoading({
          //   title: '网络请求超时',
          // })
        }
      })
    }
  }
  getAuthorization = (callback) => {
    let _that = this;
    let Url = this.options.DATABACE_API_URL + "/user";
    let os = wx.getSystemInfoSync().system.split(" ")[0] == "iOS" ? 1 : 2;
    wx.showModal({
      title: '警告通知',
      content: '您拒绝了授权,请点击确定重新授权。',
      success: function(res) {
        if (res.confirm) {
          wx.openSetting({
            success: (res) => {
              if (res.authSetting["scope.userInfo"]) { //如果用户重新同意了授权登录
                wx.login({
                  success: function(res_login) {
                    if (res_login.code) {
                      wx.getUserInfo({
                        withCredentials: true,
                        success: function(res_user) {
                          let rawData = JSON.parse(res_user.rawData);
                          wx.request({
                            url: Url,
                            data: {
                              js_code: res_login.code,
                              nickName: rawData.nickName,
                              gender: rawData.gender,
                              avatar: rawData.avatarUrl,
                              os: os
                            },
                            method: 'POST',
                            header: {
                              'content-type': 'application/json'
                            },
                            success: function(res) {
                              wx.setStorageSync('openId', res.data.tmp.openid);
                              wx.setStorageSync('token', res.data.token);
                              wx.setStorageSync('userInfo', res_user);
                              _that.createCode(); //生成二维码
                              callback && callback();

                            }
                          })
                        }
                      })
                    }
                  }
                });
              } else {
                wx.navigateBack({
                  delta: -1
                })
              }
            },
            fail: function(res) {
              wx.navigateBack({
                delta: -1
              })
            }
          })
        } else {
          wx.navigateBack({
            delta: -1
          })
        }
      }
    })
  }
  //生成二维码
  createCode = () => {
    var _that = this;
    _that.getAjaxToken('/user/allInfo', {
      type: 1
    }, function(res) {
      console.log(res);
      if (!res.user.originQRCodeURL) {
        _that.getAjaxToken('/thirdService/uploadQRCode', {
            "scene": "targetUKey=" + res.user._key,
            "page": "pages/card/details",
            "type": 2
          },
          function(data) {
            res.user.originQRCodeURL = data
            wx.setStorageSync("myUserInfo", data);

          }, "POST")
      } else {
        wx.setStorageSync("myUserInfo", res);

      }
    })
  }

  getApp = () => {
    return getApp()
  }
}
export default myUtil;