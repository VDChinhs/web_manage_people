interface ITrack{
    id: string,
    peopleid: string,
    name: string,
    type: string,
    zone: number,
    time: string,
    imageUrl: string
}

interface IPageTrack {
    total: number
    pages: number
    current_page: number
    tracks: ITrack[]
}