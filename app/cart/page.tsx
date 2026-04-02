'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (totalItems === 0) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        <div className="space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex bg-white rounded-lg shadow">
              <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-l-lg" />
              <div className="p-6 flex-1">
                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                <p className="text-lg font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                <div className="flex items-center mt-4">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-10 h-10 border rounded-l-md flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="w-12 text-center border-t border-b py-2">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-10 h-10 border rounded-r-md flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="ml-4 text-red-600 hover:text-red-900 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between text-xl font-bold">
            <span>Total: {totalItems} items</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>
          <button className="w-full mt-6 bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 font-medium">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

