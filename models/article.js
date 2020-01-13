const {mongoose} = require('../core/mongodb');
const autoIncrement = require('mongoose-auto-increment');

const articleSchema = new mongoose.Schema({
    title: {type: String, required: true, validate: /\S+/},
    keyword: [{type: String, default: ''}],
    author: {type: String, required: true, validate: /\S+/},
    desc: {type: String, default: ''},
    content: {type: String, required: true, validate: /\S+/},
    //字数
    numbers: {type: String, default: 0},
    img_url: {
        type: String,
        default: 'https://upload-images.jianshu.io/upload_images/12890819-80fa7517ab3f2783.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240'
    },
    //文章类型 1普通文章2简历3管理员介绍
    type: {type: Number, default: 1},
    //发布状态 1已发布0草稿
    state: {type: Number, default: 1},
    //转载状态 0原创1转载2混合
    origin: {type: Number, default: 0},
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag', required: true}],
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true}],
    category: [{type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true}],
    like_users: [
        {
            id: {type: mongoose.Schema.Types.ObjectId, required: true},
            name: {type: String, required: true, default: ''},
            //用户类型 0博主1其它用户
            type: {type: Number, default: 1},
            introduce: {type: String, default: ''},
            avatar: {type: String, default: 'user'},
            create_time: {type: Date, default: Date.now}
        }
    ],
    meta: {
        views: {type: Number, default: 0},
        likes: {type: Number, default: 0},
        comments: {type: Number, default: 0}
    },
    create_time: {type: Date, default: Date.now},
    update_time: {type: Date, default: Date.now}
});

articleSchema.plugin(autoIncrement.plugin, {
    model: 'Article',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});

module.exports = mongoose.model('Article', articleSchema);
