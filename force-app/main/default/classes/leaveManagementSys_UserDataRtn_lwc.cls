public class leaveManagementSys_UserDataRtn_lwc {
	@AuraEnabled(cacheable=true)
    public static List<Leave_Requests__c> userToData(String strRequire) {
        //System.debug('Employee Leave Record as per USER'+ [SELECT Name,Leave_Type__c,From_Date__c,To_Date__c,Reason__c,Status__c,Manager_Comment__c,User__c,OwnerId FROM Leave_Requests__c WHERE OwnerId=:UserInfo.getUserID() with SECURITY_ENFORCED]);
        //System.debug('Employee Leave Record full search'+ [SELECT Name,Leave_Type__c,From_Date__c,To_Date__c,Reason__c,Status__c,Manager_Comment__c,User__c,OwnerId FROM Leave_Requests__c]);

        LIST<Leave_Requests__c> returnData = new LIST<Leave_Requests__c>();
        if(strRequire == 'onlyPersonalData'){
            System.debug('In Only Personal Data');
            return [SELECT Name,Leave_Type__c,From_Date__c,To_Date__c,Reason__c,Status__c,Manager_Comment__c,User__c,OwnerId FROM Leave_Requests__c WHERE OwnerId=:UserInfo.getUserID() with SECURITY_ENFORCED];
        }else if(strRequire == 'allData'){
            System.debug('In All Data');
            return [SELECT Name,Leave_Type__c,From_Date__c,To_Date__c,Reason__c,Status__c,Manager_Comment__c,User__c,OwnerId FROM Leave_Requests__c];
        }
        return returnData;
    }
}