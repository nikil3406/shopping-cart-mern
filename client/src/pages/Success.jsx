import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Loader from '../components/Loader'

const Success = ({getUser}) => {
  const [loading,setLoading] = useState(true)
  const [confirmation,setConfirmation] = useState(null)
  const [searchParams] = useSearchParams()
 
  useEffect(()=>{
    const confirmPayment = async() =>{
      const orderId = searchParams.get('order_id')
      if (orderId) {
        try {
          const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/cart/orders/${encodeURIComponent(orderId)}`, {
            credentials: 'include'
          })
          const data = await res.json()
          if (data.success && data.order.paymentMethod === 'cash_on_delivery') {
            setConfirmation('cod')
            getUser()
          }
        } catch (error) {
          console.error('Unable to verify order:', error)
        } finally {
          setLoading(false)
        }
        return
      }

      const sessionId = searchParams.get('session_id')
      if (!sessionId) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/cart/confirm`,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          credentials:'include',
          body:JSON.stringify({sessionId})
        })
        const data = await res.json()
        if (data.success) {
          setConfirmation('card')
          getUser()
        }
      } catch (error) {
        console.error('Unable to confirm payment:', error)
      } finally {
        setLoading(false)
      }
    }

    confirmPayment()
  },[getUser,searchParams])

  if(loading){
    return <Loader/>
  }
  
  return (
    <div className='h-screen w-full flex items-center justify-center'>
      <h2 className={`text-2xl font-bold ${confirmation ? 'text-green-500' : 'text-red-500'}`}>
        {confirmation === 'cod'
          ? 'Cash-on-delivery order placed. Pay when your order arrives.'
          : confirmation === 'card'
            ? 'Payment successful. Your order is confirmed.'
            : 'Payment or order could not be confirmed.'}
      </h2>
    </div>
  )
}

export default Success
