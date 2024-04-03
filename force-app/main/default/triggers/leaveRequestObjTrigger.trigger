trigger leaveRequestObjTrigger on Leave_Requests__c (after insert, after update) {
	If(Trigger.IsInsert || Trigger.IsUpdate){
        leaveManagementSys_ApproveVal.approvalValUpdater(Trigger.new);
    }
}