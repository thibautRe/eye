import { Accessor } from "solid-js"
import { createSetSignal } from "./createSetSignal"

export function createListSelectionBehaviour<T>(getItems: Accessor<T[]>) {
  const [selectedItems, selectedItemsActions] = createSetSignal<T>()
  let lastClickedItem: T | undefined
  const handleClick = (item: T, e: MouseEvent) => {
    const prevItem = lastClickedItem
    lastClickedItem = item
    if (e.shiftKey && prevItem) {
      const allItems = getItems()
      const prevIndex = allItems.indexOf(prevItem)
      const newIndex = allItems.indexOf(item)
      if (prevIndex !== -1 && newIndex !== -1) {
        const updateIds = allItems.slice(
          Math.min(prevIndex, newIndex),
          Math.max(prevIndex, newIndex) + 1,
        )
        if (selectedItems().has(item)) {
          selectedItemsActions.delete(...updateIds)
        } else {
          selectedItemsActions.add(...updateIds)
        }
        return
      }
    }
    selectedItemsActions.toggle(item)
  }

  return [selectedItems, handleClick] as const
}
