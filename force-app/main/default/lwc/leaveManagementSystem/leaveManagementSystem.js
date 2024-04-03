import { LightningElement, wire, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import leaveRequests from '@salesforce/schema/Leave_Requests__c';
import getUserData from '@salesforce/apex/leaveManagementSys_UserDataRtn_lwc.userToData';
import getUserLeavesVal from '@salesforce/apex/leaveManagementSys_UserLeaveVal_lwc.userLeavesData';
import chartjs from '@salesforce/resourceUrl/chartJS';
import { loadScript } from 'lightning/platformResourceLoader';
// import ChartDataLabels from '';  Need to find chartJSplugin Library add if needed

import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import USER_NAME_FIELD from '@salesforce/schema/User.Name';
import USER_ROLE_FIELD from '@salesforce/schema/User.UserRoleId';

import fromDate from '@salesforce/schema/Leave_Requests__c.From_Date__c';
import toDate from '@salesforce/schema/Leave_Requests__c.To_Date__c';
import leaveType from '@salesforce/schema/Leave_Requests__c.Leave_Type__c';
import reason from '@salesforce/schema/Leave_Requests__c.Reason__c';
import status from '@salesforce/schema/Leave_Requests__c.Status__c';
import managerComment from '@salesforce/schema/Leave_Requests__c.Manager_Comment__c';
import userinfo from '@salesforce/schema/Leave_Requests__c.User__c';

const columns  = [
    { label: 'Request Id', fieldName: 'Name', type:'text', cellAttributes:{ class:{fieldName:'RowColor'}}},
    { label: 'Leave Type', fieldName: 'Leave_Type__c', type:'text', cellAttributes:{ class:{fieldName:'RowColor'}}},
    { label: 'From Date', fieldName: 'From_Date__c', type:'date', cellAttributes:{ class:{fieldName:'RowColor'}}},
    { label: 'To Date', fieldName: 'To_Date__c', type:'date', cellAttributes:{ class:{fieldName:'RowColor'}}},
    { label: 'Reason', fieldName: 'Reason__c', type:'text', cellAttributes:{ class:{fieldName:'RowColor'}}},
    { label: 'Status', fieldName: 'Status__c', type:'text', cellAttributes:{ class:{fieldName:'RowColor'}}},
    { label: 'Manager Comment', fieldName: 'Manager_Comment__c', type:'text', cellAttributes:{ class:{fieldName:'RowColor'}}},
    { type: "button", label: 'Button', initialWidth: 100, typeAttributes: {
            label: 'Edit',
            name: 'Edit',
            title: 'Edit',
            disabled: false,
            value: 'edit',
            iconPosition: 'left',
            iconName:'utility:edit',
            variant:'Brand'
        }, cellAttributes:{ class:{fieldName:'RowColor'}},
    },
];

// RoleID
// boss: 00E5i0000029vUpEAI
// worker: 00E5i0000029vUuEAI

export default class LeaveManagementSystem extends LightningElement {
    @api apexDataParameter = 'onlyPersonalData';
    @api user_ID;
    @track leaveDataToDisplay;
    @track showRecScreen = false;
    @track error;
    @track userName;
    @track userRole;
    @track selTabValue;
    @track selTabId;
    @track fieldsDynamic = [];
    // @track name;
    objectApiName = leaveRequests;
    columns = columns;
    editButtonRecID;

    @track showChartScreen = true;
    @track isChartNotInitialized = true;
    _chartColor  = ['rgb(225, 100, 100)','rgb(80, 80, 235)'];
    _chartLabel = ['Cosumed Leaves','Remaining Leaves'];;
    @track _chartPlannedLevVal = [];
    @track _chartSickLevVal = [];
    @track _chartUnpaidLevVal = [];
    myChartPlanned;
    myChartSick;
    myChartUnpaid;
    @track _tabRunning = false;
    // pieValue = 1;


    fieldsLimited=[fromDate,
        toDate,
        leaveType,
        reason];
    
    fieldsMax=[fromDate,
            toDate,
            leaveType,
            reason,
            status,
            managerComment];

    @wire(getRecord, {
         recordId: USER_ID,
         fields: [USER_NAME_FIELD, USER_ROLE_FIELD]
     }) wireuser({
         error,
         data
     }) {
         if (error) {
            console.log('Inside Error of USER Name: '+error);
            this.error = error ; 
         } else if (data) {
            // console.log('data is here ::');
            // console.log(data);
            this.userName = data.fields.Name.value;
            this.user_ID = USER_ID;
            this.userRole = data.fields.UserRoleId.value;
            console.log('Inside the Data of User Name: '+this.userName+' Role is '+this.userRole);
         }
     }

    @wire(getUserData,{ strRequire: '$apexDataParameter'})
    WireUserData({ error, data }) {
        if(error){
            console.log('Error Found -')
            console.error(error);
            this.error = error;
            this.leaveDataToDisplay = undefined;
        }else if (data) {
            console.log('Full Data Info -');
            console.log(data);
            this.leaveDataToDisplay = data.map(item=>{
                let RowColor = item.Status__c === 'Approve' ? "slds-theme_success slds-text-color_default" : item.Status__c === 'Reject' ? "slds-theme_error slds-text-color_default" : "slds-theme_default"
                // console.log(item.Status__c + ' So then Theme is ' + RowColor);
                // RowColor = item.Status__c === 'Reject' ? "slds-theme_warning" : "slds-theme_default"
                return {...item, 
                    "RowColor":RowColor
                }
            })
            this.error = undefined;
        }
    }

    @wire(getUserLeavesVal, {
        strUSERID: '$user_ID'
    }) wireleaveuser({
        error,
        data
    }) {
        if (error) {
           console.error('Inside Error of USER Leaves: '+error);
           this.error = error;
        } else if (data) {
           console.log('New data is here ::');
           console.log(data);
           for(let i=0; i<data.length; i++){
                if(data[i].Leave_Type__c == 'Planned Leave'){
                    // console.log(data[i]);
                    this._chartPlannedLevVal = [data[i].Total_Consumed__c, data[i].Remaining_Leaves__c];
                }
                else if(data[i].Leave_Type__c == 'Sick Leave'){
                    // console.log(data[i]);
                    this._chartSickLevVal = [data[i].Total_Consumed__c, data[i].Remaining_Leaves__c];
                }
                else if(data[i].Leave_Type__c == 'Unpaid Leave'){
                    // console.log(data[i]);
                    this._chartUnpaidLevVal= [data[i].Total_Consumed__c, data[i].Remaining_Leaves__c];
                }
           }
           console.log("loop end So Planned Leaves are "+this._chartPlannedLevVal +" Sick Leaves are "+this._chartSickLevVal +" Unpaid Leaves are "+this._chartUnpaidLevVal);
        }
    }

    tabSelected1(event){
        // console.log('Inside Selected Tab 1');
        // console.log(this.selTabValue);
        this._tabRunning = false;
        this.apexDataParameter = 'onlyPersonalData';
    }

    tabSelected2(event){
        // console.log('Inside Selected Tab 2');
        // console.log(this.template.querySelector('canvas.SickLeaveDonut'));
        // this.renderedCallbackManual();
        this._tabRunning = true;
        // console.log('value of current tab running '+this._tabRunning);
        this.apexDataParameter = 'onlyPersonalData';
    }

    tabSelected3(event){
        // console.log('Inside Selected Tab 3');
        // console.log(this.selTabValue);
        this._tabRunning = false;
        this.apexDataParameter = 'allData';
    }

    toEditButtonActionEmp(event) {
        console.log('Inside the button Press '+ event.detail.row.Name);
        console.log('Row ID is '+event.detail.row.Id);
        if(this.userRole == '00E5i0000029vUuEAI'){
            console.log('Worker Role Here');
            this.fieldsDynamic = this.fieldsLimited;
        }else{
            console.log('Non Worker Role Here');
            this.fieldsDynamic = this.fieldsMax;
        }
        this.editButtonRecID = event.detail.row.Id;
        this.showRecScreen = true;
        // console.log(event.detail.action.name);
        // console.log(event.detail.selectedRows[0].Id);
    }

    handleSubmit(event){
        event.preventDefault();
        const fields = event.detail.fields;
        // console.log(fields);
        fields.User__c = USER_ID;
        this.template.querySelector('lightning-record-form').submit(fields);
    }
    handleSuccess(event){
        const evt = new ShowToastEvent({
            title: 'Record Submitted',
            message: 'Record ID: ' + event.detail.id,
            variant: 'success',
        });
        
        this.dispatchEvent(evt);
        console.log(event.detail.fields);
        this.showRecScreen = false;
    }
    closePopup(){
        this.showRecScreen = false;
    }
    handleNewLeaveRequest(){
        this.editButtonRecID = '';
        this.showRecScreen = true;
        // console.log('Show Rec Screen is '+showRecScreen);
    }

    renderedCallback() {
            var check;
            console.log('Rendered Callback inside');
            this.createChartPlanned(this.check);
            this.createChartSick(this.check);
            this.createChartUnpaid(this.check);

            if(!this.isChartNotInitialized){
                console.log('Chart Not Initialized '+ this.isChartNotInitialized);
                return;
            }
            if(this._tabRunning == true){
            Promise.all([loadScript(this, chartjs)])
            .then(()=>{
                console.log('ChartJS Start');
                this.isChartNotInitialized = false;
                this.createChartPlanned(1);
                this.createChartSick(1);
                this.createChartUnpaid(1);
                this.check = 1;

                // Promise.all([loadScript(this.ChartDataLabels)])
                // .then(()=>{
                //     this.isChartNotInitialized = false;
                //     this.createChart(1);
                //     this.check = 1;
                // })
                // .catch(error => {
                //     this.dispatchEvent(
                //         new ShowToastEvent({
                //             title: 'Error Loading Chart',
                //             message: error.message,
                //             variant: 'error'
                //         })
                //     );
                // });
                
            })
            .catch(error => {
                console.log('Error Catch Chart thing');
                console.error(error.message);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading ChartJS',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
        }
    }

    // createChart(condition){
    //     console.log('Inside Create chart function');
    //     if(typeof(this.myChart) != "undefined"){
    //         console.log('Chart type in undefined');
    //         this.myChart.destroy();
    //     }

    //     console.log('Condition is '+ condition);
    //     if(condition === 1){
    //         console.log('query condition met');
    //         if(this.pieValue == 1){
    //             var canvas = this.template.querySelector('canvas.pieChartPlanned');
    //             console.log('pieChartPlanned creating new chart process 1');
    //             var ctx = canvas.getContext('2d');
    //             console.log('creating new chart process 2');
    //         }else if(this.pieValue == 2){
    //             var canvas = this.template.querySelector('canvas.pieChartSick');
    //             console.log('pieChartSick creating new chart process 1');
    //             var ctx = canvas.getContext('2d');
    //             console.log('creating new chart process 2');
    //         }else if(this.pieValue == 3){
    //             var canvas = this.template.querySelector('canvas.pieChartUnpaid');
    //             console.log('pieChartUnpaid creating new chart process 1');
    //             var ctx = canvas.getContext('2d');
    //             console.log('creating new chart process 2');
    //         }else{
    //             var ctx = null;
    //         }
    //         if(ctx != null){
    //         console.log('ctx is defined');                
    //         this.myChart = new Chart(ctx, {
    //             type: "pie",
    //             data: {
    //                 datasets: [
    //                     {
    //                         data: this._chartValue,
    //                         backgroundColor: this._chartColor,
    //                     }
    //                 ],
    //                 labels: this._chartLabel,
    //             },
    //             options:{
    //                 legend:{
    //                     position:"bottom",
    //                     display: true,
    //                 },
    //                 responsive: true,
    //                 tooltips:{
    //                     enabled: true,
    //                     mode: "point",
    //                 },
    //                 // plugins: {
    //                 //     labels: {
    //                 //         render: 'value',
    //                 //         fontSize: 18,
    //                 //         fontColor: '#ffffff',
    //                 //         fontFamily: '"Times New Roman", Times, serif'
    //                 //     }
    //                 // },
    //             }
    //         });

            
    //         console.log('Updating value');
    //         this.myChart.data.datasets[0].data = this._chartValue;
    //         this.myChart.update();

    //         console.log('Updating level');
    //         this.myChart.data.labels = this._chartLabel;
    //         this.myChart.update();

    //         console.log('Updating Color');
    //         this.myChart.data.datasets[0].backgroundColor = this._chartColor;
    //         this.myChart.update();
    //     }
    //     }
    // }

    createChartPlanned(condition){
        console.log('Inside Planned Create chart function');

        if(typeof(this.myChartPlannedPlanned) != "undefined"){
            console.error('Chart type in undefined');
            this.myChartPlanned.destroy();
        }

        console.log('Condition is '+ condition);
        if(condition === 1){
            console.log(this.template.querySelector('canvas.pieChartPlanned'));
            var ctxP = this.template.querySelector('canvas.pieChartPlanned').getContext('2d');
            console.log('ctxP is defined');
            console.log(ctxP);
            this.myChartPlanned = new Chart(ctxP, {
                type: "pie",
                data: {
                    datasets: [
                        {
                            data: this._chartPlannedLevVal,
                            backgroundColor: this._chartColor,
                        }
                    ],
                    labels: this._chartLabel,
                },
                options:{
                    legend:{
                        position:"bottom",
                        display: true,
                    },
                    responsive: true,
                    tooltips:{
                        enabled: true,
                        mode: "point",
                    },
                }
            });

            
            console.log('Updating value');
            this.myChartPlanned.data.datasets[0].data = this._chartPlannedLevVal;
            this.myChartPlanned.update();

            console.log('Updating label');
            this.myChartPlanned.data.labels = this._chartLabel;
            this.myChartPlanned.update();

            console.log('Updating Color');
            this.myChartPlanned.data.datasets[0].backgroundColor = this._chartColor;
            this.myChartPlanned.update();
        }
        
    }

    createChartSick(condition){
        console.log('Inside Sick Create chart function');

        if(typeof(this.myChartSick) != "undefined"){
            console.log('Chart type in undefined');
            this.myChartSick.destroy();
        }

        console.log('Condition is '+ condition);
        if(condition === 1){
            console.log('query condition met');
            var ctxS = this.template.querySelector('canvas.pieChartSick').getContext('2d');
            
            console.log('ctxS is defined');           
            console.log(ctxS);
            this.myChartSick = new Chart(ctxS, {
                type: "pie",
                data: {
                    datasets: [
                        {
                            data: this._chartSickLevVal,
                            backgroundColor: this._chartColor,
                        }
                    ],
                    labels: this._chartLabel,
                },
                options:{
                    legend:{
                        position:"bottom",
                        display: true,
                    },
                    responsive: true,
                    tooltips:{
                        enabled: true,
                        mode: "point",
                    },
                }
            });

            
            console.log('Updating value');
            this.myChartSick.data.datasets[0].data = this._chartSickLevVal;
            this.myChartSick.update();

            console.log('Updating level');
            this.myChartSick.data.labels = this._chartLabel;
            this.myChartSick.update();

            console.log('Updating Color');
            this.myChartSick.data.datasets[0].backgroundColor = this._chartColor;
            this.myChartSick.update();
        }
        
    }

    createChartUnpaid(condition){
        console.log('Inside Unpaid Create chart function');

        if(typeof(this.myChartUnpaid) != "undefined"){
            console.log('Chart type in undefined');
            this.myChartUnpaid.destroy();
        }

        console.log('Condition is '+ condition);
        if(condition === 1){
            console.log('query condition met');
            var ctxU = this.template.querySelector('canvas.pieChartUnpaid').getContext('2d');
            console.log('ctxU is defined');         
            console.log(ctxU);
            this.myChartUnpaid = new Chart(ctxU, {
                type: "pie",
                data: {
                    datasets: [
                        {
                            data: this._chartUnpaidLevVal,
                            backgroundColor: this._chartColor,
                        }
                    ],
                    labels: this._chartLabel,
                },
                options:{
                    legend:{
                        position:"bottom",
                        display: true,
                    },
                    responsive: true,
                    tooltips:{
                        enabled: true,
                        mode: "point",
                    },
                }
            });

            
            console.log('Updating value');
            this.myChartUnpaid.data.datasets[0].data = this._chartUnpaidLevVal;
            this.myChartUnpaid.update();

            console.log('Updating level');
            this.myChartUnpaid.data.labels = this._chartLabel;
            this.myChartUnpaid.update();

            console.log('Updating Color');
            this.myChartUnpaid.data.datasets[0].backgroundColor = this._chartColor;
            this.myChartUnpaid.update();
        }
        
    }

    
}