import { Outlet } from 'react-router-dom'

function ApplicationLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <main
        id="main-content"
        className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12"
      >
        <Outlet />
      </main>
    </div>
  )
}

export default ApplicationLayout
