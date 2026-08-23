import { useState } from 'react'
import type { FormEvent } from 'react'
import { createServerFn } from '@tanstack/react-start'
import { snakeCamelMapper } from '@electric-sql/client'
import { eq } from 'drizzle-orm'

import { products } from '../../drizzle/schema'
import { db } from '../db/db'
import { createCollection, useLiveQuery } from '@tanstack/react-db'
import { electricCollectionOptions } from '@tanstack/electric-db-collection'

const createProduct = createServerFn({ method: 'POST' })
  .validator((product: { name: string; price: string }) => {
    const name = product.name.trim()
    const price = Number(product.price)

    if (!name) {
      throw new Error('Product name is required')
    }

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Product price must be greater than zero')
    }

    return { name, price: price.toFixed(2) }
  })
  .handler(async ({ data: product }) => {
    await db.insert(products).values(product)
    return { success: true }
  })

const deleteProduct = createServerFn({ method: 'POST' })
  .validator((id: number) => {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Invalid product id')
    }

    return id
  })
  .handler(async ({ data: id }) => {
    await db.delete(products).where(eq(products.id, id))
    return { success: true }
  })

type Product = typeof products.$inferSelect

export const productsCollection = createCollection(
  electricCollectionOptions<Product>({
    id: 'products',
    shapeOptions: {
      url: 'http://localhost:30000/v1/shape',
      params: {
        table: 'products',
      },
      columnMapper: snakeCamelMapper(),
    },
    getKey: (product) => product.id,
    onInsert: async ({ transaction }) => {
      const product = transaction.mutations[0].modified
      await createProduct({
        data: {
          name: product.name,
          price: product.price,
        },
      })
    },
    onDelete: async ({ transaction }) => {
      const productId = transaction.mutations[0].key

      await deleteProduct({
        data: productId,
      })
    },
  }),
)

export function Products() {
  const {
    data: items,
    isLoading,
    isError,
  } = useLiveQuery({
    query: (q) => q.from({ product: productsCollection }),
  })

  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    const name = String(formData.get('name') ?? '').trim()
    const price = Number(formData.get('price') ?? 0).toFixed(2)
    setIsCreating(true)
    const transaction = productsCollection.insert({
      id: -Date.now(),
      name,
      price,
      createdAt: null,
    })
    form.reset()
    await transaction.isPersisted.promise
    setIsCreating(false)
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)

    try {
      const transaction = productsCollection.delete(id)
      await transaction.isPersisted.promise
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return <p className="mt-6">Loading products...</p>
  }

  if (isError) {
    return <p className="mt-6 text-red-600">Could not load products.</p>
  }

  return (
    <>
      <form onSubmit={handleCreate} className="mt-6 flex max-w-md gap-2">
        <input
          name="name"
          required
          placeholder="Product name"
          className="min-w-0 flex-1 rounded border px-3 py-2"
        />
        <input
          name="price"
          type="number"
          required
          min="0.01"
          step="0.01"
          placeholder="Price"
          className="w-28 rounded border px-3 py-2"
        />
        <button
          type="submit"
          disabled={isCreating}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : 'Create'}
        </button>
      </form>

      <ul className="mt-6 space-y-2">
        {items.map((product) => (
          <li
            key={product.id}
            className="flex items-center justify-between rounded border p-3"
          >
            <span>
              {product.name} - ${product.price}
            </span>
            <button
              type="button"
              disabled={deletingId === product.id}
              onClick={() => handleDelete(product.id)}
              className="cursor-pointer rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50"
            >
              {deletingId === product.id ? 'Deleting...' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
