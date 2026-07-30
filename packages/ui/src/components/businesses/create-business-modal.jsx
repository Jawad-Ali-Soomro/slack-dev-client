import { useCallback, useEffect, useRef, useState } from 'react'
import {
  PiBuildings,
  PiImage,
  PiLinkSimple,
  PiMapPin,
  PiTag,
  PiUserPlus,
  PiX,
} from 'react-icons/pi'
import {
  createOrganizationRequest,
  updateOrganizationRequest,
  uploadOrganizationLogoRequest,
} from '@multi-tenants/api'
import {
  BUSINESS_TYPE_OPTIONS,
  isLodgingBusinessType,
} from '@multi-tenants/constants'
import { getAssetUrl } from '@multi-tenants/config'
import {
  useModalAnimation,
  useModalBodyLock,
} from '@multi-tenants/hooks'
import { cn, slugify } from '@multi-tenants/utils'
import Button from '../button.jsx'
import IconInput from '../icon-input.jsx'
import { Dropdown } from '../dropdown.jsx'
import {
  FieldLabel,
  FormFieldProvider,
  SectionTitle,
  useFormField,
} from '../../contexts/form-field-context.jsx'

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  businessType: 'e-commerce',
  city: '',
  country: '',
  address: '',
  adminEmail: '',
  slugTouched: false,
}

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

export default function CreateBusinessModal({
  isOpen,
  onClose,
  onSaved,
  canAssignAdmin = false,
  organization = null,
}) {
  const isEdit = Boolean(organization?.id)
  const { shouldRender, isClosing } = useModalAnimation(isOpen)
  const [form, setForm] = useState(EMPTY_FORM)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    onClose?.()
  }, [isSubmitting, onClose])

  useModalBodyLock(shouldRender, handleClose)

  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_FORM)
      setLogoFile(null)
      setError('')
      setIsSubmitting(false)
      setLogoPreview((prev) => {
        if (prev?.startsWith?.('blob:')) URL.revokeObjectURL(prev)
        return ''
      })
      return
    }

    if (organization) {
      setForm({
        name: organization.name ?? '',
        slug: organization.slug ?? '',
        description: organization.description ?? '',
        businessType: organization.businessType || 'e-commerce',
        city: organization.city ?? '',
        country: organization.country ?? '',
        address: organization.address ?? '',
        adminEmail: '',
        slugTouched: true,
      })
      setLogoPreview(
        organization.logo?.url ? getAssetUrl(organization.logo.url) : '',
      )
      setLogoFile(null)
    } else {
      setForm(EMPTY_FORM)
      setLogoPreview('')
      setLogoFile(null)
    }
  }, [isOpen, organization])

  useEffect(() => {
    return () => {
      if (logoPreview?.startsWith?.('blob:')) URL.revokeObjectURL(logoPreview)
    }
  }, [logoPreview])

  function updateField(field, value) {
    setForm((prev) => {
      if (field === 'name' && !prev.slugTouched) {
        return { ...prev, name: value, slug: slugify(value) }
      }

      if (field === 'slug') {
        return { ...prev, slug: slugify(value), slugTouched: true }
      }

      return { ...prev, [field]: value }
    })
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file for the logo')
      return
    }

    setError('')
    setLogoFile(file)
    setLogoPreview((prev) => {
      if (prev?.startsWith?.('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  function clearLogo() {
    setLogoFile(null)
    setLogoPreview((prev) => {
      if (prev?.startsWith?.('blob:')) URL.revokeObjectURL(prev)
      return ''
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const isLodging = isLodgingBusinessType(form.businessType)
      const city = form.city.trim()
      const country = form.country.trim()
      const address = form.address.trim()

      if (isLodging) {
        if (!city) {
          setError('City is required for hotel and hostel businesses')
          setIsSubmitting(false)
          return
        }
        if (!country) {
          setError('Country is required for hotel and hostel businesses')
          setIsSubmitting(false)
          return
        }
      }

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        businessType: form.businessType || undefined,
        ...(isLodging
          ? {
              city,
              country,
              ...(address ? { address } : {}),
            }
          : {}),
      }

      let saved
      if (isEdit) {
        saved = await updateOrganizationRequest(organization.id, payload)
      } else {
        if (!form.businessType) {
          setError('Business type is required')
          setIsSubmitting(false)
          return
        }
        saved = await createOrganizationRequest({
          ...payload,
          businessType: form.businessType,
          adminEmail: form.adminEmail.trim() || undefined,
        })
      }

      if (logoFile && saved?.id) {
        await uploadOrganizationLogoRequest(saved.id, logoFile)
      }

      onSaved?.(saved)
      onClose?.()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? 'Failed to update business'
            : 'Failed to create business',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shouldRender) {
    return null
  }

  const isLodging = isLodgingBusinessType(form.businessType)

  return (
    <div className="fixed icon inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close business modal"
        onClick={handleClose}
        className={`absolute inset-0 bg-black/30 icon backdrop-blur-sm ${
          isClosing ? 'login-modal-backdrop-exit' : 'login-modal-backdrop-enter'
        }`}
      />

      <FormFieldProvider rounded="rounded-xl">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="business-form-title"
          className={`relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6 text-black shadow-2xl sm:p-8 ${
            isClosing ? 'login-modal-panel-exit' : 'login-modal-panel-enter'
          }`}
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-5 top-5 text-gray-400 transition hover:scale-110 hover:text-black"
          >
            <PiX className="icon text-xl" />
          </button>

          <SectionTitle
            icon={PiBuildings}
            title={isEdit ? 'Edit business' : 'Create business'}
            description={
              isEdit
                ? 'Update business details and logo.'
                : canAssignAdmin
                  ? 'Create an organization and hand it to an admin by email.'
                  : 'Create a business and optional logo.'
            }
            className="pr-8"
          />

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="flex flex-col relative items-center gap-3">
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-24 w-full items-center justify-center overflow-hidden border border-dashed border-gray-300 bg-gray-50 transition hover:border-primary hover:bg-primary/5"
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="icon h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex flex-col items-center gap-1 text-gray-400">
                      <PiImage className="icon text-2xl" />
                    </span>
                  )}
                </button>

                {logoPreview && logoFile ? (
                  <button
                    type="button"
                    onClick={clearLogo}
                    aria-label="Remove logo"
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center border border-gray-200 bg-white text-gray-500 shadow-sm hover:text-red-500"
                  >
                    <PiX className="icon h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <p className="text-xs text-gray-500 absolute bottom-2 ">
                Optional · PNG, JPG, or WebP
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldLabel className="icon sm:col-span-2">
                <IconInput
                  icon={PiBuildings}
                  required
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="Business name"
                  aria-label="Business name"
                />
              </FieldLabel>

              <FieldLabel className="icon sm:col-span-2">
                <IconDropdown
                  icon={PiTag}
                  value={form.businessType}
                  onChange={(value) => updateField('businessType', value)}
                  options={BUSINESS_TYPE_OPTIONS}
                  placeholder="Business type"
                />
                <span className="text-xs text-gray-500">
                  {isLodging
                    ? 'Hotel/hostel · set location below; admins add rooms later'
                    : 'Required · E-Commerce or Pharmacy — controls product categories'}
                </span>
              </FieldLabel>

              <FieldLabel>
                <IconInput
                  icon={PiLinkSimple}
                  required
                  value={form.slug}
                  onChange={(event) => updateField('slug', event.target.value)}
                  placeholder="slug"
                  aria-label="Slug"
                />
              </FieldLabel>

              {!isEdit && canAssignAdmin ? (
                <FieldLabel>
                  <IconInput
                    icon={PiUserPlus}
                    type="email"
                    value={form.adminEmail}
                    onChange={(event) =>
                      updateField('adminEmail', event.target.value)
                    }
                    placeholder="admin@example.com"
                    aria-label="Assign admin email"
                  />
                </FieldLabel>
              ) : (
                <div className="hidden sm:block" />
              )}
            </div>

            {isLodging ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldLabel>
                  <IconInput
                    icon={PiMapPin}
                    required
                    value={form.city}
                    onChange={(event) => updateField('city', event.target.value)}
                    placeholder="City"
                    aria-label="City"
                  />
                </FieldLabel>
                <FieldLabel>
                  <IconInput
                    icon={PiMapPin}
                    required
                    value={form.country}
                    onChange={(event) =>
                      updateField('country', event.target.value)
                    }
                    placeholder="Country"
                    aria-label="Country"
                  />
                </FieldLabel>
                <FieldLabel className="sm:col-span-2">
                  <IconInput
                    icon={PiMapPin}
                    value={form.address}
                    onChange={(event) =>
                      updateField('address', event.target.value)
                    }
                    placeholder="Street address (optional)"
                    aria-label="Address"
                  />
                </FieldLabel>
              </div>
            ) : null}

            <FieldLabel>
              <DescriptionField
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                rows={3}
                placeholder="Short description"
                aria-label="Description"
              />
            </FieldLabel>

            {error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : null}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outlined"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4"
              >
                {isSubmitting
                  ? isEdit
                    ? 'Saving...'
                    : 'Creating...'
                  : isEdit
                    ? 'Save changes'
                    : 'Create business'}
              </Button>
            </div>
          </form>
        </div>
      </FormFieldProvider>
    </div>
  )
}
