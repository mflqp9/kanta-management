"use client"

import { Menu } from "lucide-react"
import { Suspense, useLayoutEffect, useState } from "react"
import { AdminUser } from "@/components/layout/admin-user"
import { Brand } from "@/components/layout/brand"
import { LogoutButton } from "@/components/layout/logout-button"
import { SidebarNav, SidebarNavLinks } from "@/components/layout/nav-links"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  // صفحہ چھپنے پر (Activity) مینو بند ہو جائے
  useLayoutEffect(() => () => setOpen(false), [])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="مینو کھولیں">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(20rem,85vw)] gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
      >
        <SheetTitle className="sr-only">مینو</SheetTitle>
        <SheetDescription className="sr-only">تمام صفحات کی فہرست</SheetDescription>
        <div className="border-b border-sidebar-border p-4 pe-14">
          <Brand />
        </div>
        <div className="sidebar-scrollbar flex-1 overflow-y-auto p-3">
          <Suspense fallback={<SidebarNav />}>
            <SidebarNavLinks onNavigate={() => setOpen(false)} />
          </Suspense>
        </div>
        <div className="flex flex-col gap-1 border-t border-sidebar-border p-3">
          <AdminUser className="px-3 py-1" iconClassName="bg-sidebar-primary text-sidebar-primary-foreground" />
          <LogoutButton className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
