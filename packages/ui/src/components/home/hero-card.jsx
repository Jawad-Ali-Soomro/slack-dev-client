import { AiTwotoneThunderbolt } from 'react-icons/ai'
import { HiOutlineCreditCard } from 'react-icons/hi2'

const HeroCard = () => {
  return (
    <section className="relative w-full max-w-[420px] overflow-visible">
      <div className="relative w-full">
        <div className="absolute -right-4 -top-6 z-20 w-[210px] rounded-2xl bg-primary p-5 text-white shadow-xl">
          <div className="mb-8 flex items-center gap-2 text-xs opacity-90">
            <span className="h-2 w-2 rounded-full bg-white/80" />
            <span className="h-2 w-2 rounded-full bg-white/50" />
            <span className="h-2 w-2 rounded-full bg-white/50" />
          </div>
          <p className="text-sm font-medium">Credit Card</p>
          <p className="mt-6 text-lg font-semibold tracking-widest">234 **** ****</p>
          <p className="mt-8 text-right text-sm font-bold">VISA</p>
        </div>

        <div className="relative z-10 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                <AiTwotoneThunderbolt className="icon text-xl" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Waleed Mobile Zone</p>
                <span className="text-sm text-gray-500">waleed.mobile.zone@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-gray-100 p-5">
            <h3 className="text-lg font-semibold text-gray-500">Invoice</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">PKR 12,55,325.00</p>
            <p className="mt-2 text-sm text-gray-500">March 21, 2026</p>
          </div>

          <div className="mt-5 space-y-4 px-1">
            <label className="flex cursor-pointer border px-5 py-3 rounded-2xl border-gray-400 items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-4 border-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
              </span>
              <HiOutlineCreditCard className="icon text-lg text-gray-700" />
              <span className="font-medium text-gray-800">Credit Card</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 border border-gray-200 px-5 py-3 rounded-2xl">
              <span className="h-5 w-5 rounded-full border-2 border-gray-300" />
              <span className="text-lg text-gray-700">🏦</span>
              <span className="font-medium text-gray-700">Bank Account</span>
            </label>
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-2xl bg-primary py-4 text-base font-semibold text-white transition hover:bg-primary/90"
          >
            Pay
          </button>
        </div>
      </div>
    </section>
  )
}

export default HeroCard
