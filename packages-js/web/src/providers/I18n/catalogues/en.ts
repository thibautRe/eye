const enCatalogue = {
  download: "Download",
  fullResolution: "Full resolution",
  picturesAmt: (amt: number) =>
    amt === 0 ? "0 pictures" : amt === 1 ? "1 picture" : `${amt} pictures`,

  notFound: "404 Not Found",
}

export type Catalogue = Readonly<typeof enCatalogue>
export default enCatalogue
