import React from 'react'
import { routes } from './routes'
import { useRoutes } from 'react-router-dom'

export default function () {
  const elements = useRoutes(routes)
  return (
    <div>
      {elements}
    </div>
  )
}
