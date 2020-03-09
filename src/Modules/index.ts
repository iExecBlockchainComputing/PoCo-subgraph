export {
	handleCreateCategory,
} from './IexecCategoryManager'

export {
	handleTransfer,
	handleReward,
	handleSeize,
	handleLock,
	handleUnlock,
} from './IexecERC20'

export {
	handleOrdersMatched,
	handleSchedulerNotice,
	handleTaskInitialize,
	handleTaskContribute,
	handleTaskConsensus,
	handleTaskReveal,
	handleTaskReopen,
	handleTaskFinalize,
	handleTaskClaimed,
	handleAccurateContribution,
	handleFaultyContribution,
} from './IexecPoco'
