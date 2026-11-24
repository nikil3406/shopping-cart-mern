const express = require('express')
const { addToCart,removeFromCart, incrementQuantity, decrementQuantity, checkOut, placeCodOrder, getOrder, confirmCheckout} = require('../controllers/cartController')
const verifyToken = require('../middlewares/verifyToken')
const cartRouter = express.Router()


cartRouter.post("/add",verifyToken,addToCart)
cartRouter.delete("/remove/:id",verifyToken,removeFromCart)
cartRouter.post("/increment/:id",verifyToken,incrementQuantity)
cartRouter.post("/decrement/:id",verifyToken,decrementQuantity)
cartRouter.post("/checkout",verifyToken,checkOut)
cartRouter.post("/cod",verifyToken,placeCodOrder)
cartRouter.get("/orders/:orderId",verifyToken,getOrder)
cartRouter.post("/confirm",verifyToken,confirmCheckout)


module.exports = cartRouter