@isTest
public class leaveManagementSys_UserLeaveVal_test {
	@testSetup
    static void createRecords() {
        //can create new user with profile & all
    }
    @isTest
    static void testingCode(){
        String UserID = userInfo.getUserId();
        List<User_Leaves__c> leaveData = leaveManagementSys_UserLeaveVal_lwc.userLeavesData(UserID);
        //User_Leaves__c random_UserID = [SELECT Id,User__c FROM User_Leaves__c LIMIT 1];
        //List<User_Leaves__c> leaveData = leaveManagementSys_UserLeaveVal_lwc.userLeavesData(random_UserID.User__c);
    }
}