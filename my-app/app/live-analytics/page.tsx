import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable, schema } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { z } from "zod"
import { ThemeProvider } from "@/components/theme-provider";

import rawData from "./data.json"

// Type assertion: Tell TypeScript the JSON data conforms to the Creator schema
type Creator = z.infer<typeof schema>
const data = rawData as Creator[]

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    > 
    <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              {/* <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div> */}
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
      </ThemeProvider>
    </SidebarProvider>
  )
}
