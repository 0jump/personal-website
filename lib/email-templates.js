const logoURL = 'https://i.postimg.cc/p5p2gVf6/logo.png';

emailTemplates = {};

emailTemplates.dailyHomePageVisits = {};

emailTemplates.dailyHomePageVisits.getCountryCell = (pCountry) => {
    let countryCell = `
    <div class="col num4" style="max-width: 320px;min-width: 233px;display: table-cell;vertical-align: top;">
    <div style="background-color: transparent; width: 100% !important;">
        <!--[if (!mso)&(!IE)]><!-->
        <div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:10px; padding-bottom:0px; padding-right: 10px; padding-left: 10px;">
            <!--<![endif]-->
            <div class="">
                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 5px; padding-bottom: 10px;"><![endif]-->
                <div style="color:#555555;font-family:'Fira Sans', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif;line-height:120%; padding-right: 10px; padding-left: 10px; padding-top: 5px; padding-bottom: 10px;">
                    <div style="font-size:12px;line-height:14px;color:#555555;font-family:'Fira Sans', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif;text-align:left;">
                        <p style="margin: 0;font-size: 14px;line-height: 17px;text-align: center;color:#035F74">
                            <span style="font-size: 16px; line-height: 19px;"><b>${pCountry}</b></span>
                        </p>
                    </div>
                </div>
                <!--[if mso]></td></tr></table><![endif]-->
            </div>
            <!--[if (!mso)&(!IE)]><!-->
        </div>
        <!--<![endif]-->
    </div>
    </div>`;

    return countryCell;
}

emailTemplates.dailyHomePageVisits.getCityCell = (pCity) => {
    let cityCell = `
    <div class="col num4" style="max-width: 320px;min-width: 233px;display: table-cell;vertical-align: top;">
    <div style="background-color: transparent; width: 100% !important;">
        <!--[if (!mso)&(!IE)]><!-->
        <div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:10px; padding-bottom:0px; padding-right: 10px; padding-left: 10px; border-left: 1px solid #E0E0E0;">
            <!--<![endif]-->
            <div class="">
                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 5px; padding-bottom: 10px;"><![endif]-->
                <div style="color:#555555;font-family:'Fira Sans', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif;line-height:120%; padding-right: 10px; padding-left: 10px; padding-top: 5px; padding-bottom: 10px;">
                    <div style="font-size:12px;line-height:14px;color:#555555;font-family:'Fira Sans', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif;text-align:left;">
                        <p style="margin: 0;font-size: 14px;line-height: 17px;text-align: center">
                            <span style="font-size: 16px; line-height: 19px;">${pCity}</span>
                        </p>
                    </div>
                </div>
                <!--[if mso]></td></tr></table><![endif]-->
            </div>
            <!--[if (!mso)&(!IE)]><!-->
        </div>
        <!--<![endif]-->
    </div>
    </div>`;

    return cityCell;
}

emailTemplates.dailyHomePageVisits.getNbVisitsCell = (pNbVisits) => {
    let nbVisitsCell = `
    <div class="col num4" style="max-width: 320px;min-width: 233px;display: table-cell;vertical-align: top;">
    <div style="background-color: transparent; width: 100% !important;">
        <!--[if (!mso)&(!IE)]><!-->
        <div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:10px; padding-bottom:0px; padding-right: 10px; padding-left: 10px;border-left: 1px solid #E0E0E0;">
            <!--<![endif]-->
            <div class="">
                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 5px; padding-bottom: 10px;"><![endif]-->
                <div style="color:#FF6C5E;font-family:'Fira Sans', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif;line-height:120%; padding-right: 10px; padding-left: 10px; padding-top: 5px; padding-bottom: 10px;">
                    <div style="font-size:12px;line-height:14px;color:#FF6C5E;font-family:'Fira Sans', 'Lucida Sans Unicode', 'Lucida Grande', sans-serif;text-align:left;">
                        <p style="margin: 0;font-size: 14px;line-height: 17px;text-align: center">
                            <span style="font-size: 16px; line-height: 19px;"><strong>${pNbVisits}</strong></span>
                        </p>
                    </div>
                </div>
                <!--[if mso]></td></tr></table><![endif]-->
            </div>
            <!--[if (!mso)&(!IE)]><!-->
        </div>
        <!--<![endif]-->
    </div>
    </div>
    `;
    
    return nbVisitsCell;
}


let tempData = [{
    "country": "China",
    "city": "Yudai",
    "visits": 42
}, {
    "country": "Colombia",
    "city": "Pensilvania",
    "visits": 20
}, {
    "country": "Croatia",
    "city": "Bobota",
    "visits": 150
}, {
    "country": "Ukraine",
    "city": "Mysove",
    "visits": 101
}, {
    "country": "Madagascar",
    "city": "Marovoay",
    "visits": 8
}, {
    "country": "Guatemala",
    "city": "Pastores",
    "visits": 14
}, {
    "country": "United States",
    "city": "Pittsburgh",
    "visits": 37
}];




emailTemplates.dailyHomePageVisits.getRowsHtml = (pInfoArray) => {

    let totalHtml = '';
    
    for (let i=0; i < pInfoArray.length; i++){
        console.log('Info: ', pInfoArray[i].visits, '');

        let country = pInfoArray[i].country;
        let city = pInfoArray[i].city;
        let visits = pInfoArray[i].visits.toString();

        let countryCell = emailTemplates.dailyHomePageVisits.getCountryCell(country);
        let cityCell = emailTemplates.dailyHomePageVisits.getCityCell(city);
        let visitsCell = emailTemplates.dailyHomePageVisits.getNbVisitsCell(visits);

        let row = `
        <div style="Margin: 0 auto;min-width: 320px;max-width: 700px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #FFFFFF;"
            class="block-grid three-up no-stack">
            <div style="border-collapse: collapse;display: table;width: 100%;background-color:#FFFFFF;">
                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#F4AA15;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width: 700px;"><tr class="layout-full-width" style="background-color:#FFFFFF;"><![endif]-->
        
                <!--[if (mso)|(IE)]><td align="center" width="232" style=" width:232px; padding-right: 15px; padding-left: 15px; padding-top:15px; padding-bottom:0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 1px solid #E0E0E0;" valign="top"><![endif]-->
        
                    ${countryCell}
        
                <!--[if (mso)|(IE)]></td><td align="center" width="233" style=" width:233px; padding-right: 10px; padding-left: 10px; padding-top:10px; padding-bottom:0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><![endif]-->
        
                    ${cityCell}
        
                <!--[if (mso)|(IE)]></td><td align="center" width="232" style=" width:232px; padding-right: 15px; padding-left: 15px; padding-top:15px; padding-bottom:10px; border-top: 0px solid transparent; border-left: 1px solid #E0E0E0; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><![endif]-->
        
                    ${visitsCell}
        
                <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
            </div>
        </div>
        `;

        totalHtml = totalHtml + row;
    }

    return totalHtml;
}

emailTemplates.dailyHomePageVisits.getHtml = (pDate, pInfoArray) => {
    let infoHTML = emailTemplates.dailyHomePageVisits.getRowsHtml(pInfoArray);
    
    let emailHtml = `
    <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    
    <head>
        <!--[if gte mso 9]><xml>
        <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml><![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width">
        <!--[if !mso]><!-->
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <!--<![endif]-->
        <title></title>
        <!--[if !mso]><!-- -->
        <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet" type="text/css">
        <!--<![endif]-->
    
        <style type="text/css" id="media-query">
            body {
                margin: 0;
                padding: 0;
            }
    
            table,
            tr,
            td {
                vertical-align: top;
                border-collapse: collapse;
            }
    
            .ie-browser table,
            .mso-container table {
                table-layout: fixed;
            }
    
            * {
                line-height: inherit;
            }
    
            a[x-apple-data-detectors=true] {
                color: inherit !important;
                text-decoration: none !important;
            }
    
            [owa] .img-container div,
            [owa] .img-container button {
                display: block !important;
            }
    
            [owa] .fullwidth button {
                width: 100% !important;
            }
    
            [owa] .block-grid .col {
                display: table-cell;
                float: none !important;
                vertical-align: top;
            }
    
            .ie-browser .num12,
            .ie-browser .block-grid,
            [owa] .num12,
            [owa] .block-grid {
                width: 700px !important;
            }
    
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
                line-height: 100%;
            }
    
            .ie-browser .mixed-two-up .num4,
            [owa] .mixed-two-up .num4 {
                width: 232px !important;
            }
    
            .ie-browser .mixed-two-up .num8,
            [owa] .mixed-two-up .num8 {
                width: 464px !important;
            }
    
            .ie-browser .block-grid.two-up .col,
            [owa] .block-grid.two-up .col {
                width: 350px !important;
            }
    
            .ie-browser .block-grid.three-up .col,
            [owa] .block-grid.three-up .col {
                width: 233px !important;
            }
    
            .ie-browser .block-grid.four-up .col,
            [owa] .block-grid.four-up .col {
                width: 175px !important;
            }
    
            .ie-browser .block-grid.five-up .col,
            [owa] .block-grid.five-up .col {
                width: 140px !important;
            }
    
            .ie-browser .block-grid.six-up .col,
            [owa] .block-grid.six-up .col {
                width: 116px !important;
            }
    
            .ie-browser .block-grid.seven-up .col,
            [owa] .block-grid.seven-up .col {
                width: 100px !important;
            }
    
            .ie-browser .block-grid.eight-up .col,
            [owa] .block-grid.eight-up .col {
                width: 87px !important;
            }
    
            .ie-browser .block-grid.nine-up .col,
            [owa] .block-grid.nine-up .col {
                width: 77px !important;
            }
    
            .ie-browser .block-grid.ten-up .col,
            [owa] .block-grid.ten-up .col {
                width: 70px !important;
            }
    
            .ie-browser .block-grid.eleven-up .col,
            [owa] .block-grid.eleven-up .col {
                width: 63px !important;
            }
    
            .ie-browser .block-grid.twelve-up .col,
            [owa] .block-grid.twelve-up .col {
                width: 58px !important;
            }
    
            @media only screen and (min-width: 720px) {
                .block-grid {
                    width: 700px !important;
                }
    
                .block-grid .col {
                    vertical-align: top;
                }
    
                .block-grid .col.num12 {
                    width: 700px !important;
                }
    
                .block-grid.mixed-two-up .col.num4 {
                    width: 232px !important;
                }
    
                .block-grid.mixed-two-up .col.num8 {
                    width: 464px !important;
                }
    
                .block-grid.two-up .col {
                    width: 350px !important;
                }
    
                .block-grid.three-up .col {
                    width: 233px !important;
                }
    
                .block-grid.four-up .col {
                    width: 175px !important;
                }
    
                .block-grid.five-up .col {
                    width: 140px !important;
                }
    
                .block-grid.six-up .col {
                    width: 116px !important;
                }
    
                .block-grid.seven-up .col {
                    width: 100px !important;
                }
    
                .block-grid.eight-up .col {
                    width: 87px !important;
                }
    
                .block-grid.nine-up .col {
                    width: 77px !important;
                }
    
                .block-grid.ten-up .col {
                    width: 70px !important;
                }
    
                .block-grid.eleven-up .col {
                    width: 63px !important;
                }
    
                .block-grid.twelve-up .col {
                    width: 58px !important;
                }
            }
    
            @media (max-width: 720px) {
    
                .block-grid,
                .col {
                    min-width: 320px !important;
                    max-width: 100% !important;
                    display: block !important;
                }
    
                .block-grid {
                    width: calc(100% - 40px) !important;
                }
    
                .col {
                    width: 100% !important;
                }
    
                .col>div {
                    margin: 0 auto;
                }
    
                img.fullwidth,
                img.fullwidthOnMobile {
                    max-width: 100% !important;
                }
    
                .no-stack .col {
                    min-width: 0 !important;
                    display: table-cell !important;
                }
    
                .no-stack.two-up .col {
                    width: 50% !important;
                }
    
                .no-stack.mixed-two-up .col.num4 {
                    width: 33% !important;
                }
    
                .no-stack.mixed-two-up .col.num8 {
                    width: 66% !important;
                }
    
                .no-stack.three-up .col.num4 {
                    width: 33% !important;
                }
    
                .no-stack.four-up .col.num3 {
                    width: 25% !important;
                }
    
                .mobile_hide {
                    min-height: 0px;
                    max-height: 0px;
                    max-width: 0px;
                    display: none;
                    overflow: hidden;
                    font-size: 0px;
                }
            }
        </style>
    </head>
    
    <body class="clean-body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #51b7f3">
        <style type="text/css" id="media-query-bodytag">
            @media (max-width: 520px) {
                .block-grid {
                    min-width: 320px !important;
                    max-width: 100% !important;
                    width: 100% !important;
                    display: block !important;
                }
    
                .col {
                    min-width: 320px !important;
                    max-width: 100% !important;
                    width: 100% !important;
                    display: block !important;
                }
    
                .col>div {
                    margin: 0 auto;
                }
    
                img.fullwidth {
                    max-width: 100% !important;
                }
    
                img.fullwidthOnMobile {
                    max-width: 100% !important;
                }
    
                .no-stack .col {
                    min-width: 0 !important;
                    display: table-cell !important;
                }
    
                .no-stack.two-up .col {
                    width: 50% !important;
                }
    
                .no-stack.mixed-two-up .col.num4 {
                    width: 33% !important;
                }
    
                .no-stack.mixed-two-up .col.num8 {
                    width: 66% !important;
                }
    
                .no-stack.three-up .col.num4 {
                    width: 33% !important;
                }
    
                .no-stack.four-up .col.num3 {
                    width: 25% !important;
                }
    
                .mobile_hide {
                    min-height: 0px !important;
                    max-height: 0px !important;
                    max-width: 0px !important;
                    display: none !important;
                    overflow: hidden !important;
                    font-size: 0px !important;
                }
            }
        </style>
        <!--[if IE]><div class="ie-browser"><![endif]-->
        <!--[if mso]><div class="mso-container"><![endif]-->
        <table class="nl-container" style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #F4AA15;width: 100%"
            cellpadding="0" cellspacing="0">
            <tbody>
                <tr style="vertical-align: top">
                    <td id="td" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #F4AA15;"><![endif]-->
    
                        <div style="background-color:#f5f5f5;">
                            <div style="Margin: 0 auto;min-width: 320px;max-width: 700px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;"
                                class="block-grid ">
                                <div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#f5f5f5;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width: 700px;"><tr class="layout-full-width" style="background-color:transparent;"><![endif]-->
    
                                    <!--[if (mso)|(IE)]><td align="center" width="700" style=" width:700px; padding-right: 0px; padding-left: 0px; padding-top:40px; padding-bottom:5px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><![endif]-->
                                    <div class="col num12" style="min-width: 320px;max-width: 700px;display: table-cell;vertical-align: top;">
                                        <div style="background-color: transparent; width: 100% !important;">
                                            <!--[if (!mso)&(!IE)]><!-->
                                            <div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:40px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
                                                <!--<![endif]-->
    
    
                                                <div align="center" class="img-container center fixedwidth " style="padding-right: 0px;  padding-left: 0px;">
                                                    <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr style="line-height:0px;line-height:0px;"><td style="padding-right: 0px; padding-left: 0px;" align="center"><![endif]-->
                                                    <img class="center fixedwidth" align="center" border="0" src="${logoURL}"
                                                        alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: block !important;border: 0;height: auto;float: none;width: 100%;max-width: 140px"
                                                        width="140">
                                                    <!--[if mso]></td></tr></table><![endif]-->
                                                </div>
                                                <div class="">
                                                    <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 5px;"><![endif]-->
                                                    <div style="color:#FF6C5E;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;line-height:120%; padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 5px;">
                                                        <div style="line-height:14px;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:12px;color:#FF6C5E;text-align:left;">
                                                            <p style="margin: 0;line-height: 14px;font-size: 12px;text-align: center"><span
                                                                    style="font-size:32px; line-height: 50px;"><strong>Home
                                                                        Page Visits</strong></span></p>
                                                        </div>
                                                    </div>
                                                    <!--[if mso]></td></tr></table><![endif]-->
                                                </div>
    
    
                                                <div class="">
                                                    <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 5px;"><![endif]-->
                                                    <div style="color:#0068A5;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;line-height:120%; padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 5px;">
                                                        <div style="line-height:14px;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;font-size:12px;color:#0068A5;text-align:left;">
                                                            <p id="date-ctr" style="margin: 0;line-height: 14px;text-align: right;font-size: 12px">
                                                                <span style="font-size: 22px; line-height: 33px;">${pDate}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <!--[if mso]></td></tr></table><![endif]-->
                                                </div>
    
    
                                                <div class="">
                                                    <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 5px;"><![endif]-->
    
                                                    <!--[if mso]></td></tr></table><![endif]-->
                                                </div>
    
                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>
                        <div style="background-color:#F4AA15;">
                            <div style="Margin: 0 auto;min-width: 320px;max-width: 700px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;"
                                class="block-grid ">
                                <div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#F4AA15;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width: 700px;"><tr class="layout-full-width" style="background-color:transparent;"><![endif]-->
    
                                    <!--[if (mso)|(IE)]><td align="center" width="700" style=" width:700px; padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><![endif]-->
                                    <div class="col num12" style="min-width: 320px;max-width: 700px;display: table-cell;vertical-align: top;">
                                        <div style="background-color: transparent; width: 100% !important;">
                                            <!--[if (!mso)&(!IE)]><!-->
                                            <div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:5px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;">
                                                <!--<![endif]-->
    
    
    
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="divider "
                                                    style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                    <tbody>
                                                        <tr style="vertical-align: top">
                                                            <td class="divider_inner" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;padding-right: 10px;padding-left: 10px;padding-top: 10px;padding-bottom: 10px;min-width: 100%;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                <table class="divider_content" height="0px" align="center"
                                                                    border="0" cellpadding="0" cellspacing="0" width="100%"
                                                                    style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 0px solid transparent;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                    <tbody>
                                                                        <tr style="vertical-align: top">
                                                                            <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                                <span>&#160;</span>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
    
                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>
                        <div id="insertAfter" style="background-color:#F4AA15;">
                            <div style="Margin: 0 auto;min-width: 320px;max-width: 700px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;"
                                class="block-grid ">
                                <div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#F4AA15;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width: 700px;"><tr class="layout-full-width" style="background-color:transparent;"><![endif]-->
    
                                    <!--[if (mso)|(IE)]><td align="center" width="700" style=" width:700px; padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:0px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><![endif]-->
                                    <div class="col num12" style="min-width: 320px;max-width: 700px;display: table-cell;vertical-align: top;">
                                        <div style="background-color: transparent; width: 100% !important;">
                                            <!--[if (!mso)&(!IE)]><!-->
                                            <div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:5px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;">
                                                <!--<![endif]-->
    
    
    
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="divider "
                                                    style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                    <tbody>
                                                        <tr style="vertical-align: top">
                                                            <td class="divider_inner" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;padding-right: 10px;padding-left: 10px;padding-top: 10px;padding-bottom: 10px;min-width: 100%;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                <table class="divider_content" height="0px" align="center"
                                                                    border="0" cellpadding="0" cellspacing="0" width="100%"
                                                                    style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 0px solid transparent;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                    <tbody>
                                                                        <tr style="vertical-align: top">
                                                                            <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                                <span>&#160;</span>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
    
                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>
                        ${infoHTML}
                        <div id="insertBefore" style="background-image:url('https://d1oco4z2z1fhwp.cloudfront.net/templates/default/119/bottom_clos.png');background-position:top center;background-repeat:no-repeat;;background-color:#F4AA15">
                            <div style="Margin: 0 auto;min-width: 320px;max-width: 700px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;"
                                class="block-grid ">
                                <div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-image:url('https://d1oco4z2z1fhwp.cloudfront.net/templates/default/119/bottom_clos.png');background-position:top center;background-repeat:no-repeat;;background-color:#F4AA15" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width: 700px;"><tr class="layout-full-width" style="background-color:transparent;"><![endif]-->
    
                                    <!--[if (mso)|(IE)]><td align="center" width="700" style=" width:700px; padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:45px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><![endif]-->
                                    <div class="col num12" style="min-width: 320px;max-width: 700px;display: table-cell;vertical-align: top;">
                                        <div style="background-color: transparent; width: 100% !important;">
                                            <!--[if (!mso)&(!IE)]><!-->
                                            <div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:5px; padding-bottom:45px; padding-right: 0px; padding-left: 0px;">
                                                <!--<![endif]-->
    
    
    
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" class="divider mobile_hide"
                                                    style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 100%;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                    <tbody>
                                                        <tr style="vertical-align: top">
                                                            <td class="divider_inner" style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;padding-right: 10px;padding-left: 10px;padding-top: 10px;padding-bottom: 10px;min-width: 100%;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                <table class="divider_content" height="20px" align="center"
                                                                    border="0" cellpadding="0" cellspacing="0" width="100%"
                                                                    style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 0px solid transparent;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                    <tbody>
                                                                        <tr style="vertical-align: top">
                                                                            <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 20px;line-height: 20px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%">
                                                                                <span>&#160;</span>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
    
                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>
                        <div style="background-color:#0068A5;">
                            <div style="Margin: 0 auto;min-width: 320px;max-width: 700px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;"
                                class="block-grid ">
                                <div style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#0068A5;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width: 700px;"><tr class="layout-full-width" style="background-color:transparent;"><![endif]-->
    
                                    <!--[if (mso)|(IE)]><td align="center" width="700" style=" width:700px; padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:20px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><![endif]-->
                                    <div class="col num12" style="min-width: 320px;max-width: 700px;display: table-cell;vertical-align: top;">
                                        <div style="background-color: transparent; width: 100% !important;">
                                            <!--[if (!mso)&(!IE)]><!-->
                                            <div style="border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent; padding-top:5px; padding-bottom:20px; padding-right: 0px; padding-left: 0px;">
                                                <!--<![endif]-->
    
    
                                                <div class="">
                                                    <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px;"><![endif]-->
                                                    <div style="color:#FFFFFF;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;line-height:180%; padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px;">
                                                        <div style="font-size:12px;line-height:22px;font-family:'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;color:#FFFFFF;text-align:left;">
                                                            <p style="margin: 0;font-size: 14px;line-height: 25px;text-align: center"><span
                                                                    style="font-size: 20px; line-height: 36px;"><strong>Gerard
                                                                        Antoun Official Website</strong></span></p>
                                                            <p style="margin: 0;font-size: 14px;line-height: 25px;text-align: center"><em><a style="margin: 0;font-size: 14px;line-height: 25px;text-align: center; color:#ffffff" href="http://gerardantoun.com">gerardantoun.com</a></em></p>
                                                        </div>
                                                    </div>
                                                    <!--[if mso]></td></tr></table><![endif]-->
                                                </div>
    
                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>
                        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                    </td>
                </tr>
            </tbody>
        </table>
        <!--[if (mso)|(IE)]></div><![endif]-->
    </body>
    </html>
    `;

    return emailHtml;
}




module.exports = emailTemplates;