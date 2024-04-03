@isTest
public class leaveManagementSys_UserDataRtn_test {
	@testSetup
    static void createRecords() {
        
    }
    @isTest
    static void testingCode() {
        String testOne='onlyPersonalData';
        String testTwo='allData';
        LIST<Leave_Requests__c> personalData = leaveManagementSys_UserDataRtn_lwc.userToData(testOne);
		LIST<Leave_Requests__c> AllData = leaveManagementSys_UserDataRtn_lwc.userToData(testTwo);     
    }
}