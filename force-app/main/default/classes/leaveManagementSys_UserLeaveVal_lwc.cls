public class leaveManagementSys_UserLeaveVal_lwc {
	@AuraEnabled(cacheable=true)
    public static List<User_Leaves__c> userLeavesData(String strUSERID) {
        system.debug('Leave Apex code in action '+ strUSERID);
        List<User_Leaves__c> userLeaves = [SELECT ID,User__c,Total_Allocated__c,Total_Consumed__c,Remaining_Leaves__c,Leave_Type__c FROM User_Leaves__c WHERE User__c =: strUSERID];
        System.debug(userLeaves);
        return userLeaves;
    }
}