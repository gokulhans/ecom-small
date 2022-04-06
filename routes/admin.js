const { response } = require("express");
var express = require("express");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");

const verifyLogin = (req, res, next) => {
  if (req.session.adminloggedIn) {
    next();
  } else {
    res.render("admin/adminlogin");
  }
};

/* GET users listing. */

router.get("/",verifyLogin, async(req, res) => {
   
  let totalProducts = await productHelpers.getProductsLength()
  let totalUser = await productHelpers.getUserLength()

  let orders = await productHelpers.getOrderNumber()
  res.render("admin/dashboard",{admin:true,orders,totalProducts,totalUser,})  
});


router.post("/", (req, res) => {
      if (req.body.password == '1234' && req.body.email == 'admin@admin') {
        req.session.adminloggedIn = true;
        req.session.admin = response.admin;
        res.redirect("/admin");
      } else {
        res.render("admin/adminlogin");
      }
});


router.get("/adminlogout", (req, res) => {
  req.session.adminloggedIn = false;
  res.redirect("/admin");
});



router.get("/add-product",verifyLogin, function (req, res) {
  res.render("admin/add-product", { admin: true });
});

router.post("/add-product", (req, res) => {
  productHelpers.addProduct(req.body).then((id) => {
    let image1 = req.files.image1;

    if (image1) {
      image1.mv("./public/product-images/" + id + "first" + ".jpg");
    } 
    res.redirect("/admin/product-manager/");
  });
});


router.get("/delete-product/:id", (req, res) => {
  let productId = req.params.id;
  productHelpers.deleteProduct(productId).then((response) => {
    res.redirect("/admin/product-manager/");
  });
});

router.get("/edit-product/:id", async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id);
  res.render("admin/edit-product", { product, admin: true });
});


router.post("/edit-product/:id", (req, res) => {
  let id = req.params.id;
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin/product-manager");
    if (req.files) {
      let image1 = req.files.image1;
      image1.mv("./public/product-images/" + id + "first" + ".jpg");
    } 
  });
});

// Order Setup 

router.post("/changeStatus/:order", (req, res) => {
  productHelpers.changeStatus(req.params.order).then((response) => {
    res.redirect('/admin/order-manager/');
  });
});

router.post("/changeToDeliver/:order", (req, res) => {
  productHelpers.changeStatusDelivered(req.params.order).then((response) => {
    res.redirect('/admin/order-manager/');
  });
});



router.get("/cancel-order/:id", (req, res) => {
  userHelpers.cancelOrder(req.params.id).then(() => {
    res.redirect("/admin/order-manager");
  });
});













// Extra features 
// Extra features 
// Extra features 



router.get("/product-manager",verifyLogin, (req, res) => {
  productHelpers.getAllProducts().then((products) => {
    res.render("admin/product-manager", { admin: true, products });
  });
});

router.get("/user-manager",verifyLogin, (req, res) => {
  productHelpers.getAllUsers().then((users) => {
    console.log(users);
    res.render("admin/user-manager", { admin: true, users });
  });
});

router.get("/order-manager",verifyLogin, async (req, res) => {
  let orders = await productHelpers.getOrderDetails();
  res.render("admin/order-manager", { admin: true, orders });
});

router.get("/order-product-details/:id",verifyLogin, (req, res) => {
  userHelpers.getOrderProducts(req.params.id).then((products) => {
    res.render("admin/order-product-details", { admin: true, products });
  });
});



router.get("/report",verifyLogin,async(req,res)=>{  
  let orders = await productHelpers.getOrderDetails();
  res.render("admin/report",{admin:true,Nodata:true,orders})
})

router.get("/report-product/:id",verifyLogin, (req, res) => {
  userHelpers.getOrderProducts(req.params.id).then((products) => {
    res.render("admin/report-product", { admin: true, products });
  });
});

router.post('/orderSales',async(req,res)=>{
  let dates = req.body
  let report = await productHelpers.getSalesReport(req.body)
  res.render('admin/orderReport',({report,Nodata:true,admin:true,dates}))
})


module.exports = router;

