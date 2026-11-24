const User = require("../models/user")
const Order = require("../models/order")
const getStripe = () => {
    if (!process.env.STRIPE_KEY) {
        throw new Error("Stripe is not configured.")
    }
    return require('stripe')(process.env.STRIPE_KEY)
}

const addToCart = async (req, res) => {
    const { id, title, description, image, price, category } = req.body
    const userId = req.id

    try {

        const user = await User.findById(userId)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "You are not authorized."
            })
        }

        const existingProduct = user.cart.find(item => item.id == id)
        if (existingProduct) {
            return res.status(200).json({
                success: false,
                message: "Already in cart.",

            })
        }
        const product = {
            id,
            title,
            description,
            image,
            price,
            category,
            quantity: 1,
        }

        user.cart.push(product)

        await user.save()

        res.status(200).json({
            success: true,
            message: "Added to cart",

        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

const removeFromCart = async (req, res) => {
    try {
        const userId = req.id
        const user = await User.findById(userId)
        const itemId = req.params.id
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "You are not authorized."
            })
        }


        const productIndex = user.cart.findIndex(item => item.id == itemId)

        if (productIndex == -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found."
            })
        }

        user.cart.splice(productIndex, 1)

        await user.save()

        res.status(200).json({
            success: true,
            message: "Item removed from cart."
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const incrementQuantity = async (req, res) => {
    const userId = req.id
    const itemId = req.params.id

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "You are not authorized."
            })
        }

        const productIndex = user.cart.findIndex(item => item.id === itemId)
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found."
            })
        }

        // Increment quantity
        user.cart[productIndex].quantity += 1



        // Save the updated user document
        await user.save()

        res.status(200).json({
            success: true,
            message: "Quantity updated.",

        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const decrementQuantity = async (req, res) => {
    const userId = req.id
    const itemId = req.params.id

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "You are not authorized."
            })
        }

        const productIndex = user.cart.findIndex(item => item.id === itemId)
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Item not found."
            })
        }



        


        if (user.cart[productIndex].quantity > 1) {
            user.cart[productIndex].quantity -= 1
            await user.save()
        } else {
            return res.status(400).json({
                success: false,
                message: "Quantity should not be less than 0.",

            })
        }



        // Save the updated user document


        res.status(200).json({
            success: true,
            message: "Quantity updated",

        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const checkOut = async (req, res) => {
    try {
      const stripe = getStripe()
      const user = await User.findById(req.id)
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized."
        })
      }

      if (user.cart.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Your cart is empty."
        })
      }

      const hasInvalidItem = user.cart.some(item => {
        const priceInCents = Math.round(item.price * 100)
        return !item.title || !Number.isFinite(priceInCents) || priceInCents < 1 ||
          !Number.isInteger(item.quantity) || item.quantity < 1
      })
      if (hasInvalidItem) {
        return res.status(400).json({
          success: false,
          message: "Your cart contains an invalid item."
        })
      }

      const lineItems = user.cart.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.title,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }))

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        metadata: {
          userId: user._id.toString(),
        },
        success_url: `${process.env.ORIGIN}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.ORIGIN}/cancel`,
      });
  
      res.status(200).json({ success: true, url: session.url });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  const placeCodOrder = async(req,res) =>{
    try {
        const { shippingAddress } = req.body
        if (typeof shippingAddress !== 'string' || !shippingAddress.trim() || shippingAddress.trim().length > 500) {
            return res.status(400).json({
                success: false,
                message: "Enter a delivery address of up to 500 characters."
            })
        }

        const user = await User.findById(req.id)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "You are not authorized."
            })
        }

        if (user.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty."
            })
        }

        const hasInvalidItem = user.cart.some(item =>
            !item.title || !Number.isFinite(item.price) || item.price <= 0 ||
            !Number.isInteger(item.quantity) || item.quantity < 1
        )
        if (hasInvalidItem) {
            return res.status(400).json({
                success: false,
                message: "Your cart contains an invalid item."
            })
        }

        const items = user.cart.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity
        }))
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const order = await Order.create({
            user: user._id,
            items,
            total,
            shippingAddress: shippingAddress.trim()
        })

        user.cart = []
        await user.save()

        res.status(201).json({
            success: true,
            orderId: order._id,
            message: "Cash-on-delivery order placed."
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
  }

  const getOrder = async(req,res) =>{
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            user: req.id
        }).select('total currency paymentMethod paymentStatus status')

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            })
        }

        res.status(200).json({
            success: true,
            order
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
  }

  const confirmCheckout = async(req,res) =>{
    try{
        const stripe = getStripe()
        const { sessionId } = req.body
        if (typeof sessionId !== 'string' || !sessionId) {
            return res.status(400).json({
                success: false,
                message: "A checkout session is required."
            })
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId)
        if (session.metadata?.userId !== req.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "This checkout session does not belong to you."
            })
        }

        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: "Payment has not been completed."
            })
        }

        const userId = req.id
        const user = await User.findById(userId)

        if(!user){
            return res.status(401).json({
                success: false,
                message: "You are not authorized."
            })
        }
        user.cart = []
        await user.save()

        res.status(200).json({
            success: true,
            message: "Payment confirmed and cart cleared."
        })


    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
  }

module.exports = {
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    checkOut,
    placeCodOrder,
    getOrder,
    confirmCheckout
}