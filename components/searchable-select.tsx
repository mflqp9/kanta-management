"use client"

import { ChevronsUpDown, Plus } from "lucide-react"
import { useLayoutEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type SelectOption = {
  value: string
  label: string
  /** دوسری سطر — مثلاً ولدیت، گاؤں */
  hint?: string
  /** تلاش کے اضافی الفاظ (موبائل نمبر وغیرہ) */
  keywords?: string[]
}

/** تلاش والا ڈراپ ڈاؤن (کسان، گاڑی وغیرہ کے لیے) */
export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder = "منتخب کریں",
  searchPlaceholder = "تلاش کریں…",
  emptyText = "کچھ نہیں ملا",
  onCreate,
  createLabel = "نیا شامل کریں",
  loading,
  invalid,
  className,
  triggerRef,
}: {
  id?: string
  triggerRef?: React.Ref<HTMLButtonElement>
  options: SelectOption[]
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  /** "نیا شامل کریں" پر کلک — تلاش کا متن ساتھ آتا ہے */
  onCreate?: (search: string) => void
  createLabel?: string
  loading?: boolean
  invalid?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const selected = options.find((o) => o.value === value)

  useLayoutEffect(() => () => setOpen(false), [])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-11 w-full justify-between gap-2 px-3 font-normal dark:bg-input/30",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex min-w-0 items-baseline gap-2 truncate">
            {selected ? (
              <>
                <span className="truncate text-foreground">{selected.label}</span>
                {selected.hint && <span className="truncate text-xs text-muted-foreground">{selected.hint}</span>}
              </>
            ) : loading ? (
              "لوڈ ہو رہا ہے…"
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-64 p-1">
        <Command>
          <CommandInput placeholder={searchPlaceholder} value={search} onValueChange={setSearch} />
          <CommandList className="max-h-64">
            <CommandEmpty className="py-4">{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.value}
                  keywords={[o.label, o.hint ?? "", ...(o.keywords ?? [])]}
                  data-checked={o.value === value}
                  onSelect={() => {
                    onChange(o.value === value ? null : o.value)
                    setOpen(false)
                    setSearch("")
                  }}
                  className="py-2"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{o.label}</span>
                    {o.hint && <span className="truncate text-xs text-muted-foreground">{o.hint}</span>}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {onCreate && (
            <div className="border-t p-1">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start text-primary hover:text-primary"
                onClick={() => {
                  setOpen(false)
                  onCreate(search)
                  setSearch("")
                }}
              >
                <Plus />
                {createLabel}
                {search && <span className="truncate text-muted-foreground">«{search}»</span>}
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
