import { VoidComponent } from "solid-js"
import { createBecomesVisible } from "../../utils/hooks/createBecomesVisible"
import { Box } from "../Box/Box"
import { AspectRatio } from "./AspectRatio"

interface PicturePlaceholderProps {
  onBecomeVisible?: () => void
}
export const PicturePlaceholder: VoidComponent<PicturePlaceholderProps> = p => {
  return (
    <Box
      style={{ width: "30%" }}
      ref={createBecomesVisible(p.onBecomeVisible, false)}
    >
      <AspectRatio aspectRatio={16 / 9}>
        <Box bgColor="g4" style={{ height: "100%" }} />
      </AspectRatio>
    </Box>
  )
}
