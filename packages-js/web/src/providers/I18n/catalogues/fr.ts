import type { Catalogue } from "../"

const frCatalogue: Catalogue = {
  download: "Télécharger",
  fullResolution: "Haute résolution",
  picturesAmt: (amt: number) =>
    amt === 0 ? "0 photos" : amt === 1 ? "1 photo" : `${amt} photos`,
}

export default frCatalogue
