import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PiArrowLeft, PiMinus, PiPlus, PiShoppingCart, PiTrash } from 'react-icons/pi'
import { createOrderRequest } from '@multi-tenants/api'
import { useAuth, useLoginModal } from '@multi-tenants/auth'
import { getAssetUrl } from '@multi-tenants/config'
import { isLodgingBusinessType } from '@multi-tenants/constants'
import { useCart } from '../../contexts/cart-context.jsx'
import Button from '../button.jsx'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=80'

function formatMoney(amount) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount) || 0)
}

export default function CartPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { openLoginModal } = useLoginModal()
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [error, setError] = useState('')

  async function handleCheckout() {
    if (!isAuthenticated) {
      openLoginModal({ stayOnPage: true })
      return
    }

    setIsCheckingOut(true)
    setError('')
    try {
      await createOrderRequest({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      })
      clearCart()
      navigate('/orders', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (!items.length) {
    return (
      <div className="mx-auto w-full px-6 pb-20 pt-28 text-center md:max-w-7xl">
        <PiShoppingCart className="icon mx-auto size-12 text-zinc-300" />
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Browse the marketplace and add products to get started.
        </p>
        <Link to="/" className="mt-6 inline-flex">
          <Button className="gap-2 px-5">
            <PiArrowLeft className="icon size-4" />
            Continue shopping
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-28 md:max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Cart
          </h1>
          <p className="mt-2 text-sm text-zinc-500 capitalize">
            {items.length} item{items.length === 1 ? '' : 's'} ready for checkout
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm font-medium text-zinc-500 transition hover:text-red-600"
        >
          Clear cart
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <ul className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
            >
              <Link
                to={`/products/${item.productId}`}
                className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:w-28"
              >
                <img
                  src={item.imageUrl ? getAssetUrl(item.imageUrl) : FALLBACK_IMAGE}
                  alt={item.name}
                  className="h-full w-full icon object-cover"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  to={`/products/${item.productId}`}
                  className="truncate font-semibold text-zinc-900 transition hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-zinc-500">
                  {[
                    item.organizationName,
                    isLodgingBusinessType(item.businessType)
                      ? 'per night'
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-900">
                  {formatMoney(item.price)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-full border border-zinc-200">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                    className="flex size-9 items-center justify-center text-zinc-600 transition hover:text-primary disabled:opacity-40"
                  >
                    <PiMinus className="icon size-3.5" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold text-zinc-800">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="flex size-9 items-center justify-center text-zinc-600 transition hover:text-primary"
                  >
                    <PiPlus className="icon size-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => removeItem(item.productId)}
                  className="flex size-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <PiTrash className="icon size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Order summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-zinc-500">Subtotal</span>
            <span className="font-semibold text-zinc-900">
              {formatMoney(subtotal)}
            </span>
          </div>
          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <Button
            className="mt-6 h-12 w-full font-semibold"
            onClick={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? 'Placing order...' : 'Checkout'}
          </Button>
          <Link
            to="/"
            className="mt-3 block text-center text-sm font-medium text-primary transition hover:opacity-80"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  )
}
