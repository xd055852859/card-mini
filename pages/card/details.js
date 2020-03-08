// pages/card/details.js
let utils = getApp().utils
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      'http://cdn-icare.qingtime.cn/fe31a267-cf8c-491f-ad24-302a3eae45e0.jpg?imageMogr2/auto-orient/format/jpeg',
      'http://cdn-icare.qingtime.cn/a1ce4bf7-976d-4fda-b969-1dcd7fa551a3.jpg?imageMogr2/auto-orient/format/jpeg',
      'http://cdn-icare.qingtime.cn/657ffee5-e8eb-4d63-813d-358053fa5d00.jpg?imageMogr2/auto-orient/format/jpeg'
    ],
    dataDetails: "",
    targetUKey: "",
    myHeader:"",
    showMaster:true,
    scdCard:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   wx.showLoading({
     title: 'loading...',
   })
    var targetUKey = options.targetUKey || decodeURIComponent(options.scene).split("=")[1] || 175761477;
     var _that=this;
     if (targetUKey && targetUKey!=""){
       _that.setData({ "targetUKey": targetUKey });
      //login
       utils.wxIsLogin(() => {
         wx.showLoading({ title: 'loading...' })
         var isPublic = options.isOpen || 0;
         utils.getAjaxToken('/user/allInfo', {
           type: 1
         }, function (res) {
           var userInfo = res;
           //主名片不存在跳转
           if (!userInfo.cards["1"]) {
             wx.showModal({
               title: '提示',
               content: '请先完善信息',
               showCancel:false,
               success:(res)=>{
                 wx.redirectTo({
                   url: "/pages/index/createCard",
                 }) 
               }
             })        
           } else { 
             wx.setStorageSync("myUserInfo", userInfo);
          //加载名片详情
             utils.getAjaxToken("/friend", { "targetUKey": targetUKey, "isPublic": isPublic }, (data) => {
               var newArr = [];
               for (let i in data.RS1) {
                 if (parseInt(i) > 1000) {
                   newArr.push(data.RS1[i]);
                 }
               }
               _that.setData({ "dataDetails": data, "scdCard": newArr });
               wx.setNavigationBarTitle({ title: data.nickName + '的名片' });
               wx.hideLoading();
               _that.setData({ showMaster: false });
             });
               //加载名片详情-over
           }
         })

       }, "/pages/card/details?targetUKey=" + targetUKey)
        //login -over
     }else{
       wx.navigateBack({ delta: -1 })
     }
  },
  saveto: function () {
    // 更多参数，请参考官方文档
    var dataDetails = this.data.dataDetails;
    console.log(dataDetails)
    wx.addPhoneContact({
       firstName: dataDetails.nickName,   //名字
      mobilePhoneNumber: dataDetails.RS1["1"] ? dataDetails.RS1["1"].itemContent.value:"",    //手机号
      weChatNumber: dataDetails.RS1["6"] ? dataDetails.RS1["6"].itemContent.value: "",  //微信
      title: dataDetails.RS1["1000"].itemContent.post ? dataDetails.RS1["1000"].itemContent.post: "",  //职位
      email: dataDetails.RS1["2"] ? dataDetails.RS1["2"].itemContent.value :"",
      organization: dataDetails.RS1["1000"].itemContent.orgName ? dataDetails.RS1["1000"].itemContent.orgName:"",//公司
      workFaxNumber: dataDetails.RS1["3"] ? dataDetails.RS1["3"].itemContent.value :"",//电话
      success: function () {
        console.log('添加成功')
      }
    
     })
   
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  //   var _that=this;
  // return {
  //   title: '名片',
  //   path: '/pages/card/details?targetUKey=' + _that.data.targetUKey
  // }
  wx.navigateTo({
    url: '/pages/index/share?type=1&targetUKey=' + _that.data.targetUKey,
  })
  },
  changCardHanlder: function() {
    let id = this.data.targetUKey;
    wx.showModal({
      title: '',
      content: '确认要申请交换名片吗',
      success: function (res) {
        if (res.confirm) {
          utils.getAjaxToken("/friend/applyExchange", { targetUKey: id }, (data) => {
            if (data == "success") {
              wx.showToast({
                title: '申请成功',
                icon: 'success',
                duration: 2000
              });
              
            }
          }, "POST")
        }
      }
    })
  },
  deleteHanlder:function(e){
    let id = this.data.targetUKey;
    wx.showModal({
      title: '',
      content: '确认要删除吗',
      success: function (res) {
        if (res.confirm) {
          utils.getAjaxToken("/friend", { targetUKey: id }, (data) => {
            if (data == "success") {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              });
              wx.switchTab({
                url: '/pages/card/index',
                success: function (e) {
                  var page = getCurrentPages().pop();
                  if (page == undefined || page == null) return;
                  page.onLoad();
                } 
              })
            }
          }, "DELETE")
        }
      }
    })
  },
  calling: function (e) {
    var call=e.target.dataset.tel;
        wx.makePhoneCall({
      phoneNumber: call, //此号码并非真实电话号码，仅用于测试  
      success: function () {
        console.log("拨打电话成功！")
      }
    
    })
  } 
  
})