/**
 * 所有路由接口
 */
const article = require('./article')
module.exports = app => {
    //Article
    app.post('/addArticle', article.addArticle)
    app.post('/updateArticle', article.updateArticle)
    app.post('/delArticle', article.delArticle)
    app.get('/getArticleList', article.getArticleList)
    app.get('/getArticleListAdmin', article.getArticleListAdmin)
    app.post('/getArticleDetail', article.getArticleDetail)
    app.post('/likeArticle', article.likeArticle)
}
