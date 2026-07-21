*** Settings ***
Library           RequestsLibrary
Library           Collections
Library           OperatingSystem
Library           SeleniumLibrary
Library           JSONLibrary
Library           DatabaseLibrary
Library           pymssql    
Library           jdatetime

Resource          ${CURDIR}/../Variables/AdmitHis-variables.resource


*** Keywords ***

Create Landing Session
    Create Session    Landing    ${Landing_App_URL}   verify=${False}

Create AdmitHIS Session
    Create Session    HIS    ${AdmitHis_Api_URL}   verify=${False}

Create Cartable Session
    Create Session    Cartable    ${Cartable_Api_URL}   verify=${False}

Create Cash Session
    Create Session    Cash    ${Cash_Api_URL}   verify=${False}    

Create All Sessions
    Create Landing Session
    Create AdmitHIS Session
    Create Cartable Session
    Create Cash Session

Disable Screenshots
    Register Keyword To Run On Failure    NONE    


###    TC_EPD_HIS_01_SC_01_01

Get Token Data
    [Documentation]    دریافت اطلاعات کاربر لاگین کننده
    [Tags]    API_DynamicRoleClaimsManager    METHOD_GET  

    ${headers}=    Create Dictionary
    ...    Authorization=${AUTH_BEARER}
    ...    Cookie=${COOKIE_TOKEN}
    ...    Accept=application/json

    ${resp}=    GET On Session    
    ...    HIS    
    ...    /api/DynamicRoleClaimsManager/GetTokenData    
    ...    headers=${headers}

    Should Be Equal As Integers    
    ...    ${resp.status_code}    
    ...    200    

    ${json}=    Set Variable    ${resp.json()}  

    ${LOGIN_user_name}=           Set Variable    ${json["username"]}
    ${LOGIN_person_Id}=           Set Variable    ${json["personId"]}
    ${LOGIN_display_Name}=        Set Variable    ${json["displayName"]}
    ${LOGIN_ROLES}=               Set Variable    ${json["roles"]}

    Write State    LOGIN_ROLES    ${LOGIN_ROLES}
    Write State    Login_User_Name    ${LOGIN_user_name} 
    Write State    Login_Person_Id    ${LOGIN_person_Id} 
    Write State    Login_Display_Name    ${LOGIN_display_Name} 

    Log To Console
    ...    User Role:${LOGIN_ROLES} 

    Set Test Message
    ...    User Role:${LOGIN_ROLES}     

# Landing App

Start Browser Landing With Token
    [Documentation]    باز کردن کروم + تزریق کوکی token
    Open Browser    ${Landing_App_URL}    chrome     executable_path=C:/chromedriver.exe
    Maximize Browser Window
    Add Cookie    token    ${COOKIE_TOKEN}
    Reload Page


Go To Landing Page
    [Documentation]    رفتن مستقیم به صفحه لندینگ
    Go To    ${Landing_App_URL}
    Reload Page

Validate Admit Access

    [Documentation]    بررسی دسترسی کاربر به پذیرش بستری

    Get Token Data

    ${roles}=    Read State    LOGIN_ROLES

    Log To Console
    ...    User Roles: ${roles}

    ${has_access}=    Evaluate
    ...    1195 in $roles or 777 in $roles

    Skip If
    ...    not ${has_access}
    ...    User does not have Admit HIS access role (1195 or 777)

    Log To Console
    ...    User has valid Admit HIS access

    Set Test Message
    ...    User Access:${has_access}     


Click Admit HIS In Landing
    [Documentation]   کلیک بر روی گزینه پذیرش بستری
    [Arguments]    ${timeout}=80
    Wait Until Element Is Not Visible    css=div.back-spenner.ng-star-inserted    80000
    Run Keyword And Ignore Error
    ...    Wait Until Page Contains Element
    ...    ${GLOBAL_SPINNER}
    ...    3

    Wait Until Element Is Not Visible
    ...    ${GLOBAL_SPINNER}
    ...    ${timeout}      
    # Click Element    xpath=//div[contains(@class,'child-name') and normalize-space()='پذیرش بستری']
    Execute JavaScript
    ...    document.evaluate("//div[contains(@class,'child-name') and contains(.,'پذیرش بستری')]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
    Reload Page    

Validate Admit Page Opened

    [Documentation]    بررسی باز شدن صفحه پذیرش بستری

    ${opened}=    Run Keyword And Return Status

    ...    Wait Until Page Contains Element
    ...    xpath=//*[contains(text(),'پذیرش بستری')]
    ...    20s

    Should Be True
    ...    ${opened}
    ...    User has access role but Admit HIS page did not open    

    Log To Console
    ...    Open Admit Page : ${opened}

    Set Test Message
    ...    Open Admit Page : ${opened}     


###    TC_EPD_HIS_02_SC_02_01  

Start Browser AdmitHis With Token
    [Documentation]    باز کردن کروم + تزریق کوکی token
    Open Browser    ${AdmitHis_App_URL}    chrome     executable_path=C:/chromedriver.exe
    Maximize Browser Window
    Add Cookie    token    ${COOKIE_TOKEN}
    Reload Page

Go To AdmitHis Page
    [Documentation]    رفتن مستقیم به صفحه پذیرش بستری
    Go To    ${AdmitHis_App_URL}
    Reload Page

Step01 - Verify National Code Format
    [Documentation]    Verify valid national code can be entered and inquiry button is enabled for Iranian nationality

    Select Iranian Nationality

    Enter National Code
    ...    1234567891

    Verify Identity Inquiry Button Is Enabled

    Log To Console    Step01 Passed

Select Iranian Nationality

    Wait For Page Ready
    Wait For Spinner Hidden

    Click Element    xpath=//ng-select[@formcontrolname='nationality']

    Wait Until Element Is Enabled
    ...    xpath=//span[normalize-space()='ایرانی']
    ...    visible

    Click Element    xpath=//span[normalize-space()='ایرانی']

Enter National Code
    [Arguments]    ${nationalCode}

    Wait For Page Ready
    Wait For Spinner Hidden
    Input Text
    ...    xpath=//input[@formcontrolname='nationalCode']
    ...    ${nationalCode}


Verify Identity Inquiry Button Is Enabled

    Wait Until Element Is Visible
    ...    xpath=//button[contains(.,'استعلام هویت')]
    ...    visible

    Element Should Be Enabled 
    ...    xpath=//button[contains(.,'استعلام هویت')]

    Element Should Be Enabled
    ...    xpath=//button[contains(.,'استعلام هویت')]            

Switch To AdmitHis App
    Go To    ${AdmitHis_App_URL}
    Wait Until Location Contains    8019  
    Wait For Spinner Hidden
    Wait For Page Ready  

# Cash

Switch To Cash App
    Go To    ${Cash_App_URL}
    Wait Until Location Contains    8075
    Wait For Spinner Hidden
    Wait For Page Ready
    

Start Browser Cash With Token
    [Documentation]   باز کردن صندوق وب
    Open Browser    ${Cash_App_URL}    chrome
    Add Cookie    token    ${COOKIE_TOKEN}
    Maximize Browser Window
    Reload Page

Go To Cash Page
    [Documentation]    باز کردن صندوق وب
    Go To    ${Cash_App_URL}
    Reload Page

Cash Pay Patient By National Code
    [Arguments]    ${nationalCode}
    [Documentation]    Open Cash App, search patient by national code and complete payment flow

    Wait For Page Ready
    Switch To Cash App
    Wait For Page Ready
    Wait For Spinner Hidden

    Input Text
    ...    xpath=//input[@formcontrolname='nationalCode']
    ...    ${nationalCode}

    Wait For Page Ready

    Click Element Safe
    ...    xpath=//button[contains(@class,'btn-warning') and .//mat-icon[.='search']]

    Wait For Page Ready
    Wait For Spinner Hidden

    ${row_xpath}=    Set Variable
    ...    //tr[.//td[contains(normalize-space(), '${nationalCode}')]]

    Wait Until Keyword Succeeds
    ...    3x
    ...    5s
    ...    Element Should Be Visible
    ...    ${row_xpath}

    Double Click Element    ${row_xpath}

    Wait Until Element Is Visible
    ...    xpath=//button[normalize-space(text())='پرداخت']
    ...    30s

    Click Element Safe
    ...    xpath=//button[normalize-space(text())='پرداخت']

    Wait For Page Ready

    Click Element Safe
    ...    xpath=//button[contains(@class,'swal2-confirm') and normalize-space(.)='بله']

Cash Refund Patient By National Code
    [Arguments]    ${nationalCode}
    [Documentation]    Open Cash App, search patient by national code and complete payment flow

    Wait For Page Ready
    Switch To Cash App
    Wait For Page Ready
    Wait For Spinner Hidden

    Input Text
    ...    xpath=//input[@formcontrolname='nationalCode']
    ...    ${nationalCode}

    Wait For Page Ready

    Click Element Safe
    ...    xpath=//button[contains(@class,'btn-warning') and .//mat-icon[.='search']]

    Wait For Page Ready
    Wait For Spinner Hidden

    ${row_xpath}=    Set Variable
    ...    //tr[.//td[contains(normalize-space(), '${nationalCode}')]]

    Wait Until Keyword Succeeds
    ...    3x
    ...    5s
    ...    Element Should Be Visible
    ...    ${row_xpath}

    Double Click Element    ${row_xpath}

    Input Text
    ...    xpath=//input[@formcontrolname='comment']
    ...    test

    Wait Until Element Is Visible
    ...    xpath=//button[normalize-space(text())='بازپرداخت']
    ...    30s

    Click Element Safe
    ...    xpath=//button[normalize-space(text())='بازپرداخت']

    Wait For Page Ready

    Click Element Safe
    ...    xpath=//button[contains(@class,'swal2-confirm') and normalize-space(.)='بله']    


# General
Wait For Spinner Hidden
    [Documentation]    صبر کردن تا loading Angular ناپدید شود
    Wait Until Element Is Not Visible    css=div.back-spenner.ng-star-inserted    1000

Select From Ng Select
    [Arguments]    ${formcontrol}    ${value}
    Wait For Spinner Hidden

    Wait Until Element Is Visible
    ...    css=ng-select[formcontrolname='${formcontrol}']
    Click Element
    ...    css=ng-select[formcontrolname='${formcontrol}']

    Wait Until Element Is Visible
    ...    css=ng-select[formcontrolname='${formcontrol}'] input[type='text']
    Input Text
    ...    css=ng-select[formcontrolname='${formcontrol}'] input[type='text']
    ...    ${value}

    Wait Until Element Is Visible
    ...    xpath=//div[contains(@class,'ng-option') and contains(normalize-space(.), '${value}')]
    Click Element
    ...    xpath=//div[contains(@class,'ng-option') and contains(normalize-space(.), '${value}')]

    Press Keys
    ...    css=ng-select[formcontrolname='${formcontrol}'] input[type='text']
    ...    TAB

##############################################################################

Check Fields Should Be Disabled
    [Documentation]    چک می‌کند که تمام فیلدهای ارسال‌شده واقعاً غیرفعال باشند
    [Arguments]    @{fields}

    FOR    ${field}    IN    @{fields}
        Wait Until Element Is Visible    ${field}    10s

        ${selenium_disabled}=    Run Keyword And Return Status
        ...    Element Should Be Disabled    ${field}

        ${class}=    Get Element Attribute    ${field}    class
        ${has_disabled_class}=    Run Keyword And Return Status
        ...    Should Contain    ${class}    disabled

        ${is_disabled}=    Evaluate
        ...    ${selenium_disabled} or ${has_disabled_class}

        IF    not ${is_disabled}
            Fail    Field should be disabled but is enabled: ${field}
        END
    END

##############################################################################

Click Element Safe
    [Arguments]    ${locator}
    Wait For Spinner Hidden
    Wait Until Element Is Visible    ${locator}
    Wait Until Element Is Enabled    ${locator}
    Scroll Element Into View         ${locator}
    Click Element                    ${locator}     

Wait For Page Ready
    [Arguments]    ${timeout}=30

    Run Keyword And Ignore Error
    ...    Wait Until Page Contains Element
    ...    ${GLOBAL_SPINNER}
    ...    3

    Wait Until Element Is Not Visible
    ...    ${GLOBAL_SPINNER}
    ...    ${timeout}      

##############################################################
# runtime state
# 

Write State
    [Arguments]    ${key}    ${value}

    ${exists}=    Run Keyword And Return Status
    ...    File Should Exist    ${STATE_FILE}

    IF    not ${exists}
        Create File    ${STATE_FILE}    {}
    END

    ${content}=    Get File    ${STATE_FILE}    encoding=utf-8
    ${state}=      Evaluate    json.loads('''${content}''')    json    

    Set To Dictionary    ${state}    ${key}    ${value}

    ${out}=    Evaluate    json.dumps(${state}, indent=2, ensure_ascii=False)
    Create File    ${STATE_FILE}    ${out}    encoding=utf-8


Fileformation Write State
    [Arguments]    ${key}    ${value}

    ${exists}=    Run Keyword And Return Status
    ...    File Should Exist    ${STATE_FILE}

    IF    not ${exists}
        Create File    ${STATE_FILE}    {}    encoding=utf-8
    END

    ${content}=    Get File    ${STATE_FILE}    encoding=utf-8

    ${state}=    Evaluate    json.loads('''${content}''')    json

    ${key_exists}=    Run Keyword And Return Status
    ...    Dictionary Should Contain Key    ${state}    ${key}

    IF    not ${key_exists}
        # ✅ اگر وجود ندارد → بساز
        Set To Dictionary    ${state}    ${key}    ${value}

    ELSE
        ${old_value}=    Get From Dictionary    ${state}    ${key}

        ${is_null}=    Evaluate    $old_value is None or $old_value == '' or $old_value == 'null'

        IF    ${is_null}
            # ✅ اگر قبلاً null بوده → آپدیت کن
            Set To Dictionary    ${state}    ${key}    ${value}
        END
    END

    ${out}=    Evaluate    json.dumps(${state}, indent=2, ensure_ascii=False)    json

    Create File    ${STATE_FILE}    ${out}    encoding=utf-8


Read State
    [Arguments]    ${key}

    File Should Exist    ${STATE_FILE}

    ${content}=    Get File    ${STATE_FILE}
    ${state}=      Evaluate    json.loads('''${content}''')    json

    ${value}=    Get From Dictionary    ${state}    ${key}

    Should Not Be Equal    ${value}    ${None}
    ...    ❌ ${key} not found in state file

    RETURN    ${value}

    
Convert Jalali To Gregorian
    [Arguments]    ${jalali_date}
    ${gdate}=    Evaluate    __import__('jdatetime').datetime.strptime("${jalali_date}", "%Y/%m/%d").togregorian().strftime("%Y/%m/%d")
    RETURN    ${gdate}

