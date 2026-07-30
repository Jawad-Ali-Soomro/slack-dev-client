import {
  PiArrowCounterClockwise,
  PiBuildings,
  PiPackage,
  PiPencilSimple,
  PiTrash,
} from 'react-icons/pi'
import {
  formatBusinessTypeLabel,
  formatLodgingAttributeLabel,
  formatProductStatusLabel,
  isLodgingBusinessType,
} from '@multi-tenants/constants'
import { getAssetUrl } from '@multi-tenants/config'
import { cn } from '@multi-tenants/utils'
import Drawer from '../drawer.jsx'
import Button from '../button.jsx'

function formatPrice(price) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price) || 0)
}

function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-zinc-100 text-zinc-700 ring-zinc-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200/80',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200/80',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200/80',
    orange: 'bg-orange-50 text-orange-700 ring-orange-200/80',
    teal: 'bg-teal-50 text-teal-700 ring-teal-200/80',
  }

  return (
    <span
      className={cn(
        'inline-flex max-w-full w-[149px] h-10 items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}

function businessTypeTone(type) {
  switch (type) {
    case 'e-commerce':
      return 'violet'
    case 'hotel-management':
      return 'sky'
    case 'hostel-management':
      return 'orange'
    case 'pharmacy':
      return 'teal'
    default:
      return 'neutral'
  }
}

function statusTone(status) {
  switch (status) {
    case 'published':
      return 'emerald'
    case 'deleted':
      return 'rose'
    case 'draft':
    default:
      return 'neutral'
  }
}

export default function ProductDetailDrawer({
  isOpen,
  onClose,
  product,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  onViewBusiness,
  busy = '',
}) {
  const images = product?.images ?? []
  const cover = images[0]
  const attrs = product?.attributes ?? null
  const isDeleted = product?.status === 'deleted'
  const isLodging = isLodgingBusinessType(product?.businessType)
  const lodgingBadges = attrs
    ? [
        formatLodgingAttributeLabel('climate', attrs.climate),
        formatLodgingAttributeLabel('bathroom', attrs.bathroom),
        attrs.mealPlan && attrs.mealPlan !== 'none'
          ? formatLodgingAttributeLabel('mealPlan', attrs.mealPlan)
          : null,
        attrs.view && attrs.view !== 'none'
          ? formatLodgingAttributeLabel('view', attrs.view)
          : null,
        formatLodgingAttributeLabel('stayDays', attrs.stayDays),
        formatLodgingAttributeLabel('maxGuests', attrs.maxGuests),
        formatLodgingAttributeLabel('bedCount', attrs.bedCount),
      ].filter(Boolean)
    : []

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={product?.name || 'Product details'}
      description={
        product?.sku ? `SKU · ${product.sku}` : 'Product information'
      }
      wide
    >
      {!product ? null : (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
            <div className="aspect-[16/10] bg-zinc-100">
              {cover?.url ? (
                <img
                  src={getAssetUrl(cover.url)}
                  alt={product.name}
                  className="h-full w-full icon object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400">
                  <PiPackage className="icon size-12" />
                </div>
              )}
            </div>
            {images.length > 1 ? (
              <div className="flex gap-2 icon overflow-x-auto border-t icon border-zinc-200 p-3">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-white"
                  >
                    <img
                      src={getAssetUrl(image.url)}
                      alt=""
                      className="h-full icon w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center uppercase gap-2">
            {product.category?.name ? (
              <Badge tone="emerald" className='text-[10px]'>{product.category.name}</Badge>
            ) : null}
            <Badge tone={statusTone(product.status || 'draft')}>
              {formatProductStatusLabel(product.status || 'draft')}
            </Badge>
            {product.isFeatured ? <Badge tone="amber">Featured</Badge> : null}
            {product.businessType ? (
              <Badge className='text-[10px]' tone={businessTypeTone(product.businessType)}>
                {formatBusinessTypeLabel(product.businessType)}
              </Badge>
            ) : null}
            {lodgingBadges.map((label) => (
              <Badge key={label} tone="sky">
                {label}
              </Badge>
            ))}
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-zinc-500">
                {isLodging ? 'Price Per Night' : 'Price'}
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {formatPrice(product.price)}
              </p>
            </div>
            {product.organizationName ? (
              <button
                type="button"
                onClick={() => onViewBusiness?.(product)}
                className="inline-flex max-w-[50%] items-center gap-1.5 text-left text-sm text-zinc-600 transition hover:text-primary"
              >
                <PiBuildings className="icon size-4 shrink-0" />
                <span className="truncate">{product.organizationName}</span>
              </button>
            ) : null}
          </div>

          {isDeleted ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              This product is hidden from the public catalog. Restore it to
              publish again, or delete it permanently to remove it from this
              business. Unrestored products are removed automatically after 7
              days.
            </p>
          ) : null}

          <div>
            <p className="text-sm font-medium text-zinc-800">Description</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
              {product.description?.trim() || 'No description provided.'}
            </p>
          </div>

          {(product.canManage &&
            (onEdit || onDelete || onRestore || onPermanentDelete)) ||
          onViewBusiness ? (
            <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
              {onViewBusiness ? (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => onViewBusiness(product)}
                  className="h-11 gap-2 px-4"
                >
                  <PiBuildings className="icon size-4" />
                  View business
                </Button>
              ) : null}
              {product.canManage && isDeleted && onRestore ? (
                <Button
                  type="button"
                  variant="outlined"
                  disabled={busy === `restore-${product.id}`}
                  onClick={() => onRestore(product)}
                  className="h-11 gap-2 px-4 text-emerald-700 hover:bg-emerald-50"
                >
                  <PiArrowCounterClockwise className="icon size-4" />
                  Restore
                </Button>
              ) : null}
              {product.canManage && isDeleted && onPermanentDelete ? (
                <Button
                  type="button"
                  variant="outlined"
                  disabled={busy === `purge-${product.id}`}
                  onClick={() => onPermanentDelete(product)}
                  className="h-11 gap-2 px-4 text-rose-600 hover:bg-rose-50"
                >
                  <PiTrash className="icon size-4" />
                  Delete forever
                </Button>
              ) : null}
              {product.canManage && !isDeleted && onEdit ? (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => onEdit(product)}
                  className="h-11 gap-2 px-4"
                >
                  <PiPencilSimple className="icon size-4" />
                  Edit
                </Button>
              ) : null}
              {product.canManage && !isDeleted && onDelete ? (
                <Button
                  type="button"
                  variant="outlined"
                  disabled={busy === `delete-${product.id}`}
                  onClick={() => onDelete(product)}
                  className="h-11 gap-2 px-4 text-rose-600 hover:bg-rose-50"
                >
                  <PiTrash className="icon size-4" />
                  Delete
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </Drawer>
  )
}
