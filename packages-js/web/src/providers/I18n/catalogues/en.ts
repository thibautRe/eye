const enCatalogue = {
  download: "Download",
  fullResolution: "Full resolution",
  picturesAmt: (amt: number) =>
    amt === 0 ? "0 pictures" : amt === 1 ? "1 picture" : `${amt} pictures`,
}

export type Catalogue = Readonly<typeof enCatalogue>
export default enCatalogue
