import { For, VoidComponent } from "solid-js"
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
      ref={createBecomesVisible({
        onBecomesVisible: p.onBecomeVisible,
        onBecomesInvisible: p.onBecomeInvisible,
        disconnectAfterVisible: false,
      })}
    >
      <AspectRatio aspectRatio={3 / 2}>
        <Box bgColor="g5" br="m" style={{ height: "100%", width: "100%" }} />
      </AspectRatio>
    </Box>
  )
}

interface PicturePlaceholdersProps {
  onFirstBecomeVisible?: () => void
  onFirstBecomeInvisible?: () => void
}
export const PicturePlaceholders: VoidComponent<
  PicturePlaceholdersProps
> = p => {
  return (
    <For each={new Array(10).fill(null)}>
      {(_, index) => (
        <PicturePlaceholder
          onBecomeVisible={index() === 0 ? p.onFirstBecomeVisible : undefined}
          onBecomeInvisible={index() === 0 ? p.onFirstBecomeVisible : undefined}
        />
      )}
    </For>
  )
}
