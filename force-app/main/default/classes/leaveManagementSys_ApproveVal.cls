public class leaveManagementSys_ApproveVal {
    public static void approvalValUpdater(List<Leave_Requests__c> LRlist){
        Map<Id, Map<String, Integer>> totalsByUser = new Map<Id, Map<String, Integer>>();

        for(Leave_Requests__c lr : LRlist){
            if(lr.Status__c != 'Approve'){
                continue;
            }

            Integer approvedDays = lr.From_Date__c.daysBetween(lr.To_Date__c) + 1;
            if(!totalsByUser.containsKey(lr.User__c)){
                totalsByUser.put(lr.User__c, new Map<String, Integer>{
                    'Planned Leave' => 0,
                    'Sick Leave' => 0,
                    'Unpaid Leave' => 0
                });
            }

            Map<String, Integer> userTotals = totalsByUser.get(lr.User__c);
            if(userTotals.containsKey(lr.Leave_Type__c)){
                userTotals.put(
                    lr.Leave_Type__c,
                    userTotals.get(lr.Leave_Type__c) + approvedDays
                );
            }
        }

        if(totalsByUser.isEmpty()){
            return;
        }

        List<User_Leaves__c> leaveRecords = [
            SELECT Id, User__c, Total_Consumed__c, Leave_Type__c
            FROM User_Leaves__c
            WHERE User__c IN :totalsByUser.keySet()
        ];

        for(User_Leaves__c leaveRecord : leaveRecords){
            Map<String, Integer> userTotals = totalsByUser.get(leaveRecord.User__c);
            if(userTotals == null || !userTotals.containsKey(leaveRecord.Leave_Type__c)){
                continue;
            }

            Integer approvedDays = userTotals.get(leaveRecord.Leave_Type__c);
            if(approvedDays > 0){
                leaveRecord.Total_Consumed__c = leaveRecord.Total_Consumed__c + approvedDays;
            }
        }

        update leaveRecords;
    }
}
