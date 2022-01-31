import { Contract, ContractInterface } from 'ethers';
import FarmStore from '@/store/farm';

export default class ContractService {
  public static getContract(abi: ContractInterface, network: string | null, address: string | null): Contract {
    if (network != null && address != null) {
      let provider = FarmStore.provider;

      if (Object.entries(provider).length === 0) {
        FarmStore.saveProvider(network);
        provider = FarmStore.provider;
      }

      return new Contract(address, abi, provider);
    } else {
      return new Contract('', abi);
    }
  }
}
