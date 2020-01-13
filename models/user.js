const crypto = require('crypto')
const {argv} = require('yargs')
const mongoose = require('../core/mongodb')
const autoIncrement = require('mongoose-auto-increment')

const adminSchema = new mongoose.Schema({
    github_id: {type: String, default: ''},
    name: {type: String, required: true, default: ''},
    //用户类型 0博主1其它用户2github3weixin4qq(0，1 是注册的用户； 2，3，4 都是第三方授权登录的用户)
    type: {type: Number, default: 1},
    phone: {type: String, default: ''},
    img_url: {type: String, default: ''},
    email: {
        type: String,
        default: ''
    },
    introduce: {type: String, default: ''},
    avatar: {type: String, default: 'user'},
    location: {type: String, default: 'user'},
    password: {
        type: String,
        required: true,
        default: crypto.createHash('md5').update(argv.auth_default_password || 'root')
            .digest('hex')
    },
    create_time: {type: Date, default: Date.now},
    update_time: {type: Date, default: Date.now}
})
adminSchema.plugin(autoIncrement.plugin, {
    model: 'User',
    field: 'id',
    startAt: 1,
    incrementBy: 1
})

module.exports = mongoose.model('User', adminSchema)
