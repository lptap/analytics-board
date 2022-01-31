export interface Farm {
    id?: string;
    deployed: number;
    name: string;
    pendingRewards: string;
    platform: string;
    reinvestRewardBips: string;
    timelock: string;
    totalDeposits: string;
    totalSupply: string;
    depositToken: string;
    rewardToken: string;
    chainNetworkUrl: string;
    chainId: number;
    executionSchedule: string;
}
