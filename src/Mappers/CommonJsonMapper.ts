export const CommonJsonMapper = <T>(resp: string): T => {
    return JSON.parse(resp) as T; // catch will happen elsewhere
}
