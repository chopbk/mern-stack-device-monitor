var express = require('express');
var router = express.Router();
var apiUserRouter = require('./api/user-routes');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index.ejs', {
    title: 'Trang chủ'
  });
});

/*API for User */
router.use('/api/u/', apiUserRouter);

/*route to ABOUT */
router.route('/about')
  .get((req, res) => {
    res.send("Tamnd12 Đẹp Zai");
  })
module.exports = router;