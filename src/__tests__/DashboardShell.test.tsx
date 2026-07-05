import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LayoutDashboardIcon, SettingsIcon } from "lucide-react"
import { MemoryRouter } from "react-router-dom"

import { TooltipProvider } from "@/components/ui/tooltip"
import DashboardShell from "../components/DashboardShell"
import { AppProvider } from "../context/AppContext"
import { ThemeProvider } from "../context/ThemeContext"
import type { User } from "../types"

const dashboardUser: User = {
  id: "user-shell",
  email: "operator@vantagepoint.media",
  name: "Ama Mensah",
  role: "admin",
  company: "Vantage Point",
}

function Providers({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider>
        <AppProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

function renderShell({
  onViewChange = vi.fn(),
  onSignOut = vi.fn(),
}: {
  onViewChange?: (view: string) => void
  onSignOut?: () => void
} = {}) {
  const result = render(
    <DashboardShell
      role="admin"
      activeView="overview"
      navItems={[
        {
          id: "overview",
          label: "Overview",
          icon: <LayoutDashboardIcon />,
        },
        {
          id: "settings",
          label: "Settings",
          icon: <SettingsIcon />,
          badge: true,
        },
      ]}
      onSignOut={onSignOut}
      onViewChange={onViewChange}
      sidebarAction={<button type="button">Generate traffic</button>}
      user={dashboardUser}
    >
      <section>Role dashboard content</section>
    </DashboardShell>,
    { wrapper: Providers }
  )

  return { ...result, onViewChange, onSignOut }
}

describe("DashboardShell", () => {
  it("renders Vantage Point navigation, breadcrumbs, metadata, and content", () => {
    renderShell()

    expect(screen.getByRole("link", { name: "Vantage Point home" })).toBeInTheDocument()
    expect(screen.getByText("Gateway operator")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument()
    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0)
    expect(screen.getByText("Vantage Point partner network")).toBeInTheDocument()
    expect(screen.getByText("Secure marketplace operations · 2026")).toBeInTheDocument()
    expect(screen.getByText("Role dashboard content")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Toggle sidebar" })).toBeInTheDocument()
  })

  it("preserves role navigation and sidebar action behavior", async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    renderShell({ onViewChange })

    const overview = screen.getByRole("button", { name: "Overview" })
    expect(overview).toHaveAttribute("aria-current", "page")
    expect(screen.getByLabelText("Settings has updates")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Generate traffic" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Settings" }))
    expect(onViewChange).toHaveBeenCalledWith("settings")
  })

  it("keeps profile, settings, and sign-out account actions", async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    const onSignOut = vi.fn()
    renderShell({ onViewChange, onSignOut })

    const accountMenu = screen.getByRole("button", {
      name: "Open account menu for Ama Mensah",
    })
    await user.click(accountMenu)
    await user.click(await screen.findByRole("menuitem", { name: "Profile" }))
    expect(onViewChange).toHaveBeenCalledWith("profile")

    await user.click(accountMenu)
    await user.click(await screen.findByRole("menuitem", { name: "Settings" }))
    expect(onViewChange).toHaveBeenCalledWith("settings")

    await user.click(accountMenu)
    await user.click(await screen.findByRole("menuitem", { name: "Sign out" }))
    expect(onSignOut).toHaveBeenCalledOnce()
  })

  it("supports the Cmd/Ctrl+B sidebar shortcut", async () => {
    const { container } = renderShell()
    const sidebar = container.querySelector('[data-slot="sidebar"]')

    expect(sidebar).toHaveAttribute("data-state", "expanded")
    fireEvent.keyDown(window, { key: "b", ctrlKey: true })

    await waitFor(() => {
      expect(sidebar).toHaveAttribute("data-state", "collapsed")
    })
  })
})
