import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  PiMagnifyingGlass,
  PiPackage,
  PiPencilSimple,
  PiPlus,
  PiTrash,
  PiWarehouse,
} from 'react-icons/pi'
import {
  createInventoryRequest,
  deleteInventoryRequest,
  listInventoryRequest,
  listOrganizationsRequest,
  listProductsRequest,
  updateInventoryRequest,
} from '@multi-tenants/api'
import {
  formatBusinessTypeLabel,
  formatProductStatusLabel,
  isLodgingBusinessType,
} from '@multi-tenants/constants'
import { getAssetUrl } from '@multi-tenants/config'
import { cn } from '@multi-tenants/utils'
import Button from '../button.jsx'
import Checkbox from '../checkbox.jsx'
import Input from '../input.jsx'
import { Dropdown } from '../dropdown.jsx'
import ConfirmModal from '../confirm-modal.jsx'
import {
  FormFieldProvider,
  FieldLabel,
  SectionTitle,
} from '../../contexts/form-field-context.jsx'

function canManageOrg(org) {
  return org?.myRole === 'OWNER' || org?.myRole === 'ADMIN'
}

function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-zinc-100 text-zinc-700 ring-zinc-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200/80',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200/80',
  }

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}

function stockTone(row) {
  if (!row?.inStock) return 'rose'
  if (
    row.reorderLevel != null &&
    row.available <= row.reorderLevel
  ) {
    return 'amber'
  }
  return 'emerald'
}

function stockLabel(row) {
  if (!row?.inStock) return 'Out of stock'
  if (
    row.reorderLevel != null &&
    row.available <= row.reorderLevel
  ) {
    return 'Low stock'
  }
  return 'In stock'
}

export default function InventoryPage({
  title = 'Inventory',
  description = 'Manage product quantities for e-commerce and pharmacy businesses. Hotels and hostels use Hotel rooms instead.',
  canManage = true,
}) {
  const [organizations, setOrganizations] = useState([])
  const [inventories, setInventories] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [businessFilter, setBusinessFilter] = useState('all')
  const [busy, setBusy] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [formOrgId, setFormOrgId] = useState('')
  const [formProductId, setFormProductId] = useState('')
  const [formQuantity, setFormQuantity] = useState('0')
  const [formReorder, setFormReorder] = useState('')
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const manageableOrgs = useMemo(
    () =>
      organizations.filter(
        (org) => canManageOrg(org) && !isLodgingBusinessType(org.businessType),
      ),
    [organizations],
  )

  const inventoryOrgs = useMemo(
    () =>
      organizations.filter((org) => !isLodgingBusinessType(org.businessType)),
    [organizations],
  )

  const businessOptions = useMemo(
    () => [
      { value: 'all', label: 'All businesses' },
      ...inventoryOrgs.map((org) => ({
        value: org.id,
        label: org.name,
      })),
    ],
    [inventoryOrgs],
  )

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const orgs = await listOrganizationsRequest()
      const orgList = (Array.isArray(orgs) ? orgs : []).filter(
        (org) => !isLodgingBusinessType(org.businessType),
      )
      setOrganizations(orgList)

      const [inventoryGroups, productGroups] = await Promise.all([
        Promise.all(
          orgList.map(async (org) => {
            try {
              const rows = await listInventoryRequest(org.id)
              return (Array.isArray(rows) ? rows : []).map((row) => ({
                ...row,
                organizationId: org.id,
                organizationName: org.name,
                businessType: org.businessType,
                canManage: canManageOrg(org),
              }))
            } catch {
              return []
            }
          }),
        ),
        Promise.all(
          orgList.map(async (org) => {
            try {
              const rows = await listProductsRequest(org.id)
              return (Array.isArray(rows) ? rows : []).map((product) => ({
                ...product,
                organizationId: org.id,
                organizationName: org.name,
              }))
            } catch {
              return []
            }
          }),
        ),
      ])

      setInventories(inventoryGroups.flat())
      setProducts(productGroups.flat())
      setSelectedIds(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory')
      setInventories([])
      setProducts([])
      setSelectedIds(new Set())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return inventories.filter((row) => {
      if (businessFilter !== 'all' && row.organizationId !== businessFilter) {
        return false
      }
      if (!q) return true
      const haystack = [
        row.product?.name,
        row.product?.sku,
        row.organizationName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [inventories, search, businessFilter])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [search, businessFilter])

  const allSelected = useMemo(
    () =>
      filtered.length > 0 && filtered.every((row) => selectedIds.has(row.id)),
    [filtered, selectedIds],
  )

  const someSelected = useMemo(
    () => filtered.some((row) => selectedIds.has(row.id)),
    [filtered, selectedIds],
  )

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(filtered.map((row) => row.id)))
  }

  function toggleOne(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const productsWithoutInventory = useMemo(() => {
    const inventoried = new Set(inventories.map((row) => row.productId))
    return products.filter(
      (product) =>
        product.status !== 'deleted' &&
        !inventoried.has(product.id) &&
        (!formOrgId || product.organizationId === formOrgId),
    )
  }, [products, inventories, formOrgId])

  const productOptions = useMemo(
    () =>
      productsWithoutInventory.map((product) => ({
        value: product.id,
        label: `${product.name} · ${product.sku}`,
      })),
    [productsWithoutInventory],
  )

  const orgOptions = useMemo(
    () =>
      manageableOrgs.map((org) => ({
        value: org.id,
        label: org.name,
      })),
    [manageableOrgs],
  )

  function openCreate() {
    const defaultOrg = manageableOrgs[0]?.id || ''
    setEditing(null)
    setFormOrgId(defaultOrg)
    setFormProductId('')
    setFormQuantity('0')
    setFormReorder('')
    setError('')
    setIsModalOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setFormOrgId(row.organizationId)
    setFormProductId(row.productId)
    setFormQuantity(String(row.quantity ?? 0))
    setFormReorder(
      row.reorderLevel == null ? '' : String(row.reorderLevel),
    )
    setError('')
    setIsModalOpen(true)
  }

  function closeModal() {
    if (busy) return
    setIsModalOpen(false)
    setEditing(null)
  }

  async function handleSave(event) {
    event.preventDefault()
    if (!canManage) return

    const quantity = Number(formQuantity)
    const reorderLevel =
      formReorder === '' ? undefined : Number(formReorder)

    if (!Number.isInteger(quantity) || quantity < 0) {
      setError('Quantity must be a whole number of 0 or more')
      return
    }
    if (
      reorderLevel !== undefined &&
      (!Number.isInteger(reorderLevel) || reorderLevel < 0)
    ) {
      setError('Reorder level must be a whole number of 0 or more')
      return
    }

    setBusy('save')
    setError('')
    try {
      if (editing) {
        await updateInventoryRequest(editing.organizationId, editing.id, {
          quantity,
          reorderLevel: reorderLevel ?? null,
        })
      } else {
        if (!formOrgId || !formProductId) {
          setError('Select a business and product')
          setBusy('')
          return
        }
        await createInventoryRequest(formOrgId, {
          productId: formProductId,
          quantity,
          ...(reorderLevel !== undefined ? { reorderLevel } : {}),
        })
      }
      setIsModalOpen(false)
      setEditing(null)
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save inventory',
      )
    } finally {
      setBusy('')
    }
  }

  async function handleDelete() {
    if (!toDelete) return
    setBusy('delete')
    setError('')
    try {
      await deleteInventoryRequest(toDelete.organizationId, toDelete.id)
      setToDelete(null)
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete inventory',
      )
    } finally {
      setBusy('')
    }
  }

  return (
    <FormFieldProvider rounded="rounded-xl">
      <div className="mx-auto w-full space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle icon={PiWarehouse} title={title} description={description} />
          {canManage && manageableOrgs.length > 0 ? (
            <Button type="button" onClick={openCreate} className="h-11 gap-2 px-4">
              <PiPlus className="icon" />
              Add inventory
            </Button>
          ) : null}
        </div>

        {error && !isModalOpen ? (
          <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
          <div className="relative w-full max-w-[400px]">
            <PiMagnifyingGlass className="icon pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search inventory..."
              className="h-11 pl-10"
              aria-label="Search inventory"
              disabled={isLoading}
            />
          </div>
         <div className="flex max-w-[400px]">
         <Dropdown
            value={businessFilter}
            onChange={setBusinessFilter}
            options={businessOptions}
            triggerClassName="h-11 min-w-[400px] justify-between rounded-xl border-gray-200 px-4 font-normal shadow-none"
          />
         </div>
        </div>

        {isLoading ? (
          <div className="border border-dashed border-zinc-200 bg-white px-6 py-16 text-center text-sm text-zinc-500">
            Loading inventory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <PiPackage className="icon mx-auto size-10 text-zinc-300" />
            <p className="mt-3 text-sm font-medium text-zinc-800">
              No inventory records
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Hotels and hostels manage rooms under Hotel rooms. Create a
              product for e-commerce or pharmacy, then add inventory here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected && !allSelected}
                      onChange={toggleAll}
                      ariaLabel="Select all inventory rows"
                    />
                  </th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Available</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const cover = row.product?.images?.[0]?.url
                  const isSelected = selectedIds.has(row.id)
                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        'border-b border-zinc-100 last:border-0',
                        isSelected && 'bg-emerald-50/50',
                      )}
                    >
                      <td className="px-4 py-3 align-middle">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleOne(row.id)}
                          ariaLabel={`Select ${row.product?.name || 'inventory row'}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                            {cover ? (
                              <img
                                src={getAssetUrl(cover)}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-zinc-300">
                                <PiPackage className="icon size-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-zinc-900">
                              {row.product?.name || 'Product'}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                              SKU · {row.product?.sku}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-800">
                        {row.organizationName}
                      </td>
                      <td className="px-4 py-3">
                        {row.businessType ? (
                          <Badge tone="sky" className='px-5 py-3 flex items-center justify-center'>
                            {formatBusinessTypeLabel(row.businessType)}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900">
                        {row.quantity}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{row.available}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Badge tone={stockTone(row)} className='px-5 py-3 flex items-center justify-center'>{stockLabel(row)}</Badge>
                          {row.product?.status ? (
                            <Badge tone="neutral" className='px-5 py-3 flex items-center justify-center'>
                              {formatProductStatusLabel(row.product.status)}
                            </Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {row.canManage && canManage ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="outlined"
                              onClick={() => openEdit(row)}
                              aria-label="Edit inventory"
                              className="h-9 w-11 px-0"
                            >
                              <PiPencilSimple className="icon size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outlined"
                              onClick={() => setToDelete(row)}
                              aria-label="Delete inventory"
                              className="h-9 w-11 px-0 text-rose-600 hover:bg-rose-50"
                            >
                              <PiTrash className="icon size-4" />
                            </Button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
          />
          <form
            onSubmit={(event) => void handleSave(event)}
            className="relative z-10 w-full max-w-md space-y-4 rounded-[28px] bg-white p-8 shadow-2xl"
          >
            <SectionTitle
              icon={PiWarehouse}
              title={editing ? 'Update inventory' : 'Add inventory'}
              description={
                editing
                  ? 'Adjust quantity for this product.'
                  : 'Create one inventory record for a product in your business.'
              }
            />

            {error ? (
              <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {!editing ? (
              <>
                <div>
                  <FieldLabel>Business</FieldLabel>
                  <Dropdown
                    value={formOrgId}
                    onChange={(value) => {
                      setFormOrgId(value)
                      setFormProductId('')
                    }}
                    options={orgOptions}
                    triggerClassName="mt-1.5 h-11 w-full justify-between rounded-xl border-gray-200 px-4 font-normal shadow-none"
                  />
                </div>
                <div>
                  <FieldLabel>Product</FieldLabel>
                  {productOptions.length === 0 ? (
                    <p className="mt-1.5 text-sm text-zinc-500">
                      No products without inventory in this business. Create a
                      product first, or pick another business.
                    </p>
                  ) : (
                    <Dropdown
                      value={formProductId}
                      onChange={setFormProductId}
                      options={productOptions}
                      triggerClassName="mt-1.5 h-11 w-full justify-between rounded-xl border-gray-200 px-4 font-normal shadow-none"
                    />
                  )}
                </div>
              </>
            ) : (
              <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                {editing.product?.name} · {editing.organizationName}
              </p>
            )}

            <div>
              <FieldLabel>Quantity</FieldLabel>
              <Input
                type="number"
                min={0}
                step={1}
                value={formQuantity}
                onChange={(event) => setFormQuantity(event.target.value)}
                className="mt-1.5 h-11"
                required
              />
            </div>

            <div>
              <FieldLabel>Reorder level (optional)</FieldLabel>
              <Input
                type="number"
                min={0}
                step={1}
                value={formReorder}
                onChange={(event) => setFormReorder(event.target.value)}
                className="mt-1.5 h-11"
                placeholder="Low-stock warning"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outlined"
                onClick={closeModal}
                disabled={busy === 'save'}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  busy === 'save' ||
                  (!editing && (!formOrgId || !formProductId))
                }
                className="flex-1"
              >
                {busy === 'save' ? 'Saving...' : editing ? 'Save' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={Boolean(toDelete)}
        title="Remove inventory?"
        description={
          toDelete
            ? `Inventory for "${toDelete.product?.name}" will be removed. The product will show as out of stock publicly until inventory is added again.`
            : 'This inventory record will be removed.'
        }
        confirmLabel="Remove"
        isConfirming={busy === 'delete'}
        onClose={() => {
          if (busy === 'delete') return
          setToDelete(null)
        }}
        onConfirm={() => void handleDelete()}
      />
    </FormFieldProvider>
  )
}
