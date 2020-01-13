const mongoose = require('mongoose')
//ref 表示关联，被关联model的type必须是ObjectId,Number,String,和Buffer才有效
const UserSchema = new mongoose.Schema({
    name: {type: String, required: true},
    posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}] //一对多
})
const User = mongoose.model('User', UserSchema)
const PostSchama = new mongoose.Schema({
    poster: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, //一对一
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}], //一对多
    title: String
})
const Post = mongoose.model('Post', PostSchama)
const CommentSchema = new mongoose.Schema({
    post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'}, //一对一
    commenter: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, //一对一
    content: String
})
const Comment = mongoose.model('Comment', CommentSchema)

//连接数据库
mongoose.connect('mongodb://localhost/population-test', function (err) {
    if (err) throw err;
    // createData()
})

function createData() {
    var userIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId(), mongoose.Types.ObjectId()]
    var postIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId(), mongoose.Types.ObjectId()]
    var commentIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId(), mongoose.Types.ObjectId()]
    var users = []
    var posts = []
    var comments = []
    users.push({
        _id: userIds[0],
        name: 'aikin',
        posts: [postIds[0]]
    })
    users.push({
        _id: userIds[1],
        name: 'luna',
        posts: [postIds[1]]
    })
    users.push({
        _id: userIds[2],
        name: 'luajin',
        posts: [postIds[2]]
    })
    posts.push({
        _id: postIds[0],
        title: 'post-by-aikin',
        poster: userIds[0],
        comments: [commentIds[0]]
    })
    posts.push({
        _id: postIds[1],
        title: 'post-by-luna',
        poster: userIds[1],
        comments: [commentIds[1]]
    })
    posts.push({
        _id: postIds[2],
        title: 'post-by-luajin',
        poster: userIds[2],
        comments: [commentIds[2]]
    })
    comments.push({
        _id: commentIds[0],
        content: 'comment-by-luna',
        commenter: userIds[1],
        post: postIds[0]
    })
    comments.push({
        _id: commentIds[1],
        content: 'comment-by-luajin',
        commenter: userIds[2],
        post: postIds[1]
    })
    comments.push({
        _id: commentIds[2],
        content: 'comment-by-aikin',
        commenter: userIds[1],
        post: postIds[2]
    })
    User.create(users, function (err, docs) {
        Post.create(posts, function (err, docs) {
            Comment.create(comments, function (err, docs) {

            })
        })
    })
}

//填充User的posts字段
/**
 * populate函数相当于MySql'join 确实将结果重新组合返回
 * Query.populate(path, [select], [model], [match], [options])
 * path:String类型时指定要填充的字段
 * model:null时指的就是Schema ref
 * match:附加查询条件
 * options:附加的其它查询条件 如排序、限制条数等
 *
 * posts相当于join几张表
 * title相当于最终要的column
 */
User.find().populate('posts', 'title', null, {sort: {title: -1}}).exec(function (err, docs) {
    // console.log(docs[0].posts[0].title)
    console.log(docs[0].posts)
})
/**
 * Query.prototype.exec()
 * Executes the query.
 */
User.findOne({name: 'luajin'}).populate(
    {
        path: 'posts',
        select: {title: 1},
        options: {
            sort: {title: -1}
        }
    }
).exec(function (err, doc) {
    console.log(doc.posts[0].title)
})
//select必须是documents共有的field
Post.findOne({title: 'post-by-aikin'}).populate(
    'poster comments', '-_id'
).exec(function (err, doc) {
    console.log('---------',doc)
    console.log(doc.poster._id)
    console.log(doc.title)
    console.log(doc.poster.name)
    console.log(doc.comments)
})
Post.findOne({title: 'post-by-aikin'}).populate(
    {
        path: 'poster comments',
        select: '-_id'
    }
).exec(function (err, doc) {
    console.log(doc.poster._id)
    console.log(doc.title)
    console.log(doc.poster.name)
    console.log(doc.comments)
})
//如果想要给单个关联的字段指定 select，可以传入数组的参数。如下：
Post.findOne({title: 'post-by-aikin'}).populate(['poster', 'comments']).exec(function (err, doc) {
    //不传select相当于直接将两个document组合
    console.log('comments:', doc.comments)
    console.log('poster:', doc.poster)
})
Post.findOne({title: 'post-by-aikin'}).populate([
    {path: 'poster', select: '-_id'},
    {path: 'comments', select: '-content'}
])
    .exec(function (err, doc) {
        console.log(`poster's name is ${doc.poster.name}`)
        console.log(`poster's _id is ${doc.poster._id}`) //undefined
        console.log(`comment's ${doc.comments}`)
    })
Post.findOne({title: 'post-by-luna'}, (err, doc) => {
    if (err) {
        console.error(err)
        throw err
    }
    console.log(`Post.findOne:${doc}`)
    Post.updateOne({title: 'post-by-luna'}, {title: 'post-by-songyao'}).then(result => {
        console.log(`Post.updateOne:`)
        console.log(result)
    }).catch(err=>{
        if (err){
            console.error(err)
            throw err
        }
    })
}).then(result => {
    console.log(`Post.findOne:${result}`)
})
