import 'dotenv/config'
import { existsSync, readdirSync, statSync } from 'fs'
import { extname, join } from 'path'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  ImageType,
  OrganizationRole,
  Prisma,
  PrismaClient,
  Role,
} from '@prisma/client'

const UPLOADS_ROOT = join(process.cwd(), 'uploads')
const PRODUCTS_DIR = join(UPLOADS_ROOT, 'products')
const LOGOS_DIR = join(UPLOADS_ROOT, 'logos')

const SUPERADMIN_EMAIL =
  process.env.SEED_SUPERADMIN_EMAIL ?? 'jawadal829@gmail.com'
const SUPERADMIN_PASSWORD =
  process.env.SEED_SUPERADMIN_PASSWORD ?? 'Jawad@123'
const SUPERADMIN_USERNAME =
  process.env.SEED_SUPERADMIN_USERNAME ?? 'jawad.superadmin'

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@multi-tenants.local'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123'
const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME ?? 'platform.admin'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

type SeedOrg = {
  name: string
  slug: string
  businessType: string
  description: string
  city: string
  country: string
  products: Array<{
    name: string
    category: string
    price: number
    description: string
    attributes?: Prisma.InputJsonObject
  }>
}

const ORGS: SeedOrg[] = [
  {
    name: 'Skyline Hotels',
    slug: 'skyline-hotels',
    businessType: 'hotel-management',
    description: 'Boutique hotel rooms across the city.',
    city: 'Karachi',
    country: 'Pakistan',
    products: [
      {
        name: 'Deluxe Sea View Room',
        category: 'Double Bedroom',
        price: 120,
        description: 'King bed, sea view, complimentary breakfast.',
        attributes: {
          climate: 'ac',
          bathroom: 'private',
          mealPlan: 'breakfast',
          view: 'city',
          stayDays: 1,
          maxGuests: 2,
          city: 'Karachi',
          area: 'Clifton',
          country: 'Pakistan',
        },
      },
      {
        name: 'Executive Suite',
        category: 'Suite',
        price: 220,
        description: 'Spacious suite with lounge and work desk.',
        attributes: {
          climate: 'ac',
          bathroom: 'private',
          mealPlan: 'half-board',
          view: 'city',
          stayDays: 2,
          maxGuests: 3,
          city: 'Karachi',
          area: 'DHA',
          country: 'Pakistan',
        },
      },
      {
        name: 'Family Garden Room',
        category: 'Family Room',
        price: 160,
        description: 'Family-friendly room overlooking the garden.',
        attributes: {
          climate: 'ac',
          bathroom: 'private',
          mealPlan: 'breakfast',
          view: 'garden',
          stayDays: 1,
          maxGuests: 4,
          city: 'Karachi',
          area: 'Clifton',
          country: 'Pakistan',
        },
      },
    ],
  },
  {
    name: 'Harbor Hostels',
    slug: 'harbor-hostels',
    businessType: 'hostel-management',
    description: 'Affordable hostel stays for travelers.',
    city: 'Lahore',
    country: 'Pakistan',
    products: [
      {
        name: 'Shared Dorm Bed',
        category: 'Shared Dorm',
        price: 18,
        description: 'Bunk bed in a shared dorm with lockers.',
        attributes: {
          climate: 'ac',
          bathroom: 'shared',
          mealPlan: 'none',
          view: 'none',
          stayDays: 1,
          maxGuests: 1,
          bedCount: 1,
          city: 'Lahore',
          area: 'Gulberg',
          country: 'Pakistan',
        },
      },
      {
        name: 'Private Twin Room',
        category: 'Twin Room',
        price: 45,
        description: 'Private twin room with shared bathroom.',
        attributes: {
          climate: 'non-ac',
          bathroom: 'shared',
          mealPlan: 'breakfast',
          view: 'none',
          stayDays: 1,
          maxGuests: 2,
          bedCount: 2,
          city: 'Lahore',
          area: 'Gulberg',
          country: 'Pakistan',
        },
      },
    ],
  },
  {
    name: 'CarePlus Pharmacy',
    slug: 'careplus-pharmacy',
    businessType: 'pharmacy',
    description: 'Trusted pharmacy for everyday care.',
    city: 'Islamabad',
    country: 'Pakistan',
    products: [
      {
        name: 'Paracetamol 500mg',
        category: 'OTC Medicines',
        price: 4.5,
        description: 'Pain relief tablets — pack of 20.',
      },
      {
        name: 'Vitamin C Immunity',
        category: 'Supplements',
        price: 12,
        description: 'Daily vitamin C capsules — 60 count.',
      },
      {
        name: 'First Aid Kit',
        category: 'First Aid',
        price: 19.99,
        description: 'Compact home and travel first aid kit.',
      },
    ],
  },
  {
    name: 'Urban Cart Store',
    slug: 'urban-cart-store',
    businessType: 'e-commerce',
    description: 'Everyday products from local sellers.',
    city: 'Karachi',
    country: 'Pakistan',
    products: [
      {
        name: 'Wireless Headphones',
        category: 'Electronics',
        price: 89,
        description: 'Over-ear wireless headphones with noise isolation.',
      },
      {
        name: 'Canvas Tote Bag',
        category: 'Fashion',
        price: 28,
        description: 'Durable everyday tote for shopping and travel.',
      },
      {
        name: 'Minimal Desk Lamp',
        category: 'Home & Living',
        price: 42,
        description: 'Warm LED desk lamp with adjustable neck.',
      },
    ],
  },
]

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function listImageFiles(dir: string) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((name) => /\.(jpe?g|png|webp)$/i.test(name))
    .map((name) => join(dir, name))
    .filter((filePath) => statSync(filePath).isFile())
}

function mimeFor(filePath: string) {
  const ext = extname(filePath).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  return 'image/jpeg'
}

function toCents(price: number) {
  return Math.round(Number(price) * 100)
}

async function upsertUser(input: {
  email: string
  username: string
  password: string
  role: Role
}) {
  const password = await bcrypt.hash(input.password, 10)
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  })

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        username: input.username,
        password,
        role: input.role,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    })
  }

  return prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      password,
      role: input.role,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  })
}

async function ensureMembership(
  organizationId: string,
  userId: number,
  role: OrganizationRole,
) {
  const existing = await prisma.member.findUnique({
    where: {
      organizationId_userId: { organizationId, userId },
    },
  })

  if (existing) {
    if (existing.role !== role) {
      return prisma.member.update({
        where: { id: existing.id },
        data: { role },
      })
    }
    return existing
  }

  return prisma.member.create({
    data: { organizationId, userId, role },
  })
}

async function ensureCategory(organizationId: string, name: string) {
  const slug = slugify(name)
  return prisma.productCategory.upsert({
    where: {
      organizationId_slug: { organizationId, slug },
    },
    update: { name },
    create: { organizationId, name, slug },
  })
}

async function attachProductImage(options: {
  productId: string
  filePath: string
  uploadedById: number
  alt: string
}) {
  const fileName = options.filePath.split(/[\\/]/).pop()!
  const storageKey = `products/${fileName}`
  const url = `/uploads/${storageKey}`
  const size = statSync(options.filePath).size
  const mimeType = mimeFor(options.filePath)

  const existing = await prisma.image.findUnique({
    where: { storageKey },
  })

  if (existing) {
    return prisma.image.update({
      where: { id: existing.id },
      data: {
        productId: options.productId,
        type: ImageType.PRODUCT,
        url,
        mimeType,
        size,
        alt: options.alt,
        uploadedById: options.uploadedById,
      },
    })
  }

  return prisma.image.create({
    data: {
      url,
      storageKey,
      mimeType,
      size,
      alt: options.alt,
      type: ImageType.PRODUCT,
      productId: options.productId,
      uploadedById: options.uploadedById,
    },
  })
}

async function attachOrgLogo(options: {
  organizationId: string
  filePath: string
  uploadedById: number
}) {
  const organization = await prisma.organization.findUnique({
    where: { id: options.organizationId },
    select: { logoId: true },
  })
  if (organization?.logoId) return organization

  const ext = extname(options.filePath) || '.png'
  const storageKey = `logos/seed-${options.organizationId}${ext}`
  const destPath = join(UPLOADS_ROOT, storageKey)
  const url = `/uploads/${storageKey}`

  if (!existsSync(destPath)) {
    const { copyFileSync } = await import('fs')
    copyFileSync(options.filePath, destPath)
  }

  const size = statSync(destPath).size
  const mimeType = mimeFor(destPath)

  let image = await prisma.image.findUnique({ where: { storageKey } })
  if (!image) {
    image = await prisma.image.create({
      data: {
        url,
        storageKey,
        mimeType,
        size,
        alt: 'Organization logo',
        type: ImageType.LOGO,
        uploadedById: options.uploadedById,
      },
    })
  }

  return prisma.organization.update({
    where: { id: options.organizationId },
    data: { logoId: image.id },
  })
}

async function ensureOrganization(
  org: SeedOrg,
  ownerId: number,
  adminId: number,
  logoPath: string | undefined,
) {
  let organization = await prisma.organization.findUnique({
    where: { slug: org.slug },
  })

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: org.name,
        slug: org.slug,
        description: org.description,
        businessType: org.businessType,
        city: org.city,
        country: org.country,
        isActive: true,
        isVerified: true,
        ownerId,
      },
    })
  } else {
    organization = await prisma.organization.update({
      where: { id: organization.id },
      data: {
        name: org.name,
        description: org.description,
        businessType: org.businessType,
        city: org.city,
        country: org.country,
        isActive: true,
        isVerified: true,
        ownerId,
      },
    })
  }

  await ensureMembership(organization.id, ownerId, OrganizationRole.OWNER)
  await ensureMembership(organization.id, adminId, OrganizationRole.ADMIN)

  if (logoPath) {
    await attachOrgLogo({
      organizationId: organization.id,
      filePath: logoPath,
      uploadedById: ownerId,
    })
  }

  return organization
}

async function ensureProduct(options: {
  organizationId: string
  ownerId: number
  product: SeedOrg['products'][number]
  imagePath: string
  sku: string
}) {
  const category = await ensureCategory(
    options.organizationId,
    options.product.category,
  )

  const existing = await prisma.product.findUnique({
    where: {
      organizationId_sku: {
        organizationId: options.organizationId,
        sku: options.sku,
      },
    },
  })

  const data: Prisma.ProductUncheckedCreateInput = {
    name: options.product.name,
    description: options.product.description,
    sku: options.sku,
    price: toCents(options.product.price),
    isActive: true,
    status: 'published',
    isFeatured: true,
    organizationId: options.organizationId,
    categoryId: category.id,
    ...(options.product.attributes
      ? { attributes: options.product.attributes }
      : {}),
  }

  const product = existing
    ? await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          isActive: data.isActive,
          status: data.status,
          isFeatured: data.isFeatured,
          categoryId: data.categoryId,
          ...(options.product.attributes
            ? { attributes: options.product.attributes }
            : {}),
        },
      })
    : await prisma.product.create({
        data,
      })

  await attachProductImage({
    productId: product.id,
    filePath: options.imagePath,
    uploadedById: options.ownerId,
    alt: options.product.name,
  })

  return product
}

async function main() {
  const productImages = listImageFiles(PRODUCTS_DIR)
  const logoImages = listImageFiles(LOGOS_DIR)

  if (!productImages.length) {
    throw new Error(
      `No product images found in ${PRODUCTS_DIR}. Add images under server/uploads/products first.`,
    )
  }

  console.log(`Using ${productImages.length} product image(s) from uploads/products`)

  const superadmin = await upsertUser({
    email: SUPERADMIN_EMAIL,
    username: SUPERADMIN_USERNAME,
    password: SUPERADMIN_PASSWORD,
    role: Role.SUPERADMIN,
  })

  const admin = await upsertUser({
    email: ADMIN_EMAIL,
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    role: Role.ADMIN,
  })

  console.log(`Superadmin: ${superadmin.email} (${superadmin.role})`)
  console.log(`Admin: ${admin.email} (${admin.role})`)

  let imageIndex = 0
  let logoIndex = 0

  for (const org of ORGS) {
    const logoPath = logoImages.length
      ? logoImages[logoIndex % logoImages.length]
      : undefined
    logoIndex += 1

    const organization = await ensureOrganization(
      org,
      admin.id,
      superadmin.id,
      logoPath,
    )

    console.log(`Organization: ${organization.name} (${organization.slug})`)

    for (const [index, product] of org.products.entries()) {
      const imagePath = productImages[imageIndex % productImages.length]
      imageIndex += 1

      const sku = `SEED-${org.slug.slice(0, 8).toUpperCase()}-${index + 1}`
      const saved = await ensureProduct({
        organizationId: organization.id,
        ownerId: admin.id,
        product,
        imagePath,
        sku,
      })

      console.log(`  Product: ${saved.name} [${saved.status}]`)
    }
  }

  console.log('Seed completed successfully.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (error) => {
    console.error('Seed failed:', error)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
