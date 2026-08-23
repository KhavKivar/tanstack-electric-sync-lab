import { createFileRoute } from '@tanstack/react-router'

import { Products } from '../components/Products'

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})

function ProductsPage() {
  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">Products</h1>
      <Products />
    </main>
  )
}
