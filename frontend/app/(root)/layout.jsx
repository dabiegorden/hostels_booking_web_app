import { Navbar } from '@/constants'
import React from 'react'

const PagesLayout = ({children}) => {
  return (
    <div>
        <Navbar />
        {children}
    </div>
  )
}

export default PagesLayout