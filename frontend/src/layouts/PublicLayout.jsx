import { Outlet } from 'react-router-dom'

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <main
        id="main-content"
        className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      >
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
