"use client"

import React from 'react'
import AddVenuePage from './Mainpage'

export default function Page() {
  const dummySetOpen: React.Dispatch<React.SetStateAction<boolean>> = () => {}

  return (
    <AddVenuePage open={false} setOpen={dummySetOpen} />
  )
}
