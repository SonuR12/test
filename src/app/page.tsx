import InvoiceForm from '@/components/ui/form/form'
import React from 'react'

const metadata = {
  title: 'Invoice Generator',
  description: 'Generating invoices made easy with Next.js and TypeScript',
}

const page = () => {
  return (
    <>
      <InvoiceForm />
    </>
  )
}

export default page
