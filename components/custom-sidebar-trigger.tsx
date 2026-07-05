import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function CustomSidebarTrigger() {
  return (
    <Tooltip>
      <TooltipTrigger delay={700} render={<SidebarTrigger aria-label="Toggle sidebar" />} />
      <TooltipContent className="px-2 py-1" side="right">
        Toggle sidebar
        <KbdGroup>
          <Kbd>⌘/Ctrl</Kbd>
          <Kbd>B</Kbd>
        </KbdGroup>
      </TooltipContent>
    </Tooltip>
  )
}
