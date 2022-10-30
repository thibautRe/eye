import { VoidComponent } from "solid-js"
import { createBecomesVisible } from "../../utils/hooks/createBecomesVisible"
import { Box } from "../Box/Box"
import { AspectRatio } from "./AspectRatio"

interface PicturePlaceholderProps {
  onBecomeVisible?: () => void
  onBecomeInvisible?: () => void
}
export const PicturePlaceholder: VoidComponent<PicturePlaceholderProps> = p => {
  return (
    <Box
      style={{ width: "30%" }}
      ref={createBecomesVisible({
        onBecomesVisible: p.onBecomeVisible,
        onBecomesInvisible: p.onBecomeInvisible,
        disconnectAfterVisible: false,
      })}
    >
      <AspectRatio aspectRatio={16 / 9}>
        <Box bgColor="g4" style={{ height: "100%" }} />
      </AspectRatio>
    </Box>
  )
}
