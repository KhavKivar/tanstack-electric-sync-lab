import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Home</h1>
      <Link
        to="/products"
        className="mt-6 inline-block rounded bg-black px-4 py-2 text-white"
      >
        Ver productos
      </Link>
    </div>
  )
}
