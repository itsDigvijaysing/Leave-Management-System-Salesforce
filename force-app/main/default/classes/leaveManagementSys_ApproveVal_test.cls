@isTest
public class leaveManagementSys_ApproveVal_test {
    @TestSetup
    static void createRecord(){
        String UserID = userInfo.getUserId();
        List<Leave_Requests__c> newLeaves = new List<Leave_Requests__c>();
        for(Integer i=0;i<6;i++){
            Leave_Requests__c lreq = new Leave_Requests__c();
            lreq.From_Date__c = system.today();
            lreq.To_Date__c = system.today().addDays(1);
            if(i<2){
                lreq.Leave_Type__c = 'Planned Leave';
            }else if(i<4){
                lreq.Leave_Type__c = 'Sick Leave';
            }else if(i<6){
                lreq.Leave_Type__c = 'Unpaid Leave';
            }
            lreq.User__c = UserID;
            lreq.Reason__c = 'testing';
            newLeaves.add(lreq);
        }
        Insert newLeaves;
    }
    @isTest
    static void testingCode(){
		List<Leave_Requests__c> newLevList = [SELECT ID, User__c, Reason__c, Status__c FROM Leave_Requests__c WHERE Reason__c ='testing'];
        for(Leave_Requests__c LRlist:newLevList){
            LRlist.Status__c = 'Approve';
        }
        Update newLevList;
    }
}