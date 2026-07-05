import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export type AppBreadcrumbPage = {
  title: string
  icon?: ReactNode
}

export function AppBreadcrumbs({ page }: { page: AppBreadcrumbPage }) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap text-xs">
        <BreadcrumbItem className="hidden sm:inline-flex">
          <BreadcrumbLink render={<Link to="/" />}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden sm:list-item" />
        <BreadcrumbItem className="min-w-0">
          <BreadcrumbPage className="flex min-w-0 items-center gap-2 font-medium [&>svg]:size-3.5">
            {page.icon}
            <span className="truncate">{page.title}</span>
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
