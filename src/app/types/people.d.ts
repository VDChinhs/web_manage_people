interface IPeople{
    id: string,
    name: string,
    role: string,
    embeddingface: BinaryData,
    facestraight: BinaryData,
    imageUrl: string
}

interface IPagePeople {
    total: number
    pages: number
    current_page: number
    peoples: IPeople[]
  }