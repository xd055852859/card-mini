// pages/index/insterest.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        interest: [
            { id: 1, name: "勤奋", state: false, new: false },
            { id: 2, name: "热情", state: false, new: false },
            { id: 3, name: "幽默", state: false, new: false },
            { id: 4, name: "责任心", state: false, new: false },
            { id: 5, name: "风度", state: false, new: false },
            { id: 6, name: "踏实", state: false, new: false },
            { id: 7, name: "信任", state: false, new: false },
            { id: 8, name: "合作", state: false, new: false },
            { id: 9, name: "和蔼", state: false, new: false },
            { id: 10, name: "商务", state: false, new: false }
        ], //从数据库中获取到的初始兴趣标签
        //选中的标签数组,从缓存中提取
        newInterestName: "",
        addView: false,
        disable: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        //获取数据
        let fav = wx.getStorageSync("fav");
        fav.map((item, index) => {
            if (item.new) {
                item.delState=true;
                this.data.interest.push(item);
            } else {
                item.delState = false;
                this.data.interest[item.id-1].state = true;
            }
        })
        this.setData({
            interest: this.data.interest
        })
    },
    //获取输入框内容
    getName: function(e) {
        this.data.newInterestName = e.detail.value;
    },

    clickInterest: function(e) {
        this.data.interest[e.currentTarget.dataset.id].state = this.data.interest[e.currentTarget.dataset.id].state ? false : true;
        this.setData({
            interest: this.data.interest
        })
    },
    //弹出框
    addInterest: function() {
        this.data.newInterestName = "";
        this.setData({
            addView: true
        })
    },
    addSubmit: function() {
        this.data.interest.push({ id: (this.data.interest[this.data.interest.length - 1].id + 1), name: this.data.newInterestName, state: true, new: true,delState:true })
        this.setData({
            interest: this.data.interest,
            addView: false
        })
    },
    cancelSubmit: function() {
        this.setData({
            addView: false
        })
    },
    delInterest:function(e){
      this.data.interest.splice(e.currentTarget.dataset.id,1);
      this.setData({
        interest: this.data.interest
      })
    },
    saveInterest: function() {
        this.setData({ disable: true });

        var pages = getCurrentPages(); //当前页面
        var prevPage = pages[pages.length - 2]; //上一页面
        var arr = this.data.interest.filter(function(item) {
            return (item.state == true);
        });
        prevPage.setData({ //直接给上移页面赋值
            fav: arr,
            favState: 1,
            favDisable: true
        });
        wx.navigateBack({ //返回
            delta: 1
        })
    }
})