export enum NetworkEnum {
    Main = 1,
    Ropsten = 3,
    Rinkeby = 4
}

export const networkObjectMap = {
    [NetworkEnum.Main]: {
        id: NetworkEnum.Main,
        name: 'Main net'
    },
    [NetworkEnum.Rinkeby]: {
        id: NetworkEnum.Rinkeby,
        name: 'Rinkeby'
    },
    [NetworkEnum.Ropsten]: {
        id: NetworkEnum.Ropsten,
        name: 'Ropsten'
    }
}
