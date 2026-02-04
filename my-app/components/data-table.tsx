"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconBrandInstagram,
  IconBrandYoutube,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconClock,
  IconDotsVertical,
  IconExternalLink,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
  IconTrendingUp,
  IconX,
} from "@tabler/icons-react"
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"

import { Analytics } from "./analytics"

import { useIsMobile } from "@/hooks/use-mobile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


// Creator Schema
export const schema = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  profileImage: z.string(),
  tier: z.enum(["Nano", "Micro", "Macro", "Mega"]),
  gender: z.enum(["Male", "Female", "Other"]),
  category: z.string(),
  niche: z.string(),
  contentLink: z.string(),
  aiVerificationStatus: z.enum(["Verified", "Pending", "Rejected"]),
  impressions: z.number(),
  engagementRate: z.number(),
  followers: z.number(),
  views: z.number(),
  creatorPrice: z.number(),
  hashtagsUsed: z.array(z.string()),
  appealOption: z.enum(["None", "Requested", "In Review", "Approved", "Denied"]),
  paymentStatus: z.enum(["Paid", "Pending", "Unpaid"]),
  dateSubmitted: z.string(),
  aiPerformanceScore: z.number(),
  platform: z.enum(["instagram", "youtube"]),
  youtubeViews: z.number(),
  instagramViews: z.number(),
})

type Creator = z.infer<typeof schema>

// Tier badge colors
const tierColors: Record<string, string> = {
  Nano: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Micro: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Macro: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Mega: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

// Verification status colors
const verificationColors: Record<string, string> = {
  Verified: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Pending: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Rejected: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

// Payment status colors
const paymentColors: Record<string, string> = {
  Paid: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Pending: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  Unpaid: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// Format number with K/M suffix
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}

const columns: ColumnDef<Creator>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Creator Account",
    cell: ({ row }) => {
      const creator = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border-2 border-zinc-700">
            <AvatarImage src={creator.profileImage} alt={creator.name} />
            <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{creator.name}</span>
            <span className="text-xs text-muted-foreground">@{creator.username}</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge className={`${tierColors[creator.tier]} text-xs px-1.5 py-0`}>
                {creator.tier}
              </Badge>
              <span className="text-xs text-muted-foreground">{creator.gender}</span>
            </div>
          </div>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: "category",
    header: "Category / Niche",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <Badge variant="outline" className="text-muted-foreground px-1.5 w-fit">
          {row.original.category}
        </Badge>
        <span className="text-xs text-muted-foreground">{row.original.niche}</span>
      </div>
    ),
  },
  {
    accessorKey: "contentLink",
    header: "Content Link",
    cell: ({ row }) => (
      <a
        href={row.original.contentLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-300 transition-colors"
      >
        {row.original.platform === "instagram" ? (
          <IconBrandInstagram className="size-4" />
        ) : (
          <IconBrandYoutube className="size-4" />
        )}
        <span className="text-xs truncate max-w-[100px]">View Content</span>
        <IconExternalLink className="size-3" />
      </a>
    ),
  },
  {
    accessorKey: "aiVerificationStatus",
    header: "AI Verification",
    cell: ({ row }) => (
      <Badge className={`${verificationColors[row.original.aiVerificationStatus]} px-2`}>
        {row.original.aiVerificationStatus === "Verified" && (
          <IconCircleCheckFilled className="size-3 mr-1" />
        )}
        {row.original.aiVerificationStatus === "Pending" && (
          <IconClock className="size-3 mr-1" />
        )}
        {row.original.aiVerificationStatus === "Rejected" && (
          <IconX className="size-3 mr-1" />
        )}
        {row.original.aiVerificationStatus}
      </Badge>
    ),
  },
  {
    accessorKey: "impressions",
    header: () => <div className="text-right">Impressions</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatNumber(row.original.impressions)}
      </div>
    ),
  },
  {
    accessorKey: "engagementRate",
    header: () => <div className="text-right">ER</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <span className="font-medium text-foreground">
          {row.original.engagementRate.toFixed(1)}%
        </span>
      </div>
    ),
  },
  {
    accessorKey: "followers",
    header: () => <div className="text-right">Followers</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatNumber(row.original.followers)}
      </div>
    ),
  },
  {
    accessorKey: "views",
    header: () => <div className="text-right">Views</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatNumber(row.original.views)}
      </div>
    ),
  },
  {
    accessorKey: "creatorPrice",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium text-foreground">
        ${formatNumber(row.original.creatorPrice)}
      </div>
    ),
  },
  {
    accessorKey: "hashtagsUsed",
    header: "Hashtags",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1 max-w-[150px]">
        {row.original.hashtagsUsed.slice(0, 2).map((tag, index) => (
          <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0">
            {tag}
          </Badge>
        ))}
        {row.original.hashtagsUsed.length > 2 && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            +{row.original.hashtagsUsed.length - 2}
          </Badge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "appealOption",
    header: "Appeal",
    cell: ({ row }) => {
      const appeal = row.original.appealOption
      if (appeal === "None") {
        return <span className="text-muted-foreground text-xs">-</span>
      }
      return (
        <Badge variant="outline" className="text-xs">
          {appeal}
        </Badge>
      )
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => (
      <Badge className={`${paymentColors[row.original.paymentStatus]} px-2`}>
        {row.original.paymentStatus}
      </Badge>
    ),
  },
  {
    accessorKey: "aiPerformanceScore",
    header: () => <div className="text-right">AI Score</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <span className="font-bold text-foreground">
          {row.original.aiPerformanceScore}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "dateSubmitted",
    header: "Submitted",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {new Date(row.original.dateSubmitted).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Edit Creator</DropdownMenuItem>
          <DropdownMenuItem>Send Message</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

function DraggableRow({ row }: { row: Row<Creator> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: Creator[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [searchType, setSearchType] = React.useState<"name" | "username" | "url">("name")
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  // Calculate totals for the charts
  const totalYoutubeViews = React.useMemo(() =>
    data.reduce((sum, creator) => sum + creator.youtubeViews, 0),
    [data]
  )
  const totalInstagramViews = React.useMemo(() =>
    data.reduce((sum, creator) => sum + creator.instagramViews, 0),
    [data]
  )


  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
      globalFilter,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase()
      if (searchType === "name") {
        return row.original.name.toLowerCase().includes(search)
      }
      if (searchType === "username") {
        return row.original.username.toLowerCase().includes(search)
      }
      if (searchType === "url") {
        return row.original.contentLink.toLowerCase().includes(search)
      }
      return true
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  const chartConfig = {
    youtube: {
      label: "YouTube",
      color: "hsl(0 100% 50%)",
    },
    instagram: {
      label: "Instagram",
      color: "hsl(280 100% 70%)",
    },
  } satisfies ChartConfig

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Analytics Section - Always visible above creators */}
      <div className="px-4 lg:px-6">
        <Analytics
          data={data}
          totalYoutubeViews={totalYoutubeViews}
          totalInstagramViews={totalInstagramViews}
          chartConfig={chartConfig}
          tierColors={tierColors}
          formatNumber={formatNumber}
        />
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Creators</h2>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  <span className="hidden lg:inline">Columns</span>
                  <IconChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-[300px]">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={`Search by ${searchType}...`}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={searchType} onValueChange={(v) => setSearchType(v as "name" | "username" | "url")}>
              <SelectTrigger className="w-[130px]" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">By Name</SelectItem>
                <SelectItem value="username">By Username</SelectItem>
                <SelectItem value="url">By Reel URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground hidden sm:inline">Sort by:</Label>
            <Select
              value={sorting[0]?.id || ""}
              onValueChange={(value) => {
                if (value) {
                  setSorting([{ id: value, desc: sorting[0]?.desc || false }])
                } else {
                  setSorting([])
                }
              }}
            >
              <SelectTrigger className="w-[150px]" size="sm">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="followers">Followers</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="creatorPrice">Creator Price</SelectItem>
                <SelectItem value="engagementRate">ER</SelectItem>
                <SelectItem value="dateSubmitted">Date Submitted</SelectItem>
                <SelectItem value="aiPerformanceScore">AI Score</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => {
                if (sorting[0]) {
                  setSorting([{ id: sorting[0].id, desc: !sorting[0].desc }])
                }
              }}
              disabled={!sorting[0]}
            >
              {sorting[0]?.desc ? (
                <IconSortDescending className="size-4" />
              ) : (
                <IconSortAscending className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Creators Table */}
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No creators found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} creator(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
