import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  PiArrowCounterClockwise,
  PiBuildings,
  PiMagnifyingGlass,
  PiPackage,
  PiPencilSimple,
  PiPlus,
  PiTrash,
} from 'react-icons/pi'
import {
  deleteProductRequest,
  listOrganizationsRequest,
  listProductsRequest,
  permanentlyDeleteProductRequest,
  restoreProductRequest,
} from '@multi-tenants/api'
import {
  formatBusinessTypeLabel,
  formatLodgingAttributeLabel,
  formatProductStatusLabel,
  getProductCategoriesForBusiness,
  isLodgingBusinessType,
  PRODUCT_STATUS_OPTIONS,
} from '@multi-tenants/constants'
import { getAssetUrl } from '@multi-tenants/config'
import { cn } from '@multi-tenants/utils'
import Button from '../button.jsx'
import Input from '../input.jsx'
import { Dropdown } from '../dropdown.jsx'
import BusinessDetailDrawer from '../businesses/business-detail-drawer.jsx'
import CreateProductModal from '../businesses/create-product-modal.jsx'
import ConfirmModal from '../confirm-modal.jsx'
import ProductDetailDrawer from './product-detail-drawer.jsx'
import {
  FormFieldProvider,
  SectionTitle,
} from '../../contexts/form-field-context.jsx'

function canManageOrgProducts(org) {
  return org?.myRole === 'OWNER' || org?.myRole === 'ADMIN'
}

function formatPrice(price) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
  }).format(Number(price) || 0)
}

function Badge({ children, tone = 'neutral', className = '', dot = false }) {
  const tones = {
    neutral: 'bg-zinc-100 text-zinc-700 ring-zinc-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200/80',
    violet: 'bg-violet-50 text-violet-700 ring-violet-200/80',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200/80',
    orange: 'bg-orange-50 text-orange-700 ring-orange-200/80',
    teal: 'bg-teal-50 text-teal-700 ring-teal-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200/80',
    fuchsia: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200/80',
  }

  const dots = {
    neutral: 'bg-zinc-400',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
    violet: 'bg-violet-500',
    rose: 'bg-rose-500',
    orange: 'bg-orange-500',
    teal: 'bg-teal-500',
    indigo: 'bg-indigo-500',
    fuchsia: 'bg-fuchsia-500',
  }

  return (
    <span
      className={cn(
        'inline-flex max-w-full w-[110px] h-10 items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset',
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {dot ? (
        <span
          className={cn(
            'size-1.5 shrink-0 rounded-full',
            dots[tone] ?? dots.neutral,
          )}
        />
      ) : null}
      <span className="truncate text-[10px]">{children}</span>
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

function categoryTone(name) {
  if (!name) return 'neutral'
  const tones = ['emerald', 'amber', 'sky', 'rose', 'indigo', 'fuchsia', 'teal']
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % tones.length
  }
  return tones[hash]
}

function SkeletonPulse({ className = '' }) {
  return (
    <div
      className={cn('animate-pulse bg-zinc-200/80', className)}
      aria-hidden
    />
  )
}

function ProductCardSkeleton() {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white">
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
        <SkeletonPulse className="icon absolute inset-0 h-full w-full" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <SkeletonPulse className="h-8 w-20 rounded-full" />
          <SkeletonPulse className="h-8 w-16 rounded-full" />
        </div>
        <div className="absolute right-3 bottom-3">
          <SkeletonPulse className="h-8 w-20 rounded-xl" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 pb-0">
        <div className="space-y-2">
          <SkeletonPulse className="h-5 w-3/4 rounded-lg" />
          <SkeletonPulse className="h-3 w-1/3 rounded-lg" />
        </div>
        <div className="space-y-2">
          <SkeletonPulse className="h-3 w-full rounded-lg" />
          <SkeletonPulse className="h-3 w-5/6 rounded-lg" />
        </div>
        <div className="mt-auto flex flex-wrap gap-1.5 pb-3">
          <SkeletonPulse className="h-8 w-24 rounded-full" />
          <SkeletonPulse className="h-8 w-28 rounded-full" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-4 py-3">
        <SkeletonPulse className="h-11 w-32 rounded-[15px]" />
        <SkeletonPulse className="h-9 w-11 rounded-[15px]" />
        <SkeletonPulse className="h-9 w-11 rounded-[15px]" />
      </div>
    </li>
  )
}

export default function ProductsPage({
  title = 'Products',
  description = 'View and upload products for your businesses.',
  canUpload = true,
  canAssignAdmin = false,
  canManageTeams = true,
}) {
  const navigate = useNavigate()
  const { status: statusParam } = useParams()
  const resolvedStatus =
    statusParam && PRODUCT_STATUS_OPTIONS.some((item) => item.value === statusParam)
      ? statusParam
      : 'all'

  const [organizations, setOrganizations] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [businessFilter, setBusinessFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [busy, setBusy] = useState('')
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [viewingProduct, setViewingProduct] = useState(null)
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false)
  const [detailOrgId, setDetailOrgId] = useState(null)
  const [isBusinessDetailOpen, setIsBusinessDetailOpen] = useState(false)
  const [productToPurge, setProductToPurge] = useState(null)

  const manageableOrgs = useMemo(
    () =>
      organizations.filter(
        (org) =>
          canManageOrgProducts(org) && !isLodgingBusinessType(org.businessType),
      ),
    [organizations],
  )

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: 'All statuses' },
      ...PRODUCT_STATUS_OPTIONS,
    ],
    [],
  )

  function handleStatusFilterChange(value) {
    if (!value || value === 'all') {
      navigate('/products')
      return
    }
    navigate(`/products/${value}`)
  }

  const businessOptions = useMemo(
    () => [
      { value: 'all', label: 'All businesses' },
      ...organizations
        .filter((org) => !isLodgingBusinessType(org.businessType))
        .map((org) => ({
          value: org.id,
          label: org.name,
        })),
    ],
    [organizations],
  )

  const categoryOptions = useMemo(() => {
    const names = new Set()
    products.forEach((product) => {
      if (product.category?.name) names.add(product.category.name)
    })
    if (businessFilter !== 'all') {
      const org = organizations.find((item) => item.id === businessFilter)
      getProductCategoriesForBusiness(org?.businessType).forEach((name) =>
        names.add(name),
      )
    }
    return [
      { value: 'all', label: 'All categories' },
      ...[...names].sort().map((name) => ({ value: name, label: name })),
    ]
  }, [products, businessFilter, organizations])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return products.filter((product) => {
      if (businessFilter !== 'all' && product.organizationId !== businessFilter) {
        return false
      }
      if (
        categoryFilter !== 'all' &&
        product.category?.name !== categoryFilter
      ) {
        return false
      }
      if (
        resolvedStatus !== 'all' &&
        (product.status || 'draft') !== resolvedStatus
      ) {
        return false
      }
      if (!query) return true

      return [
        product.name,
        product.sku,
        product.description,
        product.category?.name,
        product.organizationName,
        product.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [products, search, businessFilter, categoryFilter, resolvedStatus])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const orgs = await listOrganizationsRequest()
      const orgList = Array.isArray(orgs) ? orgs : []
      setOrganizations(orgList)

      const productGroups = await Promise.all(
        orgList.map(async (org) => {
          if (isLodgingBusinessType(org.businessType)) {
            return []
          }
          try {
            const items = await listProductsRequest(org.id)
            return (Array.isArray(items) ? items : []).map((product) => ({
              ...product,
              organizationId: product.organizationId ?? org.id,
              organizationName: org.name,
              organizationSlug: org.slug,
              businessType: org.businessType,
              myRole: org.myRole,
              canManage: canManageOrgProducts(org),
            }))
          } catch {
            return []
          }
        }),
      )

      setProducts(productGroups.flat())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
      setOrganizations([])
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  function openCreateModal() {
    setEditingProduct(null)
    setIsProductModalOpen(true)
  }

  function openEditModal(product) {
    setEditingProduct(product)
    setIsProductModalOpen(true)
  }

  function closeProductModal() {
    setIsProductModalOpen(false)
    setEditingProduct(null)
  }

  function openProductDetail(product) {
    setViewingProduct(product)
    setIsProductDetailOpen(true)
  }

  function closeProductDetail() {
    setIsProductDetailOpen(false)
  }

  function openBusinessDetail(organizationId) {
    if (!organizationId) return
    setIsProductDetailOpen(false)
    setDetailOrgId(organizationId)
    setIsBusinessDetailOpen(true)
  }

  async function handleDeleteProduct(product) {
    if (!product?.canManage) return

    setBusy(`delete-${product.id}`)
    setError('')
    try {
      await deleteProductRequest(product.organizationId, product.id)
      setIsProductDetailOpen(false)
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete product',
      )
    } finally {
      setBusy('')
    }
  }

  async function handleRestoreProduct(product) {
    if (!product?.canManage) return

    setBusy(`restore-${product.id}`)
    setError('')
    try {
      await restoreProductRequest(product.organizationId, product.id)
      setIsProductDetailOpen(false)
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to restore product',
      )
    } finally {
      setBusy('')
    }
  }

  function requestPermanentDelete(product) {
    if (!product?.canManage || product.status !== 'deleted') return
    setProductToPurge(product)
  }

  async function handlePermanentDelete() {
    const product = productToPurge
    if (!product?.canManage) return

    setBusy(`purge-${product.id}`)
    setError('')
    try {
      await permanentlyDeleteProductRequest(
        product.organizationId,
        product.id,
      )
      setProductToPurge(null)
      setIsProductDetailOpen(false)
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to permanently delete product',
      )
    } finally {
      setBusy('')
    }
  }

  return (
    <FormFieldProvider rounded="rounded-xl">
      <div className="mx-auto w-full space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle icon={PiPackage} title={title} description={description} />

        </div>

        {error ? (
          <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
          <div className="relative w-[400px]">
            <PiMagnifyingGlass className="icon pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="h-11 pl-10"
              aria-label="Search products"
              disabled={isLoading}
            />
          </div>
          <div className={cn("flex gap-3 flex-row")}>
            <Dropdown
              value={businessFilter}
              onChange={setBusinessFilter}
              options={businessOptions}
              triggerClassName="h-11 min-w-[180px] justify-between rounded-xl border-gray-200 px-4 font-normal shadow-none"
            />
            <Dropdown
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categoryOptions}
              triggerClassName="h-11 min-w-[180px] justify-between rounded-xl border-gray-200 px-4 font-normal shadow-none"
            />
            <Dropdown
              value={resolvedStatus}
              onChange={handleStatusFilterChange}
              options={statusOptions}
              triggerClassName="h-11 min-w-[160px] justify-between rounded-xl border-gray-200 px-4 font-normal shadow-none"
            />
            {canUpload && manageableOrgs.length > 0 ? (
              <Button
                type="button"
                onClick={openCreateModal}
                className="h-11 gap-2 px-4"
              >
                <PiPlus className="icon" />
              </Button>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <ul
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
            aria-busy="true"
            aria-label="Loading products"
          >
            {Array.from({ length: 8 }, (_, index) => (
              <ProductCardSkeleton key={`product-skeleton-${index}`} />
            ))}
          </ul>
        ) : filteredProducts.length === 0 ? (
          <div className="border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <PiPackage className="icon mx-auto size-10 text-zinc-300" />
            <p className="mt-3 text-sm font-medium text-zinc-800">
              No products yet
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {canUpload && manageableOrgs.length > 0
                ? 'Upload your first product from this section.'
                : 'Products from your businesses will appear here.'}
            </p>
            {canUpload && manageableOrgs.length > 0 ? (
              <Button
                type="button"
                onClick={openCreateModal}
                className="mx-auto mt-5 gap-2 px-4"
              >
                <PiPlus className="icon" />
                Add product
              </Button>
            ) : null}
          </div>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const cover = product.images?.[0]
              const categoryName = product.category?.name
              const attrs = product.attributes ?? {}
              const lodgingMeta = [
                formatLodgingAttributeLabel('climate', attrs.climate),
                formatLodgingAttributeLabel('stayDays', attrs.stayDays),
                formatLodgingAttributeLabel('bathroom', attrs.bathroom),
              ].filter(Boolean)
              const isLodging = isLodgingBusinessType(product.businessType)

              return (
                <li
                  key={`${product.organizationId}-${product.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white transition hover:border-zinc-300"
                >
                  <button
                    type="button"
                    onClick={() => openProductDetail(product)}
                    className="flex flex-1 flex-col icon text-left"
                    aria-label={`View details for ${product.name}`}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden icon">
                      {cover?.url ? (
                        <img
                          src={getAssetUrl(cover.url)}
                          alt={product.name}
                          className="h-full w-full object-cover icon transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full icon items-center justify-center text-zinc-400">
                          <PiPackage className="icon size-10" />
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 icon " />

                      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                        <div className="flex min-w-0 flex-wrap gap-1.5">
                          {categoryName ? (
                            <Badge tone={categoryTone(categoryName)} dot>
                              {categoryName}
                            </Badge>
                          ) : null}
                          {product.isFeatured ? (
                            <Badge tone="amber" dot>
                              Featured
                            </Badge>
                          ) : null}
                        </div>
                        <Badge
                          tone={statusTone(product.status || 'draft')}
                          dot
                        >
                          {formatProductStatusLabel(product.status || 'draft')}
                        </Badge>
                      </div>

                      <div className="absolute right-3 bottom-3">
                        <span className="rounded-xl bg-emerald-500 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
                          {formatPrice(product.price)}
                          {isLodging ? (
                            <span className="ml-1 text-[10px] font-semibold opacity-90">
                              /NIGHT
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4 pb-0">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-zinc-900">
                          {product.name}
                        </h3>
                        <p className="mt-1 truncate text-xs text-zinc-500">
                          SKU · {product.sku}
                        </p>
                      </div>

                      {product.description ? (
                        <p className="line-clamp-2 text-sm leading-6 text-zinc-500">
                          {product.description}
                        </p>
                      ) : null}

                      <div className="mt-auto flex flex-wrap items-center gap-1.5 pb-3">
                        {product.businessType ? (
                          <Badge tone={businessTypeTone(product.businessType)}>
                            {formatBusinessTypeLabel(product.businessType)}
                          </Badge>
                        ) : null}
                        {lodgingMeta.map((label) => (
                          <Badge key={label} className='text-[10px] capitalize' tone="amber">
                            {label}
                          </Badge>
                        ))}
                        <Badge tone="sky">
                          <span className="inline-flex items-center gap-1">
                            <PiBuildings className="icon size-3" />
                            {product.organizationName}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center justify-end gap-2 border-t border-zinc-100 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openBusinessDetail(product.organizationId)}
                      className="rounded-[15px] flex items-center justify-center gap-3 border border-gray-200 px-5 h-11 text-xs font-medium text-zinc-500 transition hover:text-primary"
                    >
                      <PiBuildings className='icon' />
                      View Business
                    </button>

                    {product.canManage ? (
                      <div className="flex items-center gap-1.5">
                        {product.status === 'deleted' ? (
                          <>
                            <Button
                              type="button"
                              variant="outlined"
                              disabled={busy === `restore-${product.id}`}
                              onClick={() => void handleRestoreProduct(product)}
                              aria-label="Restore product"
                              className="h-9 gap-1.5 px-3 text-emerald-700 hover:bg-emerald-50"
                            >
                              <PiArrowCounterClockwise className="icon size-4" />
                              Restore
                            </Button>
                            <Button
                              type="button"
                              variant="outlined"
                              disabled={busy === `purge-${product.id}`}
                              onClick={() => requestPermanentDelete(product)}
                              aria-label="Delete product permanently"
                              className="h-9 w-11 px-0 text-rose-600 hover:bg-rose-50"
                            >
                              <PiTrash className="icon size-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="outlined"
                              onClick={() => openEditModal(product)}
                              aria-label="Edit product"
                              className="h-9 w-11 px-0"
                            >
                              <PiPencilSimple className="icon size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outlined"
                              disabled={busy === `delete-${product.id}`}
                              onClick={() => void handleDeleteProduct(product)}
                              aria-label="Delete product"
                              className="h-9 w-11 px-0 text-rose-600 hover:bg-rose-50"
                            >
                              <PiTrash className="icon size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <CreateProductModal
        isOpen={isProductModalOpen}
        businesses={manageableOrgs}
        product={editingProduct}
        onClose={closeProductModal}
        onSaved={() => {
          void loadData()
        }}
      />

      <ProductDetailDrawer
        isOpen={isProductDetailOpen}
        product={viewingProduct}
        busy={busy}
        onClose={closeProductDetail}
        onEdit={(product) => {
          closeProductDetail()
          openEditModal(product)
        }}
        onDelete={(product) => void handleDeleteProduct(product)}
        onRestore={(product) => void handleRestoreProduct(product)}
        onPermanentDelete={(product) => requestPermanentDelete(product)}
        onViewBusiness={(product) =>
          openBusinessDetail(product.organizationId)
        }
      />

      <ConfirmModal
        isOpen={Boolean(productToPurge)}
        title="Delete permanently?"
        description={
          productToPurge
            ? `"${productToPurge.name}" will be removed from this business forever. This cannot be undone.`
            : 'This product will be removed forever.'
        }
        confirmLabel="Delete forever"
        isConfirming={Boolean(
          productToPurge && busy === `purge-${productToPurge.id}`,
        )}
        onClose={() => {
          if (productToPurge && busy === `purge-${productToPurge.id}`) return
          setProductToPurge(null)
        }}
        onConfirm={() => void handlePermanentDelete()}
      />

      <BusinessDetailDrawer
        isOpen={isBusinessDetailOpen}
        organizationId={detailOrgId}
        canAssignAdmin={canAssignAdmin}
        canManageTeams={canManageTeams}
        onClose={() => setIsBusinessDetailOpen(false)}
      />
    </FormFieldProvider>
  )
}
