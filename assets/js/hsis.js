var cropForm = new FormData();
var Hsis = {
    token: '39764279bc374d8a857dc064aa97087bc162d47e20fb46dda9fc84a437e4ef93',
    lang: 'az',
    appId: 1000017,
    currModule: '',
    operationList: [],
    array: [],
    node: [],
    structureId: '',
    subModuleId: [],
    tempDataId: '',
    personId: 0,
    button: '',
    top: 0,
    eduLevels: [],
    universities: [],
    begin: true,
    paginationActive: true,
    // personId: '',
    stompClient: 0,
    tempData: {
        form: ''
    },
    Codes: {
        FOREIGN_UNIVERSITY: 86
    },
    urls: {
        ROS: "http://192.168.1.8:8082/ROS/",
        AdminRest: 'http://192.168.1.8:8082/AdministrationRest/',
        HSIS: "http://192.168.1.8:8082/UnibookHsisRest/",
        HTP: "http://192.168.1.8:8082/HTPRest/",
//        HTP: "http://localhost:8082/HTPRest/",
        REPORT: 'http://192.168.1.8:8082/ReportingRest/',
//        REPORT: 'http://localhost:8080/ReportingRest/',
        EMS: 'http://192.168.1.8:8082/UnibookEMS/',
        COMMUNICATION: 'http://192.168.1.8:8082/CommunicationRest/',
        NOTIFICATION: 'http://192.168.1.8:8082/NotificationSystem/greeting.html?token=',
        SOCKET: 'http://192.168.1.8:8082/SocketRest'

        /*  ROS: "http://192.168.100.78:8080/ROS/",
          AdminRest: 'http://atis.edu.az/AdministrationRest/',
          HSIS: "http://atis.edu.az/UnibookHsisRest/",
          HTP: "http://192.168.100.78:8080/HTPRest/",
          REPORT: 'http://atis.edu.az/ReportingRest/',
          EMS: 'http://atis.edu.az/UnibookEMS/',
          COMMUNICATION: 'http://atis.edu.az/CommunicationRest/',
          SOCKET: 'http://atis.edu.az/SocketRest'*/
    },
    statusCodes: {
        OK: 'OK',
        UNAUTHORIZED: 'UNAUTHORIZED',
        ERROR: 'ERROR',
        INVALID_PARAMS: 'INVALID_PARAMS',
        DUPLICATE_DATA: 'DUPLICATE_DATA'
    },
    REGEX: {
        email: /\S+@\S+\.\S+/,
        number: /^\d+$/,
        decimalNumber: /^\d+(\.\d+)?$/,
        TEXT: 'text\/plain',
        PDF: 'application\/pdf',
        XLS: 'application\/vnd\.ms-excel',
        XLSX: 'application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet',
        DOC: 'application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document',
        DOCX: 'application\/msword',
        phone: /\(\+\d{3}\)-\d{2}-\d{3}-\d{2}-\d{2}/,
        IMAGE_EXPRESSION: 'image\/jpeg|image\/png',
    },
    MASK: {
        phone: '(+000)-00-000-00-00'
    },


    initToken: function (cname) {
        var name = cname + "=";

        if (document.cookie == name + null || document.cookie == "") {
            window.location.href = '/AdministrationSystem/greeting.html'
        } else {
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];

                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }

                if (c.indexOf(name) == 0) {
                    Hsis.token = c.substring(name.length, c.length);
                }
            }
        }

    },

    initLanguageCookie: function (name) {
        var ca = document.cookie.split(';');

        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];

            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }

            if (c.indexOf(name) == 0) {
                Hsis.lang = c.substring(name.length, c.length).split('=')[1];
            }
        }

        if (Hsis.lang.trim().length === 0) {
            Hsis.lang = 'az';
        }
    },
    initCurrentModule: function (name) {
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                var currModule = c.substring(name.length, c.length).split('=')[1];
                return currModule;
            }
        }
        return "";
    },
    loadLanguagePack: function (lang) {
        $.getJSON('assets/js/i18n/' + lang + '.json', function (data) {
            $.each(data, function (i, v) {
                Hsis.dictionary[lang][i] = v;
            });
        });
    },
    i18n: function () {
        Hsis.initLanguageCookie('lang');
        var attr = '';

        $('[data-i18n]').each(function () {
            attr = $(this).attr('data-i18n');
            $(this).text(Hsis.dictionary[Hsis.lang][attr]);
            $(this).attr('placeholder', Hsis.dictionary[Hsis.lang][attr]);
        });
    },
    getCookie: function (cookie_name) {

        var results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');

        if (results)
            return (decodeURI(results[2]));
        else
            return null;

    },
    dictionary: {
        az: {},
        en: {},
        ru: {}
    },
    Proxy: {
        loadApplications: function (callback) {
            $.ajax({
                url: Hsis.urls.ROS + 'applications?token=' + Hsis.token,
                type: 'GET',
//                headers: {
//                    'Token': Hsis.token
//                },
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    Hsis.Service.parseApplications(data.data);
                                    Hsis.Service.parseApplicationsList(data.data);
                                    $('[data-toggle="tooltip"]').tooltip();
                                    break;

                                case Hsis.statusCodes.ERROR:
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:
//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                },
                complete: function (data) {

                    if (callback) {
                        callback()
                    }
                }
            });
        },
        getFileByte: function (callback) {
            $.ajax({
                url: 'http://192.168.1.8:8082/UnibookHsisRest/students/file/1000906?token=0b575f79978f4f9b99754ba90201fc2634561f6d7aa94fafac2bab324ab46dae',
                type: 'GET',
//                headers: {
//                    'Token': Hsis.token
//                },
                success: function (data) {
                    console.log(data);
                }
            });
        },
        getAcademicGroupForSelect: function (params, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'groups/select?token=' + Hsis.token + (params ? '&' + params : ''),
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                break;

                            case Hsis.statusCodes.OK:
                                if (callback) {
                                    callback(result.data);
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
            })
        },

        loadSubApplications: function (callback) {
            $.ajax({
                url: Hsis.urls.ROS + 'applications/1000014/subApplications?token=' + Hsis.token,
                type: 'GET',
//                headers: {
//                    'Token': Hsis.token
//                },
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    if (callback)
                                        callback(data);
//                                    Admin.Service.parseSubApplicationsList(data.data);
//                                    $('[data-toggle="tooltip"]').tooltip()
                                    break;

                                case Hsis.statusCodes.ERROR:
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:
//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
        },
        loadOrgTree: function (callback, container) {
            var tree = {};
            $.ajax({
                url: Hsis.urls.HSIS + 'structures?token=' + Hsis.token,
                type: 'GET',
                global: false,
                beforeSend: function () {
                    if (typeof container !== "undefined") {
                        $('.btn.tree-modal').attr('data-check', 1);
                        NProgress.start();
                    }

                },
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:

                                break;

                            case Hsis.statusCodes.OK:
                                tree = data.data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }

                },
                complete: function () {
                    callback(tree);
                    $('.btn.tree-modal').attr('data-check');
                    NProgress.done();

                }
            });
        },
        loadModules: function (callback) {
            var modules = {};
            $.ajax({
                url: Hsis.urls.ROS + 'applications/' + Hsis.appId + '/modules?token=' + Hsis.token,
                type: 'GET',
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    modules = data;
                                    break;

                                case Hsis.statusCodes.ERROR:
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:
//                                    window.location = Hsis.urls.ROS + 'unauthorized';\
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                },
                complete: function () {
                    callback(modules);
                }
            });
        },
        loadSubModules: function (moduleId, callback) {

            $.ajax({
                url: Hsis.urls.ROS + 'applications/modules/' + moduleId + '/subModules?token=' + Hsis.token,
                type: 'GET',
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    callback(data);
                                    break;

                                case Hsis.statusCodes.ERROR:
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:
//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }
            });
        },


        // new ajax request
        getAbroadStructure: function (page, form, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'structures/abroad?token=' + Hsis.token + '&page=' + (page ? page : 1) + '&pageSize=20',
                type: 'GET',
                data: form,
                success: function (result) {
                    try {
                        if (result) {
                            switch (result.code) {
                                case Hsis.statusCodes.OK:
                                    if (callback)
                                        callback(result);

                                    Hsis.Service.loadAbroadStructures(result.data);
                                    break;
                                case Hsis.statusCodes.ERROR:
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                    break;
                                case Hsis.statusCodes.UNAUTHORIZED:
//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            })
        },

        getDictionariesTypeListByType: function (typeId, callback) {
            var result = {};
            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/dictionaries/types/' + typeId + '?&token=' + Hsis.token,
                type: 'GET',
                beforeSend: function (xhr) {
                    $('.module-block[data-id="10000141"]').attr('check', 1);
                },
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    result = data.data;
                                    if (callback)
                                        callback(result);
                                    break;

                                case Hsis.statusCodes.ERROR:
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:

//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    }
                    catch (err) {
                        console.error(err);
                    }
                },
                complete: function () {
                    $('.module-block[data-id="1000141"]').removeAttr('check', 1);
                }

            });
        },

        getDictionaryDetails: function (dicId, callback) {
            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/dictionaries/' + dicId + '?token=' + Hsis.token,
                type: 'GET',
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify("Xəta baş verdi!", {
                                    type: 'danger'
                                });
                                break;
                            case Hsis.statusCodes.OK:

                                if (callback)
                                    callback(data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:

//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                    ;
                }
            });
        },

        loadDictionariTypes: function (callback) {
            var result = {};
            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/dictionaries/types?token=' + Hsis.token,
                type: 'GET',
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    result = data;
                                    break;

                                case Hsis.statusCodes.ERROR:
                                    $.notify("Xəta baş verdi!", {
                                        type: 'danger'
                                    });
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:

//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    }
                    catch (err) {
                        console.error(err);
                    }
                },
                complete: function () {
                    callback(result);
                }

            });
        },

        loadDictionarySearch: function (page, queryParams, callback) {
            $.ajax({
//                url: Hsis.urls.AdminRest + 'settings/dictionaries/search?token=' + Hsis.token + (queryParams ? '&' + queryParams : '') + (page ? '&page=' + page : ''),
                url: Hsis.urls.AdminRest + 'settings/dictionaries/search?pageSize=100000&token=' + Hsis.token + (queryParams ? '&' + queryParams : ''),
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify("Xəta baş verdi!", {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                if (callback)
                                    callback(result.data)
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:

//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }

                    }
                }

            });

        },
        // get request for abroadaddress
        getAbroadAddress: function (page, form, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'structures/abroad/address?token=' + Hsis.token + '&page=' + (page ? page : 1) + '&pageSize=20',
                type: 'GET',
                data: form,
                success: function (result) {
                    try {
                        if (result) {
                            switch (result.code) {
                                case Hsis.statusCodes.OK:
                                    if (callback)
                                        callback(result);
                                    Hsis.Service.loadAbroadAddress(result.data, page);
                                    break;
                                case Hsis.statusCodes.ERROR:
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                    break;
                                case Hsis.statusCodes.UNAUTHORIZED:
//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            })
        },
        //AJAX Request
        addAbroadStructure: function (form, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'structures/abroad/add?token=' + Hsis.token,
                type: 'POST',
                data: form,
                beforeSend: function () {
                    $('.xtms-approve').attr('disabled', 'disabled');
                },
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                if (data.message) {
                                    $.notify(data.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;
                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) callback(data);
                                break;
                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'login?app=' + Hsis.token;
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function () {
                    $('.xtms-approve').removeAttr('disabled');
                }
            })
        },
        //add
        addAbroadAddress: function (form, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'structures/abroad/address/add?token=' + Hsis.token,
                type: 'POST',
                data: form,
                beforeSend: function () {
                    $('.xtms-approve-address').attr('disabled', 'disabled');
                },
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                if (data.message) {
                                    $.notify(data.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;
                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) callback(data);
                                break;
                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'login?app=' + Hsis.token;
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function () {
                    $('.xtms-approve-address').removeAttr('disabled');
                }
            })
        },
        //remove ADDRESS
        removeAbroadAddress: function (id, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'structures/abroad/address/' + id + '/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                if (data.message) {
                                    $.notify(data.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;
                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) callback(data);
                                break;
                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'login?app=' + Hsis.token;
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            })
        },
        //remove abroad structure
        removeAbroadStructure: function (id, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'structures/abroad/' + id + '/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                if (data.message) {
                                    $.notify(data.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;
                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) callback(data);
                                break;
                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'login?app=' + Hsis.token;
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            })
        },
        //edit2 ADDRESS
        editAbroadAddress: function (id, formData, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'structures/abroad/address/' + id + '/edit?token=' + Hsis.token,
                type: 'POST',
                data: formData,
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                if (data.message) {
                                    $.notify(data.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;
                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) callback(data);
                                break;
                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'login?app=' + Hsis.token;
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            })
        },
        //edit Structure
        editAbroadStructure: function (id, formData, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'structures/abroad/' + id + '/edit?token=' + Hsis.token,
                type: 'POST',
                data: formData,
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                if (data.message) {
                                    $.notify(data.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;
                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) callback(data);
                                break;
                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'login?app=' + Hsis.token;
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            })
        },


        getProfile: function () {
            $.ajax({
                url: Hsis.urls.ROS + "profile?token=" + Hsis.token,
                type: 'GET',
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                try {
                                    if (data.data) {
                                        var user = data.data;
                                        $('.user-notify-content h6').text(user.person.name + ' ' + user.person.surname + ' ' + user.person.patronymic);
                                        // $('.welcome-text p span').text(user.person.name);
                                        $('.user-notify-content p[data-type="role"]').text(user.role.value[Hsis.lang]);
                                        $('.user-notify-content p[data-type="org"]').text(user.structure.name[Hsis.lang]);
                                        $('.side-title-block p').text(user.orgName.value[Hsis.lang]);
                                        $('.main-img img').attr('src', Hsis.urls.AdminRest + 'users/' + user.id + '/image?token=' + Hsis.token);
                                        $('.side-title-block img').attr('src', Hsis.urls.HSIS + 'structures/' + user.orgName.id + '/logo?token=' + Hsis.token);
                                        var img = $('.main-img img');
                                        img.on('error', function (e) {
                                            $('.main-img img').attr('src', 'assets/img/guest.png');
                                        })
                                        $('div.big-img img').attr('src', Hsis.urls.AdminRest + 'users/' + user.id + '/image?token=' + Hsis.token);
                                        $('div.big-img img').on('error', function (e) {
                                            $('div.big-img img').attr('src', 'assets/img/guest.png');
                                        });
                                        Hsis.structureId = user.structure.id;
                                    }
                                } catch (err) {
                                    console.error(err);
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            })
        },
        loadOperations: function (moduleId, callback) {
            var operations = {};
            $.ajax({
                url: Hsis.urls.ROS + 'applications/modules/' + moduleId + '/operations?token=' + Hsis.token,
                type: 'GET',
                global: false,
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    operations = data.data;
                                    Hsis.operationList = operations;
                                    break;

                                case Hsis.statusCodes.ERROR:
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:
//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                },
                complete: function () {
                    callback(operations);
                }
            });
        },
        loadOrgTreeTypes: function (callback) {
            var types;

            $.ajax({
                url: Hsis.urls.HSIS + 'structures/types?token=' + Hsis.token,
                type: 'GET',
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.OK:
                                types = data.data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;
                        }
                    }
                },
                complete: function () {
                    callback(types);
                }
            });

        },
        loadOrgTreeDetails: function (treeId, callback) {
            var tree = {};
            $.ajax({
                url: Hsis.urls.HSIS + 'structures/' + treeId + '?token=' + Hsis.token,
                type: 'GET',
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                tree = data.data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
                complete: function () {
                    callback(tree);
                }
            });

        },
        loadOrgTreeByType: function (typeId, callback, container) {
            var tree = {};
            $.ajax({
                url: Hsis.urls.HSIS + 'structures/bytype/' + typeId + '?token=' + Hsis.token,
                type: 'GET',
                beforeSend: function () {
                    if (typeof container !== "undefined") {
                        container.attr('data-check', 1);
                    }

                },
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                tree = data.data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
                complete: function () {
                    callback(tree);
                }
            });
        },
        loadOrgTreeByTypeAndATM: function (typeId, atmType, callback, container) {
            var tree = {};
            $.ajax({
                url: Hsis.urls.HSIS + 'structures/bytype/' + typeId + '?uniTypeId=' + atmType + '&token=' + Hsis.token,
                type: 'GET',
                beforeSend: function () {
                    if (typeof container !== "undefined") {
                        container.attr('data-check', 1);
                    }

                },
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                tree = data.data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
                complete: function () {
                    callback(tree);
                }
            });
        },
        loadOrgTreeByATMType: function (typeId, uniTypeId, callback, container) {
            var tree = {};
            $.ajax({
                url: Hsis.urls.HSIS + 'structures?uniTypeId=' + uniTypeId + '&token=' + Hsis.token,
                type: 'GET',
                beforeSend: function () {
                    if (typeof container !== "undefined") {
                        container.attr('data-check', 1);
                    }

                },
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                tree = data.data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
                complete: function () {
                    callback(tree);
                }
            });
        },
        getPersonInfoByPinCode: function (pinCode, callback) {
            var data;
            $.ajax({
                // url: Hsis.urls.HSIS + 'students/getInfoByPinCode?token=' + Hsis.token + '&pinCode=' + pinCode,
                url: "http://atis.edu.az/IAMASRest/getInfoByPinCode?pinCode=" + pinCode,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                // $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                //     type: 'danger'
                                // });
                                callback(result.data);
                                break;

                            case Hsis.statusCodes.OK:
                                callback(result.data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            }).done(function () {

            });
        },

        loadAbroadStudents: function (page, queryParams, callback, before, order) {

            $.ajax({
                url: Hsis.urls.HTP + 'students/abroad?token=' + Hsis.token + (queryParams ? '&' + queryParams : '') + (page ? '&page=' + page : '') + (order ? order : '') + '&pageSize=20',
                type: 'GET',
                beforeSend: function () {
                    if (before) {
                        $('.module-list .chekbox-con input').attr('disabled', 'disabled');
                    }
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                Hsis.Service.parseAbroadStudents(result.data, page);
                                $('body').find('.col-sm-8.data').removeClass('col-sm-8').addClass('col-sm-12');
                                $('body').find('.col-sm-4.info').fadeOut(1).css('right', '-100%');
                                if (callback)
                                    callback(result.data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }


                    }
                },
                complete: function () {
                    $('.module-list .chekbox-con input').removeAttr('disabled');
                    $('.module-block[data-id="1000114"]').removeAttr('data-check');
                }
            })
        },
        loadArchiveAbroadStudents: function (page, queryParams, callback, before, order) {

            $.ajax({
                url: Hsis.urls.HTP + 'students/abroad/archive?token=' + Hsis.token + (queryParams ? '&' + queryParams : '') + (page ? '&page=' + page : '') + (order ? order : '') + '&pageSize=20',
                type: 'GET',

                beforeSend: function () {
                    if (before) {
                        $('.module-list .chekbox-con input').attr('disabled', 'disabled');
                    }
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                
                                Hsis.Service.parseAbroadStudents(result.data, page);
                                Hsis.Service.parseArchiveAbroadStudents(result.data, page);
                                $('body').find('.col-sm-8.data').removeClass('col-sm-8').addClass('col-sm-12');
                                $('body').find('.col-sm-4.info').fadeOut(1).css('right', '-100%');
                                if (callback)
                                    callback(result.data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
                complete: function () {
                    $('#abroad_student_list').attr('data-page-type', 'archive');
                    $('.module-list .chekbox-con input').removeAttr('disabled');
                    $('.module-block[data-id="1000146"]').removeAttr('data-check');
                }
            })
        },

        restoreAbroadStudents: function (studentId, callback) {

            $.ajax({
                url: Hsis.urls.HTP + 'students/abroad/' + studentId + '/restore?token=' + Hsis.token,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                $('body').find('.col-sm-8.data').removeClass('col-sm-8').addClass('col-sm-12');
                                $('body').find('.col-sm-4.info').fadeOut(1).css('right', '-100%');
                                if (callback)
                                    callback(result);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }


                    }
                }
            })
        },


        getStructureListByParentId: function (id, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'structures/' + id + '/childs?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                callback(result);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            })
        },
        loadDictionariesByTypeId: function (typeId, parentId, callback) {
            var result = {};
            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/dictionaries?typeId=' + typeId + '&parentId=' + parentId + '&token=' + Hsis.token,
                type: 'GET',
                global: false,
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    result = data.data;
                                    break;
                                case Hsis.statusCodes.ERROR:
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                    break;
                                case Hsis.statusCodes.UNAUTHORIZED:
//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                },
                complete: function () {

                    callback(result);
                }

            });
        },

        editDictionary: function (dic, callback) {
            var code = {};
            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/dictionaries/' + dic.id + '/edit?token=' + Hsis.token,
                type: 'POST',
                data: dic,
                beforeSend: function () {
                    $('#main-div .btn-dictionary').attr('disabled', 'disabled');
                },
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify("Xəta baş verdi!", {
                                    type: 'danger'
                                });
                                break;
                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                code = data;
                                if (callback)
                                    callback(data);
                                Hsis.Proxy.loadOperations(Hsis.currModule, function (operations) {
                                    $('#buttons_div').find('ul').html(Hsis.Service.parseOperations(operations, 1));

                                    Hsis.Proxy.loadDictionariesByTypeId(Hsis.dicTypeId, 0, function (result) {
                                        Hsis.Service.parseDictype(result);
                                    });

                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:

//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                            case Hsis.statusCodes.INVALID_PARAMS:
                                $.notify("Daxil etdiyiniz parametrlər yanlışdır!", {
                                    type: 'danger'
                                });
                        }
                    }

                },
                complete: function () {
                    $('#main-div .btn-dictionary').removeAttr('disabled');
                }
            });
        },
        removeDictionary: function (dicId, callback) {
            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/dictionaries/' + dicId + '/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify("Xəta baş verdi!", {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback)
                                    callback(data)
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:

//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }

                    }
                    ;
                }
            });
        },

        addDictionary: function (dic, callback) {
            var code = {};
            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/dictionaries/add?token=' + Hsis.token,
                type: 'POST',
                data: dic,
                beforeSend: function () {
                    $('#main-div .btn-dictionary').attr('disabled', 'disabled');
                },
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify("Xəta baş verdi!", {
                                    type: 'danger'
                                });
                                break;
                            case Hsis.statusCodes.DUPLICATE_DATA:
                                $.notify("Daxil etdiyiniz kod artıq mövcuddur!", {
                                    type: 'danger'
                                });
                                break;
                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                code = data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:

//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                            case Hsis.statusCodes.INVALID_PARAMS:
                                $.notify("Daxil etdiyiniz parametrlər yanlışdır!", {
                                    type: 'danger'
                                });
                                break;
                        }
                    }
                    ;
                },
                complete: function () {
                    $('#main-div .btn-dictionary').removeAttr('disabled');
                    if (callback)
                        callback(code)
                }
            });
            return code;
        },

        checkDictionaryCode: function (code, callback) {
            var result = {};
            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/dictionaries?code=' + code + '&token=' + Hsis.token,
                type: 'GET',
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    result = data;
                                    if (callback)
                                        callback(result);
                                    break;

                                case Hsis.statusCodes.ERROR:
                                    $.notify("Xəta baş verdi!", {
                                        type: 'danger'
                                    });
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:

//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    }
                    catch (err) {
                        console.error(err);
                    }
                }


            });
        },
        loadDictionariesListByParentId: function (parentId, callback) {
            var result = {};
            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/dictionaries/parentId/' + parentId + '?token=' + Hsis.token,
                type: 'GET',
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    callback(data)
                                    break;

                                case Hsis.statusCodes.ERROR:
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:

//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }

            });
        },
        loadAdressTypes: function (parentId, callback) {
            var result = {};
            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/address/parentId/' + parentId + '?token=' + Hsis.token,
                type: 'GET',
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    callback(data.data);
                                    break;

                                case Hsis.statusCodes.ERROR:
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:

//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }

            });
        },
///
        loadAbroadAdressTypes: function (parentId, callback) {
            var result = {};
            $.ajax({
                url: Hsis.urls.HTP + 'settings/address/parentId/' + parentId + '?token=' + Hsis.token,
                type: 'GET',
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    callback(data.data);
                                    break;

                                case Hsis.statusCodes.ERROR:
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:

//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }

            });
        },

        getStudentListByOrgId: function (params, callback) {
            var data = {};
            $.ajax({
                url: Hsis.urls.HSIS + 'groups/student' + '?token=' + Hsis.token + (params ? '&' + params : ''),
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $('.notification-parent').notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    position: "bottom center",
                                    style: 'red'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                data = result.data;

                                var htmlTag = $('#possibleStudent');
                                htmlTag.html('');
                                $.each(data, function (i, d) {
                                    var e = $(document.createElement('option'));
                                    e.attr('class', 'option_class');
                                    e.attr('onclick', 'addToSelectedStudentList($(this))');
                                    e.text(d.lastName + " " + d.firstName + " " + d.middleName);
                                    e.val(d.id);
                                    htmlTag.append(e);
                                });

                                if (students !== null) {
                                    $.each(students, function (i, stud) {
                                        var obj = $('#possibleStudent option[value=\'' + stud + '\']');
                                        obj.attr('disabled', 'disabled').attr("style", "background-color:#FF5B57;border-bottom:3px solid #FF5B57;");
                                    });
                                }

                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                }
            });
        },

        addAbroadStudent: function (formData, callback) {
            var person = {};
            $.ajax({
                url: Hsis.urls.HTP + 'students/abroad/add?token=' + Hsis.token,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                beforeSend: function (xhr) {
                    $('#main-div #confirmAbroadStudent').attr('disabled', 'disabled');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                person = result.data;
                                if (callback) {
                                    callback(person);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function () {
                    cropForm = new FormData();
                    $('#main-div #confirmAbroadStudent').removeAttr('disabled');
                }
            });
        },
        removeStudent: function (id, callback) {

            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) {
                                    callback(result);
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                },
                complete: function () {
                    $('.main-content-upd #buttons_div').removeAttr('data-id');
                    Hsis.Proxy.loadStudents();
                }
            })
        },
        removeAbroadStudent: function (id, callback) {

            $.ajax({
                url: Hsis.urls.HTP + 'students/abroad/' + id + '/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) {
                                    callback(result);
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                },
                complete: function () {
                    $('.main-content-upd #buttons_div').removeAttr('data-id');
                }
            })
        },
        getAbroadStudentDetails: function (id, callback) {
            var data = {};
            $.ajax({
                url: Hsis.urls.HTP + 'students/abroad/' + id + '?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {


                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                // Hsis.Service.parseQuestionnaireView(result.data);
                                data = result.data;
                                if (callback) callback(data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                }
            })
        },
        getAbroadStudentDetailsByPelcId: function (id, callback) {
            var data = {};
            $.ajax({
                url: Hsis.urls.HTP + 'students/abroad/pelc/' + id + '?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {


                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                // Hsis.Service.parseQuestionnaireView(result.data);
                                data = result.data;
                                if (callback) callback(data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                }
            })
        },
        getArchiveAbroadStudentDetailsByPelcId: function (id, callback) {
            var data = {};
            $.ajax({
                url: Hsis.urls.HTP + 'students/abroad/archive/pelc/' + id + '?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {


                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                // Hsis.Service.parseQuestionnaireView(result.data);
                                data = result.data;
                                if (callback) callback(data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                }
            })
        },
        editCommonInfoStudent: function (formData, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/commonInfo/edit?token=' + Hsis.token,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                beforeSend: function (xhr) {
                    $('#main-div .edit-common-info').attr('disabled, disabled');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });

                                if (callback) {
                                    callback(result);
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                },
                complete: function () {
                    cropForm = new FormData();
                    $('#main-div .edit-common-info').removeAttr('disabled');
                }
            })
        },
        editCommonInfoAbroadStudent: function (formData, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HTP + 'students/abroad/' + id + '/commonInfo/edit?token=' + Hsis.token,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                beforeSend: function (xhr) {
                    $('#main-div .edit-common-info').attr('disabled, disabled');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });

                                if (callback) {
                                    callback(result);
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                },
                complete: function () {
                    cropForm = new FormData();
                    $('#main-div .edit-common-info').removeAttr('disabled');
                }
            })
        },
        editContactStudent: function (contact, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/contact/edit?token=' + Hsis.token,
                type: 'POST',
                data: contact,
                beforeSend: function (xhr) {
                    $('#main-div .btn-contact-modal-submit').attr('disabled', 'disabled')
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });

                                callback(result);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                },
                complete: function () {
                    $('#main-div .btn-contact-modal-submit').removeAttr('disabled');
                }
            })
        },
        addStudentContact: function (studentId, contact, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + studentId + '/contacts/add?token=' + Hsis.token,
                type: 'POST',
                data: contact,
                beforeSend: function (xhr) {
                    $('#main-div .btn-contact-modal-submit').attr('disabled', 'disabled');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                },
                complete: function () {
                    $('#main-div .btn-contact-modal-submit').removeAttr('disabled');
                }
            });
        },
        removeStudentContact: function (contactId, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/contacts/' + contactId + '/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.OK:

                                callback(result);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                }
            });
        },
        loadAddressTree: function (callback) {
            var tree = {};
            $.ajax({
                url: Hsis.urls.HSIS + 'students/addresses?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                tree = result.data;
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'lgoin?app=' + Hsis.appId;
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
                complete: function () {
                    callback(tree);
                }
            })
        },
        editStudentAddress: function (address, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HTP + 'students/' + id + '/address/' + address.id + '/edit?token=' + Hsis.token,
                type: 'POST',
                data: address,
                beforeSend: function (xhr) {
                    $('#main-div #get_permanent_address_edit').attr('disabled', 'disabled');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:


                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });

                                callback(result.code);
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'lgoin?app=' + Hsis.appId;
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
                complete: function () {
                    $('#main-div #get_permanent_address_edit').removeAttr('disabled');
                }
            })
        },
        editStudentAcademicInfo: function (academicInfo, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HTP + 'students/' + id + '/academicInfo/edit?token=' + Hsis.token,
                type: 'POST',
                data: academicInfo,
                beforeSend: function (xhr) {
                    $('#main-div .edit-academic-info').attr('disabled', 'disabled');
                    $('#main-div .edit-uni-action').attr('disabled', 'disabled');
                    $('#main-div .edit-school-action').attr('disabled', 'disabled');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result);
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'lgoin?app=' + Hsis.appId;
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
                complete: function () {
                    $('#main-div .edit-academic-info').removeAttr('disabled');
                    $('#main-div .edit-uni-action').removeAttr('disabled');
                    $('#main-div .edit-school-action').removeAttr('disabled');
                }
            })
        },
        removeDocFiles: function (fileId, filePath, callback) {
            var id = $('#main-div').attr('data-id');
            var moduleType = $('#main-div').attr('data-type');
            var module = moduleType === 'E' ? 'teachers/' : 'students/';
            $.ajax({
                url: Hsis.urls.HSIS + module + id + '/document/file/' + fileId + '/remove?token=' + Hsis.token,
                type: 'POST',
                data: {
                    filePath: filePath
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result)
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                        }
                    }
                }
            })
        },
        removeStudentDocument: function (docId, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/document/' + docId + '/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result)
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                        }
                    }
                }
            })
        },
        editStudentDocument: function (document, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/document/' + document.id + '/edit?token=' + Hsis.token,
                type: 'POST',
                data: document,
                beforeSend: function (xhr) {
                    $('#main-div .edit-document-submit').attr('disabled', 'disabled');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result)
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                        }
                    }
                },
                complete: function () {
                    $('#main-div .edit-document-submit').removeAttr('disabled');
                }
            })
        },
        addStudentFiles: function (docId, formData, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/document/' + docId + '/file/add?token=' + Hsis.token,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                beforeSend: function (xhr) {
                    $('#main-div .add-doc-file').attr('disabled', 'disabled');
                    $('#main-div .add-past-edu-doc-file').attr('disabled', 'disabled');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result)
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                        }
                    }
                },
                complete: function () {
                    $('#main-div .add-doc-file').removeAttr('disabled');
                    $('#main-div .add-past-edu-doc-file').removeAttr('disabled');
                }
            })
        },
        loadStructure: function (page, queryParams, callback, before) {
            $.ajax({
                url: Hsis.urls.HTP + 'structures/abroad?token=' + Hsis.token + (queryParams ? '&' + queryParams : '') + (page ? '&page=' + page : '') + "&pageSize=20",
                type: 'GET',
                beforeSend: function () {
                    if (before) {
                        $('#main-div li.sub-module-item').attr('data-attr', 1);
                    }
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                Hsis.Service.loadAbroadStructures(result.data, page);
                                if (callback)
                                    callback(result.data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }


                    }
                },
                complete: function () {
                    $('#main-div li.sub-module-item').removeAttr('data-attr');
                    $('.module-block[data-id="1000131"]').removeAttr('data-check');
                }
            })
        },


        addStudentDocument: function (document, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HTP + 'students/' + id + '/document/add?token=' + Hsis.token,
                type: 'POST',
                data: document,
                beforeSend: function () {
                    $('#main-div #past_edu_doc_confirm').attr('disabled', 'disabled');
                    $('#main-div .add-document-submit').attr('disabled', 'disabled');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result)
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                        }
                    }
                },
                complete: function () {
                    $('#main-div #past_edu_doc_confirm').removeAttr('disabled');
                    $('#main-div .add-document-submit').removeAttr('disabled');
                }
            })
        },


        addStudentRegularDocument: function (document, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/document/add?token=' + Hsis.token,
                type: 'POST',
                data: document,
                beforeSend: function () {
                    $('#main-div #past_edu_doc_confirm').attr('disabled', 'disabled');
                    $('#main-div .add-document-submit').attr('disabled', 'disabled');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result)
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                        }
                    }
                },
                complete: function () {
                    $('#main-div #past_edu_doc_confirm').removeAttr('disabled');
                    $('#main-div .add-document-submit').removeAttr('disabled');
                }
            })
        },

        //xtms-structure-address
        loadAddress: function (page, queryParams, callback, before) {
            $.ajax({
                url: Hsis.urls.HTP + 'structures/abroad/address?token=' + Hsis.token + (queryParams ? '&' + queryParams : '') + (page ? '&page=' + page : ''),
                type: 'GET',
                beforeSend: function () {
                    if (before) {
                        $('#main-div li.sub-module-item').attr('data-attr', 1);
                    }
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                Hsis.Service.loadAbroadAddress(result.data, page);
                                if (callback)
                                    callback(result.data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }


                    }
                },
                complete: function () {
                    $('#main-div li.sub-module-item').removeAttr('data-attr');
                    $('.module-block[data-id="1000131"]').removeAttr('data-check');
                }
            })
        },

        getStudentContactDetails: function (id, callback) {
            var data = {};
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/contactDetails?token=' + Hsis.token,
                type: 'GET',
                beforeSend: function () {
                    NProgress.start();
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                data = result.data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                },
                complete: function () {
                    callback(data);

                    NProgress.done();
                }
            })
        },
        getStudentAddressDetails: function (id, callback) {
            var data = {};
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/addressDetails?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                data = result.data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                },
                complete: function () {
                    callback(data);
                }
            })
        },
        getStudentCommonDetails: function (callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/commonDetails?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                callback(result);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                }
            })
        },
        removeStudentImage: function (callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/image/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.OK:


                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }


                    }
                }
            })
        },
        searchStudent: function (page, query, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'students?token=' + Hsis.token + (query ? '&' + query : '') + (page ? '&page=' + page : ''),
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (result.data) {
                                    var div = $('.space-for-footer .flex-input');
                                    if (div.html().trim().length == 0) {
                                        var html = '<button  data-i18n="load.more" data-table="students" class="btn loading-margins btn-load-more">' + Hsis.dictionary[Hsis.lang]['load.more'] + '</button>';
                                        div.html(html);
                                    }
                                }
                                Hsis.Service.parseStudents(result.data, page);
                                if (callback)
                                    callback(result.data);
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                }

            })
        },
        searchforeignStudents: function (page, query, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'students/foreign?token=' + Hsis.token + (query ? '&' + query : '') + (page ? '&page=' + page : ''),
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (result.data) {
                                    var div = $('.space-for-footer .flex-input');
                                    if (div.html().trim().length == 0) {
                                        var html = '<button  data-i18n="load.more" data-table="students" class="btn loading-margins btn-load-more">' + Hsis.dictionary[Hsis.lang]['load.more'] + '</button>';
                                        div.html(html);
                                    }
                                }
                                Hsis.Service.parseForeignStudents(result.data, page);
                                if (callback)
                                    callback(result.data);
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                }

            })
        },
        searchTeacher: function (page, query, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'teachers?token=' + Hsis.token + (query ? '&' + query : '') + (page ? '&page=' + page : ''),
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (result.data) {
                                    var div = $('.space-for-footer .flex-input');
                                    if (div.html().trim().length == 0) {
                                        var html = '<button  data-i18n="load.more" data-table="teachers" class="btn loading-margins btn-load-more">' + Hsis.dictionary[Hsis.lang]['load.more'] + '</button>';
                                        div.html(html);
                                    }
                                }

                                Hsis.Service.parseTeachers(result.data, page);
                                if (callback)
                                    callback(result.data);
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
            })
        },

        //xtms-structure-search
        searchStructure: function (page, query, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'structures/abroad?token=' + Hsis.token + (query ? '&' + query : '') + (page ? '&page=' + page : '') + "&pageSize=20",
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (result.data) {

                                    /*var div = $('.space-for-footer .flex-input');
                                    if (div.html().trim().length == 0) {

                                    }*/
                                }
                                Hsis.Service.loadAbroadStructures(result.data, page);
                                if (callback)
                                    callback(result.data);
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
            })
        },

        //xtms-structure-address
        searchAddress: function (page, query, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'structures/abroad/address?token=' + Hsis.token + (query ? '&' + query : '') + (page ? '&page=' + page : '') + "&pageSize=20",
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (result.data) {
                                    /*var div = $('.space-for-footer .flex-input');
                                    if (div.html().trim().length == 0) {
                                        var html = '<button  data-i18n="load.more" data-table="abroad-structure-address_module" class="btn loading-margins btn-load-more">' + Hsis.dictionary[Hsis.lang]['load.more'] + '</button>';
                                        div.html(html);
                                    }*/
                                }
                                Hsis.Service.loadAbroadAddress(result.data, page);
                                if (callback)
                                    callback(result.data);
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
            })
        },
        editStudentGraduationInfo: function (graduationInfo) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/graduationInfo/edit?token=' + Hsis.token,
                type: 'POST',
                data: {
                    pelcId: graduationInfo.pelcId,
                    actionDate: graduationInfo.actionDate,
                    graduationOrgId: graduationInfo.graduationOrgId,
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:


                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                }
            })
        },
        getFilteredStructureList: function (parentId, typeId, addressTreeId, callback, fullInfoFlag, children) {
            var structure = {};
            $.ajax({
                url: Hsis.urls.HSIS + 'structures/filter?parentId=' + parentId + '&typeId=' + typeId + '&addressTreeId=' + addressTreeId + '&token=' + Hsis.token + '&fullInfoFlag=' + (fullInfoFlag ? fullInfoFlag : '0') + '&children=' + (children ? children : '0'),
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                structure = result.data;
                                callback(structure);
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                }

            });

        },
        confirmStudent: function (pelcId, callback) {
            var students = {};
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + pelcId + '/confirm?token=' + Hsis.token,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                students = result.data;
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function () {
                    callback(students);
                }

            });
        },
        addStudentRelationship: function (relation, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/relationship/add?token=' + Hsis.token,
                type: 'POST',
                data: relation,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result);
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }

            });
        },
        editStudentRelationship: function (relation, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/relationship/edit?token=' + Hsis.token,
                type: 'POST',
                data: relation,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result);
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }

            });
        },
        removeStudentRelationship: function (relation, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + id + '/relationship/remove?token=' + Hsis.token,
                type: 'POST',
                data: relation,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result);
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }

            });
        },
        getStudentDetailsByPinCode: function (pincode, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'students/pincode/' + pincode + '/details?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                callback(result);
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });

                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }

            });
        },
        getStudentByPinCode: function (pincode, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'students/pincode/' + pincode + '?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                callback(result);
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }

            });
        },
        addAcceptedStudent: function (studentFormData, personId) {
            $.ajax({
                url: Hsis.urls.HSIS + 'students/' + personId + '/add?token=' + Hsis.token,
                type: 'POST',
                data: studentFormData,
                contentType: false,
                processData: false,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                }
            });

        },
        addAcceptedAbroadStudent: function (studentFormData, personId) {
            $.ajax({
                url: Hsis.urls.HTP + 'students/abroad/' + personId + '/add?token=' + Hsis.token,
                type: 'POST',
                data: studentFormData,
                contentType: false,
                processData: false,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });

                                cropForm = new FormData();
                                $('#main-div #confirmAcceptedAbroadStudent').remove();
                                Hsis.Proxy.loadAbroadStudents();

                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify('Seçilmiş təhsil səviyyəsi tələbəyə daha öncə əlavə edilib!!!', {
                                        type: 'danger'
                                    });
                                }
                                
//                                else {
//                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
//                                        type: 'danger'
//                                    });
//                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                }
            });

        },
        getStudentActionDetails: function (id, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'students/action/' + id + '?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                callback(result);
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                }
            });

        },

        //get uni college
        //uncomment
        getUniActionDetails: function (id, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'students/action/' + id + '?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                callback(result);
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                }
            });

        },


        changePassword: function (pass, callback) {
            $.ajax({
                url: Hsis.urls.AdminRest + 'users/changePassword?token=' + Hsis.token,
                type: 'POST',
                data: pass,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                callback(result);
                                break;

                            case Hsis.statusCodes.INVALID_PARAMS:
                                callback(result);
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                }
            });
        },
        getSpecialityNames: function (callback) {
            var specialities = {};
            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/specialities?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                specialities = result.data;
                                break;


                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
                complete: function () {
                    if (callback) {
                        callback(specialities);
                    }
                }
            });
        },
        getOrgAddress: function (id, callback) {
            var address = {};
            $.ajax({
                url: Hsis.urls.HSIS + 'structures/' + id + '/address?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {

                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                address = result.data;
                                break;


                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
                complete: function () {
                    if (callback) {
                        callback(address);
                    }
                }


            })
        },
        addPersoneduLifeCycle: function (eduLifeCycle, personId, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'students/edulifecycle/' + personId + '/add?token=' + Hsis.token,
                type: 'POST',
                data: eduLifeCycle,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                callback(result.data);
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                }
            })

        },
        getStudentInfoByTQDK: function (pincode, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'students/pincode/' + pincode + '/tqdkDetails?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {

                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                callback(result);
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                }
            })
        },
        getDictionaryStructureTypes: function (callback) {

            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/dictionaries?structureAttr=1&token=' + Hsis.token,
                type: 'GET',
                success: function (result) {

                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                callback(result);
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                }
            })
        },
        removeEduLifeCycle: function (pelcId, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'students/edulifecycle/' + pelcId + '/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (callback) {
                                    callback(result);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }

                }

            });

        },
        getOrgsWithoutSchools: function (callback, container) {
            var tree = {};
            $.ajax({
                url: Hsis.urls.HSIS + 'structures/universities?token=' + Hsis.token,
                type: 'GET',
                global: false,
                beforeSend: function () {
                    if (typeof container !== "undefined") {
                        $('.btn.tree-modal').attr('data-check', 1);
                    }
                },
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                tree = data.data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function () {
                    callback(tree);
                    $('.btn.tree-modal').attr('data-check');

                }
            })
        },
        getEduYears: function (callback) {
            $.ajax({
                url: Hsis.urls.REPORT + 'graphicsReport/year?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                if (callback) {
                                    callback(result.data);
                                }

                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;


                        }
                    }

                }
            });
        },
        getOrgPlanByOrgId: function (id, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'structures/' + id + '/plan?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (callback) {
                                    callback(result.data);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            })
        },
        addOrgPlan: function (plan, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'structures/plan/add?token=' + Hsis.token,
                type: 'POST',
                data: plan,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (callback) {
                                    callback();
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            })
        },
        editOrgPlan: function (id, plan, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'structures/plan/' + id + '/edit?token=' + Hsis.token,
                type: 'POST',
                data: plan,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (callback) {
                                    callback();
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            })
        },
        removeOrgPlan: function (id, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'structures/plan/' + id + '/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (callback) {
                                    callback();
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            })
        },
        addOrderDocument: function (formData, callback) {

            $.ajax({
                url: Hsis.urls.HTP + 'order/add?token=' + Hsis.token,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                beforeSend: function (xhr) {
                    $('body .add-order-document-submit').attr('data-check', '1');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) {
                                    callback(result);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
                complete: function () {
                    $('body .add-order-document-submit').removeAttr('data-check');
                }
            });
        },
        getOrderList: function (page, form, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'order?token=' + Hsis.token + (page ? '&page=' + page : '') + "&pageSize=20",
                type: 'GET',
                data: form,
                beforeSend: function (xhr) {
                    $('.module-block[data-id="1000142"]').attr('data-check', 1);
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                Hsis.Service.parseOrder(result.data, page);
                                if (callback) {
                                    callback(result.data);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function (jqXHR, textStatus) {
                    $('.module-block[data-id="1000142"]').removeAttr('data-check');
                }
            })
        },
        getOrderDetails: function (id, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'order/' + id + '?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (callback) {
                                    callback(result.data);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            })
        },
        addOrderFiles: function (docId, formData, callback) {
            var id = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HTP + 'order/' + docId + '/file/add?token=' + Hsis.token,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) {
                                    callback();
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                        }
                    }
                }
            })
        },
        removeOrderFiles: function (fileId, filePath, callback) {

            $.ajax({
                url: Hsis.urls.HTP + 'order/file/' + fileId + '/remove?token=' + Hsis.token,
                type: 'POST',
                data: {
                    filePath: filePath
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) {
                                    callback(result);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                        }
                    }
                }
            })
        },
        editOrderDocument: function (form, callback) {

            $.ajax({
                url: Hsis.urls.HTP + 'order/' + form.id + '/edit?token=' + Hsis.token,
                type: 'POST',
                data: form,
                beforeSend: function (xhr) {
                    $('body .edit-order-document-submit').attr('data-check', '1');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) {
                                    callback(result);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                        }
                    }
                },
                complete: function (jqXHR, textStatus) {
                    $('body .edit-order-document-submit').removeAttr('data-check');
                }
            })
        },
        removeOrderDocument: function (id, callback) {

            $.ajax({
                url: Hsis.urls.HTP + 'order/' + id + '/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) {
                                    callback(result);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                        }
                    }
                }
            })
        },
        addWorkLifeCycle: function (work, callback) {
            var personId = $('#main-div').attr('data-id');
            $.ajax({
                url: Hsis.urls.HSIS + 'teachers/' + personId + '/workInfo/add?token=' + Hsis.token,
                type: 'POST',
                data: work,
                beforeSend: function (xhr) {
                    $('#main-div .edit-work-lifecycle-modal-submit').attr('disabled', 'disabled');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) {
                                    callback(result);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                },
                complete: function (jqXHR, textStatus) {
                    $('#main-div .edit-work-lifecycle-modal-submit').removeAttr('disabled');
                }
            });
        },
        getOrgAdministrativeData: function (id, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'structures/' + id + '/administrative?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                if (callback) {
                                    callback(result.data);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                if (result.message) {
                                    $.notify(result.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                } else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            })
        },
        getOrderDocumentsByType: function (id, orgId, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'order/type/' + id + '?token=' + Hsis.token,
                type: 'GET',
                data: {
                    orgId: orgId
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (callback) {
                                    callback(result.data);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }

                }
            });

        },
        getForeignAddressTree: function (callback, container) {
            var tree = {};
            $.ajax({
                url: Hsis.urls.HSIS + 'foreign/addresses/?token=' + Hsis.token,
                type: 'GET',
                beforeSend: function () {
                    if (typeof container !== "undefined") {
                        $('.btn.tree-modal').attr('data-check', 1);
                    }
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                tree = result.data;
                                break;
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function () {
                    callback(tree);
                    $('.btn.tree-modal').attr('data-check');
                }
            });
        },
        loadForeignStudents: function (page, queryParams, callback, before) {

            $.ajax({
                url: Hsis.urls.HSIS + 'students/foreign?token=' + Hsis.token + (queryParams ? '&' + queryParams : '') + (page ? '&page=' + page : ''),
                type: 'GET',
                beforeSend: function () {
                    if (before) {

                    }

                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                Hsis.Service.parseForeignStudents(result.data, page);
                                $('body').find('.col-sm-8.data').removeClass('col-sm-8').addClass('col-sm-12');
                                $('body').find('.col-sm-4.info').fadeOut(1).css('right', '-100%');
                                if (callback)
                                    callback(result.data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }


                    }
                },
                complete: function () {
                    $('.module-block[data-id="1000113"]').removeAttr('data-check');
                }
            })
        },
        getStructureListByFilter: function (id, levelId, callback) {

            $.ajax({
                url: Hsis.urls.HSIS + 'structures/allFilter?token=' + Hsis.token,
                type: 'GET',
                data: {
                    parentId: id ? id : 0,
                    levelId: levelId ? levelId : 0
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                if (callback) {
                                    callback(result.data);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                        }
                    }
                }
            })
        },
        getOrderAdvancedSearch: function (typeId, orgId, eduYearId, callback) {

            $.ajax({
                url: Hsis.urls.HSIS + 'order/type/' + typeId + '?token=' + Hsis.token + '&orgId=' + orgId + '&eduYearId=' + eduYearId,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                if (callback) {
                                    callback(result);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                        }
                    }
                }
            })
        },

        //uncomment
        getStructureListByAdress: function (id, callback) {

            $.ajax({
                url: Hsis.urls.HSIS + 'structures/address/' + id + '?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                if (callback) {
                                    callback(result);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;
                        }
                    }
                }
            })
        },
        getStructureListByAdressandType: function (id, type, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'structures/address/' + id + '?orgType=' + type + '&token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (callback) {
                                    callback(result);
                                }
                                break;
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                        }
                    }
                }
            })
        },


        loadDictionariesByTypeCode: function (parentCode, callback) {
            var form = {
                parentCode: parentCode
            }
            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/dictionaries/type?token=' + Hsis.token,
                type: 'GET',
                data: form,
                success: function (result) {
                    try {
                        if (result) {
                            switch (result.code) {
                                case Hsis.statusCodes.OK:
                                    if (callback) {
                                        callback(result.data)
                                    }

                                    break;

                                case Hsis.statusCodes.ERROR:
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:

//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }

            });
        },
        getStudentsInAbroad: function (page, queryParams, callback) {

            $.ajax({
                url: Hsis.urls.HSIS + 'foreign/students?token=' + Hsis.token + (queryParams ? '&' + queryParams : '') + (page ? '&page=' + page : ''),
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                Hsis.Service.parseStudentsInAbroad(result.data, page);
                                if (callback)
                                    callback(result.data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function () {
                }
            })
        },
        getStudentsWithoutOrder: function (form, callback, page) {
            $.ajax({
//                url: Hsis.urls.HTP + 'students/withoutOrder?token=' + Hsis.token + (page ? '&page=' + page : ''),
                url: Hsis.urls.HTP + 'students/withoutOrder?token=' + Hsis.token + '&pageSize=100000',
                type: 'GET',
                data: form,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;
                            case Hsis.statusCodes.OK:
                                if (callback)
                                    callback(result.data);
                                break;
                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
            });
        },
        getStudentsWithOrder: function (form, callback, page) {
            $.ajax({
//                url: Hsis.urls.HTP + 'students/withOrder?token=' + Hsis.token + (page ? '&page=' + page : ''),
                url: Hsis.urls.HTP + 'students/withOrder?token=' + Hsis.token + '&pageSize=100000',
                type: 'GET',
                data: form,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;
                            case Hsis.statusCodes.OK:
                                console.log(result.data);
                                if (callback)
                                    callback(result.data);
                                break;
                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
            });
        },
        addOrderToStudents: function (form, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'students/order/add?token=' + Hsis.token,
                type: 'POST',
                dataType: 'json',
                data: form,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;
                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback) {
                                    callback();
                                }
                                break;
                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }

                }
            });
        },

        getAllCountry: function (callback) {

            $.ajax({
                url: Hsis.urls.HSIS + 'structures/allCountry?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (callback) {
                                    callback(result.data);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                        }
                    }
                }
            })
        },
        getLastOrderByActionId: function (orgId, actionId, callback) {

            $.ajax({
                url: Hsis.urls.HSIS + 'order/action/' + actionId + '?token=' + Hsis.token + '&orgId=' + orgId,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (callback) {
                                    callback(result.data);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                        }
                    }
                }
            })
        },
        getStudentListByOrderId: function (form, callback, page) {

            $.ajax({
                url: Hsis.urls.HSIS + 'students/order/' + form.orderId + '?token=' + Hsis.token + (page ? '&page=' + page : ''),
                type: 'GET',
                data: form,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (callback) {
                                    callback(result.data);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                        }
                    }
                }
            })
        },
        getStudentsDiplomListByDiplomParams: function (form, callback, page) {

            $.ajax({
                url: Hsis.urls.HSIS + 'diplom/student?token=' + Hsis.token + (page ? '&page=' + page : ''),
                type: 'GET',
                data: form,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:
                                if (callback) {
                                    callback(result.data);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                        }
                    }
                }
            })
        },

        removeStudentFromOrder: function (pelcId, orderId, callback) {
            var data;
            $.ajax({
                url: Hsis.urls.HTP + 'students/' + pelcId + '/order/' + orderId + '/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result.data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            });
        },

        submitmOrder: function (orderId, callback) {
            var data;
            $.ajax({
                url: Hsis.urls.HTP + 'order/' + orderId + '/confirm?token=' + Hsis.token,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result.data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            });
        },

        addAbroadStudentRegistrationDate: function (form, id, callback) {
            var data;
            $.ajax({
                url: Hsis.urls.HTP + 'students/' + id + '/registration/add?token=' + Hsis.token,
                type: 'POST',
                data: form,
                beforeSend: function (xhr) {
                    $('#main-div .add-registration-date-submit').attr('disabled', 'disabled');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function (jqXHR, textStatus) {
                    $('#main-div .add-registration-date-submit').removeAttr('disabled');
                }
            });
        },

        addAbroadStudentAchievement: function (form, id, callback) {
            var data;
            $.ajax({
                url: Hsis.urls.HTP + 'students/' + id + '/achievement/add?token=' + Hsis.token,
                type: 'POST',
                data: form,
                beforeSend: function (xhr) {
                    $('#main-div .add-archievement-submit').attr('disabled', 'disabled');
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function (jqXHR, textStatus) {
                    $('#main-div .add-archievement-submit').removeAttr('disabled');
                }
            });
        },

        removeAbroadStudentRegistrationDate: function (id, regId, callback) {
            var data;
            $.ajax({
                url: Hsis.urls.HTP + 'students/' + id + '/registration/' + regId + '/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            });
        },

        removeAbroadStudentAchievement: function (id, achId, callback) {
            var data;
            $.ajax({
                url: Hsis.urls.HTP + 'students/' + id + '/achievement/' + achId + '/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                callback(result);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            });
        },

        editAbroadPelc: function (id, pelcId, form, callback) {
            var data;
            $.ajax({
                url: Hsis.urls.HTP + 'students/abroad/' + id + '/pelc/' + pelcId + '/edit?token=' + Hsis.token,
                type: 'POST',
                data: form,
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });

                                if (callback)
                                    callback(result);

                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            });
        },

        getStudentEduPlanSubject: function (id, callback) {
            $.ajax({
                url: Hsis.urls.EMS + 'eduplan/pelc/' + id + '?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                if (callback)
                                    callback(result);

                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                }
            });
        },

        editStudentEduPlanMark: function (id, form, callback) {
            $.ajax({
                url: Hsis.urls.EMS + 'eduplan/pelc/' + id + '/graduateMark/edit?token=' + Hsis.token,
                type: 'POST',
                data: form,
                beforeSend: function (xhr) {

                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                if (callback)
                                    callback(result);

                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function (jqXHR, textStatus) {

                }
            });
        },

        loadPelcShortInfo: function (id, callback) {
            $.ajax({
                url: Hsis.urls.HSIS + 'students/shortinfo/' + id + '?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                if (callback)
                                    callback(result.data);

                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
            });

        },
        loadDictionaryByMultiParents: function (type, parents, callback) {
            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/dictionary/multipleparent?typeId=' + type + '&parents=' + parents + '&token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                if (callback)
                                    callback(result.data);

                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
            });
        },
        loadAbroadAddress: function (type, parent, callback) {
            $.ajax({
                url: Hsis.urls.AdminRest + 'settings/address/abroad?token=' + Hsis.token,
                type: 'GET',
                data: {
                    typeId: type,
                    parentId: parent
                },
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;
                            case Hsis.statusCodes.OK:
                                if (callback)
                                    callback(result.data);
                                break;
                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
            });

        },
        //uncomment
        getAbroadOrgByAbroadAddr: function (id, callback) {

            $.ajax({
                url: Hsis.urls.HTP + 'structures/address/abroad/' + id + '?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                if (callback) {
                                    callback(result.data);
                                }
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                if (callback) {
                                    callback(result.data);
                                }
                                break;
                        }
                    }
                }
            })
        },
        getUnreadNotification: function (callback) {
            $.ajax({
                url: Hsis.urls.COMMUNICATION + 'notification/unread/count?token=' + Hsis.token,
                type: 'GET',
                success: function (result) {
                    if (result) {
                        switch (result.code) {
                            case Hsis.statusCodes.OK:

                                callback(result);
                                break;

                            case Hsis.statusCodes.INVALID_PARAMS:
                                callback(result);
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }
                }
            });
        },


        //New istifageciler module HTP de Get
        loadUsers: function (page, params, callback) {
            $.ajax({
                url: Hsis.urls.HTP + 'users?token=' + Hsis.token + (params ? '&' + params : '') + (page ? '&page=' + page : '') + "&pageSize=25",
                type: 'GET',
                //data: params,
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    Hsis.Service.parseUsers(data, page);
                                    if (callback)
                                        callback(data.data);
                                    break;

                                case Hsis.statusCodes.ERROR:
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:

//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    }
                    catch (err) {
                        console.error(err);
                    }
                }

            });
        },

        editUser: function (formData, callback) {
            var code = {};
            $.ajax({
//                url: Hsis.urls.AdminRest + "users/" + Hsis.tempDataId + "/edit",
                url: Hsis.urls.HTP + "users/" + Hsis.tempDataId + "/edit",
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function (data) {
                    if (data) {

                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                if (data.message) {
                                    $.notify(data.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                }
                                else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;
                            case Hsis.statusCodes.DUPLICATE_DATA:
                                $.notify("İstifadəçi adı artıq mövcuddur!", {
                                    type: 'danger'
                                });

                                break;
                            case Hsis.statusCodes.OK:
                                code = data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function () {
                    callback(code);
                }
            })

        },

        registretedUser: function (data, callback) {
            $.ajax({
                url: Hsis.urls.AdminRest + 'users/registreted?token=' + Hsis.token,
                type: 'POST',
                data: data,
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                callback(data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }

                }
            });
        },


        removeUser: function (userId, callback) {
            var code = {};
            $.ajax({
                url: Hsis.urls.AdminRest + 'users/' + userId + '/remove?token=' + Hsis.token,
                type: 'POST',
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                if (data.message) {
                                    $.notify(data.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                }
                                else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;
                            case Hsis.statusCodes.OK:
                                code = data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:

//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }

                },
                complete: function () {
                    callback(code);
                }
            });
            return code;
        },
        blockUser: function (userId, block, callback) {
            console.log(userId);
            var code = {};
            $.ajax({
                url: Hsis.urls.AdminRest + 'users/' + userId + (block == 'false' ? '/block' : '/unblock') + '?token=' + Hsis.token,
                type: 'POST',
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                if (data.message) {
                                    $.notify(data.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                }
                                else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;
                            case Hsis.statusCodes.OK:
                                code = data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:

//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function () {
                    callback(code);
                }
            });
            return code;
        },

        deactivateSession: function (userId, callback) {
            var code = {};
            $.ajax({
                url: Hsis.urls.AdminRest + 'users/' + userId + '/invalidatesession?token=' + Hsis.token,
                type: 'POST',
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.OK:
                                code = data;
                                break;

                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:

//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function () {
                    callback(code);
                }
            })
        },
        loadRoles: function (callback) {
            var roles = {};

            $.ajax({
                url: Hsis.urls.AdminRest + 'users/roles?token=' + Hsis.token,
                type: 'GET',
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    roles = data;
                                    break;

                                case Hsis.statusCodes.ERROR:
                                    $.notify(Sec.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:

//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    }
                    catch (err) {
                        console.error(err);
                    }
                },
                complete: function () {
                    callback(roles);
                }
            });
        },
        getDistrictListByAzerbaijan: function (callback) {

            $.ajax({
                url: Hsis.urls.HTP + 'structures/address/district?token=' + Hsis.token,
                type: 'GET',
                success: function (data) {
                    try {
                        if (data) {
                            switch (data.code) {
                                case Hsis.statusCodes.OK:
                                    if(callback) callback(data);
                                    break;

                                case Hsis.statusCodes.ERROR:
                                    $.notify(Sec.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                    break;

                                case Hsis.statusCodes.UNAUTHORIZED:

//                                    window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                    break;
                            }
                        }
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            });
        },
        getUserById: function (id, callback) {
            var user = {};
            $.ajax({
                url: Hsis.urls.AdminRest + '/users/' + id + '?token=' + Hsis.token,
                type: 'GET',
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                user = data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:

//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function () {
                    callback(user);
                    $('#confirm').removeAttr('disabled');
                }
            })
        },
        addUser: function (formData, callback) {
            var code = {};
            $.ajax({
                url: Hsis.urls.HTP + 'users/add',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function (data) {
                    if (data) {

                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                if (data.message) {
                                    $.notify(data.message[Hsis.lang], {
                                        type: 'danger'
                                    });
                                }
                                else {
                                    $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                        type: 'danger'
                                    });
                                }
                                break;
                            case Hsis.statusCodes.DUPLICATE_DATA:
                                $.notify("İstifadəçi adı artıq mövcuddur!", {
                                    type: 'danger'
                                });
                                break;
                            case Hsis.statusCodes.OK:
                                code = data;
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;
                        }
                    }
                },
                complete: function () {
                    cropForm = new FormData();
                    callback(code);
                }
            });
        },
        getUnregistretedUsersList: function (page, type, orgId, callback, keyword) {
            $.ajax({
                url: Hsis.urls.AdminRest + 'users/unregistreted?token=' + Hsis.token + (page ? '&page=' + page : '') + (keyword ? '&keyword=' + keyword : ''),
                type: 'GET',
                data: {
                    type: type,
                    orgId: orgId

                },
                success: function (data) {
                    if (data) {
                        switch (data.code) {
                            case Hsis.statusCodes.ERROR:
                                $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                                    type: 'danger'
                                });
                                break;

                            case Hsis.statusCodes.OK:
                                callback(data);
                                break;

                            case Hsis.statusCodes.UNAUTHORIZED:
//                                window.location = Hsis.urls.ROS + 'unauthorized';
                                    $.notify('Baza ilə əlaqədə xəta var', {
                                        type: 'danger'
                                    });
                                break;

                        }
                    }

                }
            });
        },


    },
    Service: {
        parseApplications: function (applications) {
            var html = '';
            $.each(applications, function (i, v) {
                html += '<div class="col-md-4 p-l-0" title = "' + v.name[Hsis.lang] + '">' +
                    '<li class="button-item">' +
                    '<a data-id="' + v.id + '" target="_blank" class="button-icon" href="' + v.url + '?token=' + Hsis.token + '">' +
                    '<div class="flex-center">' + '<div class="' + v.iconPath + '"></div>' +
                    '<span class="button-name">' + v.shortName[Hsis.lang] + '</span>' +
                    '</div>' +
                    '</a>' +
                    '</li>' +
                    '</div>';
            });

            $('#application-list .div-application').html(html);
        },
        // loadcity parse  to module_1000131
        loadAbroadStructures: function (data, page) {

            if (data && data.list) {
                var html = '';
                var count;
                if (page) {
//                    count = ($('#abroad_structure_table tbody tr').length * page) - $('#abroad_structure_table tbody tr').length;
                        count = ((page-1) * 20)
                } else {
                    count = 0;
                }
                if (data.list.length > 0) {
                    $.each(data.list, function (i, v) {
                        html += '<tr data-id ="' + v.id + '" data-country-id ="' + v.abroadCountry.id + '" data-city-id ="' + v.abroadCity.id + '" data-uni-name="' + v.name[Hsis.lang] + '">' +
                            '<td>' + ++count + '</td>' +
                            '<td>' + v.abroadCountry.value[Hsis.lang] + '</td>' +
                            '<td>' + v.abroadCity.value[Hsis.lang] + '</td>' +
                            '<td>' + v.name[Hsis.lang] + '</td>' +
                            '<td style="float: right">' + Hsis.Service.parseOperations(Hsis.operationList, 2) + '</td>' +
                            '</tr>';
                    });
                }


                if (page) {
                    $('body').find('#abroad_structure_table tbody').html(html);
                } else {
                    $('body').find('#abroad_structure_table tbody').html(html);
                }

                $('span.head-total').html(data.count);
                var paginationCount = Math.ceil(data.count / 20);
                Hsis.paginationActive = true;
                Pagination.Init(document.getElementById('pagination'), {
                    size: paginationCount,
                    page: page ? page : 1,
                    step: 3
                }, Hsis.paginationActive);
            }
        },

        //parse to module_1000132
        loadAbroadAddress: function (data, page) {

            if (data && data.list) {
                var html = '';
                var count;
                if (page) {
//                    count = ($('#abroad-structure-address tbody tr').length * page) - $('#abroad-structure-address tbody tr').length;
                    count = ((page-1) * 20)
                } else {
                    count = 0;
                }

                $.each(data.list, function (i, v) {
                    html += '<tr data-id ="' + v.id + '" data-country-id ="' + v.country.id + '" data-city-id ="' + v.cityName + '" >' +
                        '<td>' + (++count) + '</td>' +
                        '<td>' + v.country.value[Hsis.lang] + '</td>' +
                        '<td>' + v.cityName + '</td>' +
                        '<td style="float: right">' + Hsis.Service.parseOperations(Hsis.operationList, 2) + '</td>' +
                        '</tr>';
                });


                if (page) {
                    $('body').find('#abroad-structure-address tbody').html(html);
                } else {
                    $('body').find('#abroad-structure-address tbody').html(html);
                }

                $('span.head-total').html(data.count);
                var paginationCount = Math.ceil(data.count / 20);
                Hsis.paginationActive = true;
                Pagination.Init(document.getElementById('pagination'), {
                    size: paginationCount,
                    page: page ? page : 1,
                    step: 3
                }, Hsis.paginationActive);


                /*var paginationCount = Math.ceil(data.count / 20);
                $(".custom-pagination").empty();
                for (var tt = 0; tt < paginationCount; tt++) {
                    var nmm = tt + 1;
                    if (!page) page = 1;
                    if (page === nmm) {
                        $(".custom-pagination").append('<li class="page-item current"><a class="page-link" href="#">' + nmm + '</a></li>');
                    } else {
                        $(".custom-pagination").append('<li class="page-item"><a class="page-link" href="#">' + nmm + '</a></li>');
                    }
                }
                pagination(paginationCount, page - 1);*/


            }
        },
        parseApplicationsList: function (data) {
            var html = '';
            if (data) {
                $.each(data, function (i, v) {
                    if (v.id == 1000001)
                        html += '<li data-toggle="tooltip" data-placement="bottom" title = "' + v.name[Hsis.lang] + '">' +
                            '<a data-id="' + v.id + '"  href="' + v.url + '?token=' + Hsis.token + '">' + v.shortName[Hsis.lang] + '</a>' +
                            '</li>';
                });
                Hsis.Proxy.loadSubApplications(function (data) {
                    if (data && data.data) {
                        $.each(data.data, function (i, v) {
                            html += '<li data-toggle="tooltip" data-placement="bottom" title = "' + v.name[Hsis.lang] + '">' +
                                '<a data-id="' + v.id + '"  href="' + v.url + '?token=' + Hsis.token + '">' + v.shortName[Hsis.lang] + '</a>' +
                                '</li>';
                        })
                    }

                    $('.app-con').html(html);
                    $('.app-con a[data-id="' + Hsis.appId + '"]').parent('li').addClass('active');
                    $('[data-toggle="tooltip"]').tooltip();

                    /*var moduleListItems = $('body').find('.app-con li');
                    console.log(moduleListItems)
                    if (moduleListItems.length > 5) {
                        $('body').find('div.app-list, .hide-menu').addClass('less-menu')
                    } else {
                        $('body').find('div.app-list, .hide-menu').removeClass('less-menu')
                    }*/
                })

            }

        },
        parseModules: function (modules) {
            var html = '';
            if (modules.data) {

                $.each(modules.data, function (i, v) {
                    if (v.parentId == 0) {
                        html += '<li title="' + v.name[Hsis.lang] + '" data-id="' + v.id + '" class="module-block">' +
                            '<a href="#" class="" >' + v.shortName[Hsis.lang] + '</a>' +
                            '</li>';
                    }

                });
            }

            return html;
        },
        parseOrgTree: function (tree) {
            try {
                Hsis.array = [];
                var array = [];
                if (tree.length > 0) {
                    $.each(tree, function (i, v) {

                        var obj = {
                            id: v.id.toString(),
                            dicType: v.type.id,
                            parent: (v.parent.id) == 0 ? "#" : v.parent.id.toString(),
                            text: v.name[Hsis.lang],
                            about: v.about[Hsis.lang],
                            type: v.type.value[Hsis.lang],
                            name: v.name[Hsis.lang],
                            startDate: v.startDate,
                            endDate: v.endDate,
                            shortName: v.shortName[Hsis.lang],
                            li_attr: {
                                'title': tree[i].type.value[Hsis.lang]
                            },
                        };


                        array.push(obj);
                        Hsis.array.push(obj);
                    });

                    $('body').find('#jstree').jstree('refresh').jstree({
                        "core": {
                            "data": array,
                            "check_callback": true,
                            "themes": {
                                "variant": "large",
                                "dots": false,
                                "icons": false
                            }
                        },
                        "search": {
                            "case_insensitive": true,
                            "show_only_matches": true
                        },
                        "plugins": ["wholerow", "search", "crrm"]
                    }).on('loaded.jstree', function () {
                        $('.tree-preloader').remove();
                        $('.module-block[data-id=' + Hsis.currModule + ']').removeAttr('data-check');

                    })
                } else {
                    $('body').find('#jstree').jstree("destroy");
                }
            } catch (err) {
                console.error(err);
            }
        },
        parseOperations: function (operations, type, $obj, callback) {
            var html = '';
            if (operations) {
                var innerButton = $('<div class="dropdown-func op-cont">' +
                    '<div title = "Əməliyyatlar" class="operations operations-top dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                    '<img src="assets/img/upd/table-dots.svg">' +
                    '</div>' + '<ul class="dropdown-menu">' +
                    '</ul>' +
                    '</div>');
                $.each(operations, function (i, v) {
                    if (v.typeId == type) {
                        if (type == '1') {
                            html += '<li><a id="operation_' + v.id + '" href="#" >' + v.name[Hsis.lang] + '</a></li>';
                        } else if (type == '2') {
                            if ($obj) {
                                var statusId = $obj.status ? $obj.status.id : 0;
                                if ((v.id == 1000042 || v.id == 1000041  || v.id == 1001440) && statusId == 1000340) {
                                    html += '';
                                } else if ((v.id == 1000028
                                ) && statusId == 1000340 && v.roleId != 1000020 && v.roleId != 1000075) {
                                    html += '';
                                } else if ((v.id == 1001311 || v.id == 1001330 || v.id == 1000171) && statusId == 1000340) {
                                    html += '';
                                } else {
                                    html += '<li><a  id="operation_' + v.id + '" data-status = "' + statusId + '" href="#">' + v.name[Hsis.lang] + '</a></li>';
                                }
                            } else {
                                html += '<li><a id="operation_' + v.id + '" data-status = "' + statusId + '" href="#">' + v.name[Hsis.lang] + '</a></li>';
                            }
                        }
                    }
                });
                if (type == '2') {
                    innerButton.find('ul').html(html);
                    return innerButton.html();
                }


            }
            return html;
        },
        parseDictionaryForSelect: function (data) {
            var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]["select"] + '</option>';
            if (data) {
                $.each(data, function (i, v) {
                    html += '<option parent="' + v.parentId + '" code="' + v.code + '" value="' + v.id + '">' + v.value[Hsis.lang] + '</option>';
                });
            }
            return html;
        },
        //for options
        commonParseTree: function (data, objectId, nodeTypeId) {
            try {
                if (data.length > 0) {
                    var arrayData = [];
                    $.each(data, function (i, v) {
                        var obj = {
                            id: v.id.toString(),
                            parent: (v.parent.id === 0 || v.parent.id.toString().length < 3) ? "#" : v.parent.id.toString(), /* || v.parent.id.toString().length < 5 */
                            text: v.name[Hsis.lang],
                            typeId: v.type.id
                        };
                        arrayData.push(obj);
                        Hsis.array.push(obj);
                    });

                    $('#main-div').find('#' + objectId).on('loaded.jstree', function (e, data) {
                        $('.tree-preloader').remove();
                        $('#' + objectId).removeAttr('data-id');
                        $('#' + objectId).removeAttr('data-check');

                    }).jstree({
                        "conditionalselect": function (node) {
                            if (nodeTypeId) {
                                return node.original.typeId == nodeTypeId ? true : false;
                            }
                            else {
                                return true;
                            }
                        },
                        "core": {
                            "data": arrayData,
                            "check_callback": true,
                            "themes": {
                                "variant": "large",
                                "dots": false,
                                "icons": true
                            },
                        },
                        "search": {
                            "case_insensitive": true,
                            "show_only_matches": true
                        },
                        "plugins": ["conditionalselect", "wholerow", "search"],
                        "themes": {"stripes": true}
                    });
                } else {
                    $('#main-div').find('#' + objectId).jstree("destroy");
                }
            } catch (err) {
                console.error(err);
            }
        },
        parseEditStudentAddress: function (data) {
            try {
                if (data) {
                    $.each(data.addresses, function (i, v) {
                        switch (v.type.id) {
                            case 1000178:
                                $('#permanent_address_edit').text(v.fullAddress[Hsis.lang] + ', ' + v.name);
                                $('#permanent_address_edit').attr('data-addressTree-id', v.addressTree.id);
                                $('#permanent_address_edit').attr('data-address-name', v.name);
                                $('#permanent_address_edit').removeAttr('data-id').attr('data-id', v.id);
                                $('#main-div #permanent_street_edit').val(v.name);
                                break;
                            case 1000198:

                                $('#temporary_address_edit').text(v.fullAddress[Hsis.lang] + ', ' + v.name);
                                $('#temporary_address_edit').attr('data-addressTree-id', v.addressTree.id);
                                $('#temporary_address_edit').attr('data-address-name', v.name);
                                $('#temporary_address_edit').removeAttr('data-id').attr('data-id', v.id);
                                $('#main-div #temporary_street_edit').val(v.name);
                                break;

                            case 1000199:
                                $('#birth_place_edit').text(v.fullAddress[Hsis.lang]);
                                $('#birth_place_edit').attr('data-addressTree-id', v.addressTree.id);
                                $('#birth_place_edit').attr('data-address-name', v.name);
                                $('#birth_place_edit').removeAttr('data-id').attr('data-id', v.id);
                                break;
                        }
                    })

                }
            } catch (err) {
                console.error(err);
            }
        },
        parseOldStudentAddress: function (data) {
            try {

                if (data) {
                    $.each(data.addresses, function (i, v) {

                        switch (v.type.id) {
                            case 1000178:
                                $('#permanent_address_edit').text(v.fullAddress[Hsis.lang] + ', ' + v.name);

                                break;

                            case 1000198:
                                $('#temporary_address_edit').text(v.fullAddress[Hsis.lang] + ', ' + v.name);
                                break;

                            case 1000199:
                                $('#birth_place_edit').text(v.fullAddress[Hsis.lang]);
                                break;
                        }
                    })

                }

            } catch (err) {
                console.error(err);
            }
        },
        parseEditStudentDocument: function (data, doctype) {
            try {
                var html = '';
                if (data) {
                    $.each(data, function (i, v) {
                        html += '<div class="col-md-12 for-align doc-item" data-doc-id = "' + v.id + '">' +
                            '<table class="table-block col-md-12">' +
                            '<tr>' +
                            '<td style="width: 20%;">' + Hsis.dictionary[Hsis.lang]['doc_type'] + '</td>' +
                            '<td style="width: 20%;">' + Hsis.dictionary[Hsis.lang]['serial_number'] + '</td>' +
                            '<td style="width: 20%;">' + Hsis.dictionary[Hsis.lang]['doc_number'] + '</td>' +
                            '<td style="width: 20%;">' + Hsis.dictionary[Hsis.lang]['issue_date'] + '</td>' +
                            '<td style="width: 20%;">' + Hsis.dictionary[Hsis.lang]['end_date'] + '</td>' +
                            '<td></td>' +
                            '</tr>' +
                            '<tr>' +
                            '<td style="width: 20%;" data-id="' + v.type.id + '" class="add-doc-type">' + v.type.value[Hsis.lang] + '</td>' +
                            '<td style="width: 20%;" class="add-doc-serial">' + v.serial + '</td>' +
                            '<td style="width: 20%;" class="add-doc-number">' + v.number + '</td>' +
                            '<td style="width: 20%;" class="add-doc-date">' + v.startDate + '</td>' +
                            '<td style="width: 20%;" class="add-doc-end-date">' + v.endDate + '</td>' + '</tr>' +
                            '</table>' +
                            '<label><p><span>Zəhmət olmasa pdf formatında </span>' + Hsis.dictionary[Hsis.lang]['choose_files'] + '</p><input type="file" multiple class="add-doc-file" data-doc-id = "' + v.id + '"/></label>' +
                            '<div class="operations-button ">' +
                            '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="glyphicon glyphicon-list"></span></div>' +
                            '<ul class="dropdown-menu student-dropdown">' +
                            '<li><a href="#" class="student_doc_edit" data-doc-type = "' + doctype + '"data-id = "' + v.id + '" data-type-id = "' + v.type.id + '" data-doc-serial = "' + v.serial + '" data-doc-number = "' + v.number + '" data-doc-start-date = "' + v.startDate + '" data-doc-end-date = "' + v.endDate + '">' + Hsis.dictionary[Hsis.lang]['edit'] + '</a></li>' +
                            '<li><a href="#" class="student_doc_remove" data-id = "' + v.id + '">' + Hsis.dictionary[Hsis.lang]['erase'] + '</a></li>' +
                            '</ul>' +
                            '</div>' +
                            '</div>';

                        if (v.files.length > 0) {

                            html += '<div class = "student-doc-file-div">';
                            $.each(v.files, function (k, j) {
                                var type = j.path.split(".")[j.path.split(".").length - 1];
                                console.log(type);
                                html += '<div data-type="view" class="user-doc-file" >' +
                                // data-file-id = "' + j.id + '" data-file-path = "' + j.path + '"
                                    '<div class="doc-delete">✖</div>' +
                                    '<img data-type="view" src="' + getUrl(j.id, type) + '" alt="" width="50" height="50">' +

                                    // '<img data-type = "' + getUrl(type) + '" src="' + getUrl(j.id, type) + '" alt="" width="50" height="50">' +
                                    '<div class="upload-img"><a href="' + Hsis.urls.HSIS + 'students/file/' + j.id + '?fileType=1&token=' + Hsis.token + '" download = "' + j.originalName + '"><img src="assets/img/download.svg" width="20" height="20"></a></div>' +
                                    '</div>';
                            });
                            html += '</div>';
                        }
                        //   src="' + Hsis.urls.HSIS + 'students/file/' + j.id + '?token=' + Hsis.token + '"
                        html += '</div>';

                    });
                } else {
                    html += '<div class="blank-panel"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>';
                }
            } catch (err) {
                console.error(err);
            }
            return html;

        },
        parseViewStudentDocument: function (data, doctype) {
            try {
                var html = '';
                if (data) {
                    $.each(data, function (i, v) {
                        html += '<div class="col-md-12 for-align doc-item" doc-type="' + doctype + '">' +
                            '<table class="table-block col-md-12">' +
                            '<tr>' +
                            '<td style="width: 20%;">' + Hsis.dictionary[Hsis.lang]['doc_type'] + '</td>' +
                            '<td style="width: 20%;">' + Hsis.dictionary[Hsis.lang]['serial_number'] + '</td>' +
                            '<td style="width: 20%;">' + Hsis.dictionary[Hsis.lang]['doc_number'] + '</td>' +
                            '<td style="width: 20%;">' + Hsis.dictionary[Hsis.lang]['issue_date'] + '</td>' +
                            '<td style="width: 20%;">' + Hsis.dictionary[Hsis.lang]['end_date'] + '</td>' + '<td></td>' +
                            '</tr>' +
                            '<tr>' +
                            '<td style="width: 20%;" class="add-doc-type">' + v.type.value[Hsis.lang] + '</td>' +
                            '<td style="width: 20%;" class="add-doc-serial">' + v.serial + '</td>' +
                            '<td style="width: 20%;" class="add-doc-number">' + v.number + '</td>' +
                            '<td style="width: 20%;" class="add-doc-date">' + v.startDate + '</td>' +
                            '<td style="width: 20%;" class="add-doc-end-date">' + v.endDate + '</td>' +
                            '</tr>' +
                            '</table>';


                        if (v.files.length > 0) {
                            console.log(v.files);
                            html += '<div class = "student-doc-file-div">';
                            $.each(v.files, function (k, j) {
                                var type = j.path.split(".")[j.path.split(".").length - 1];
                                console.log(type);
                                html += '<div class="user-doc-file" data-type="view">' +
                                    // '<img  data-type = "' + getUrl(type) + '" src="' + getUrl(j.id, type) + '" alt="" width="50" height="50">' +
                                    '<img data-type="view" src="' + getUrl(j.id, type) + '" alt="" width="50" height="50">' +
                                    '<div class="upload-img"><a href="' + Hsis.urls.HSIS + 'students/file/' + j.id + '?fileType=1&token=' + Hsis.token + '" target="_blank"><img src="assets/img/download.svg" width="20" height="20"></a></div>' +
                                    '</div>';
                            });
                            html += '</div>';
                        }
                        // src="' + Hsis.urls.HSIS + 'students/file/' + j.id + '?token=' + Hsis.token + '"

                        html += '</div>';
                    });
                } else {
                    html += '<div class="blank-panel"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>';
                }

            } catch (err) {
                console.error(err);
            }

            return html;

        },
        parseStudentOrder: function (data, doctype) {
            try {

                var html = '';
                if (data) {
                    $.each(data, function (i, v) {
                        html += '<div class="col-md-12 for-align doc-item" doc-type="' + doctype + '">' +
                            '<table class="table-block col-md-12">' +
                            '<tr>' +
                            '<td style="width: 25%;">' + Hsis.dictionary[Hsis.lang]['order_type'] + '</td>' +
                            '<td style="width: 25%;">' + Hsis.dictionary[Hsis.lang]['order_series'] + '</td>' +
                            '<td style="width: 25%;">' + Hsis.dictionary[Hsis.lang]['order_number'] + '</td>' +
                            '<td style="width: 25%;">' + Hsis.dictionary[Hsis.lang]['issue_date'] + '</td>' +
//                            '<td>' + Hsis.dictionary[Hsis.lang]['end_date'] + '</td>' + '<td></td>' +
                            '</tr>' +
                            '<tr>' +
                            '<td style="width: 25%;" class="add-doc-type">' + v.type.value[Hsis.lang] + '</td>' +
                            '<td style="width: 25%;" class="add-doc-serial">' + v.serial + '</td>' +
                            '<td style="width: 25%;" class="add-doc-number">' + v.number + '</td>' +
                            '<td style="width: 25%;" class="add-doc-date">' + (v.startDate ? v.startDate : "") + '</td>' +
//                            '<td class="add-doc-end-date">' + (v.endDate ? v.endDate : "") + '</td>' +
                            '</tr>' +
                            '</table>';


                        if (v.files.length > 0) {
                            html += '<div class = "student-doc-file-div">';
                            $.each(v.files, function (k, j) {
                                if (j.path && j.path.length > 0) {
                                    var type = j.path.split(".")[j.path.split(".").length - 1];
                                    console.log(type);
                                    html += '<div class="user-doc-file">' +
                                        '<img  data-type = "' + getFileType(type) + '" src="' + Hsis.urls.HTP + 'order/file/' + v.id + '?token=' + Hsis.token + '" alt="" width="50" height="50">' +
                                        '<div class="upload-img"><a href="' + Hsis.urls.HTP + 'order/file/' + v.id + '?fileType=1&token=' + Hsis.token + '" target="_blank"><img src="assets/img/download.svg" width="20" height="20"></a></div>' +
                                        '</div>';
                                }

                            });
                            html += '</div>';
                        }

                        html += '</div>';
                    });
                } else {
                    html += '<div class="blank-panel"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>';
                }

            } catch (err) {
                console.error(err);
            }

            return html;

        },
        parseEditStudentContact: function (data) {
            try {
                if (data) {
                    var html = '';
                    $.each(data.contacts, function (i, v) {
                        html += '<div class="col-md-12 for-align contact-item">' +
                            '<table class="table-block col-md-12">' +
                            '<thead>' +
                            '<tr><th style="width:50%">' + Hsis.dictionary[Hsis.lang]['contact_type'] + '</th>' +
                            '<th style="width:50%">' + Hsis.dictionary[Hsis.lang]['contact'] + ' </th>' +
                            '</tr></thead>' +
                            '<tbody>' +
                            '<tr >' +
                            '<td style="width:50%">' + v.type.value[Hsis.lang] + '</td>' +
                            '<td style="width:50%">' + v.contact + '</td>' +
                            '</tr>' +
                            '</tbody>' +
                            '</table>' +
                            '<div class="operations-button">' +
                            '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                            '<span class="glyphicon glyphicon-list"></span>' +
                            '</div>' +
                            '<ul class="dropdown-menu student-dropdown">' +
                            '<li class = "edit-contact-li" data-id = "' + v.id + '" data-type-id = "' + v.type.id + '" data-contact = "' + v.contact + '"><a href="#"> ' + Hsis.dictionary[Hsis.lang]['edit'] + ' </a></li>' +
                            '<li class="remove-contact-li" data-id="' + v.id + '"><a href="#" data-id = "' + v.id + '">' + Hsis.dictionary[Hsis.lang]['erase'] + '</a></li>' +
                            '</ul>' +
                            '</div>' +
                            '</div>';


                    });

                    return html;
                }


            } catch (err) {
                console.error(err);
            }

        },
        parseViewStudentContact: function (data) {
            try {
                var html = '';
                if (data) {
                    $.each(data.contacts, function (i, v) {

                        html += '<div class="col-md-12 for-align contact-item">' +
                            '<table class="table-block col-md-12">' +
                            '<thead>' +
                            '<tr><th style="width: 50%;">' + Hsis.dictionary[Hsis.lang]['contact_type'] + '</th>' +
                            '<th style="width: 50%;">' + Hsis.dictionary[Hsis.lang]['contact'] + ' </th>' +
                            '</tr></thead>' +
                            '<tbody>' +
                            '<tr >' +
                            '<td style="width: 50%;">' + v.type.value[Hsis.lang] + '</td>' +
                            '<td style="width: 50%;">' + v.contact + '</td>' +
                            '</tr>' +
                            '</tbody>' +
                            '</table>' +
                            '</div>';
                    });
                }

            } catch (err) {
                console.error(err);
            }

            return html;
        },
        parseStudentRelationShip: function (data) {

            try {
                if (data.length > 0) {
                    var html = '';

                    $.each(data, function (i, v) {

                        html += '<div class="col-md-12 for-align relationship-item">' +
                            '<table class="table-block col-md-12">' +
                            '<thead>' +
                            '<tr>' +
                            '<th style="width: 33.33%;" >' + Hsis.dictionary[Hsis.lang]['relation_type'] + '</th>' +
                            '<th style="width: 33.33%;" >' + Hsis.dictionary[Hsis.lang]['name'] + '</th>' +
                            '<th style="width: 33.33%;" >' + Hsis.dictionary[Hsis.lang]['contact'] + '</th>' +
                            '</tr>' + '</thead>' +
                            '<tbody>' +
                            '<tr >' +
                            '<td style="width: 33.33%;">' + v.type.value[Hsis.lang] + '</td>' +
                            '<td style="width: 33.33%;">' + v.fullName + '</td>' +
                            '<td style="width: 33.33%;">' + v.contactNumber + '</td>' +
                            '</tr>' +
                            '</tbody>' +
                            '</table>' +
                            '<div class="operations-button">' +
                            '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                            '<span class="glyphicon glyphicon-list"></span>' +
                            '</div>' +
                            '<ul class="dropdown-menu student-dropdown">' +
                            '<li><a class="edit-student-relationship"  data-id = "' + v.id + '" data-fullname="' + v.fullName + '" data-contact="' + v.contactNumber + '" data-type-id="' + v.type.id + '" href="#" class="edit">' + Hsis.dictionary[Hsis.lang]['edit'] + '</a></li>' +
                            '<li><a class="erase-student-relationship" data-id="' + v.id + '" href="#" class="erase">' + Hsis.dictionary[Hsis.lang]['erase'] + '</a></li>' +
                            '</ul>' +
                            '</div>' +
                            '</div>';


                    });
                }


            } catch (err) {
                console.error(err)
            }
            return html

        },
        parseViewStudentRelationShip: function (data) {

            try {
                var html = '';

                if (data.length > 0) {
                    $.each(data, function (i, v) {

                        html += '<div class="col-md-12 for-align relationship-item">' +
                            '<table class="table-block col-md-12">' +
                            '<thead>' +
                            '<tr>' +
                            '<th style="width: 33.33%;">' + Hsis.dictionary[Hsis.lang]['relation_type'] + '</th>' +
                            '<th style="width: 33.33%;">' + Hsis.dictionary[Hsis.lang]['name'] + '</th>' +
                            '<th style="width: 33.33%;">' + Hsis.dictionary[Hsis.lang]['contact'] + '</th>' +
                            '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                            '<tr >' +
                            '<td style="width: 33.33%;">' + v.type.value[Hsis.lang] + '</td>' +
                            '<td style="width: 33.33%;">' + v.fullName + '</td>' +
                            '<td style="width: 33.33%;">' + v.contactNumber + '</td>' +
                            '</tr>' + '</tbody>' +
                            '</table>' +
                            '</div>';
                    });

                    return html;
                }

            } catch (err) {
                console.error(err)
            }


        },
        parseStudentActions: function (data) {
            try {
                var html = '';
                if (data.length > 0) {

                    var studyPlace = "";
                    var dataOrgType = "";
                    $.each(data, function (i, v) {
                        switch (v.org.typeId) {
                            case 1000057:
                                studyPlace = Hsis.dictionary[Hsis.lang]['university'];
                                dataOrgType = 'U';
                                break;
                            case 1000056:
                                studyPlace = Hsis.dictionary[Hsis.lang]['school'];
                                dataOrgType = 'M';
                                break;
                            case 1000055:
                                studyPlace = Hsis.dictionary[Hsis.lang]['college'];
                                dataOrgType = 'K';
                                break;
                            default:
                                studyPlace = Hsis.dictionary[Hsis.lang]['university'];
                                dataOrgType = 'U';
                                break;

                        }
                        html += '<div data-org-type = "' + dataOrgType + '" class="col-md-12 for-align student-action" data-status-id="' + v.status.id + '" data-id ="' + v.id + '" data-action-type = "' + v.actionType.id + ' " data-action-date = "' + v.actionDate + '">' +
                            '<table class="table-block col-md-12">' +
                            '<thead>' +
                            '<tr data-pelc-id = "' + v.id + '" data-type-id="' + v.org.typeId + '">' +
                            '<th style="width:20%;">' + studyPlace + '</th>' +
                            '<th style="width: 20%;">' + Hsis.dictionary[Hsis.lang]["start_action_type"] + '</th>' +
                            '<th style="width: 20%;">' + Hsis.dictionary[Hsis.lang]["start_date"] + '</th>' +
                            '<th style="width: 20%;">' + Hsis.dictionary[Hsis.lang]["end_action_type"] + '</th>' +
                            '<th style="width: 20%;">' + Hsis.dictionary[Hsis.lang]["end_date"] + '</th>' +
                            '<th></th>' +
                            '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                            '<tr >' +
                            '<td data-org-name style="width:20%;">' + (v.org.typeId == "1000056" ? v.org.value[Hsis.lang] : v.univer.value[Hsis.lang]) + '</td>' +
                            '<td style="width: 20%;" data-action-type >' + v.actionType.value[Hsis.lang] + ' </td>' +
                            '<td style="width: 20%;" data-action-date >' + v.actionDate + ' </td>' +
                            '<td style="width: 20%;" data-end-action-type>' + v.endActionType.value[Hsis.lang] + ' </td>' +
                            '<td style="width: 20%;" data-end-action-date>' + v.endActionDate + ' </td>' +
                            '<td></td>' +
                            '</tr>' +
                            '</tbody>' +
                            '</table>' +
                            '<div class="operations-button">' +
                            '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                            '<span class="glyphicon glyphicon-list"></span>' +
                            '</div>' +
                            '<ul class="dropdown-menu student-action student-dropdown">' +
                            '<li><a class="show-student-action"  data-id = "' + v.id + '" href="#" data-type-id = "' + v.org.typeId + '">' + Hsis.dictionary[Hsis.lang]["show"] + ' </a></li>' +

                            '<li><a class="edit-student-action" data-org-id="' + v.uniParentId + '"  data-id = "' + v.id + '" href="#" data-type-id = "' + (v.org.typeId == "1000073" ? 1000073 : v.org.typeId) + '">' + Hsis.dictionary[Hsis.lang]["edit"] + '</a></li>' +
                            '<li><a class="erase-student-action" data-org-id="' + v.uniParentId + '"  data-id = "' + v.id + '" href="#" data-type-id = "' + v.org.typeId + '">' + Hsis.dictionary[Hsis.lang]["erase"] + '</a></li>' +

                            '</ul>' +
                            '</div>' +
                            '</div>';
                    });


                } else {
                    html += '<div class="blank-panel"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>';
                }

                //console.log(html);
                return html;
            } catch (err) {
                console.error(err)
            }

        },
        parseOneStudentAction: function (data) {
            try {
                var html = '';
                var studyPlace = "";
                if (data) {

                    switch (data.org.typeId) {
                        case 1000057:
                            studyPlace = Hsis.dictionary[Hsis.lang]['university'];
                            break;
                        case 1000056:
                            studyPlace = Hsis.dictionary[Hsis.lang]['school'];
                            break;
                        case 1000055:
                            studyPlace = Hsis.dictionary[Hsis.lang]['college'];
                            break;
                        default:
                            studyPlace = Hsis.dictionary[Hsis.lang]['university'];
                            break;
                    }
                    html += '<div class="col-md-12 for-align student-action past_edu" data-status-id="' + data.status.id + '" data-org-type="' + data.org.typeId + '" data-id ="' + data.id + '" data-action-type = "' + data.actionType.id + ' " data-action-date = "' + data.actionDate + ' ">' +
                        '<table class="table-block col-md-12">' +
                        '<thead>' +
                        '<tr data-pelc-id = "' + data.id + '" data-org-type = "' + data.org.typeId + '" data-type-id="' + data.typeId + '">' + '<th style="width:145px;">' + studyPlace + '</th>' +
                        '<th style="width: 25%;" >' + Hsis.dictionary[Hsis.lang]["start_action_type"] + '</th>' +
                        '<th style="width: 25%;" >' + Hsis.dictionary[Hsis.lang]["start_date"] + '</th>' +
                        '<th style="width: 25%;" >' + Hsis.dictionary[Hsis.lang]["end_action_type"] + '</th>' +
                        '<th style="width: 25%;" >' + Hsis.dictionary[Hsis.lang]["end_date"] + '</th>' +
                        '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                        '<tr >' +
                        '<td style="width:20%;" data-org-name>' + (data.org.typeId == "1000056" ? data.org.value[Hsis.lang] : data.univer.value[Hsis.lang]) + '</td>' +
                        '<td style="width:20%;" data-action-type >' + data.actionType.value[Hsis.lang] + '</td>' +
                        '<td style="width:20%;" data-action-date >' + data.actionDate + '</td>' +
                        '<td style="width:20%;" data-end-action-type>' + data.endActionType.value[Hsis.lang] + '</td>' +
                        '<td style="width:20%;" data-end-action-date>' + data.endActionDate + '</td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '<div class="operations-button">' +
                        '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                        '<span class="glyphicon glyphicon-list"></span>' +
                        '</div>' +
                        '<ul class="dropdown-menu">' +
                        '<li><a class="edit-student-action" data-org-id="' + (data.org.typeId == "1000056" ? data.org.id : data.univer.id) + '"  data-id = "' + data.id + '" href="#" data-type-id = "' + (data.org.typeId == "1000056" ? data.org.typeId : 1000073) + '">' + Hsis.dictionary[Hsis.lang]["edit"] + '</a></li>' +
                        '<li><a class="erase-student-action" data-org-id="' + data.org.id + '"  data-id = "' + data.id + '" href="#" data-type-id = "' + data.org.typeId + '">' + Hsis.dictionary[Hsis.lang]["erase"] + '</a></li>' +
                        '</ul>' +
                        '</div>' +
                        '</div>';
                }
                if (html.length > 0 && $('#past_edu_doc').hasClass('hidden')) {
                    $('#past_edu_doc').removeClass('hidden');
                }

                return html;
            } catch (err) {
                console.error(err)
            }
        },
        parseStudents: function (data, page) {
            if (data) {
                var html = '';
                var count;

                if (page) {
                    count = $('#student_list tbody tr').length;
                } else {
                    count = 0;
                }

                var ref = data.studentList ? data.studentList : data;
                if (ref.length > 0) {
                    $.each(ref, function (i, v) {
                        var actionType = (v.endActionType.id == "0") ? v.actionType.value[Hsis.lang] : v.endActionType.value[Hsis.lang];
                        html += '<tr data-image = "' + (v.imagePath ? v.imagePath : '') + '" data-edu-pay-type="' + v.eduPayType.value[Hsis.lang] + '" data-edu-level="' + v.eduLevel.value[Hsis.lang] + '" data-edu-type="' + v.eduType.value[Hsis.lang] + '"  data-status-id="' + v.status.id + '" data-pelc-id="' + v.pelcId + '" data-id="' + v.id + '" data-firstname ="' + v.firstName + '" data-lastname ="' + v.lastName + '" data-speciality="' + (v.eduLifeCycleByOrgs ? v.eduLifeCycleByOrgs[0].name[Hsis.lang] : "") + '">' +
                            '<td>' + (++count) + '</td>' +
                            '<td style="white-space: pre-line;">' + (v.eduLifeCycleByOrgs ? v.eduLifeCycleByOrgs[0].name[Hsis.lang] : "") + '</td>' +
                            '<td style="white-space: pre-line;">' + v.lastName + ' ' + v.firstName + ' ' + v.middleName + '</td>' +
                            '<td>' + v.eduType.value[Hsis.lang] + '</td>' +
                            '<td>' + v.score + '</td>' +
                            '<td style="white-space: pre-line;">' + v.startYearName + '</td>' +
                            '<td style="white-space: pre-line;">' + v.status.value[Hsis.lang] + '</td>' +
                            '<td endActionTypeId = "' + v.endActionType.id + '" >' + v.groupName + '</td>' +
                            '</tr>';
                    });

                    if (data.studentCount > 0) {
                        $('span[data-student-count]').html(data.studentCount);
                    }

                    if ($('#main-div #load_more_div').children().length == 0) {
                        $('#main-div #load_more_div').html('<button  data-table="students" class="btn loading-margins btn-load-more">' + Hsis.dictionary[Hsis.lang]["load.more"] + '</button>');
                    }
                } else {
                    $('span[data-student-count]').html(0);
                }


                if (page) {
                    $('body').find('#student_list tbody').append(html);
                } else {
                    $('body').find('#student_list tbody').html(html);
                }


            }

        },
        parseDictype: function (data, page) {
            var html = '';
            var count;
            if (page) {
                count = ($('#users-table tbody tr').length * page) - $('#users-table tbody tr').length;
            } else {
                count = 0;
            }
            if (data) {
                $.each(data, function (i, v) {
                    html += '<tr data-id="' + v.id + '">' +
                        '<td>' + (++count) + '</td>' +

                        '<td class="hidden">' + (v.parentId != 0 ? v.parentId : 'No parent') + '</td>' +
                        '<td>' + v.value[Hsis.lang] + '</td>' +
                        '<td>' + v.code + '</td>' +
                        '<td style="float: right">' + Hsis.Service.parseOperations(Hsis.operationList, '2') + '</td>' +
                        '</tr>';
                });

                if (page) {
                    $('#users-table tbody').html(html);
                }
                else {
                    $('#users-table tbody').html(html);
                }
//                $('span.head-total').html(data.count);
//                var paginationCount = Math.ceil(data.count / 27);
//                $(".custom-pagination").empty();
//                for (var tt = 0; tt < paginationCount; tt++) {
//                    var nmm = tt + 1;
//                    if (!page) page = 1;
//                    if (page === nmm) {
//                        $(".custom-pagination").append('<li class="page-item active"><a class="page-link" href="#">' + nmm + '</a></li>');
//                    } else {
//                        $(".custom-pagination").append('<li class="page-item"><a class="page-link" href="#">' + nmm + '</a></li>');
//                    }
//                }
//                pagination(paginationCount, page - 1);

            }


        },

        parseAbroadStudents: function (data, page) {
            console.log(page)

            if (data && data.studentList) {

                var html = '';
                var count;

                if (page) {
//                    count = ($('#abroad_student_list tbody tr').length * page) - $('#abroad_student_list tbody tr').length;
                        count = ((page-1) * 20)
                } else {
                    count = 0;
                }

                if (data.studentList.length) {
                    $(".custom-pagination").show();
                    $.each(data.studentList, function (i, v) {
                        html += '<tr data-pincode = "'+v.pinCode+'" data-image = "' + (v.imagePath ? v.imagePath : '') + '" data-note = "' + v.note + '" data-abroad-number="' + v.abroadNumber + '" data-country="' + v.countryName + '" data-pelc-id="' + v.pelcId + '" data-id="' + v.id + '" data-firstname ="' + v.firstName + '" data-father-name ="' + v.middleName + '" data-lastname ="' + v.lastName + '" data-university="' + (v.eduLifeCycleByOrgs ? v.eduLifeCycleByOrgs[0].name[Hsis.lang] : "") + '">' +
                            '<td>' + (++count) + '</td>' +
                            '<td style="white-space: pre-line; text-align: center">' + v.abroadNumber + '</td>' +
                            '<td style="white-space: pre-line; text-align: center">' + (v.abroadStatus.id > 0 ? v.abroadStatus.value[Hsis.lang] : '-') + '</td>' +
                            
                            '<td style="white-space: pre-line; max-width: 330px; width: 300px;">' + v.lastName + ' ' + v.firstName + ' ' + v.middleName + '</td>' +
                            '<td style="white-space: pre-line; text-align: center">' + v.countryName + '</td>' +
                            '<td style="white-space: pre-line; text-align: center">' + (v.eduLifeCycleByOrgs ? v.eduLifeCycleByOrgs[0].name[Hsis.lang] : "") + '</td>' +
                            '<td style="white-space: pre-line; text-align: center">' + v.eduLevel.value[Hsis.lang] + '</td>' +
                            '<td style="white-space: pre-line; text-align: center">' + v.specDicrection.value[Hsis.lang] + '</td>' +
                            
//                            '<td style="white-space: pre-line;">' + (v.graduateDate ? v.graduateDate : '-') + '</td>' +
                            '<td style="white-space: pre-line; text-align: center">' + v.pinCode + '</td>' +
                                    '<td style="white-space: pre-line;">' + (v.allContact ? v.allContact : '-') + '</td>' +
                            '</tr>';
                    });

                    // if (data.studentCount > 0) {
                    //     count = data.studentCount;
                    // }

                    if (page) {
                        $('body').find('#abroad_student_list tbody').html(html);
                    } else {
                        $('body').find('#abroad_student_list tbody').html(html);
                    }


                    $('span[data-student-count]').html(data.studentCount);
                    var paginationCount = Math.ceil(data.studentCount / 20);
                    Hsis.paginationActive = true;
                    Pagination.Init(document.getElementById('pagination'), {
                        size: paginationCount,
                        page: page ? page : 1,
                        step: 3
                    }, Hsis.paginationActive);


                    /*var paginationCount = Math.ceil(data.studentCount / 27);
                    $(".custom-pagination").empty();
                    for (var tt = 0; tt < paginationCount; tt++) {
                        var nmm = tt + 1;
                        if (!page) page = 1;
                        if (page === nmm) {
                            $(".custom-pagination").append('<li class="page-item active"><a class="page-link" href="#">' + nmm + '</a></li>');
                        } else {
                            $(".custom-pagination").append('<li class="page-item"><a class="page-link" href="#">' + nmm + '</a></li>');
                        }
                    }
                    pagination(paginationCount, page - 1);*/

                } else {
                    $('span[data-student-count]').html(0);
                    $('body').find('#abroad_student_list tbody').html('');
                    Hsis.paginationActive = true;
                    Pagination.Init(document.getElementById('pagination'), {
                        size: 1,
                        page: 1,
                        step: 3
                    }, Hsis.paginationActive);
                }
                /* else {
                                    $(".custom-pagination").hide();
                                    $('span[data-student-count]').html(0);
                                }*/


            }

        },
        parseArchiveAbroadStudents: function (data, page) {
            console.log(page)

            if (data && data.studentList) {

                var html = '';
                var count;

                if (page) {
//                    count = ($('#abroad_student_list tbody tr').length * page) - $('#abroad_student_list tbody tr').length;
                        count = ((page-1) * 20)
                } else {
                    count = 0;
                }

                if (data.studentList.length) {
                    $(".custom-pagination").show();
                    $.each(data.studentList, function (i, v) {
                        html += '<tr data-pincode = "'+v.pinCode+'" data-image = "' + (v.imagePath ? v.imagePath : '') + '" data-note = "' + v.note + '" data-abroad-number="' + v.abroadNumber + '" data-country="' + v.countryName + '" data-pelc-id="' + v.pelcId + '" data-id="' + v.id + '" data-firstname ="' + v.firstName + '" data-father-name ="' + v.middleName + '" data-lastname ="' + v.lastName + '" data-university="' + (v.eduLifeCycleByOrgs ? v.eduLifeCycleByOrgs[0].name[Hsis.lang] : "") + '">' +
                            '<td>' + (++count) + '</td>' +
                            '<td style="white-space: pre-line;">' + v.abroadNumber + '</td>' +
                            '<td style="white-space: pre-line;">' + (v.abroadStatus.id > 0 ? v.abroadStatus.value[Hsis.lang] : '-') + '</td>' +
                            
                            '<td style="white-space: pre-line;">' + v.lastName + ' ' + v.firstName + ' ' + v.middleName + '</td>' +
                            '<td style="white-space: pre-line;">' + v.countryName + '</td>' +
                            '<td style="white-space: pre-line;">' + (v.eduLifeCycleByOrgs ? v.eduLifeCycleByOrgs[0].name[Hsis.lang] : "") + '</td>' +
                            '<td style="white-space: pre-line;">' + v.eduLevel.value[Hsis.lang] + '</td>' +
                            '<td style="white-space: pre-line;">' + v.specDicrection.value[Hsis.lang] + '</td>' +
                            
//                            '<td style="white-space: pre-line;">' + (v.graduateDate ? v.graduateDate : '-') + '</td>' +
                            '<td style="white-space: pre-line;">' + v.pinCode + '</td>' +
                                    '<td style="white-space: pre-line;">' + (v.allContact ? v.allContact : '-') + '</td>' +
                            '</tr>';
                    });

                    // if (data.studentCount > 0) {
                    //     count = data.studentCount;
                    // }

                    if (page) {
                        $('body').find('#abroad_archive_student_list tbody').html(html);
                    } else {
                        $('body').find('#abroad_archive_student_list tbody').html(html);
                    }


                    $('span[data-student-count]').html(data.studentCount);
                    var paginationCount = Math.ceil(data.studentCount / 20);
                    Hsis.paginationActive = true;
                    Pagination.Init(document.getElementById('pagination'), {
                        size: paginationCount,
                        page: page ? page : 1,
                        step: 3
                    }, Hsis.paginationActive);


                    /*var paginationCount = Math.ceil(data.studentCount / 27);
                    $(".custom-pagination").empty();
                    for (var tt = 0; tt < paginationCount; tt++) {
                        var nmm = tt + 1;
                        if (!page) page = 1;
                        if (page === nmm) {
                            $(".custom-pagination").append('<li class="page-item active"><a class="page-link" href="#">' + nmm + '</a></li>');
                        } else {
                            $(".custom-pagination").append('<li class="page-item"><a class="page-link" href="#">' + nmm + '</a></li>');
                        }
                    }
                    pagination(paginationCount, page - 1);*/

                } else {
                    $('span[data-student-count]').html(0);
                    $('body').find('#abroad_archive_student_list tbody').html('');
                    Hsis.paginationActive = true;
                    Pagination.Init(document.getElementById('pagination'), {
                        size: 1,
                        page: 1,
                        step: 3
                    }, Hsis.paginationActive);
                }
                /* else {
                                    $(".custom-pagination").hide();
                                    $('span[data-student-count]').html(0);
                                }*/


            }

        },


        parseQuestionnaireView: function (result) {
            $('body [data-name="name"]').html(result.firstName);
            $('body [data-name="surname"]').html(result.lastName);
            $('body [data-name="father-name"]').html(result.middleName);
            $('body [data-name="pinCode"]').html(result.pinCode);


            if (result.addresses.length > 0) {

                $.each(result.addresses, function (i, v) {
                    if (v.type.id == 1000199) {//b
                        html = 'Doğulduğu yer:   ' + v.fullAddress[Hsis.lang];
                        $('body [data-name="baddress"]').html(html);
                    } else if (v.type.id == 1000178) { //f
                        html = 'Qeydiyyatda olduğu ünvan:   ' + v.fullAddress[Hsis.lang];
                        $('body [data-name="paddress"]').html(html);
                    } else if (v.type.id == 1000198) {//t
                        html = 'Faktiki ünvan :   ' + v.fullAddress[Hsis.lang];
                        $('body [data-name="raddress"]').html(html);
                    }

                });

                $('body .fullAddress div').each(function () {
                    if ($(this).text().trim().length == 0) {
                        if ($(this).attr('data-name') === 'paddress') {
                            html = 'Qeydiyyatda olduğu ünvan:   ' + Hsis.dictionary[Hsis.lang]['no_information'];
                            $(this).text(html)
                        } else if ($(this).attr('data-name') === 'raddress') {
                            html = 'Faktiki ünvan:   ' + Hsis.dictionary[Hsis.lang]['no_information'];
                            $(this).text(html)
                        } else if ($(this).attr('data-name') === 'baddress') {
                            html = 'Doğulduğu yer:   ' + Hsis.dictionary[Hsis.lang]['no_information'];
                            $(this).text(html)
                        }


                    }
                })
//                html += '</ul>';
//                $('body .fullAddress ').html(html)
            } else {
                $('body .fullAddress label').each(function () {
                    if ($(this).text().trim().length == 0) {
                        html = '<ul style="padding-left: 0; margin-top: 0; margin-bottom: 5px;">' +
                            '<li style="list-style: none"><span style="margin-right: 5px;">' + Hsis.dictionary[Hsis.lang]['no_information'] + '</span></li>';
                        $(this).text(html)
                    }
                })
//                $('body .fullAddress ').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>')
                // $('body [data-name="endData"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }


            if (result.contacts.length > 0) {
                html = '';
                $.each(result.contacts, function (i, v) {
                    html += '<ul style="padding-left: 0; margin-top: 0; margin-bottom: 5px;">' +
                        '<li style="list-style: none"><span style="margin-right: 5px; float: left;">' + v.type.value[Hsis.lang] + ':' + '</span></li>' +
                        '<li style="list-style: none"><span style="margin-right: 5px;">' + v.contact + '</span></li>' +
                        '</ul>';
                });

                $('body .contacts ').html(html)
            } else {
                html = '<ul style="padding-left: 0; margin-top: 0; margin-bottom: 2px;">' +
                    '<li class="order-document" style="list-style: none;"><span style="margin-right: 5px;float:left;">Əlaqə vasitəsi:</span>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</li>' +
                    '</ul>'
                $('body .contacts').html(html)
//                $('body .contacts ').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>')
                // $('body [data-name="endData"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }


            /*if (result.documents.length !== 0) {
                html = '';
                $.each(result.documents, function (i, v) {

                    if (v.type != undefined && v.type.id == '1000288') {
                        html += '<ul style="padding-left: 0; margin-top: 0; margin-bottom: 2px;">' +
                            '<li style="list-style: none"><span style="margin-right: 2px;">Şəxsiyyət vəsiqəsinin seriyası və nömrəsi: </span>' + v.serial + ' / ' + v.number + '</li>' +
                            // '<li style="list-style: none"><span style="margin-right: 45%;">Seriya/nömrə: Sənədin Tipi:</span>'+'</li>'+
                            // v.type.value[Hsis.lang]+
                            /!*'<li>Verilmə tarixi:'+v.startDate+'</li>'+
                            '<li>Bitmə tarixi:'+v.endDate+'</li>'+*!/
                            '</ul>'
                    }

                });
                $('body .document_list ').html(html)
            } else {
                html = '<ul style="padding-left: 0; margin-top: 0; margin-bottom: 2px;">' +
                    '<li style="list-style: none"><span style="margin-right: 2px;">Şəxsiyyət vəsiqəsinin seriyası və nömrəsi: </span>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</li>' +

                    '</ul>'
//                $('body .document_list ').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>')
            }*/

            if (result.documents.length > 0) {
                html = '';
                $.each(result.documents, function (i, v) {
                    html += '<ul style="padding-left: 0; margin-top: 0; margin-bottom: 5px;">' +
                        // '<li class="order-document" style="list-style: none;"><span style="margin-right: 45%;">Əmrin Tipi:</span>'+v.type.value[Hsis.lang]+'</li>'+
                        '<li class="order-document" style="list-style: none;"><span style="margin-right: 2px;">Şəxsiyyət vəsiqəsinin seriyası və nömrəsi::</span>' + v.serial + ' / ' + v.number + ' - ' + v.startDate + '</li>' +
                        // '<li class="order-document" style="list-style: none;"><span style="margin-right: 45%;">Verilmə tarixi:</span>'+'</li>'+
                        // '<li class="order-document" style="list-style: none;"><span style="margin-right: 45%;">Bitmə tarixi:</span>'+v.endDate+'</li>'+
                        '</ul>'
                });
                $('body .document_list').html(html)
            } else {

                html = '<ul style="padding-left: 0; margin-top: 0; margin-bottom: 5px;">' +
                    '<li class="order-document" style="list-style: none;"><span style="margin-right: 5px;float:left;">Şəxsiyyət vəsiqəsinin seriyası və nömrəsi:</span>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</li>' +
                    '</ul>'
                $('body .document_list').html(html)
            }





            if (result.orderDocuments.length > 0) {
                html = '';
                $.each(result.orderDocuments, function (i, v) {
                    html += '<ul style="padding-left: 0; margin-top: 0; margin-bottom: 5px;">' +
                        // '<li class="order-document" style="list-style: none;"><span style="margin-right: 45%;">Əmrin Tipi:</span>'+v.type.value[Hsis.lang]+'</li>'+
                        '<li class="order-document" style="list-style: none;"><span style="margin-right: 2px;">Əmr nömrəsi və tarixi:</span>' + v.serial + ' / ' + v.number + ' - ' + v.startDate + '</li>' +
                        // '<li class="order-document" style="list-style: none;"><span style="margin-right: 45%;">Verilmə tarixi:</span>'+'</li>'+
                        // '<li class="order-document" style="list-style: none;"><span style="margin-right: 45%;">Bitmə tarixi:</span>'+v.endDate+'</li>'+
                        '</ul>'
                });
                $('body .document_order').html(html)
            } else {

                html = '<ul style="padding-left: 0; margin-top: 0; margin-bottom: 5px;">' +
                    '<li class="order-document" style="list-style: none;"><span style="margin-right: 5px;float:left;">Əmr nömrəsi və tarixi:</span>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</li>' +
                    '</ul>'
                $('body .document_order').html(html)
            }


            /*if(result.citizenship.value !== 0){
                $('body [data-name="citizen"]').html(result.citizenship.value[Hsis.lang]);
            }else{
                $('body [data-name="citizen"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if(result.pinCode.length > 0){
                $('body [data-name="status"]').html(result.pinCode);
            }else{
                $('body [data-name="status"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }*/

            if (result.gender.value !== 0) {
                $('body [data-name="gender"]').html(result.gender.value[Hsis.lang]);
            } else {
                $('body [data-name="gender"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.maritalStatus.value !== 0) {
                $('body [data-name="family-status"]').html(result.maritalStatus.value[Hsis.lang]);
            } else {
                $('body [data-name="family-status"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.birthDate.length > 0) {
                $('body [data-name="birthday"]').html(result.birthDate);
            } else {
                $('body [data-name="birthday"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.militaryService.value !== 0) {
                $('body [data-name="military"]').html(result.militaryService.value[Hsis.lang]);
            } else {
                $('body [data-name="military"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }


            if (result.relations.length > 0) {
                html = '';
                $.each(result.relations, function (i, v) {
                    html += '<ul style="padding-left: 0; margin-top: 2px; margin-bottom: 2px;">' +
                        '<li style="list-style: none;  margin-bottom: 5px;"><span style="margin-right: 2px;">Qohumluq əlaqəsi:</span>' + v.type.value[Hsis.lang] + '</li>' +
                        '<li style="list-style: none; margin-bottom: 5px;"><span style="margin-right: 2px; ">Adı:</span>' + v.fullName + '</li>' +
                        '<li style="list-style: none; margin-bottom: 5px;"><span style="margin-right: 2px; ">Əlaqə:</span>' + v.contactNumber + '</li>' +
                        '</ul>'
                });
                $('body .document_family').html(html)
            } else {
                $('body .document_family').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>')
                // $('body [data-name="endData"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }


            if (result.registrationDates.length > 0) {
                html = '';
                $.each(result.registrationDates, function (i, v) {
                    html += '<tr>' +
                        '<td>' + v.date + '</td>' +
                        '<td>' + v.note + '</td>' +
                        '</tr>'
                });
                $('body .document_registration tbody').html(html)
            } else {
                $('body .document_registration tbody').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>')
                // $('body [data-name="endData"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }


            /*  if (result.achievements.length > 0) {
                  html ='';
                  $.each(result.achievements, function (i, v) {
                      html += '<tr>'+
                          '<td>'+v.type.value[Hsis.lang]+'</td>'+
                          '<td>'+v.note+'</td>'+
                          '</tr>'
                  });
                  $('body .document_achievements tbody').html(html)
              } else {
                  $('body .document_achievements tbody').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>')
                  // $('body [data-name="endData"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
              }*/


            if (result.countryName.length > 0) {
                $('body [data-name="countryName"]').html(result.countryName);
            } else {
                $('body [data-name="countryName"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.cityName.length > 0) {
                $('body [data-name="cityName"]').html(result.cityName);
            } else {
                $('body [data-name="cityName"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.atmName.length > 0) {
                $('body [data-name="atmName"]').html(result.atmName);
            } else {
                $('body [data-name="atmName"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.eduLineId.value !== 0) {
                $('body [data-name="eduLineId"]').html(result.eduLineId.value[Hsis.lang]);
            } else {
                $('body [data-name="eduLineId"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.abroadNumber.length > 0) {
                $('body [data-name="abroadNumber"]').html(result.abroadNumber);
            } else {
                $('body [data-name="abroadNumber"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.abroadStatus.value !== 0) {
                $('body [data-name="abroadStatus"]').html(result.abroadStatus.value[Hsis.lang]);
            } else {
                $('body [data-name="abroadStatus"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.actionDate.length > 0) {
                $('body [data-name="actionDate"]').html(result.actionDate);
            } else {
                $('body [data-name="actionDate"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.graduateDate.length > 0) {
                $('body [data-name="graduateDate"]').html(result.graduateDate);
            } else {
                $('body [data-name="graduateDate"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.eduPeriod.value !== 0) {
                $('body [data-name="eduPeriod"]').html(result.eduPeriod);
            } else {
                $('body [data-name="eduPeriod"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.eduLangId.value !== 0) {
                $('body [data-name="eduLangId"]').html(result.eduLangId.value[Hsis.lang]);
            } else {
                $('body [data-name="eduLangId"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.eduLevel.value !== 0) {
                $('body [data-name="eduLevel"]').html(result.eduLevel.value[Hsis.lang]);
            } else {
                $('body [data-name="eduLevel"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.specDicrection.value !== 0) {
                $('body [data-name="specDirection"]').html(result.specDicrection.value[Hsis.lang]);
            } else {
                $('body [data-name="specDirection"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

            if (result.spec.value !== 0) {
                $('body [data-name="spec"]').html(result.spec.value[Hsis.lang]);
            } else {
                $('body [data-name="spec"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }


            if (result.eduLifeCycleByOrgs.length > 0) {
                $('body [data-name="eduLifeCycleByOrg"]').html(result.eduLifeCycleByOrgs[0].name[Hsis.lang]);
            } else {
                $('body [data-name="eduLifeCycleByOrg"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }


            if (result.pelcAction.length > 0) {
                html = '';
                $.each(result.pelcAction, function (i, v) {
                    html += '<ul style="padding-left: 0; margin-top: 0; margin-bottom: 2px;">' +
                        '<li style="list-style: none; margin-bottom: 5px;"><span style="margin-right: 2px;">Təhsil müəssisəsi:</span>' + v.org.value[Hsis.lang] + '</li>' +
                        '<li style="list-style: none; margin-bottom: 5px;"><span style="margin-right: 2px;">Başlama hərəkəti: </span>' + v.actionType.value[Hsis.lang] + '</li>' +
                        '<li style="list-style: none; margin-bottom: 5px;"><span style="margin-right: 2px;">Başlama tarixi: </span>' + v.actionDate + '</li>' +
                        '<li style="list-style: none; margin-bottom: 5px;"><span style="margin-right: 2px;">Bitmə hərəkəti: </span>' + v.endActionType.value[Hsis.lang] + '</li>' +
                        '<li style="list-style: none; margin-bottom: 5px;"><span style="margin-right: 2px;">Bitmə tarixi:</span>' + v.endActionDate + '</li>' +
                        '</ul>'
                });
                $('body .finish_schools').html(html)
            } else {
                $('body .finish_schools').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>')
            }


            /* if (result.pelcAction.length > 0) {
                 html ='<ul style="padding-left: 0; margin-top: 0; margin-bottom: 2px;">';
                 $.each(result.pelcAction, function (i, v) {
                     html += '<li style="list-style: none"><span style="margin-right: 2%;">'+v.type.value[Hsis.lang]+v.fullAddress[Hsis.lang]+':</span></li>';
                 });
                 html+=  '</ul>';
                 $('body .fullAddress ').html(html)
             } else {
                 $('body .fullAddress ').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>')
                 // $('body [data-name="endData"]').html('<div class="blank-panel survey-view"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
             }*/


        },
        parseScholarshipPlan: function (plan) {
            if (plan) {
                var html = '';
                $.each(plan, function (i, v) {
                    html += '<div data-id="' + v.id + '" data-count="' + v.scholarshipPlan + '" data-year="' + v.eduYearId + '" class="col-md-12 for-align scholarship-item">' +
                        '<table class="table-block col-md-12">' + '<thead>' +
                        '<tr>' +
                        '<th>' + Hsis.dictionary[Hsis.lang]["edu_year"] + '</th>' +
                        '<th>' + Hsis.dictionary[Hsis.lang]["place_count"] + '</th>' + '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                        '<tr>' +
                        '<td data-year>' + v.eduYearName + '</td>' + '<td data-count>' + v.scholarshipPlan + '</td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '<div class="operations-button">' +
                        '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                        '<span class="glyphicon glyphicon-list"></span>' + '</div>' +
                        '<ul class="dropdown-menu">' + '<li>' +
                        '<a edit-scholarship="" data-id="' + v.id + '" data-year-name="' + v.eduYearName + '" data-year="' + v.eduYearId + '" data-count="' + v.scholarshipPlan + '"  href="#" class="edit">' + Hsis.dictionary[Hsis.lang]["edit"] + '</a>' +
                        '</li>' +
                        '<li>' +
                        '<a remove-scholarship="" data-id="' + v.id + '" data-year-name="' + v.eduYearName + '" data-year="' + v.eduYearId + '" data-count="' + v.scholarshipPlan + '"  href="#" class="edit">' + Hsis.dictionary[Hsis.lang]["erase"] + '</a>' +
                        '</li>' +
                        '</ul>' +
                        '</div>' +
                        '</div>';
                });
                $('#scholarplan_div').html(html);
            }
        },
        parseApplyAndGradPlan: function (plan) {
            if (plan) {
                var html = '';
                $.each(plan, function (i, v) {
                    html += '<div data-id="' + v.id + '" graduate-count="' + v.graduatePlan + '" apply-count="' + v.applyPlan + '" data-year="' + v.eduYearId + '" class="col-md-12 for-align applyandgrad-item">' +
                        '<table class="table-block col-md-12">' + '<thead>' +
                        '<tr>' +
                        '<th>' + Hsis.dictionary[Hsis.lang]["edu_year"] + '</th>' +
                        '<th>' + Hsis.dictionary[Hsis.lang]["apply_plan"] + '</th>' + '<th>' + Hsis.dictionary[Hsis.lang]["graduate_plan"] + '</th>' + '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                        '<tr>' +
                        '<td data-year>' + v.eduYearName + '</td>' +
                        '<td apply-count>' + v.applyPlan + '</td>' +
                        '<td graduate-count>' + v.graduatePlan + '</td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '<div class="operations-button">' +
                        '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                        '<span class="glyphicon glyphicon-list"></span>' +
                        '</div>' +
                        '<ul class="dropdown-menu">' +
                        '<li>' +
                        '<a edit-applyandgrad="" data-id="' + v.id + '" data-year-name="' + v.eduYearName + '" data-year="' + v.eduYearId + '" graduate-count="' + v.graduatePlan + '" apply-count="' + v.applyPlan + '"  href="#" class="edit">' + Hsis.dictionary[Hsis.lang]["edit"] + '</a>' +
                        '</li>' +
                        '<li>' +
                        '<a remove-applyandgrad="" data-id="' + v.id + '"  href="#" >' + Hsis.dictionary[Hsis.lang]["erase"] + '</a>' +
                        '</li>' +
                        '</ul>' +
                        '</div>' +
                        '</div>';
                });
                $('#applyandgradplan_div').html(html);
            }
        },
        operation_1000057: function () {  // student view
            $('#main-div').load('partials/student_view.html', function () {

                Hsis.Proxy.getStudentDetails(localStorage.personId, function (data) {
                    if (data) {
                        console.log(data.image, data.image.path)
                        var html = '';
                        $('body .input-file-con .new-img-con').fadeIn(1)
                        if (data.image && data.image.path) {

                            $('body .input-file-con .new-img-con img').attr('src', Hsis.urls.HSIS + 'students/image/' + data.image.path + '?token=' + Hsis.token + '&size=200x200&' + Math.random());

                            $('body .input-file-con .new-img-con img').on('error', function (e) {
                                $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                            });
                        } else {
                            $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                        }

                        $('#firstname').val(data.firstName).attr('disabled', 'disabled');
                        $('#lastname').val(data.lastName).attr('disabled', 'disabled');
                        $('#middlename').val(data.middleName).attr('disabled', 'disabled');
                        $('#pincode').val(data.pinCode).attr('disabled', 'disabled');
                        $('#disability_degree').text(data.disabilityDegree.value[Hsis.lang]).attr('disabled', 'disabled').attr('data-id', data.disabilityDegree.id);

                        setTimeout(function () {
                            Hsis.Service.parseEditStudentAddress(data);
                            $('.contact-info .panel-body').html(Hsis.Service.parseViewStudentContact(data));
                        }, 1000);


                        if (data.contacts.length > 0) {
                            setTimeout(function () {
                                $('.contact-info .panel-body').html(Hsis.Service.parseViewStudentContact(data));
                            }, 1000);
                        }
                        $('#citizenship').find('option[value="' + data.citizenship.id + '"]').attr('selected', 'selected');
                        $('#citizenship').attr('disabled', 'disabled');
                        $('#gender').find('option[value="' + data.gender.id + '"]').attr('selected', 'selected');
                        $('#gender').attr('disabled', 'disabled');
                        $('#marital_status').find('option[value="' + data.maritalStatus.id + '"]').attr('selected', 'selected');
                        $('#marital_status').attr('disabled', 'disabled');
                        $('#social_status').find('option[value="' + data.socialStatus.id + '"]').attr('selected', 'selected');
                        $('#social_status').attr('disabled', 'disabled');
                        $('#orphan_degree').find('option[value="' + data.orphanDegree.id + '"]').attr('selected', 'selected');
                        $('#orphan_degree').attr('disabled', 'disabled');
                        $('#military_status').find('option[value="' + data.militaryService.id + '"]').attr('selected', 'selected');
                        $('#military_status').attr('disabled', 'disabled');
                        $('#nationality').find('option[value="' + data.nationality.id + '"]').attr('selected', 'selected');
                        $('#nationality').attr('disabled', 'disabled');
                        $('.date-birthdate').val(data.birthDate).attr('disabled', 'disabled');
                        $('#main-div').attr('data-id', data.id);
                        $('#main-div').attr('data-pelc-id', data.pelcId);


                        var personal = 'personal';
                        var academic = 'academic';
                        var school = 'school';

                        if (data.documents.length > 0) {
                            $('.add-doc-block .panel-body').html(Hsis.Service.parseViewStudentDocument(data.documents, personal));
                        }

                        if (data.pelcDocuments.length > 0) {
                            $('.activity_name #acad_doc_add').html(Hsis.Service.parseViewStudentDocument(data.pelcDocuments, academic));
                        } else {
                            $('#acad_doc_add').html('<div class="blank-panel"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
                        }

                        $('.activity_name #school_doc_add').html(Hsis.Service.parseViewStudentDocument(data.schoolDocuments, school));

                        $('.student-relationships-div .panel-body').html(Hsis.Service.parseViewStudentRelationShip(data.relations));

                        $('.action-students .panel-body').html(Hsis.Service.parseStudentActions(data.pelcAction));
                        $('#main-div .edit-student-action').parent('li').remove();
                        $('#main-div .erase-student-action').parent('li').remove();

                        $('#action_type').find('option[value="' + data.actionType.id + '"]').attr('selected', 'selected');
                        $('#action_type').attr('disabled', 'disabled');
                        $('#edu_line').find('option[value="' + data.eduLineId.id + '"]').attr('selected', 'selected');
                        $('#edu_line').attr('disabled', 'disabled');
                        $('#edu_lang').find('option[value="' + data.eduLangId.id + '"]').attr('selected', 'selected');
                        $('#edu_lang').attr('disabled', 'disabled');
                        $('#edu_type').find('option[value="' + data.eduType.id + '"]').attr('selected', 'selected');
                        $('#edu_type').attr('disabled', 'disabled');
                        $('#edu_pay_type').find('option[value="' + data.eduPayType.id + '"]').attr('selected', 'selected');
                        $('#edu_pay_type').attr('disabled', 'disabled');
                        $('.second-info-date').val(data.actionDate).attr('disabled', 'disabled');
                        $('.student-card-number').val(data.studentCardNo).attr('disabled', 'disabled');
                        $('#edu_level').find('option[value="' + data.eduLevel.id + '"]').attr('selected', 'selected');
                        $('#edu_level').attr('disabled', 'disabled');


                        var orderType;
                        if (data.endActionType.id != 0) {
                            $('.in-action').addClass('hidden');
                            $('.out-action').removeClass('hidden');
                            $('.add-out-action').addClass('hidden');
                            $('.add-edulifecycle, #edu_org, #past_edu_doc_info').addClass('out-action-type');
                            $('#out-action-date').val(data.endActionDate);
                            Hsis.Proxy.loadDictionariesByTypeId('1000025', 1000259, function (actionType) {
                                var html = Hsis.Service.parseDictionaryForSelect(actionType);
                                $('#main-div .student-action-type').html(html);
                                $('#main-div .student-action-type').find('option[value="' + data.endActionType.id + '"]').prop('selected', true);
                                $('#main-div #student-academic-note').html(data.note);
                                Hsis.Proxy.loadDictionariesByTypeId(1000050, 0, function (reasons) {
                                    var html = Hsis.Service.parseDictionaryForSelect(reasons);
                                    $('#outReasonId').html(html);
                                    $('#outReasonId').find('option[value="' + data.reasonId + '"]').prop('selected', true);
                                    $('.out-action :input').attr('disabled', 'disabled');
                                });

                            });

                            orderType = orderType = data.endActionType.id;

                            Hsis.Proxy.getOrderDocumentsByType(orderType, Hsis.structureId, function (order) {
                                if (order) {
                                    var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]["select"] + '</option>';
                                    var st = '';
                                    $.each(order, function (i, v) {
                                        st = v.startDate == null ? '' : '-' + (v.startDate).toString().slice(6, 10);
                                        html += '<option value="' + v.id + '">' + v.serial + v.number + st + '</option>';
                                    });
                                    $('#order').html(html);
                                    $('#main-div #order').find('option[value="' + data.orderId + '"]').attr('selected', 'selected').trigger('change');
                                    $('#main-div #order').attr('disabled', 'disabled');
                                }
                            });


                        } else {

                            $('#student-academic-action-date').val(data.endActionDate);
                            Hsis.Proxy.loadDictionariesByTypeId('1000025', 1000259, function (actionType) {
                                var html = Hsis.Service.parseDictionaryForSelect(actionType);
                                $('#main-div .student-action-type').html(html);
                                $('#main-div .student-action-type').find('option[value="' + data.endActionType.id + '"]').prop('selected', true);
                                $('#main-div #student-academic-note').html(data.note);
                                Hsis.Proxy.loadDictionariesByTypeId(1000050, 0, function (reasons) {
                                    var html = Hsis.Service.parseDictionaryForSelect(reasons);
                                    $('#reasonId').find('option[value="' + data.reasonId + '"]').prop('selected', true);
                                    $('.out-action :input').attr('disabled', 'disabled');
                                });

                            });
                            $('.in-action').removeClass('hidden');
                            if (data.status.id != 1000340) {
                                $('.add-out-action').addClass('hidden');
                            } else {
                                $('.add-out-action').removeClass('hidden');
                            }

                            orderType = data.actionType.id;
                        }

                        Hsis.Proxy.getOrderDocumentsByType(data.actionType.id, Hsis.structureId, function (order) {
                            if (order) {
                                var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]["select"] + '</option>';
                                var st = '';
                                $.each(order, function (i, v) {
                                    st = v.startDate == null ? '' : '-' + (v.startDate).toString().slice(6, 10);
                                    html += '<option value="' + v.id + '">' + v.serial + v.number + st + '</option>';
                                });
                                $('#order').html(html);
                                $('#main-div #order').find('option[value="' + data.orderId + '"]').attr('selected', 'selected').trigger('change');
                                $('#main-div #order').attr('disabled', 'disabled');
                            }
                        });

                        $.each(data.eduLifeCycleByOrgs, function (i, v) {
                            if (v.type.id == 1000057 || v.type.id == 1000604) {
                                Hsis.Proxy.getFilteredStructureList(Hsis.structureId, v.type.id, 0, function (specialities) {
                                    if (specialities) {
                                        var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                        $.each(specialities, function (k, l) {
                                            html += '<option value="' + l.id + '">' + l.name[Hsis.lang] + '</option>'
                                        })
                                        $('#main-div #orgId').html(html);
                                    }
                                    $('#orgId').find('option[value="' + v.id + '"]').attr('selected', 'selected');
                                    $('#orgId').attr('disabled', 'disabled');
                                });

                            } else if (v.type.id == 1000056) {
                                $('.edit-graduated-school').attr('data-pelc-id', v.pelcId);
                                Hsis.Proxy.getFilteredStructureList(Hsis.structureId, '1000056', v.addressTreeId, function (schools) {
                                    var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                    if (schools) {
                                        $.each(schools, function (k, j) {
                                            html += '<option value="' + j.id + '">' + j.name[Hsis.lang] + '</option>';
                                        })
                                    }
                                    ;
                                    $('#schoolId').html(html);
                                    $('#schoolId').find('option[value = "' + v.id + '"]').attr("selected", "selected");
                                    $('#schoolId').attr('disabled', 'disabled');
                                    $('#graduatedDate').val(v.actionDate).attr('disabled', 'disabled');
                                })
                            } else if (v.type.id == 1002306) {
                                $('#main-div #edu_level').find('option[value="1000604"]').prop('selected', true);
                                var eduLevel = 1000604;
                                Hsis.Proxy.getFilteredStructureList(Hsis.structureId, eduLevel, 0, function (specialities) {
                                    if (specialities) {
                                        var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                        $.each(specialities, function (i, v) {
                                            html += '<option value="' + v.id + '">' + v.name[Hsis.lang] + '</option>'
                                        });
                                        $('#main-div #orgId').html(html);
                                        $('#main-div #orgId').find('option[value="' + v.type.parentId + '"]').prop('selected', true);
                                        $('#main-div #edit_uni_action_orgId').html(html);
                                        Hsis.Proxy.getFilteredStructureList(v.type.parentId, '1002306', 0, function (subSpeciality) {
                                            if (subSpeciality) {
                                                var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                                $.each(subSpeciality, function (i, g) {
                                                    html += '<option value="' + g.id + '">' + g.name[Hsis.lang] + '</option>'
                                                })
                                                $('#sub_speciality').html(html);
                                                $('#sub_speciality').find('option[value="' + v.id + '"]').prop('selected', true);
                                                $('.sub_speciality').removeClass('hidden');
                                                $('#sub_speciality').attr('disabled', 'disabled');
                                                $('#orgId').attr('disabled', 'disabled');
                                            } else {
                                                $('.sub_speciality').addClass('hidden');
                                            }
                                        })
                                    }
                                });

                            }
                        })

                        $('#score').val(data.score).attr('disabled', 'disabled');


                        var pelcId = data.pelcId;
                        Hsis.Proxy.getStudentEduPlanSubject(pelcId, function (data) {
                            if (data && data.data) {
                                var html;
                                $('body .eduplan_name').text(data.data.name)
                                $.each(data.data.allSubjects, function (i, v) {

                                    var html = '<tr data-subject-id = "' + v.id + '" data-id = "' + v.pelcMark.id + '" data-pelc-id = "' + pelcId + '">' +
                                        '<td>' + (++i) + '</td>' +
                                        '<td>' + v.name + '</td>' +
                                        '<td>' + v.code + '</td>' +
                                        '<td><select class="form-control subject_type" disabled="disabled"></select></td>' +
                                        '<td><input name="graduatePoint" class="form-control graduate_point" disabled="disabled"></td>' +
                                        '</tr>'
                                    $('#main-div #subject_list tbody').append(html)
                                    Hsis.Proxy.loadDictionariesByTypeId('1000097', 0, function (maritalStatus) {
                                        var html = Hsis.Service.parseDictionaryForSelect(maritalStatus);
                                        $('#main-div #subject_list tbody tr[data-id = "' + v.pelcMark.id + '"] select').html(html);
                                        $('#main-div #subject_list tbody tr[data-id = "' + v.pelcMark.id + '"] select').val(v.pelcMark.graduateType.id);
                                    });
                                    $('#main-div #subject_list tbody tr[data-id = "' + v.pelcMark.id + '"] input').val(v.pelcMark.graduateMark > 0 ? v.pelcMark.graduateMark : '');

                                })
                            }
                        })
                    }


                });
            });
        },
        operation_1001362: function () {
            // student view
            $('#main-div').load('partials/abroad_student_view.html', function () {
                Hsis.Proxy.getAbroadStudentDetailsByPelcId(localStorage.pelcId, function (data) {
                    if (data) {
                        var html = '';
                        if (data.image && data.image.path) {
                            $('body .input-file-con .new-img-con').fadeIn(1);
                            $('body .input-file-con .new-img-con img').attr('src', Hsis.urls.HSIS + 'students/image/' + data.image.path + '?token=' + Hsis.token + '&size=200x200&' + Math.random());

                            $('body .input-file-con .new-img-con img').on('error', function (e) {
                                $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                            });
                        }

                        $('body #firstname').text(data.firstName);
                        $('body #lastname').text(data.lastName);
                        $('body #middlename').text(data.middleName);
                        $('body input#pincode').val(data.pinCode);
                        // $('body #pincode').text(data.pinCode);
                        $('body #pincode').prev("label").text(data.pinCode);
                        $('.get-iamas-photo').trigger('click');


                        if (data.addresses.length > 0) {
                            setTimeout(function () {
                                Hsis.Service.parseEditStudentAddress(data);
                            }, 1000);
                        }


                        if (data.contacts.length > 0) {
                            setTimeout(function () {
                                $('.contact-info .panel-body').html(Hsis.Service.parseViewStudentContact(data));
                            }, 1000);
                        }

                        $('#birthdate').text(data.birthDate);

                        $('body #citizenship').text(data.citizenship.value[Hsis.lang]);
                        $('#gender').text(data.gender.value[Hsis.lang]);

                        $('#marital_status').text(data.maritalStatus.value[Hsis.lang]);

                        $('#social_status').text(data.socialStatus && data.socialStatus.id ? data.socialStatus.value[Hsis.lang] : '-');

                        $('#orphan_degree').text(data.orphanDegree && data.orphanDegree.id ? data.orphanDegree.value[Hsis.lang] : '-');

                        $('#military_status').text(data.militaryService && data.militaryService.id ? data.militaryService.value[Hsis.lang] : '-');

                        $('#disability_degree').text(data.disabilityDegree && data.disabilityDegree.id ? data.disabilityDegree.value[Hsis.lang] : '-');

                        $('#nationality').text(data.nationality && data.nationality.id ? data.nationality.value[Hsis.lang] : '-');

                        $('#main-div').attr('data-id', data.id);
                        $('#main-div').attr('data-pelc-id', data.pelcId);


                        var personal = 'personal';
                        var academic = 'academic';
                        var school = 'school';

                        if (data.documents.length > 0) {
                            $('.add-doc-block .panel-body').html(Hsis.Service.parseViewStudentDocument(data.documents, personal));
                        }
                        if (data.orderDocuments.length > 0) {
                            $('body #order_doc_add').html(Hsis.Service.parseStudentOrder(data.orderDocuments, personal));
                        }

                        if (data.pelcDocuments && data.pelcDocuments.length > 0) {
                            $('.activity_name #acad_doc_add').html(Hsis.Service.parseViewStudentDocument(data.pelcDocuments, academic));
                        } else {
                            $('#acad_doc_add').html('<div class="blank-panel"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
                        }


                        $('.student-relationships-div .panel-body').html(Hsis.Service.parseViewStudentRelationShip(data.relations));

                        $('.action-students .panel-body').html(Hsis.Service.parseStudentActions(data.pelcAction));
                        $('#main-div .edit-student-action').parent('li').remove();
                        $('#main-div .erase-student-action').parent('li').remove();

                        $('#main-div #edu_line').text(data.eduLineId.value[Hsis.lang]);

                        $('#main-div #edu_lang1').html(data.eduLangId.value[Hsis.lang]);

                        $('#main-div #abroad_edu_level').text(data.eduLevel.value[Hsis.lang]);
                        $('#main-div #action_date').text(data.actionDate);
                        $('#main-div #private_work_number').text(data.abroadNumber);
                        $('#main-div #graduate_date').text(data.graduateDate);
                        $('#main-div #edu-period').text(data.eduPeriod);

                        $('#main-div #speciality').text(data.spec.value[Hsis.lang]);

                        // $('#main-div #spec_direction').text(data.spec.value[Hsis.lang]);
                        $('#main-div #spec_direction').text(data.specDicrection.value[Hsis.lang]);

                        $('#main-div #note').text(data.note);

                        $('#main-div #status').text(data.abroadStatus.value[Hsis.lang]);


                        $('#main-div #foreign_country').text(data.countryName);
                        $('#main-div #foreign_city').text(data.cityName);
                        $('#main-div #foreign_university').text(data.atmName);


                        if (data.achievements) {
                            Hsis.Service.parseViewAbroadStudentAchievement(data.achievements)
                        }
                        if (data.achievements) {
                            Hsis.Service.parseViewAbroadStudentRegistrationDate(data.registrationDates);
                        }
                    }
                });
            });
        },

        parseOrder: function (data, page) {
            if (data) {
                var html = '';
                var count;
                if (page) {
//                    count = ($('.main-content-upd #order-list tbody tr').length * page) - $('.main-content-upd #order-list tbody tr').length;
                        count = ((page-1) * 20)
                } else {
                    count = 0;
                }
                $.each(data.list, function (i, v) {
                    html += '<tr data-id="' + v.id + '" data-type-id="' + v.type.id + '" data-status-id="' + v.status.id + '">' +
                        '<td>' + (++count) + '</td>' +
                        '<td style="white-space:pre-line;">' + v.type.value[Hsis.lang] + '</td>' +
                        '<td>' + v.serial + '</td>' +
                        '<td>' + v.number + '</td>' +
                        '<td>' + v.startDate + '</td>' +
                        '<td>' + v.status.value[Hsis.lang] + '</td>' +
                        '</tr>';
                });


                $('span[data-group-count]').html(data.count);
                var paginationCount = Math.ceil(data.count / 20);
                Hsis.paginationActive = true;
                Pagination.Init(document.getElementById('pagination'), {
                    size: paginationCount,
                    page: page ? page : 1,
                    step: 3
                }, Hsis.paginationActive);

                /*var paginationCount = Math.ceil(data.count / 27);
                $(".custom-pagination").empty();
                for (var tt = 0; tt < paginationCount; tt++) {
                    var nmm = tt + 1;
                    if (!page) page = 1;
                    if (page === nmm) {
                        $(".custom-pagination").append('<li class="page-item active"><a class="page-link" href="#">' + nmm + '</a></li>');
                    } else {
                        $(".custom-pagination").append('<li class="page-item"><a class="page-link" href="#">' + nmm + '</a></li>');
                    }
                }
                pagination(paginationCount, page - 1);*/
                if (page) {
                    $('body').find('#order-list tbody').html(html);
                } else {
                    $('body').find('#order-list tbody').html(html);
                }

                /*if ($('#main-div #load_more_div').children().length == 0) {
                    $('#main-div #load_more_div').html('<button  data-table="order_module" class="btn loading-margins btn-load-more">' + Hsis.dictionary[Hsis.lang]["load.more"] + '</button>');
                }*/
            }
        },

        //    New Istifadeciler modulu HTP-de
        parseUsers: function (data, page) {
            var html = '';
            if (data.data && data.data.userList) {
                var count;

                if (page) {
//                    count = ($('#htpUsers tbody tr').length * page) - $('#htpUsers tbody tr').length;
                        count = ((page-1) * 20)
                }
                else {
                    count = 0;
                }
                $.each(data.data.userList, function (i, v) {
                    html += '<tr data-image-id="' + v.image.id + '" data-is-blocked="' + v.account.blocked + '" data-id="' + v.account.id + '">' +
                        '<td>' + (++count) + '</td>' +
                        '<td style="white-space:pre-line;">' + v.orgName.value[Hsis.lang] + '</td>' +
                        '<td>' + v.account.username + '</td>' +
                        '<td>' + v.name + ' ' + v.surname + ' ' + v.patronymic + '</td>' +
                        '<td>' + v.account.role.value[Hsis.lang] + '</td>' +
                        '<td style="white-space:pre-line;">' + v.account.lastAction.updateDate + '</td>' +
                        '<td><div class="' + (v.sessionActive ? "online" : "offline") + ' status"></div><span>' + (v.sessionActive ? Hsis.dictionary[Hsis.lang]['online'] : Hsis.dictionary[Hsis.lang]['offline']) + '</span></td>' +
                        '<td><div class="' + (v.account.blocked ? "offline" : "online") + ' status"></div><span>' + (v.account.blocked ? Hsis.dictionary[Hsis.lang]['blocked'] : Hsis.dictionary[Hsis.lang]['unblocked']) + '</span></td>' +
                        '<td style="float: right">' + Hsis.Service.parseOperations(Hsis.operationList, '2') + '</td>' +
                        '</tr>';
                });

                $('#main-div #user_count').text(data.data.count);
                var paginationCount = Math.ceil(data.count / 20);
                Hsis.paginationActive = true
                Pagination.Init(document.getElementById('pagination'), {
                    size: paginationCount,
                    page: page ? page : 1,
                    step: 3
                }, Hsis.paginationActive);
                /*var paginationCount = Math.ceil(data.data.count / 25);
                $(".custom-pagination").empty();
                for (var tt = 0; tt < paginationCount; tt++) {
                    var nmm = tt + 1;
                    if (!page) page = 1;
                    if (page === nmm) {
                        $(".custom-pagination").append('<li class="page-item active"><a class="page-link" href="#">' + nmm + '</a></li>');
                    } else {
                        $(".custom-pagination").append('<li class="page-item"><a class="page-link" href="#">' + nmm + '</a></li>');
                    }
                }
                pagination(paginationCount, page - 1);*/

            }
            if (page) {
                $('#htpUsers tbody').html(html);
            }
            else {
                $('#htpUsers tbody').html(html);
            }


        },


        operation_1000058: function () { // teacher view
            $('#main-div').load('partials/teacher_view.html', function () {
                Hsis.Proxy.getTeacherDetails(localStorage.personId, function (data) {
                    var html = '';

                    if (data.image && data.image.path) {
                        $('body .input-file-con .new-img-con').fadeIn(1)
                        $('body .input-file-con .new-img-con img').attr('src', Hsis.urls.HSIS + 'teachers/image/' + data.image.path + '?token=' + Hsis.token + '&size=200x200&' + Math.random());

                        $('body .input-file-con .new-img-con img').on('error', function (e) {
                            $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                        });
                    }


                    $('#firstname').val(data.firstName).attr('disabled', 'disabled');
                    $('#lastname').val(data.lastName).attr('disabled', 'disabled');
                    $('#middlename').val(data.middleName).attr('disabled', 'disabled');
                    $('#pincode').val(data.pinCode).attr('disabled', 'disabled');

                    $('#citizenship').find('option[value="' + data.citizenship.id + '"]').attr('selected', 'selected');
                    $('#citizenship').attr('disabled', 'disabled')
                    $('#gender').find('option[value="' + data.gender.id + '"]').attr('selected', 'selected');
                    $('#gender').attr('disabled', 'disabled');
                    $('#marital_status').find('option[value="' + data.maritalStatus.id + '"]').attr('selected', 'selected');
                    $('#marital_status').attr('disabled', 'disabled');
                    $('#social_status').find('option[value="' + data.socialStatus.id + '"]').attr('selected', 'selected');
                    $('#social_status').attr('disabled', 'disabled');
                    $('#orphan_degree').find('option[value="' + data.orphanDegree.id + '"]').attr('selected', 'selected');
                    $('#orphan_degree').attr('disabled', 'disabled');
                    $('#disability_degree').find('option[value="' + data.disabilityDegree.id + '"]').attr('selected', 'selected');
                    $('#disability_degree').attr('disabled', 'disabled');
                    $('#military_status').find('option[value="' + data.militaryService.id + '"]').attr('selected', 'selected');
                    $('#military_status').attr('disabled', 'disabled');
                    $('#nationality').find('option[value="' + data.nationality.id + '"]').attr('selected', 'selected');
                    $('#nationality').attr('disabled', 'disabled');
                    $('.date-birthdate').val(data.birthDate).attr('disabled', 'disabled');
                    $('#main-div').attr('data-id', data.id);
                    $('#main-div').attr('data-pwlc-id', data.pwlcId);
                    $('#main-div').attr('data-type', 'emp-view');

                    setTimeout(function () {
                        Hsis.Service.parseEditStudentAddress(data);
                    }, 1000);

                    $('body .contact-info .panel-body').html(Hsis.Service.parseViewStudentContact(data));
                    var personal = 'personal';
                    var work = 'work';

                    if (data.documents.length > 0) {
                        $('.add-doc-block .panel-body').html(Hsis.Service.parseViewTeacherDocument(data.documents, personal));
                    }

                    if (data.pwlcDocuments.length > 0) {
                        $('.activity_name #work_doc_add').html(Hsis.Service.parseViewTeacherDocument(data.pwlcDocuments, work));
                    }

                    if (data.languages.length > 0) {
                        $('#append_languages').html(Hsis.Service.parseViewTeacherLanguages(data));
                    }

                    if (data.subjects.length > 0) {
                        $('#append_subjects').html(Hsis.Service.parseViewTeacherSubjects(data));
                    }


                    $('.edu_info .edu-info-block').html(Hsis.Service.parseViewTeacherEduLifeCycle(data));

                    $('.edit-academic-degree-info .panel-body').html(Hsis.Service.parseViewTeacherAcademicDegree(data.academicDegrees));
                    $('.edit-research-history-info .panel-body').html(Hsis.Service.parseViewTeacherAcademicActivity(data.academicActivitys));

                    console.log(data);
                    Hsis.Service.parseWorkLifeCycle(data.workActions);
                    $('li .edit-work-action,li .erase-work-action').remove();

                });
            });

        },
        parseWorkLifeCycle: function (data) {
            if (data) {
                var html = '';
                $.each(data, function (i, v) {
                    html += '<div class="col-md-12 for-align work-action" org-parent="' + v.parentOrgType + '" data-status-id="1000341" data-id="' + v.id + '" start-action="' + v.actionType.id + '" start-date="' + v.actionDate + '" end-date="' + (v.endActionDate != null ? v.endActionDate : '') + '" end-action ="' + v.endActionType.id + '" card-no="' + (v.cardNo != null ? v.cardNo : '') + '" org="' + v.org.id + '" teaching="' + v.teaching + '" staff-type="' + v.staffType.id + '" position="' + v.position.id + '" note="' + (v.note != null ? v.note : '') + '" >' +
                        '<table class="table-block col-md-12">' +
                        '<thead>' +
                        '<tr>' +
                        '<th style="width:145px;">' + Hsis.dictionary[Hsis.lang]["university"] + '</th>' +
                        '<th>' + Hsis.dictionary[Hsis.lang]["start_action_type"] + ' </th>' +
                        '<th>' + Hsis.dictionary[Hsis.lang]["start_date"] + ' </th>' +
                        '<th>' + Hsis.dictionary[Hsis.lang]["end_action_type"] + ' </th>' +
                        '<th>' + Hsis.dictionary[Hsis.lang]["end_date"] + ' </th>' +
                        '<th></th>' +
                        '</tr>' +
                        '</thead>' +
                        '<tbody>' +
                        '<tr>' + '<td org-name="" style="width:145px;">' + v.university.value[Hsis.lang] + '</td>' +
                        '<td start-action="">' + v.actionType.value[Hsis.lang] + '</td>' +
                        '<td start-date="">' + v.actionDate + '</td>' +
                        '<td end-action="">' + v.endActionType.value[Hsis.lang] + '</td>' +
                        '<td end-date="">' + (v.endActionDate != null ? v.endActionDate : '') + '</td>' +
                        '<td></td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '<div class="operations-button">' +
                        '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                        '<span class="glyphicon glyphicon-list"></span>' +
                        '</div>' +
                        '<ul class="dropdown-menu">' +
                        '<li><a class="show-work-action"  href="#" university-name="' + v.university.value[Hsis.lang] + '" start-action-name="' + v.actionType.value[Hsis.lang] + '" teaching-name="" end-action-name="' + v.endActionType.value[Hsis.lang] + '" org-name="' + v.org.value[Hsis.lang] + '" position-name="' + v.position.value[Hsis.lang] + '" staff-name="' + v.staffType.value[Hsis.lang] + '">' + Hsis.dictionary[Hsis.lang]["show"] + '</a></li>' +
                        (v.endActionType.id == 0 ? ('<li><a class="edit-work-action"  href="#">' + Hsis.dictionary[Hsis.lang]["edit"] + '</a></li>' +
                            '<li><a class="erase-work-action" data-page="edit" >' + Hsis.dictionary[Hsis.lang]["erase"] + '</a></li>') : '') +
                        '</ul>' +
                        '</div>' +
                        '</div>';
                });
                $('#work_action_block').html(html);
            }
        },
        parseStudentsInAbroad: function (data, page) {
            if (data) {
                var html = '';
                var count;

                if (page) {
                    count = $('.main-content-upd #foreign_student_list tbody tr').length;
                } else {
                    count = 0;
                }

                $.each(data.list, function (i, v) {
                    html += '<tr data-edu-level="' + v.eduLevel.value[Hsis.lang] + '" data-parent-workplace ="' + v.parentsWorkPlace + '" data-contact = "' + v.contact + '" data-address = "' + v.address + '"  data-birthdate ="' + v.birthdate + '" data-edu-type="' + v.eduType.value[Hsis.lang] + '"  data-start-year="' + v.eduStartYear + '" data-end-year="' + v.eduEndYear + '" data-note="' + v.note + '" data-fullname ="' + v.fullname + '"  data-speciality="' + v.specialty[Hsis.lang] + '">' +
                        '<td>' + (++count) + '</td>' +
                        '<td style="white-space: pre-line;">' + v.university[Hsis.lang] + '</td>' +
                        '<td>' + v.specialty[Hsis.lang] + '</td>' +
                        '<td style="white-space: pre-line;">' + v.fullname + '</td>' +
                        '<td>' + v.gender.value[Hsis.lang] + '</td>' +
                        '</tr>';
                });

                if (data.count > 0) {
                    $('span[data-student-count]').html(data.count);
                }

                if ($('#main-div #load_more_div').children().length == 0) {
                    $('#main-div #load_more_div').html('<button  data-table="foreign_students" class="btn loading-margins btn-load-more">' + Hsis.dictionary[Hsis.lang]["load.more"] + '</button>');
                }


                if (page) {
                    $('body').find('#foreign_student_list tbody').append(html);
                } else {
                    $('body').find('#foreign_student_list tbody').html(html);
                }


            } else {
                $('span[data-student-count]').html(0);
            }

        },
        parseForeignStudents: function (data, page) {
            if (data) {
                var html = '';
                var count;

                if (page) {
                    count = $('#foreign_student_list tbody tr').length;
                } else {
                    count = 0;
                }

                if (data.studentList.length > 0) {
                    $.each(data.studentList, function (i, v) {

                        var actionType = (v.endActionType.id == "0") ? v.actionType.value[Hsis.lang] : v.endActionType.value[Hsis.lang];
                        html += '<tr  data-edu-level="' + v.eduLevel.value[Hsis.lang] + '" data-edu-type="' + v.eduType.value[Hsis.lang] + '"  data-pelc-id="' + v.pelcId + '" data-id="' + v.id + '" data-firstname ="' + v.firstName + '" data-lastname ="' + v.lastName + '" >' +
                            '<td>' + (++count) + '</td>' +
                            '<td style="white-space: pre-line;">' + v.lastName + ' ' + v.firstName + ' ' + v.middleName + '</td>' +
                            '<td style="white-space: pre-line;">' + v.citizenship.value[Hsis.lang] + '</td>' +
                            '<td style="white-space: pre-line;">' + v.universitet[Hsis.lang] + '</td>' +
                            '<td style="white-space: pre-line;">' + v.specialty[Hsis.lang] + '</td>' +
                            '<td>' + v.eduLevel.value[Hsis.lang] + '</td>' +
                            '<td>' + v.eduType.value[Hsis.lang] + '</td>' +
                            '<td>' + v.eduLineId.value[Hsis.lang] + '</td>' +
                            '<td>' + v.startYearName + '</td>' +
                            '<td>' + v.eduCourseYear + '</td>' +
                            '<td>' + v.pinCode + '</td>' +
                            '<td>' + v.myiNumber + '</td>' +
                            '<td>' + actionType + '</td>' +
                            '</tr>';
                    });

                    if (data.studentCount > 0) {
                        $('span[data-student-count]').html(data.studentCount);
                    }

                    if ($('#main-div #load_more_div').children().length == 0) {
                        $('#main-div #load_more_div').html('<button  data-table="students" class="btn loading-margins btn-load-more">' + Hsis.dictionary[Hsis.lang]["load.more"] + '</button>');
                    }
                } else {
                    $('span[data-student-count]').html(0);
                }


                if (page) {
                    $('body').find('#foreign_student_list tbody').append(html);
                } else {
                    $('body').find('#foreign_student_list tbody').html(html);
                }


            }

        },
        parseStudentsWithoutOrder: function (data, page) {
            var html = '';
            var count = 0;
            if (page) {
//                count = ($('#student_list_without tbody tr').length * page) - $('#student_list_without tbody tr').length;
                count = (page-1) * 20;
            } else {
                count = 0;
            }
            if (data && data.studentList.length > 0) {
                $.each(data.studentList, function (i, v) {
                    html += '<tr data-id = "' + v.pelcId + '">' +
                        '<td>' + (++count) + '</td>' +
                        '<td>' + v.firstName + ' ' + v.lastName + ' ' + v.middleName + '</td>' +
                        '<td style="white-space: pre-line;">' + v.curOrgId.value[Hsis.lang] + '</td>' +
                        '<td><div>' +
                        '<input name="studentsId" type="checkbox" value="' + v.pelcId + '">' +
                        '</div></td>' +
                        '</tr>';
                });
                if (data.studentCount > 0) {
                    count = data.studentCount;
                }
                $('[data-student-count]').html(count);
//                var paginationCount = Math.ceil(count / 20);
//                Hsis.paginationActive = true
//                Pagination.Init(document.getElementById('pagination1'), {
//                    size: paginationCount,
//                    page: page ? page : 1,
//                    step: 3
//                }, Hsis.paginationActive);
                
                if (page) {
                    $('body').find('#students_without_order tbody').html(html);
                } else {
                    $('body').find('#students_without_order tbody').html(html);
                }

            } else {
                $('body').find('#students_without_order tbody').html('');
            }


            if (data.studentCount > 0) {
                count = data.studentCount;
            }


            /*if ($('#main-div #students_without_order').find('#load_more_div').children().length == 0) {
                $('#main-div #students_without_order').find('#load_more_div').html('<button  data-table="students-without-order" class="btn loading-margins btn-load-more">' + Hsis.dictionary[Hsis.lang]["load.more"] + '</button>');
            }*/

            /*else {
               $('#main-div #students_without_order').find('#load_more_div').html('');

           }*/
            // $('[data-student-count]').html(count);
            /*if (page) {
                $('#student_list_without tbody').append(html);
            } else {
                $('#student_list_without tbody').html(html);
            }*/
            $('body').find('a[href=#tab1]').attr('data-count', count);

        },


        parseStudentsWithOrder: function (data, page, parseType) {
            var html = '';
            var count = 0;
            parseType = $('#main-div').attr('data-order-type');
            if (page) {
//                count = ($('#students_with_order tbody tr').length * page) - $('#students_with_order tbody tr').length;
                count = (page - 1) *20;
            } else {
                count = 0;
            }
            if (data && data.studentList.length > 0) {

                $.each(data.studentList, function (i, v) {
                    html += '<tr data-id ="' + v.pelcId + '">' +
                        '<td>' + (++count) + '</td>' +
                        '<td>' + v.firstName + ' ' + v.lastName + ' ' + v.middleName + '</td>' +
                        '<td style="white-space: pre-line;">' + v.curOrgId.value[Hsis.lang] + '</td>' +
                        '<td>' + ((parseType && parseType == "view") ? '' : '<a href="" class="removeStudent"><i class="fa fa-remove" style="font-size:24px;color:red"></i></a>') + '</td>' +
                        '</tr>';
                });


                if (data.studentCount > 0) {
                    count = data.studentCount;
                }

                if (page) {
                    $('body').find('#students_with_order tbody').html(html);
                } else {
                    $('body').find('#students_with_order tbody').html(html);
                }
                
                $('span[data-student-count]').html(count);
//                var paginationCount = Math.ceil(count / 20);
//                Hsis.paginationActive = true
//                Pagination.Init(document.getElementById('pagination2'), {
//                    size: paginationCount,
//                    page: page ? page : 1,
//                    step: 3
//                }, Hsis.paginationActive);
//                $(".custom-pagination").empty();
//                for (var tt = 0; tt < paginationCount; tt++) {
//                    var nmm = tt + 1;
//                    if (!page) page = 1;
//                    if (page === nmm) {
//                        $(".custom-pagination").append('<li class="page-item active"><a class="page-link" href="#">' + nmm + '</a></li>');
//                    } else {
//                        $(".custom-pagination").append('<li class="page-item"><a class="page-link" href="#">' + nmm + '</a></li>');
//                    }
//                }
//                pagination(paginationCount, page - 1);
                /*if ($('#main-div #students_with_order').find('#load_more_div').children().length == 0) {
                    $('#main-div #students_with_order').find('#load_more_div').html('<button data-table="students-with-order" ' + (parseType && parseType == "view" ? 'data-parsetype="view"' : '') + '  class="btn loading-margins btn-load-more">' + Hsis.dictionary[Hsis.lang]["load.more"] + '</button>');
                }*/
            } else {
                $('body').find('#students_with_order tbody').html('');
            }
            /* else {
                            $('#main-div #students_with_order').find('#load_more_div').html('');
                        }*/
            // $('[data-student-count]').html(count);
            /* if (page) {
                 $('#students_with_order tbody').append(html);
             } else {
                 $('#students_with_order tbody').html(html);
             }*/
            $('body').find('a[href=#tab2]').attr('data-count', count);


        },
        parseForeignRelation: function (data, page) {
            if (data) {
                var html = '';
                var count;
                if (page) {
                    count = $('.main-content-upd #foreign_relation_list tbody tr').length;
                } else {
                    count = 0;
                }
                $.each(data, function (i, v) {
                    html += '<tr data-id="' + v.id + '">' +
                        '<td>' + (++count) + '</td>' +
                        '<td>' + v.country.value[Hsis.lang] + '</td>' +
                        '<td>' + v.company.value[Hsis.lang] + '</td>' +
                        '<td>' + v.startDate + '</td>' +
                        '<td>' + v.endDate + '</td>' +
                        '</tr>';
                });

                if (page) {
                    $('body').find('#foreign_relation_list tbody').append(html);
                } else {
                    $('body').find('#foreign_relation_list tbody').html(html);
                }

                if ($('#main-div #load_more_div').children().length == 0) {
                    $('#main-div #load_more_div').html('<button  data-table="foreignRelations" class="btn loading-margins btn-load-more">' + Hsis.dictionary[Hsis.lang]["load.more"] + '</button>');
                }
            }
        },
        parseAbroadStudentAchievement: function (data) {
            if (data) {
                var html = '';
                $.each(data, function (i, v) {
                    html += '<div class="col-md-12 for-align archievement-item">' +
                        '<table class="table-block col-md-12">' +
                        '<thead>' +
                        '<tr><th style="width: 50%">Tipi</th>' +
                        '<th style="width: 50%">Qeyd</th>' +
                        '</tr></thead>' +
                        '<tbody>' +
                        '<tr data-id="' + v.id + '">' +
                        '<td style="width: 50%;" >' + v.type.value[Hsis.lang] + '</td>' +
                        '<td style="width: 50%;" >' + v.note + ' </td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '<div class="operations-button">' +
                        '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span' +
                        ' class="glyphicon glyphicon-list"></span></div>' +
                        '<ul class="dropdown-menu student-dropdown">' +
                        '<li><a href="#" class="remove-archievement" data-id = "' + v.id + '">' + Hsis.dictionary[Hsis.lang]['erase'] + '</a></li>' +
                        '</ul>' +
                        '</div>' +
                        '</div>';
                });
                $('#main-div .archievement-panel .blank-panel').hide();
                $('#main-div .archievement-panel').prepend(html);
                $('#main-div #archievement_note').val('')
                $('#main-div #archievement_type').val(0);

            }
        },
        parseAbroadStudentRegistrationDate: function (data) {
            if (data) {
                var html = '';
                $.each(data, function (i, v) {
                    html += '<div class="col-md-12 for-align registration-date-item">' +
                        '<table class="table-block col-md-12">' +
                        '<thead>' +
                        '<tr><th style="width: 25%">Tarix</th>' +
                        '<th style="width: 25%">Yaşayış xərci</th>' +
                        '<th style="width: 25%">Yol xərci</th>' +
                        '<th style="width: 25%">Qeyd</th>' +
                        '</tr></thead>' +
                        '<tbody>' +
                        '<tr data-id="' + v.id + '">' +
                        '<td style="width: 25%;" >' + v.date + '</td>' +
                        '<td style="width: 25%;" >' + v.liveCost + ' </td>' +
                        '<td style="width: 25%;" >' + (v.roadCost ? v.roadCost : '') + ' </td>' +
                        '<td style="width: 25%;" >' + (v.note ? v.note : '') + ' </td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '<div class="operations-button">' +
                        '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span' +
                        ' class="glyphicon glyphicon-list"></span></div>' +
                        '<ul class="dropdown-menu">' +
                        '<li><a href="#" class="remove-registration-date" data-id = "' + v.id + '">' + Hsis.dictionary[Hsis.lang]['erase'] + '</a></li>' +
                        '</ul>' +
                        '</div>' +
                        '</div>';
                });
                $('#main-div .registration-date-panel .blank-panel').hide();
                $('#main-div .registration-date-panel').prepend(html);
                $('#main-div #registration_date').val('');
                $('#main-div #registration_date_note').val('');

            }
        },
        parseViewAbroadStudentAchievement: function (data) {
            if (data) {
                var html = '';
                $.each(data, function (i, v) {
                    html += '<div class="col-md-12 for-align archievement-item">' +
                        '<table class="table-block col-md-12">' +
                        '<thead>' +
                        '<tr><th style="width: 50%">Tipi</th>' +
                        '<th style="width: 50%">Qeyd</th>' +
                        '</tr></thead>' +
                        '<tbody>' +
                        '<tr data-id="' + v.id + '">' +
                        '<td style="width: 50%;" >' + v.type.value[Hsis.lang] + '</td>' +
                        '<td style="width: 50%;" >' + v.note + ' </td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '</div>';
                });
                $('#main-div .archievement-panel .blank-panel').hide();
                $('#main-div .archievement-panel').prepend(html);

            }
        },
        parseViewAbroadStudentRegistrationDate: function (data) {
            if (data) {
                var html = '';
                $.each(data, function (i, v) {
                    html += '<div class="col-md-12 for-align registration-date-item">' +
                        '<table class="table-block col-md-12">' +
                        '<thead>' +
                        '<tr><th style="width: 25%">Tarix</th>' +
                        '<th style="width: 25%">Qeyd</th>' +
                        '<th style="width: 25%">Yaşayış xərci</th>' +
                        '<th style="width: 25%">Yol xərci</th>' +
                        '</tr></thead>' +
                        '<tbody>' +
                        '<tr data-id="' + v.id + '">' +
                        '<td style="width: 25%;" >' + v.date + '</td>' +
                        '<td style="width: 25%;" >' + (v.note ? v.note : '') + ' </td>' +
                        '<td style="width: 25%;" >' + (v.liveCost ? v.liveCost : '') + ' </td>' +
                        '<td style="width: 25%;" >' + (v.roadCost ? v.roadCost : '') + ' </td>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>' +
                        '</div>';
                });
                $('#main-div .registration-date-panel .blank-panel').hide();
                $('#main-div .registration-date-panel').prepend(html);

            }
        },
        parseDictionaryByMultiParents: function (data, groupHtml) {
            var parents = [];
            var grouphObj = '';

            if (data) {
                $.each(data, function (i, v) {
                    if ($.inArray(v.parentId, parents) == -1) {
                        parents.push(v.parentId);
                        grouphObj = $('<optgroup label="' + v.parentName[Hsis.lang] + '"></optgroup>');
                        groupHtml.append(grouphObj);
                    }
                    var opt = $('<option value="' + v.id + '">' + v.value[Hsis.lang] + '</option>');
                    grouphObj.append(opt.get(0).outerHTML);

                });

            }

        },
        parseStudentsWithoutDiplom: function (data, page) {
            var html = '';
            var count = 0;
            if (page) {
                count = $('#students_with_order tbody tr').length;
            } else {
                count = 0;
            }
            if (data.studentList.length > 0) {
                $.each(data.studentList, function (i, v) {
                    html += '<tr>' +
                        '<td>' + (++i) + '</td>' +
                        '<td>' + v.specialty[Hsis.lang] + '</td>' +
                        '<td>' + v.lastName + ' ' + v.firstName + ' ' + v.middleName + '</td>' +
                        '<td><label><input type="checkbox"  name="pelcId" value="' + v.pelcId + '"></label></td>' +
                        '</tr>'
                });

                if (data.studentCount > 0) {
                    $('span[data-student-count]').html(data.studentCount);
                }

                if ($('#main-div #load_more_div [data-table="students-without-diplom"]').length == 0) {
                    $('#main-div #load_more_div').html('<button  data-table="students-without-diplom" class="btn loading-margins btn-load-more">' + Hsis.dictionary[Hsis.lang]["load.more"] + '</button>');
                }

            } else {
                $('span[data-student-count]').html(0);
            }
            if (page) {
                $('#main-div #graduate-student-list tbody').append(html);
            } else {
                $('#main-div #graduate-student-list tbody').html(html);
            }

        },
        parseStudentsWithDiplom: function (data, page) {
            var html = '';
            var count = 0;
            if (page) {
                count = $('#students_with_diplom tbody tr').length;
            } else {
                count = 0;
            }
            if (data.studentList && data.studentList.length > 0) {

                $.each(data.studentList, function (i, v) {
                    console.log(v);
                    html += '<tr data-pelc-id="' + v.student.pelcId + '" data-diplom-id="' + v.diplom.id + '" data-id ="' + v.id + '">' +
                        '<td>' + (++i) + '</td>' +
                        '<td>' + v.student.specialty[Hsis.lang] + '</td>' +
                        '<td>' + v.student.lastName + ' ' + v.student.firstName + ' ' + v.student.middleName + '</td>' +
                        '<td class="take-diplom">' + v.diplom.serial + ' - ' + v.diplom.startNumber + '</td>' +
                        '<td class="remove-student-diplom"><i class="fa fa-remove" style="font-size:24px;color:red"></i></td>' +
                        '</tr>'
                })

                if (data.studentCount > 0) {
                    $('span[data-student-count]').html(data.studentCount);
                }

                if ($('#main-div #load_more_div').children().length == 0) {
                    $('#main-div #load_more_div').html('<button  data-table="students-with-diplom" class="btn loading-margins btn-load-more">' + Hsis.dictionary[Hsis.lang]["load.more"] + '</button>');
                }


            } else {
                $('span[data-student-count]').html(0);
            }

            if (page) {
                $('#main-div #students_with_diplom tbody').append(html);
            } else {
                $('#main-div #students_with_diplom tbody').html(html);
            }

        },


        parseUnregisteredUsers: function (data, type, page) {
            var html = '';
            var count;

            if (page) {
                count = $('.content-part #unregistered-users-table tbody tr').length;
            }
            else {
                count = 0;
            }
            $.each(data, function (i, v) {
                html += '<tr>' +
                    '<td>' + (++count) + '</td>' +
                    '<td>' + v.name + ' ' + v.surname + ' ' + v.patronymic + '</td>' +
                    '<td>' + v.gender.value[Hsis.lang] + '</td>' +
                    '<td>' + v.birthdate + '</td>' +
                    '<td>' +
                    '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                    '<span class="glyphicon glyphicon-list"></span>' +
                    '</div>' +
                    '<ul class="dropdown-menu ">' +
                    '<li><a id="registered-user-a" data-type = "' + type + '"data-org-id = "' + v.orgId + '" data-pin = "' + v.pin + '" data-id = "' + v.id + '" data-fname="' + v.name + '" data-lname="' + v.surname + '" data-mname="' + v.patronymic + '" data-birthdate = "' + v.birthdate + '" data-gender = "' + v.gender.id + '" href="#" >' + Hsis.dictionary[Hsis.lang]["sign_up"] + '</a></li>' +
                    '</ul>' +
                    '</td>' +
                    '</tr>';
            });

            if (page) {
                $('.content-part').find('#unregistered-users-table tbody').html(html);
            }
            else {
                $('.content-part').find('#unregistered-users-table tbody').html(html);
            }

        },


    },
    Validation: {
        validateEmail: function (email) {
            var re = Hsis.REGEX.email;
            return re.test(email);
        },
        validateNumber: function (number) {
            var re = Hsis.REGEX.number;
            return re.test(number);
        },
        validatePhoneNumber: function (phone) {
            var re = Hsis.REGEX.phone;
            return re.test(phone);
        },
        validateDecimalNumber: function (number) {
            var re = Hsis.REGEX.decimalNumber;
            return re.test(number);
        },
        validateRequiredFields: function (requiredAttr) {
            var required = $('[' + requiredAttr + ']');

            var requiredIsEmpty = false;

            required.each(function (i, v) {
                if (v.value.length == 0 || (requiredAttr !== 'default-teaching-required' && requiredAttr !== 'default-required' && v.value == 0 && $(this).is('select'))) {
                    $(v).addClass('blank-required-field');

                    if (!requiredIsEmpty) {

                        $.notify(Hsis.dictionary[Hsis.lang]['required_fields'], {
                            type: 'warning'
                        });
                        requiredIsEmpty = true;
                    }

                    $(v).on('focusout', function (e) {
                        if (v.value.length && $(v).hasClass('blank-required-field')) {
                            $(v).removeClass('blank-required-field');
                            $(v).off('focusout');
                        }
                    });
                }
            });

            return !requiredIsEmpty;
        },
        checkFile: function (contentType, fileType) {
            var result = contentType.match(fileType);
            if (result) {
                return true;
            } else {

                return false;
            }
        }
    },
    WebSocket: {


        /*        connect: function () {
                    var name = $('.namename').val();
                    // var socket = new SockJS(Hsis.urls.SOCKET + '/chat');
                    Hsis.stompClient = Stomp.over(socket);
                    Hsis.stompClient.connect({'Login': Hsis.token}, function (frame) {
                        var sessionId = /\/([^\/]+)\/websocket/.exec(socket._transport.url)[1];
        //                    console.log("connected, session id: " + sessionId);
                        Hsis.stompClient.subscribe('/topic/messages/' + sessionId, function (messageOutput) {
                            $('body .notification').removeClass('hidden');

                        });
                    });
                },*/
        /*disconnect: function (a) {
            if (Hsis.stompClient != 0) {
                Hsis.stompClient.disconnect();
            }
            if (a == 1) {
                Hsis.WebSocket.connect();
            }
        },*/
    },

};
var fileTypes = {
    IMAGE_CONTENT_TYPE: '^(' + Hsis.REGEX.IMAGE_EXPRESSION + ')$',
    FILE_CONTENT_TYPE: '^(' + Hsis.REGEX.PDF + ')$',
//    FILE_CONTENT_TYPE: '^(' + Hsis.REGEX.TEXT + '|' + Hsis.REGEX.PDF + '|' + Hsis.REGEX.XLS + '|' + Hsis.REGEX.XLSX + '|' + Hsis.REGEX.DOC + '|' + Hsis.REGEX.DOCX + '|' + Hsis.REGEX.IMAGE_EXPRESSION + ')$'
    
};


