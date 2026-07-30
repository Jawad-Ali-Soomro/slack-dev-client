import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  PiBed,
  PiBuildings,
  PiCalendarBlank,
  PiCurrencyDollar,
  PiImage,
  PiMapPin,
  PiMapTrifold,
  PiPackage,
  PiFlagBanner,
  PiSnowflake,
  PiTag,
  PiUsers,
  PiForkKnife,
  PiBathtub,
  PiX,
} from 'react-icons/pi'
import {
  createProductRequest,
  updateProductRequest,
  uploadProductImageRequest,
} from '@multi-tenants/api'
import {
  formatBusinessTypeLabel,
  getProductCategoriesForBusiness,
  isLodgingBusinessType,
  LODGING_BATHROOM_OPTIONS,
  LODGING_CLIMATE_OPTIONS,
  LODGING_MEAL_PLAN_OPTIONS,
  LODGING_VIEW_OPTIONS,
  PRODUCT_STATUS_FORM_OPTIONS,
} from '@multi-tenants/constants'
import { getAssetUrl } from '@multi-tenants/config'
import {
  useModalAnimation,
  useModalBodyLock,
} from '@multi-tenants/hooks'
import { cn } from '@multi-tenants/utils'
import Button from '../button.jsx'
import IconInput from '../icon-input.jsx'
import { Dropdown } from '../dropdown.jsx'
import {
  FieldLabel,
  FormFieldProvider,
  useFormField,
} from '../../contexts/form-field-context.jsx'

const EMPTY_FORM = {
  name: '',
  description: '',
  category: '',
  price: '',
  organizationId: '',
  status: 'draft',
  climate: 'ac',
  bathroom: 'private',
  mealPlan: 'none',
  view: 'none',
  stayDays: '1',
  maxGuests: '2',
  bedCount: '',
  city: '',
  area: '',
  country: '',
  address: '',
}

const MAX_IMAGES = 5

const statusOptions = PRODUCT_STATUS_FORM_OPTIONS.map((item) => ({
  value: item.value,
  label: item.label,
}))

const climateOptions = LODGING_CLIMATE_OPTIONS.map((item) => ({
  value: item.value,
  label: item.label,
}))
const bathroomOptions = LODGING_BATHROOM_OPTIONS.map((item) => ({
  value: item.value,
  label: item.label,
}))
const mealPlanOptions = LODGING_MEAL_PLAN_OPTIONS.map((item) => ({
  value: item.value,
  label: item.label,
}))
const viewOptions = LODGING_VIEW_OPTIONS.map((item) => ({
  value: item.value,
  label: item.label,
}))

function IconDropdown({ icon: Icon, className = '', triggerClassName = '', ...props }) {
  const { rounded } = useFormField()

  return (
    <div className={cn('relative', className)}>
      {Icon ? (
        <Icon className="icon pointer-events-none absolute left-3.5 top-1/2 z-10 size-[1.05rem] -translate-y-1/2 text-zinc-400" />
      ) : null}
      <Dropdown
        {...props}
        triggerClassName={cn(
          'h-12 w-full justify-between border-gray-200 px-4 font-normal shadow-none',
          Icon && 'pl-11',
          rounded,
          triggerClassName,
        )}
      />
    </div>
  )
}

function DescriptionField(props) {
  const { rounded } = useFormField()

  return (
    <textarea
      {...props}
      className={cn(
        'w-full border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-500 focus:border-primary ',
        rounded,
        props.className,
      )}
    />
  )
}

export default function CreateProductModal({
  isOpen,
  onClose,
  onSaved,
  organizationId = null,
  businessType = null,
  businesses = [],
  product = null,
}) {
  const isEdit = Boolean(product?.id)
  const { shouldRender, isClosing } = useModalAnimation(isOpen)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const productableBusinesses = useMemo(
    () => businesses.filter((org) => !isLodgingBusinessType(org.businessType)),
    [businesses],
  )

  const businessOptions = useMemo(
    () =>
      productableBusinesses.map((org) => ({
        value: org.id,
        label: `${org.name}${
          org.businessType
            ? ` · ${formatBusinessTypeLabel(org.businessType)}`
            : ''
        }`,
      })),
    [productableBusinesses],
  )

  const selectedBusiness = useMemo(() => {
    const selectedId =
      form.organizationId || product?.organizationId || organizationId
    if (selectedId && productableBusinesses.length) {
      return productableBusinesses.find((org) => org.id === selectedId) ?? null
    }
    if (organizationId || product?.organizationId) {
      const type = businessType || product?.businessType
      if (isLodgingBusinessType(type) && !isEdit) {
        return productableBusinesses[0] ?? null
      }
      return {
        id: organizationId || product.organizationId,
        businessType: type,
      }
    }
    return productableBusinesses[0] ?? null
  }, [
    form.organizationId,
    organizationId,
    businessType,
    productableBusinesses,
    product,
    isEdit,
  ])

  const resolvedOrgId =
    selectedBusiness?.id ?? product?.organizationId ?? organizationId
  const resolvedBusinessType =
    selectedBusiness?.businessType ??
    product?.businessType ??
    businessType ??
    null

  const isLodging = isLodgingBusinessType(resolvedBusinessType)
  const isPharmacy = resolvedBusinessType === 'pharmacy'

  const categoryOptions = useMemo(() => {
    return getProductCategoriesForBusiness(resolvedBusinessType).map(
      (name) => ({
        value: name,
        label: name,
      }),
    )
  }, [resolvedBusinessType])


  const totalImageSlots = existingImages.length + imageFiles.length

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    onClose?.()
  }, [isSubmitting, onClose])

  useModalBodyLock(shouldRender, handleClose)

  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_FORM)
      setError('')
      setIsSubmitting(false)
      setExistingImages([])
      setImageFiles([])
      setImagePreviews((prev) => {
        prev.forEach((url) => {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url)
        })
        return []
      })
      return
    }

    if (product?.id) {
      const categoryName = product.category?.name ?? ''
      const defaults = getProductCategoriesForBusiness(
        product.businessType ||
          businesses.find((org) => org.id === product.organizationId)
            ?.businessType,
      )
      const attrs = product.attributes ?? {}
      setForm({
        name: product.name ?? '',
        description: product.description ?? '',
        category: categoryName || defaults[0] || 'General',
        price:
          product.price === 0 || product.price
            ? String(product.price)
            : '',
        organizationId: product.organizationId ?? '',
        status: product.status || 'draft',
        climate: attrs.climate || 'ac',
        bathroom: attrs.bathroom || 'private',
        mealPlan: attrs.mealPlan || 'none',
        view: attrs.view || 'none',
        stayDays:
          attrs.stayDays === 0 || attrs.stayDays
            ? String(attrs.stayDays)
            : '1',
        maxGuests:
          attrs.maxGuests === 0 || attrs.maxGuests
            ? String(attrs.maxGuests)
            : '2',
        bedCount:
          attrs.bedCount === 0 || attrs.bedCount
            ? String(attrs.bedCount)
            : '',
        city: attrs.city || '',
        area: attrs.area || '',
        country: attrs.country || '',
        address: attrs.address || '',
      })
      setExistingImages(
        (product.images ?? []).map((image) => ({
          id: image.id,
          url: getAssetUrl(image.url),
        })),
      )
      return
    }

    const initialOrgId =
      organizationId &&
      !isLodgingBusinessType(
        businessType ||
          businesses.find((org) => org.id === organizationId)?.businessType,
      )
        ? organizationId
        : productableBusinesses[0]?.id || ''
    const initialType =
      businessType ||
      productableBusinesses.find((org) => org.id === initialOrgId)
        ?.businessType ||
      productableBusinesses[0]?.businessType ||
      null
    const defaults = getProductCategoriesForBusiness(initialType)

    setForm({
      ...EMPTY_FORM,
      organizationId: initialOrgId,
      category: defaults[0] ?? 'General',
    })
    setExistingImages([])
  }, [isOpen, organizationId, businessType, businesses, product, productableBusinesses])

  useEffect(() => {
    if (!isOpen || !resolvedBusinessType || isEdit) return
    const defaults = getProductCategoriesForBusiness(resolvedBusinessType)
    setForm((prev) => {
      if (defaults.includes(prev.category)) return prev
      return { ...prev, category: defaults[0] ?? 'General' }
    })
  }, [isOpen, resolvedBusinessType, isEdit])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleImagesChange(event) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith('image/'),
    )
    event.target.value = ''

    if (!files.length) return

    setImageFiles((prev) => {
      const room = Math.max(0, MAX_IMAGES - existingImages.length)
      const next = [...prev, ...files].slice(0, room)
      setImagePreviews((current) => {
        current.forEach((url) => {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url)
        })
        return next.map((file) => URL.createObjectURL(file))
      })
      return next
    })
  }

  function removeNewImage(index) {
    setImageFiles((prev) => {
      const next = prev.filter((_, i) => i !== index)
      setImagePreviews((current) => {
        const removed = current[index]
        if (removed?.startsWith('blob:')) URL.revokeObjectURL(removed)
        return current.filter((_, i) => i !== index)
      })
      return next
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!resolvedOrgId || isSubmitting) return

    const name = form.name.trim()
    const category = form.category.trim()
    const price = Number(form.price)

    if (!resolvedOrgId) {
      setError('Select a business')
      return
    }

    if (!name) {
      setError('Product name is required')
      return
    }

    if (isLodging && !isEdit) {
      setError(
        'Hotels and hostels manage rooms instead of products. Use Hotel rooms.',
      )
      return
    }

    if (!category) {
      setError('Product category is required')
      return
    }

    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid price')
      return
    }

    let attributes
    if (isLodging) {
      const stayDays = Number(form.stayDays)
      const maxGuests = Number(form.maxGuests)
      const bedCount = form.bedCount ? Number(form.bedCount) : undefined

      if (!Number.isInteger(stayDays) || stayDays < 1) {
        setError('Enter valid days of stay (1 or more)')
        return
      }
      if (!Number.isInteger(maxGuests) || maxGuests < 1) {
        setError('Enter a valid guest capacity')
        return
      }
      if (
        bedCount !== undefined &&
        (!Number.isInteger(bedCount) || bedCount < 1)
      ) {
        setError('Enter a valid bed count')
        return
      }

      const city = form.city.trim()
      if (!city) {
        setError('City is required for hotel and hostel listings')
        return
      }

      attributes = {
        climate: form.climate,
        bathroom: form.bathroom,
        mealPlan: form.mealPlan,
        view: form.view,
        stayDays,
        maxGuests,
        city,
        ...(form.area.trim() ? { area: form.area.trim() } : {}),
        ...(form.country.trim() ? { country: form.country.trim() } : {}),
        ...(form.address.trim() ? { address: form.address.trim() } : {}),
        ...(bedCount != null ? { bedCount } : {}),
      }
    }

    setIsSubmitting(true)
    setError('')

    try {
      const payload = {
        name,
        description: form.description.trim() || undefined,
        category,
        price,
        status: form.status || 'draft',
        ...(attributes ? { attributes } : {}),
      }

      let saved
      if (isEdit) {
        saved = await updateProductRequest(
          product.organizationId,
          product.id,
          payload,
        )
        if (imageFiles.length) {
          for (const file of imageFiles) {
            await uploadProductImageRequest(
              product.organizationId,
              product.id,
              file,
            )
          }
        }
      } else {
        saved = await createProductRequest(resolvedOrgId, payload)
        if (saved?.id && imageFiles.length) {
          for (const file of imageFiles) {
            await uploadProductImageRequest(resolvedOrgId, saved.id, file)
          }
        }
      }

      onSaved?.(saved)
      onClose?.()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? 'Failed to update product'
            : 'Failed to create product',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shouldRender) {
    return null
  }

  return (
    <div className="fixed icon inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close product modal"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/30 icon backdrop-blur-sm ${
          isClosing ? 'login-modal-backdrop-exit' : 'login-modal-backdrop-enter'
        }`}
      />

      <FormFieldProvider rounded="rounded-2xl">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-form-title"
          className={cn(
            'relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-[28px] bg-white p-8 text-black min-w-[500px] shadow-2xl',
            isLodging ? 'max-w-3xl' : 'max-w-lg',
            isClosing ? 'login-modal-panel-exit' : 'login-modal-panel-enter',
          )}
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute top-5 right-5 z-10 text-gray-400 transition hover:scale-110 hover:text-black"
          >
            <PiX className="icon text-xl" />
          </button>

          <div className="shrink-0 pr-8">
            <h1
              id="product-form-title"
              className={cn(
                'font-bold tracking-tight text-zinc-900',
                isLodging ? 'text-2xl' : 'text-3xl',
              )}
            >
              {isEdit ? 'Edit product' : 'Add product'}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {isLodging
                ? 'Add a room listing with stay options for guests.'
                : isPharmacy
                  ? 'Upload pharmacy inventory using pharmacy categories only.'
                  : resolvedBusinessType
                    ? `Categories for ${formatBusinessTypeLabel(resolvedBusinessType)}.`
                    : 'Fill in the details below to continue.'}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto"
          >
            {businessOptions.length > 0 && !isEdit ? (
              <FieldLabel>
                <IconDropdown
                  icon={PiBuildings}
                  value={form.organizationId || resolvedOrgId || ''}
                  onChange={(value) => updateField('organizationId', value)}
                  options={businessOptions}
                  placeholder="Select business"
                />
              </FieldLabel>
            ) : null}

            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative flex h-28 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 text-zinc-400 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                {existingImages[0] || imagePreviews[0] ? (
                  <img
                    src={existingImages[0]?.url || imagePreviews[0]}
                    alt="Product cover"
                    className="icon absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <PiImage className="icon text-3xl" />
                    <span className="text-xs font-medium">
                      Upload product images
                    </span>
                  </>
                )}
              </button>

              {(existingImages.length > 0 || imagePreviews.length > 0) &&
              totalImageSlots < MAX_IMAGES ? (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {existingImages.map((image, index) => (
                    <div
                      key={image.id || image.url}
                      className="h-14 w-14 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
                    >
                      <img
                        src={image.url}
                        alt={`Product image ${index + 1}`}
                        className="icon h-full w-full object-cover"
                      />
                    </div>
                  ))}
                  {imagePreviews.map((preview, index) => (
                    <div key={preview} className="relative h-14 w-14">
                      <div className="h-full w-full overflow-hidden rounded-xl border border-zinc-200">
                        <img
                          src={preview}
                          alt={`New preview ${index + 1}`}
                          className="icon h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        aria-label={`Remove image ${index + 1}`}
                        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:text-red-500"
                      >
                        <PiX className="icon h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-zinc-300 text-zinc-400 hover:border-primary hover:text-primary"
                  >
                    <PiImage className="icon text-lg" />
                  </button>
                </div>
              ) : null}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImagesChange}
              />
             
            </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FieldLabel>
              <IconInput
                icon={PiPackage}
                required
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Product name"
                aria-label="Product name"
              />
            </FieldLabel>

            <FieldLabel>
              <IconDropdown
                icon={PiTag}
                value={form.category}
                onChange={(category) => updateField('category', category)}
                options={categoryOptions}
                placeholder={
                  isLodging ? 'Select room type' : 'Select category'
                }
              />
              {/* <span className="text-xs text-gray-400">{categoryHint}</span> */}
            </FieldLabel>
           </div>

            <FieldLabel>
              <DescriptionField
                rows={3}
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                placeholder="Description"
                aria-label="Product description"
              />
            </FieldLabel>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FieldLabel>
                <IconInput
                  icon={PiCurrencyDollar}
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => updateField('price', event.target.value)}
                  placeholder={isLodging ? 'Price per night' : 'Price'}
                  aria-label="Product price"
                />
              </FieldLabel>
              <FieldLabel>
                <IconDropdown
                  icon={PiFlagBanner}
                  value={form.status || 'draft'}
                  onChange={(status) => updateField('status', status)}
                  options={statusOptions}
                  placeholder="Select status"
                />
               
              </FieldLabel>
            </div>

            {isLodging ? (
              <div className="">
                
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <FieldLabel>
                    <IconDropdown
                      icon={PiSnowflake}
                      value={form.climate}
                      onChange={(climate) => updateField('climate', climate)}
                      options={climateOptions}
                      placeholder="AC / Non-AC"
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <IconDropdown
                      icon={PiBathtub}
                      value={form.bathroom}
                      onChange={(bathroom) => updateField('bathroom', bathroom)}
                      options={bathroomOptions}
                      placeholder="Bathroom"
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <IconDropdown
                      icon={PiForkKnife}
                      value={form.mealPlan}
                      onChange={(mealPlan) => updateField('mealPlan', mealPlan)}
                      options={mealPlanOptions}
                      placeholder="Meal plan"
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <IconDropdown
                      icon={PiBuildings}
                      value={form.view}
                      onChange={(view) => updateField('view', view)}
                      options={viewOptions}
                      placeholder="View"
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <IconInput
                      icon={PiCalendarBlank}
                      required
                      type="number"
                      min="1"
                      step="1"
                      value={form.stayDays}
                      onChange={(event) =>
                        updateField('stayDays', event.target.value)
                      }
                      placeholder="Days of stay"
                      aria-label="Days of stay"
                      inputClassName="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <IconInput
                      icon={PiUsers}
                      required
                      type="number"
                      min="1"
                      step="1"
                      value={form.maxGuests}
                      onChange={(event) =>
                        updateField('maxGuests', event.target.value)
                      }
                      placeholder="Max guests"
                      aria-label="Max guests"
                      inputClassName="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </FieldLabel>
                  <FieldLabel className="icon">
                    <IconInput
                      icon={PiBed}
                      type="number"
                      min="1"
                      step="1"
                      value={form.bedCount}
                      onChange={(event) =>
                        updateField('bedCount', event.target.value)
                      }
                      placeholder="Bed count (optional, for dorms)"
                      aria-label="Bed count"
                      inputClassName="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <IconInput
                      icon={PiMapPin}
                      required
                      value={form.city}
                      onChange={(event) =>
                        updateField('city', event.target.value)
                      }
                      placeholder="City"
                      aria-label="City"
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <IconInput
                      icon={PiMapTrifold}
                      value={form.area}
                      onChange={(event) =>
                        updateField('area', event.target.value)
                      }
                      placeholder="Area / neighborhood"
                      aria-label="Area"
                    />
                  </FieldLabel>
                  <FieldLabel>
                    <IconInput
                      icon={PiMapPin}
                      value={form.country}
                      onChange={(event) =>
                        updateField('country', event.target.value)
                      }
                      placeholder="Country"
                      aria-label="Country"
                    />
                  </FieldLabel>
                  <FieldLabel className="icon">
                    <IconInput
                      icon={PiBuildings}
                      value={form.address}
                      onChange={(event) =>
                        updateField('address', event.target.value)
                      }
                      placeholder="Address / landmark"
                      aria-label="Address"
                    />
                  </FieldLabel>
                </div>
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <div className="mt-auto flex gap-3 pt-2">
              <Button
                type="button"
                variant="outlined"
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-12 flex-1 rounded-2xl px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 flex-1 rounded-2xl px-4 font-semibold"
              >
                {isSubmitting
                  ? 'Saving...'
                  : isEdit
                    ? 'Save changes'
                    : 'Add product'}
              </Button>
            </div>
          </form>
        </div>
      </FormFieldProvider>
    </div>
  )
}
