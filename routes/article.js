import Article from '../models/article';
import User from '../models/user';
import {responseClient} from '../utils/util';

module.exports.addArticle = (req, res) => {
    const {
        title,
        author,
        keyword,
        content,
        desc,
        img_url,
        tags,
        category,
        state,
        type,
        origin
    } = req.body;
    let tempArticle = null;
    if (img_url) {
        tempArticle = new Article({
            title,
            author,
            keyword: keyword ? keyword.split(',') : [],
            content,
            numbers: content.length,
            desc,
            img_url,
            tags: tags ? tags.split(',') : [],
            category: category ? category.split(',') : [],
            state,
            type,
            origin
        })
    } else {
        tempArticle = new Article({
            title,
            author,
            keyword: keyword ? keyword.split(',') : [],
            content,
            numbers: content.length,
            desc,
            tags: tags ? tags.split(',') : [],
            category: category ? category.split(',') : [],
            state,
            type,
            origin
        })
    }
    //返回一个promise
    tempArticle.save().then(data => {
        responseClient(res, 200, 0, '保存成功', data)
    }).catch(err => {
        console.log(err)
        responseClient(res)
    })
}
//更新
module.exports.updateArticle = (req, res) => {
    const {
        title,
        author,
        keyword,
        content,
        desc,
        img_url,
        tags,
        category,
        state,
        type,
        origin,
        id
    } = req.body
    Article.update(
        {_id: id},
        {
            title,
            author,
            keyword: keyword ? keyword.split(',') : [],
            content,
            desc,
            img_url,
            tags: tags ? tags.split(',') : [],
            category: category ? category.split(',') : [],
            state,
            type,
            origin
        }
    ).then(result => {
        responseClient(res, 200, 0, '操作成功', result)
    })
        .catch(err => {
            console.error(err)
            responseClient(res)
        })
}
//删除
module.exports.delArticle = (req, res) => {
    let {id} = req.body
    Article.deleteMany({_id: id})
        .then(result => {
            if (result.n === 1) {
                responseClient(res, 200, 0, '删除成功')
            } else {
                responseClient(res, 200, 1, '文章不存在')
            }
        })
        .catch(err => {
            console.error(err)
            responseClient(res)
        })
}
//前台文章列表
module.exports.getArticleList = (req, res) => {
    let keyword = req.query.keyword || null
    let state = req.query.state || ''
    let likes = req.query.likes || ''
    let tag_id = req.query.tag_id || ''
    let category_id = req.query.category_id || ''
    let article = req.query.article || ''
    let pageNum = parseInt(req.query.pageNum) || 1
    let pageSize = parseInt(req.query.pageSize) || 10
    //归档 article:1
    if (article) {
        pageSize = 1000
    }
    let conditions = {}
    //发布状态
    if (!state) {
        if (keyword) {
            const reg = new RegExp(keyword, 'i')
            conditions = {
                $or: [{title: {$regex: reg}}, {desc: {$regex: reg}}]
            }
        }
    } else if (state) {
        state = parseInt(state)
        if (keyword) {
            const reg = new RegExp(keyword, 'i')
            conditions = {
                $and: [
                    {$or: [{state}]},
                    {
                        $or: [
                            {title: {$regex: reg}},
                            {desc: {$regex: reg}},
                            {keyword: {$regex: reg}}
                        ]
                    }
                ]
            }
        } else {
            conditions = {state}
        }
    }
    // pageNum = 3=>2 * pageSize
    let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize
    let responseData = {
        count: 0,
        list: []
    }
    // 最优count方法
    Article.estimatedDocumentCount({}, (err, count) => {
        if (err) {
            console.error(err)
        } else {
            responseData.count = count
            //find第二个参数projection,控制要返回的字段
            let fields = {
                title: 1,
                desc: 1,
                img_url: 1,
                tags: 1,
                category: 1,
                meta: 1,
                create_time: 1
            }
            //归档
            if (article) {
                fields = {
                    title: 1,
                    create_time: 1
                }
            }
            //find第三个参数,分页+排序
            let options = {
                skip: skip,
                limit: pageSize,
                sort: {create_time: -1}
            }
            Article.find(conditions, fields, options, (err, result) => {
                if (err) {
                    console.error(err)
                } else {
                    let newList = []
                    //热门
                    if (likes) {
                        //sort a,b return a-b;若a-b>0则a排在b后面
                        result.sort(function (a, b) {
                            return b.meta.likes - a.meta.likes
                        })
                        responseData.list = result
                    } else if (category_id) {
                        //根据分类id返回数据
                        result.forEach(item => {
                            if (item.category.indexOf(category_id) > -1) {
                                newList.push(item)
                            }
                        })
                        let len = newList.length
                        responseData.count = len
                        responseData.list = newList
                    } else if (tag_id) {
                        //根据标签id返回数据,选择了标签云中的标签
                        result.forEach(item => {
                            if (item.tags.indexOf(tag_id) > -1) {
                                newList.push(item)
                            }
                        })
                        let len = newList.length
                        responseData.count = len
                        responseData.list = newList
                    } else if (article) {
                        //归档
                        const archiveList = []
                        let obj = {}
                        //按年份归档文章列表
                        result.forEach(e => {
                            let year = e.create_time.getFullYear()
                            if (!obj.year) {
                                obj.year = []
                                obj.year.push(e)
                            } else {
                                obj.year.push(e)
                            }
                        })
                        for (const key in obj) {
                            if (obj.hasOwnProperty(key)) {
                                const element = obj[key]
                                let item = {}
                                item.year = key
                                item.list = element
                                archiveList.push(item)
                            }
                        }
                        //按年份降序
                        archiveList.sort(function (a, b) {
                            return b.year - a.year
                        })
                        responseData.list = archiveList
                    } else {
                        responseData.list = result
                    }
                    responseClient(res, 200, 0, '操作成功', responseData)
                }
            })
        }
    })
}
//后台文章列表
module.exports.getArticleListAdmin = (req, res) => {
    let keyword = req.query.keyword || null
    let state = req.query.state || ''
    let likes = req.query.likes || ''
    let pageNum = parseInt(req.query.pageNum) || 1
    let pageSize = parseInt(req.query.pageSize) || 10
    let conditions = {}
    if (!state) {
        if (keyword) {
            const reg = new RegExp(keyword, 'i')
            conditions = {
                $or: [{title: {$regex: reg}}, {desc: {$regex: reg}}]
            }
        }
    } else if (state) {
        state = parseInt(state)
        if (keyword) {
            const reg = new RegExp(keyword, 'i')
            conditions = {
                $and: [
                    {$or: [{state}]},
                    {$or: [{title: {$regex: reg}}, {desc: {$regex: reg}}]}
                ]
            }
        } else {
            conditions = {state}
        }
        let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize
        let responseData = {
            count: 0,
            list: []
        }
        Article.estimatedDocumentCount({}, (err, count) => {
            if (err) {
                console.error(err)
            } else {
                responseData.count = count
                let fields = {
                    title: 1,
                    author: 1,
                    keyword: 1,
                    desc: 1,
                    img_url: 1,
                    tags: 1,
                    category: 1,
                    state: 1,
                    type: 1,
                    origin: 1,
                    comments: 1,
                    like_User_id: 1,
                    meta: 1,
                    create_time: 1
                }
                let options = {
                    skip: skip,
                    limit: pageSize,
                    sort: {create_time: -1}
                }
                /**
                 * populate指定了查询结果合并tags、comments、category三个document替换掉ref
                 */
                Article.find(conditions, fields, options, (err, result) => {
                    if (err) {
                        console.error(err)
                    } else {
                        //热门
                        if (likes) {
                            result.sort((a, b) => {
                                return b.meta.likes - a.meta.likes
                            })
                            responseData.list = result
                            responseClient(res, 200, 0, '操作成功', responseData)
                        }
                    }
                }).populate([
                    {path: 'tags'},
                    {path: 'comments'},
                    {path: 'category'}
                ]).exec((err, doc) => {
                })
            }
        })
    }
}
//喜欢文章
module.exports.likeArticle = (req, res) => {
    if (!req.session.userInfo) {
        responseClient(res, 200, 1, '您还没登录,或者登录信息已过期，请重新登录！')
        return
    }
    let {id, user_id} = req.body
    Article.findOne({_id: id}).then(data => {
        let fields = {}
        data.meta.likes = data.meta.likes + 1
        fields.meta = data.meta
        let like_users_arr = data.like_users.length ? data.like_users : []
        User.findOne({_id: user_id}).then(user => {
            let new_like_user = {}
            new_like_user.id = user._id
            new_like_user.name = user.name
            new_like_user.avatar = user.avatar
            new_like_user.create_time = user.create_time
            new_like_user.type = user.type
            new_like_user.introduce = user.introduce
            like_users_arr.push(new_like_user)
            fields.like_users = like_users_arr
            Article.update({_id: id}, fields).then(result => {
                responseClient(res, 200, 0, '操作成功', result)
            }).catch(err => {
                console.error(`update article error:${err}`)
                throw err
            })
        }).catch(err => {
            responseClient(res)
            console.error(`find user error:${err}`)
        })
    }).catch(err => {
        responseClient(res)
        console.error(`find article error:${err}`)
    })
}
//根据type文章详情
module.exports.getArticleDetailByType = (req, res) => {
    let {type} = req.body
    if (!type) {
        responseClient(res, 200, 1, '文章不存在!')
        return
    }
    Article.findOne({type}, (err, data) => {
        if (err) {
            console.error(err)
        } else {
            data.meta.views += 1
            Article.updateOne({type}, {meta: data.meta}).then(result => {
                //result: { n: 0, nModified: 0, ok: 1 }
                responseClient(res, 200, 0, '操作成功', data)
            }).catch(err => {
                console.error(`getArticleDetailByType error:${err}`)
                throw err
            })
        }
    }).populate([
        {path: 'tags', select: '-_id'},
        {path: 'category', select: '-_id'},
        {path: 'comments', select: '-_id'}
    ]).exec((err, doc) => {
    })
}
//文章详情
module.exports.getArticleDetail = (req, res) => {
    let {id} = req.body
    //文章类型 1普通文章2简历3管理员介绍
    let type = Number(req.body.type) || 1
    //文章评论过滤 1过滤2不过滤
    let filter = Number(req.body.filter) || 1
    if (type) {
        if (!id) {
            responseClient(res, 200, 1, '文章不存在！')
            return
        } else {
            Article.findOne({_id: id}, (err, data) => {
                if (err) {
                    console.error(err)
                    throw err
                } else {
                    data.meta.views += 1
                    Article.updateOne({_id: id}, {meta: data.meta}).then(result => {
                        //过滤
                        if (filter === 1) {
                            const arr = data.comments
                            for (let i = arr.length - 1; i >= 0; i--) {
                                const e = arr[i]
                                //未通过审核
                                if (e.state !== 1) {
                                    //直接修改原数组 返回删除的元素
                                    arr.splice(i, 1)
                                }
                                const newArr = e.other_comments
                                const length = newArr.length
                                if (length) {
                                    for (let i = newArr.length - 1; i >= 0; i--) {
                                        const item = newArr[i]
                                        if (item.state !== 1) {
                                            newArr.splice(i, 1)
                                        }
                                    }
                                }
                            }
                        }
                        responseClient(res, 200, 0, '操作成功', data)
                    }).catch(err => {
                        console.error(err)
                        throw err
                    })
                }
            }).populate(['tags', 'category', 'comments'])
                .exec((err, doc) => {
                })
        }
    } else {
        Article.findOne({type}, (err, data) => {
            if (err) {
                console.error(err)
                throw err
            } else {
                if (data) {
                    data.meta.views += 1
                    Article.updateOne({type}, {meta: data.meta}).then(result => {
                        if (filter === 1) {
                            const arr = data.comments;
                            for (let i = arr.length - 1; i >= 0; i--) {
                                const e = arr[i];
                                if (e.state !== 1) {
                                    arr.splice(i, 1);
                                }
                                const newArr = e.other_comments;
                                const length = newArr.length;
                                if (length) {
                                    for (let j = length - 1; j >= 0; j--) {
                                        const item = newArr[j];
                                        if (item.state !== 1) {
                                            newArr.splice(j, 1);
                                        }
                                    }
                                }
                            }
                        }
                        responseClient(res, 200, 0, '操作成功 ！', data)
                    }).catch(err => {
                        if (err) {
                            console.error(err)
                            throw err
                        }
                    })
                } else {
                    responseClient(res, 200, 1, '文章不存在')
                }
            }
        }).populate(['tags', 'category', 'comments'])
            .exec((err, doc) => {
            })
    }
}
