public class leaveManagementSys_ApproveVal {
    public static void approvalValUpdater(List<Leave_Requests__c> LRlist){
        String UserID;
        String LeaveType;
        Integer Papproved=0;
        Integer Sapproved=0;
        Integer Uapproved=0;
        System.debug('IN leaveManagementSys_ApproveVal');
        for(Leave_Requests__c lr:LRlist){
            if(lr.Status__c == 'Approve'){
                userID = lr.User__c;
                if(lr.Leave_Type__c == 'Planned Leave'){
                    Papproved = Papproved + lr.From_Date__c.daysBetween(lr.To_Date__c) + 1;
                }
                else if(lr.Leave_Type__c == 'Sick Leave'){
                    Sapproved = Sapproved + lr.From_Date__c.daysBetween(lr.To_Date__c) + 1;
                }
                else if(lr.Leave_Type__c == 'Unpaid Leave'){
                    Uapproved = Uapproved + lr.From_Date__c.daysBetween(lr.To_Date__c) + 1;
                }
            }
        }
        
        Boolean pleave = true;
        Boolean sleave = true;
        Boolean uleave = true;
        List<User_Leaves__c> LRlistAll = [SELECT ID,User__c,Total_Allocated__c,Total_Consumed__c,Remaining_Leaves__c,Leave_Type__c FROM User_Leaves__c WHERE User__c =: userID];
        if(LRlistAll != null){
        for(User_Leaves__c LRloop: LRlistAll){
            if(LRloop.Leave_Type__c == 'Planned Leave' && pleave){
            	if(Papproved > 0){
                	LRloop.Total_Consumed__c = LRloop.Total_Consumed__c + Papproved;
            	}
                System.debug('In Planned Leave');
                pleave = false;
            }
            if(LRloop.Leave_Type__c == 'Sick Leave' && sleave){
            	if(Sapproved > 0){
                    LRloop.Total_Consumed__c = LRloop.Total_Consumed__c + Sapproved;
                }
                System.debug('In Sick Leave');
                sleave = false;
            }
            if(LRloop.Leave_Type__c == 'Unpaid Leave' && uleave){
            	if(Uapproved > 0){
                    LRloop.Total_Consumed__c = LRloop.Total_Consumed__c + Uapproved;
                }
                System.debug('In Unpaid Leave');
                uleave = false;
            }
        }
        Update LRlistAll;
        }
        
        // I can use for loop & make it efficient so then it will be updated only one time but In multiple userleaves accounts will create issue in loop
        /*if(Papproved > 0){
            User_Leaves__c plannedVal = new User_Leaves__c();
            plannedVal = [SELECT ID,User__c,Total_Consumed__c,Leave_Type__c FROM User_Leaves__c WHERE User__c =: userID AND Leave_Type__c = 'Planned Leave' LIMIT 1];
            if(plannedVal != null){
                plannedVal.Total_Consumed__c = plannedVal.Total_Consumed__c + Papproved;
            	system.debug(plannedVal);
            	update plannedVal;
            }
        }
        if(Sapproved > 0){
            User_Leaves__c SickVal = new User_Leaves__c();
            SickVal = [SELECT ID,User__c,Total_Consumed__c,Leave_Type__c FROM User_Leaves__c WHERE User__c =: userID AND Leave_Type__c = 'Sick Leave' LIMIT 1];
            if(SickVal != null){
            SickVal.Total_Consumed__c = SickVal.Total_Consumed__c + Sapproved;
            system.debug(SickVal);
            update SickVal;
            }
        }
        if(Uapproved > 0){
            User_Leaves__c UnpaidVal = new User_Leaves__c();
            UnpaidVal = [SELECT ID,User__c,Total_Consumed__c,Leave_Type__c FROM User_Leaves__c WHERE User__c =: userID AND Leave_Type__c = 'Unpaid Leave' LIMIT 1];
            if(Uapproved != null){
            UnpaidVal.Total_Consumed__c = UnpaidVal.Total_Consumed__c + Uapproved;
            System.debug(UnpaidVal);
            update UnpaidVal;
        	}
        }*/
        
    }
}