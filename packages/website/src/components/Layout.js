import React from 'react'

const Layout = ({ children }) => {
  return (
    <div className="max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 mt-8 flex-grow flex flex-col">
      {children}
    </div>
  )
}

export default Layout
