*** Settings ***
Library           RequestsLibrary
Library           Collections
Library           OperatingSystem
Library           SeleniumLibrary

Resource          Resources/Variables/AdmitHis-variables.resource
Resource          Resources/Keywords/AdmitHis-UI-keywords.resource


Suite Setup       Create AdmitHIS Session

*** Test Cases ***


# PreAdmit Test
01-UI - Open Filing Page
    [Documentation]   باز  کردن صفحه پذیرش بستری
    [Tags]    STEP_01_Open_Browser    UI_Test    step01    preadmit

    Disable Screenshots
    Start Browser AdmitHis With Token
    Go To AdmitHis Page
    Wait For Spinner Hidden
    Log To Console    ---- DONE ----

# زمانی که کاربر شروع به پذیرش میکنه و کد ملی رو وارد میکنه و استحقاق درمان میکنه

02-UI - Enter national code of preadmit patient
    [Documentation]   وارد کردن کد ملی بیمار و استعلام کد ملی
    [Tags]    UI_Test    step02    preadmit

    Disable Screenshots        
    Wait For Page Ready
    Wait Until Element Is Visible    //input[@formcontrolname='nationalCode']    50s
    Clear Element Text    //input[@formcontrolname='nationalCode']
    Input Text         //input[@formcontrolname='nationalCode']     ${nationalCode}
    Click Element Safe       id=button-addon3
    Wait For Page Ready


# پر کردن باقی فیلد های مهم در پذیرش 

03-UI - Fill Patient PreAdmit Info
    [Documentation]    پر کردن اطلاعات مورد نیاز بیمار 
    [Tags]    UI_Test    step03    preadmit

    Disable Screenshots
    Wait For Page Ready
    Select From Ng Select    maritalStatus           مجرد
    Select From Ng Select    insurRelation           خود فرد

    Input Text         //input[@formcontrolname='mobileNumber']    09383509316
    Input Text         //input[@formcontrolname='address']    dfgdfgdfgd
    Input Text         //input[@formcontrolname='accompanyfullName']     مهرشاد شیخ الاسلامی
    Select From Ng Select    relation   خود فرد 
    Input Text         //input[@formcontrolname='accompanyMobileNumber']    09383586316

    Wait For Spinner Hidden
    Wait Until Element Is Visible    id=button-addon2
    Click Element    id=button-addon2

    Select From Ng Select    firstRecognition         شکستگی
    Select From Ng Select    howToRefer               وسیله شخصی
    Select From Ng Select    causeOfHospitalization   دل درد

#وقتی که بخش بیمار را برای بستری کردن انتخاب میکنیم

04-UI - Assign Ward And Doctor And Prepayment
    [Documentation]    انتخاب بخش و پزشک بیمار preadmit
    [Tags]    UI_Test    step04    preadmit

    Disable Screenshots
    Wait For Page Ready
    Select From Ng Select    wardfileld             اطفال 2 - تخت خالی 
    Select From Ng Select    doctorField             Siavash Siavash
    Select From Ng Select    responsiblePatient     خود فرد

    Input Text         //input[@formcontrolname='prepayment']             10000

05-UI - Save Admission Filing
    [Documentation]    سیو کردن پذیرش preadmit
    [Tags]    UI_Test    step05    preadmit

    Disable Screenshots
    Click Element Safe     css=button.btn-saveFile
    Wait For Page Ready


# زدن دکمه لغو صفحه پرینت برگه پذیرش 

06-UI - deny admit print page
    [Documentation]    لغو پرینت برگه پذیرش 
    [Tags]    UI_Test    step06    preadmit

    Disable Screenshots
    Click Element Safe    css=button.swal2-deny.swal2-styled

07-UI - Open Cash Web And Pay
    [Documentation]     باز کردن صندوق و دریافت پیش پرداخت بیمار پری ادمیت
    [Tags]    UI_Test    step07    preadmit
    
    Disable Screenshots
    Cash Pay Patient By National Code    ${nationalCode}


08-UI - go to inpatient list
    [Documentation]    رفتن به لیست بیماران بستری 
    [Tags]    UI_Test    step08    preadmit
    
    Disable Screenshots
    # Start Browser AdmitHis With Token
    # Go To AdmitHis Page
    Wait For Page Ready
    Switch To AdmitHis App
    Click Element Safe    xpath=//img[@src='assets/icons/inpatient.svg']/ancestor::a   
    Wait For Page Ready


09-UI - Load Preadmit Patient List
    [Documentation]    لیست بیماران preadmit 
    [Tags]    UI_Test   step09    preadmit
    
    Disable Screenshots
    # Start Browser AdmitHis With Token
    # Go To AdmitHis Page
    # Wait For Page Ready
    # Click Element Safe    xpath=//img[@src='assets/icons/inpatient.svg']/ancestor::a  
    Wait For Page Ready
    Click Element Safe    xpath=//span[contains(@class,'mat-checkbox-inner-container')]
    Wait For Page Ready

10-UI - Edit Preadmit Patient
    [Documentation]     ویرایش بیمار preadmit
    [Tags]      UI_Test    step10    preadmit

    Disable Screenshots
    # Start Browser AdmitHis With Token
    # Go To AdmitHis Page
    # Wait For Page Ready
    # Click Element Safe    xpath=//img[@src='assets/icons/inpatient.svg']/ancestor::a 
    # Wait For Page Ready 
    # Click Element Safe    xpath=//span[contains(@class,'mat-checkbox-inner-container')]
    Wait For Page Ready
    Input Text      //input[@formcontrolname='nationalCode']     	${nationalCode}
    Click Element Safe    css=button.mat-tooltip-trigger.btn.btn-warning
    Wait For Page Ready   
    Click Element Safe    css=button.mat-tooltip-trigger.btn-action.ng-star-inserted 
    Wait For Page Ready
    Click Element Safe    css=button.mat-tooltip-trigger.btn.btn-edit1   
    Wait For Page Ready
    Select From Ng Select    wardfileld             اطفال 2 - تخت خالی (33)
    Select From Ng Select    doctorField             Siavash Siavash
    Wait For Page Ready
    Click Element Safe     css=button.btn-saveFile
    Wait For Page Ready
    Click Element Safe     css=button.swal2-deny.swal2-styled
    Wait For Page Ready 
    Click Element Safe     xpath=//span[contains(@class,'mat-checkbox-inner-container')]
    Wait For Page Ready

11-UI - Cancel Preadmit 
    [Documentation]   لغو پذیرش preadmit
    [Tags]    UI_Test    step11    preadmit

    Disable Screenshots
    # Start Browser AdmitHis With Token
    # Go To AdmitHis Page
    # Wait For Page Ready
    # Click Element Safe    xpath=//img[@src='assets/icons/inpatient.svg']/ancestor::a 
    # Wait For Page Ready 
    # Click Element Safe    xpath=//span[contains(@class,'mat-checkbox-inner-container')]
    # Wait For Page Ready
    # Input Text      mat-input-55     	${nationalCode}
    Input Text            xpath=//input[@formcontrolname='nationalCode']    ${nationalCode}
    Click Element Safe    css=button.mat-tooltip-trigger.btn.btn-warning
    Wait For Page Ready   
    Click Element Safe    xpath=//button[not(@hidden) and .//mat-icon[normalize-space(.)='cancel']]
    Wait For Page Ready
    Click Element Safe    xpath=//button[contains(@class,'swal2-confirm') and normalize-space(.)='بله']

12-UI - Open Cash Web And Refund
    [Documentation]   بازپرداخت به بیمار در صندوق
    [Tags]    UI_Test    step12    preadmit
    
    Disable Screenshots
    Cash Refund Patient By National Code    ${nationalCode}   


#------------------------------------------------------------------------------
# Inpatient Admit Test

13-UI - Open Filling Page
    [Documentation]   باز  کردن صفحه پذیرش بستری
    [Tags]    Open_Browser    UI_Test    step13    inpatient

    Disable Screenshots
    Start Browser AdmitHis With Token
    Go To AdmitHis Page
    Wait For Page Ready
    # Switch To AdmitHis App
    Wait For Spinner Hidden
    Log To Console    ---- DONE ----

14-UI - Enter national code of inpatient 
    [Documentation]   وارد کردن کد ملی بیمار و استعلام کد ملی
    [Tags]    UI_Test    step14    inpatient

    Disable Screenshots    
    Wait For Page Ready
    Wait Until Element Is Visible    //input[@formcontrolname='nationalCode']    10s
    Clear Element Text    //input[@formcontrolname='nationalCode']
    Input Text         //input[@formcontrolname='nationalCode']     ${nationalCode}
    Click Element Safe       id=button-addon3
    Wait For Page Ready     

15-UI - Fill inpatient Info
    [Documentation]    پر کردن اطلاعات مورد نیاز بیمار 
    [Tags]    UI_Test    step15    inpatient
    
    Disable Screenshots
    Wait For Page Ready
    Select From Ng Select    maritalStatus           مجرد
    Select From Ng Select    insurRelation           خود فرد

    Input Text         //input[@formcontrolname='mobileNumber']    09383509316
    Input Text         //input[@formcontrolname='address']    dfgdfgdfgd
    Input Text         //input[@formcontrolname='accompanyfullName']     مهرشاد شیخ الاسلامی
    Select From Ng Select    relation   خود فرد 
    Input Text         //input[@formcontrolname='accompanyMobileNumber']    09383586316

    Wait For Spinner Hidden
    Wait Until Element Is Visible    id=button-addon2
    Click Element    id=button-addon2

    Select From Ng Select    patientClass            بستری
    Select From Ng Select    firstRecognition         شکستگی
    Select From Ng Select    howToRefer               وسیله شخصی
    Select From Ng Select    causeOfHospitalization   دل درد

16-UI - Assign Ward And Doctor 
    [Documentation]    انتخاب بخش و پزشک بیمار preadmit
    [Tags]    UI_Test    step16    inpatient
    
    Disable Screenshots
    # Start Browser AdmitHis With Token
    # Go To AdmitHis Page
    # Wait For Page Ready
    Select From Ng Select    wardfileld             اطفال 2 - تخت خالی
    Select From Ng Select    bedNum            اتاق1 - تخت عمومي - تخت18
    Select From Ng Select    doctorField             Siavash Siavash
    Select From Ng Select    responsiblePatient     خود فرد
  
17-UI - Save Admission Filing
    [Documentation]    سیو کردن پذیرش preadmit
    [Tags]    UI_Test  step17  inpatient

    Disable Screenshots
    Click Element Safe     css=button.btn-saveFile
    Click Element Safe    css=button.swal2-confirm.swal2-styled
    Wait For Page Ready

18-UI - deny admit print page
    [Documentation]    لغو پرینت برگه پذیرش 
    [Tags]    UI_Test  step18  inpatient
    
    Disable Screenshots
    Click Element Safe    css=button.swal2-deny.swal2-styled

19-UI - go to inpatient list
    [Documentation]    رفتن به لیست بیماران بستری 
    [Tags]    UI_Test    step19  inpatient
    
    Disable Screenshots
    # Start Browser AdmitHis With Token
    # Go To AdmitHis Page
    Wait For Page Ready
    Switch To AdmitHis App
    Click Element Safe    xpath=//img[@src='assets/icons/inpatient.svg']/ancestor::a   
    Wait For Page Ready

20-UI - Edit Preadmit Patient
    [Documentation]     ویرایش بیمار بستری
    [Tags]      UI_Test    step20  inpatient
    
    Disable Screenshots
    # Start Browser AdmitHis With Token
    # Go To AdmitHis Page
    # Wait For Page Ready
    # Click Element Safe    xpath=//img[@src='assets/icons/inpatient.svg']/ancestor::a 
    Wait For Page Ready
    Input Text      //input[@formcontrolname='nationalCode']     	${nationalCode}
    Click Element Safe    css=button.mat-tooltip-trigger.btn.btn-warning
    Wait For Page Ready   
    Click Element Safe    css=button.mat-tooltip-trigger.btn-action.ng-star-inserted 
    Wait For Page Ready
    Click Element Safe    css=button.mat-tooltip-trigger.btn.btn-edit1   
    Wait For Page Ready
    Wait For Spinner Hidden
    Check Fields Should Be Disabled
    ...    //ng-select[@formcontrolname='typeOfAdmission']
    ...    //ng-select[@formcontrolname='priorityHospitalization']
    ...    //ng-select[@formcontrolname='patientClass']
    ...    //ng-select[@formcontrolname='firstRecognition']
    ...    //ng-select[@formcontrolname='howToRefer']
    ...    //ng-select[@formcontrolname='causeOfHospitalization']
    ...    //input[@formcontrolname='wardfileText']
    ...    //input[@formcontrolname='bedNumberText']
    ...    //input[@formcontrolname='prepayment']
    ...    //input[@formcontrolname='prepaymentDoctor']
    ...    //ng-select[@formcontrolname='doctorField']
    Select From Ng Select    responsiblePatient            همسر
    Wait For Page Ready
    Click Element Safe     css=button.btn-saveFile
    Wait For Page Ready
    Click Element Safe     css=button.swal2-deny.swal2-styled
    Wait For Page Ready