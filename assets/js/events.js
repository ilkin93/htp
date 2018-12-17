/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(function () {

//    $(".iframeUpdate").attr("src","http://192.168.1.78:8082/UnibookShared/#/profile-edit?token=" + Hsis.token);

    var chosenLang;

    if (document.cookie.indexOf('lang') == -1) {
        chosenLang = Hsis.lang;
    } else {
        chosenLang = Hsis.getCookie('lang');
    }


    $('.language-buttons a').each(function () {
        if ($(this).attr('id') == chosenLang) {
            $(this).parent('li').prependTo($('.language-buttons ul'));

        }
    });

    $('.main-content').on('click', '.language-buttons a', function (e) {
        try {
            e.preventDefault();
            var lang = $(this).attr('id');

            if (lang != 'en' && lang != 'ru') {
                lang = 'az';
            }

            $('.language-buttons a').each(function () {
                $(this).removeAttr('data-chosen');
            });

            document.cookie = "lang=" + lang;
            window.location.reload();
        } catch (err) {
            console.error(err);
        }

    });

    if (Hsis.token == '0') {
        Hsis.initToken('tk');
    }


    Hsis.loadLanguagePack('az');
    Hsis.loadLanguagePack('en');
    Hsis.loadLanguagePack('ru');

    setTimeout(function () {
        Hsis.i18n();
        $.fn.datepicker.defaults.language = Hsis.lang;
        $.extend(jconfirm.pluginDefaults, {
            confirmButton: Hsis.dictionary[Hsis.lang]['ok'],
            cancelButton: Hsis.dictionary[Hsis.lang]['close'],
            title: Hsis.dictionary[Hsis.lang]['warning']
        });
    }, 1000);


    $('#logoutForm').attr("action", Hsis.urls.ROS + "logout");
    $('#logoutForm input[name="token"]').val(Hsis.token);


    Hsis.Proxy.getProfile();

    // Hsis.Proxy.loadApplications();

    $('body .iframe-tab-1').attr('src', Hsis.urls.NOTIFICATION + Hsis.token);

    Hsis.Proxy.loadModules(function (modules) {
        $('ul.module .mod-con').prepend(Hsis.Service.parseModules(modules));
        $('.module-list').html(Hsis.Service.parseModules(modules));
        var currModule = Hsis.initCurrentModule('currModule');
        if (localStorage.button != undefined) {
            Hsis.Service[localStorage.button]();
            localStorage.removeItem('button');

        } else {
            if (currModule != "") {
                Hsis.currModule = currModule;
                var module = $('ul.module-list').find('.module-block[data-id="' + Hsis.currModule + '"] a');

                if (module.length) {
                    module.click();
                } else {
                    $('ul.module-list').find('.module-block a').eq(0).click();
                }
            } else {
                $('ul.module-list').find('.module-block a').eq(0).click();
            }
        }


    });


    $('ul.module-list').on('click', '.module-block a', function (e) {
        Hsis.paginationActive = true;
        NProgress.done();
        NProgress.remove();
        var obj = $(this).parents('li');
        var title = obj.attr('title');
        var id = obj.attr('data-id');
        $('ul.module-list').find('li').removeClass('active');
        $(this).parents('li').addClass('active');
        try {

            if (obj.attr('data-check') !== '1') {
                NProgress.start();
                Hsis.currModule = obj.attr('data-id');
                document.cookie = "currModule=" + Hsis.currModule;


                $('.main-content-upd').load('partials/module_' + Hsis.currModule + '.html?' + Math.random(), function () {
                    $('#main-div #buttons_div').attr('title', 'Ümumi əməliyyatlar');
                    history.pushState({page: id}, null, '#' + title);
                    $('ul.module-list').find('li').removeAttr('data-check');
                    obj.attr('data-check', 1);

                });
            } else {
                return false
            }


            var moduleName = $(this).find('span').html();
            var html = '<li>' +
                '<span style="color:white;">' + moduleName + '</span>' +
                '</li>';
            $('ul.breadcrumb').html(html);
            Hsis.tempData.form = '';
            $('#main-div').removeAttr('data-citizenship');

        } catch (err) {
            console.error(err);
        }
    });
    $('body').on('click', '#jstree .jstree-anchor', function (e) {
        try {
            var div = $(this).parent().closest('div').attr('id');
            $('.main-content-upd #buttons_div').attr('data-id', $(this).parent().attr('id'));
            var node = $("#" + div).jstree('get_selected', true);

            $('.main-content-upd #buttons_div').attr('parent-node', node[0].parent);
            var nodeId = node[0].id;
            Hsis.node = node;
            var about = '';
            var dicType;
            var name;
            var type;
            var shortName;
            var startDate;
            var endDate;
            Hsis.tempData.org = $(this).parents('li').attr('id');

            $.each(Hsis.array, function (i, v) {
                if (Hsis.tempData.org == v.id) {

                    about = v.about;
                    dicType = v.dicType;
                    name = v.name;
                    type = v.type;
                    shortName = v.shortName;
                    startDate = v.startDate;
                    endDate = v.endDate;
                }
            });

            $('.main-row').find('.div-info').html(about);
            $('dd[name]').html(name);
            $('dd[short-name]').html(shortName);
            $('dd[type]').html(type);
            $('dd[start-date]').html(startDate);
            $('dd[closed-date]').html(endDate);
            $('.main-content-upd #buttons_div').attr('data-dicType-id', dicType);
            if (div == "jstree") {
                Hsis.Proxy.getOrgAdministrativeData(nodeId, function (data) {
                    if (data) {
                        var html = '<dl class="dl-horizontal">' +
                            '<dt><span data-i18n="add_date">Əlavə edilmə tarixi</span>:</dt>' +
                            '<dd add-date="">' + data.createDate + '</dd>' +
                            '<dt><span data-i18n="created_by">Əlavə edən</span>:</dt>' +
                            '<dd created-by="">' + data.createdBy + '</dd>' +
                            '<dt><span data-i18n="updated_date">Yenilənmə tarixi</span>:</dt>' +
                            (data.lastUpdate != null ? '<dd update-date="">' + data.lastUpdate + '</dd>' +
                                '<dt><span data-i18n="updated_by">Yeniləyən</span>:</dt>' +
                                '<dd updated-by="">' + data.updatedBy + '</dd>' : '') +
                            '</dl>';
                        $('#priviledged').html(html);
                    }

                })
            }
            $('body').find('.tree-div-9').removeClass('col-sm-12').addClass('col-sm-9');
            $('body').find('.tree-div-3').fadeIn();

        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1000067', function () {
        try {

            var id = $(this).parents('#buttons_div').attr('data-id');
            var parentId = $(this).parents('#buttons_div').attr('data-dictype-id');
            var uniDicId = 1000073;
            var type = 0;
            if (!id) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_parent_node'], {
                    type: 'warning'
                });
                return false;
            }

            Hsis.Proxy.loadDictionariesListByParentId(parentId, function (data) {
                if (data) {
                    if (data.code == Hsis.statusCodes.OK) {
                        $.each(data.data, function (i, v) {
                            if (v.id == uniDicId) {
                                type++;
                            }
                        })
                    }
                }

                if (type > 0) {
                    $('.add-new .search-scroll').load('partials/orgtree_modal.html', function () {
                        $('#main-div .university-type').removeClass('hidden');
                        $('#main-div .scholarshipPlan').removeClass('hidden');
                        $('#main-div .orgedulang').removeClass('hidden');
                        $('#main-div .orgcontact').removeClass('hidden');
                        $('#main-div .org_address').removeClass('hidden');
                        $('#typeUniversity').attr('required', 'required');
                        $('body').find('#confirmOrgTree').text(Hsis.dictionary[Hsis.lang]['add']);
                        $('#main-div #confirmOrgTree').attr('data-org-id', uniDicId);
                        $('body').find('#parentId').val(id);
                        $('body').find('.add-new').css('right', '0');
                    });
                } else {
                    $.notify(Hsis.dictionary[Hsis.lang]['cant_add_univer_to_struc'], {
                        type: 'danger'
                    });
                }

            });


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1000066', function () {
        try {

            var id = $(this).parents('#buttons_div').attr('data-id');
            var parentId = $(this).parents('#buttons_div').attr('data-dictype-id');
            var schoolDicId = 1000056;
            var type = 0;
            if (!id) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_parent_node'], {
                    type: 'danger'
                });
                return false;
            }

            Hsis.Proxy.loadDictionariesListByParentId(parentId, function (data) {
                if (data) {
                    if (data.code == Hsis.statusCodes.OK) {
                        $.each(data.data, function (i, v) {
                            if (v.id == schoolDicId) {
                                type++;
                            }
                        })
                    }
                }

                if (type > 0) {
                    $('.add-new .search-scroll').load('partials/orgtree_modal.html', function () {
                        $('#main-div .org_address').removeClass('hidden');
                        $('body').find('#confirmOrgTree').text(Hsis.dictionary[Hsis.lang]['add']);
                        $('#main-div #confirmOrgTree').attr('data-org-id', schoolDicId);
                        $('body').find('#parentId').val(id);
                        $('body').find('.add-new').css('right', '0');
                    });
                } else {
                    $.notify(Hsis.dictionary[Hsis.lang]['cant_add_school_to_struc'], {
                        type: 'danger'
                    });
                }

            })


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1000074', function () {
        try {

            var id = $(this).parents('#buttons_div').attr('data-id');
            var parentId = $(this).parents('#buttons_div').attr('data-dictype-id');
            var filialDicId = 1000418;
            var type = 0;
            if (!id) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_parent_node'], {
                    type: 'warning'
                });
                return false;
            }

            Hsis.Proxy.loadDictionariesListByParentId(parentId, function (data) {
                if (data) {
                    if (data.code == Hsis.statusCodes.OK) {
                        $.each(data.data, function (i, v) {
                            if (v.id == filialDicId) {
                                type++;
                            }
                        })
                    }
                }

                if (type > 0) {
                    $('.add-new .search-scroll').load('partials/orgtree_modal.html', function () {
                        $('body').find('#confirmOrgTree').text(Hsis.dictionary[Hsis.lang]['add']);
                        $('#main-div .org_address').removeClass('hidden');
                        $('#main-div #confirmOrgTree').attr('data-org-id', filialDicId);
                        $('body').find('#parentId').val(id);
                        $('body').find('.add-new').css('right', '0');
                    });
                } else {
                    $.notify(Hsis.dictionary[Hsis.lang]['cant_add_branch_to_struc'], {
                        type: 'danger'
                    });
                }

            })


        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '#operation_1000068', function () {
        try {

            var id = $(this).parents('#buttons_div').attr('data-id');
            var parentId = $(this).parents('#buttons_div').attr('data-dictype-id');
            var facultyDicId = 1000083;
            var type = 0;
            if (!id) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_parent_node'], {
                    type: 'warning'
                });
                return false;
            }

            Hsis.Proxy.loadDictionariesListByParentId(parentId, function (data) {
                if (data) {
                    if (data.code == Hsis.statusCodes.OK) {
                        $.each(data.data, function (i, v) {
                            if (v.id == facultyDicId) {
                                type++;
                            }
                        })
                    }
                }

                if (type > 0) {
                    $('.add-new .search-scroll').load('partials/orgtree_modal.html', function () {
                        $('#main-div .org-structure').remove();
                        $('body').find('#confirmOrgTree').text(Hsis.dictionary[Hsis.lang]['add']);
                        $('#main-div #confirmOrgTree').attr('data-org-id', facultyDicId);
                        $('body').find('#parentId').val(id);
                        $('body').find('.add-new').css('right', '0');
                    });
                } else {
                    $.notify(Hsis.dictionary[Hsis.lang]['cant_add_faculty_to_struc'], {
                        type: 'danger'
                    });
                }

            })


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1000069', function () {
        try {

            var id = $(this).parents('#buttons_div').attr('data-id');
            var parentId = $(this).parents('#buttons_div').attr('data-dictype-id');
            var kafedraDicId = 1000074;
            var type = 0;
            if (!id) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_parent_node'], {
                    type: 'warning'
                });
                return false;
            }

            Hsis.Proxy.loadDictionariesListByParentId(parentId, function (data) {
                if (data) {
                    if (data.code == Hsis.statusCodes.OK) {
                        $.each(data.data, function (i, v) {
                            if (v.id == kafedraDicId) {
                                type++;
                            }
                        })
                    }
                }

                if (type > 0) {
                    $('.add-new .search-scroll').load('partials/orgtree_modal.html', function () {
                        $('#main-div .org-structure').remove();
                        $('body').find('#confirmOrgTree').text(Hsis.dictionary[Hsis.lang]['add']);
                        $('#main-div #confirmOrgTree').attr('data-org-id', kafedraDicId);
                        $('body').find('#parentId').val(id);
                        $('body').find('.add-new').css('right', '0');
                    });
                } else {
                    $.notify(Hsis.dictionary[Hsis.lang]['cant_add_department_to_struc'], {
                        type: 'danger'
                    });
                }

            })


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1000070', function () {
        try {

            var id = $(this).parents('#buttons_div').attr('data-id');
            var parentId = $(this).parents('#buttons_div').attr('data-dictype-id');
            var specDicId = 1000700;
            var type = 0;
            if (!id) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_parent_node'], {
                    type: 'warning'
                });
                return false;
            }
            Hsis.Proxy.loadDictionariesListByParentId(parentId, function (data) {
                if (data) {

                    if (data.code == Hsis.statusCodes.OK) {
                        $.each(data.data, function (i, v) {
                            if (v.id == specDicId) {
                                type++;
                            }
                        })
                    }
                }

                if (type > 0) {
                    $('.add-new .search-scroll').load('partials/orgtree_modal.html', function () {

                        Hsis.Proxy.loadDictionariesByTypeId('1000035', 0, function (specialityTypes) {
                            var html = Hsis.Service.parseDictionaryForSelect(specialityTypes);
                            $('#speciality_types').html(html);
                        });
                        $('#main-div .org-structure').remove();
                        $('body').find('#confirmOrgTree').text(Hsis.dictionary[Hsis.lang]['add']);
                        $('body').find('#parentId').val(id);
                        $('.structure-name-input').addClass('hidden');
                        $('.structure-name-filter').removeClass('hidden');
                        $('.applyAndGradPlan').removeClass('hidden');
                        $('#orgName').removeAttr('required');
                        $('#orgCode').removeAttr('required');
                        $('#speciality_levels').attr('required', 'required');
                        $('#org_name_select').attr('required', 'true');
                        $('body').find('.add-new').css('right', '0');
                    });
                } else {
                    $.notify(Hsis.dictionary[Hsis.lang]['cant_add_speciality_to_struc'], {
                        type: 'danger'
                    });
                }

            })


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1000023', function () {

        try {
            $('#jstree').jstree('deselect_all');

            var id = $(this).parents('#buttons_div').attr('data-id');
            var dicId = $(this).parents('#buttons_div').attr('data-dictype-id');
            var parentNodeId = $(this).parents('#buttons_div').attr('parent-node');

            if (!id) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_parent_node'], {
                    type: 'warning'
                });
                return false;
            }

            Hsis.operationList = "edit";
            $('.add-new .search-scroll').load('partials/orgtree_modal.html', function () {
                if (dicId != 1000056 && dicId != 1000073 && dicId != 1000418) {
                    $('#main-div .org-structure').remove();
                    $('#main-div .org_address').remove();
                } else {
                    $('#main-div .org_address').removeClass('hidden');
                }

                if (dicId == 1000073) {
                    $('#main-div .university-type').removeClass('hidden');
                    $('.scholarshipPlan').removeClass('hidden');
                    $('.orgcontact').removeClass('hidden');
                    $('.orgedulang').removeClass('hidden');
                }

                if (dicId == 1000057 || dicId == 1000604) {
                    $('.applyAndGradPlan').removeClass('hidden');
                    Hsis.Proxy.getOrgPlanByOrgId(id, function (plan) {
                        Hsis.Service.parseApplyAndGradPlan(plan);

                    });
                    $('.structure-name-input').addClass('hidden');
                    $('.structure-name-filter').removeClass('hidden');
                    $('#orgName').removeAttr('required');
                    $('#orgCode').removeAttr('required');
                    Hsis.Proxy.loadDictionariesByTypeId('1000035', 0, function (specialityTypes) {
                        var html = Hsis.Service.parseDictionaryForSelect(specialityTypes);
                        $('#speciality_types').html(html);
                    });

                } else if (dicId == 1002306) {
                    $('.structure-name-filter').removeClass('hidden');
                    $('.sub_speciality').removeClass('hidden');
                    $('#sub_speciality').attr('required', 'true');
                    $('.structure-name-input').addClass('hidden');
                    $('#orgCode').parent('.structure-name-input').removeClass('hidden');
                    $('#orgName').removeAttr('required');
                    $('#orgCode').removeAttr('required');
                    $('#speciality_types').parent('.structure-name-filter').addClass('hidden');
                    $('#speciality_levels').find('option').not('option[value="1000047"]').remove();
                    $('#org_name_select').attr('required', 'true');
                    $('#org_name_select').attr('disabled', 'disabled');
                    Hsis.Proxy.getFilteredStructureList(Hsis.structureId, '1000604', 0, function (specialities) {
                        if (specialities) {
                            var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                            $.each(specialities, function (k, l) {
                                html += '<option dic-id="' + l.type.typeId + '" value="' + l.id + '">' + l.name[Hsis.lang] + ' - ' + l.code + '</option>'
                            })
                            $('#org_name_select').html(html);
                            $('#org_name_select').find('option[value="' + parentNodeId + '"]').prop('selected', true);
                            var dicId = $('#org_name_select').find('option:selected').attr('dic-id');
                            Hsis.Proxy.loadDictionariesByTypeId('1000056', dicId, function (subSpeciality) {
                                if (subSpeciality) {
                                    var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                    $.each(subSpeciality, function (p, q) {
                                        html += '<option parent_id ="' + q.parentId + '" value="' + q.id + '">' + q.value[Hsis.lang] + '</option>'
                                    });
                                    $('#sub_speciality').html(html);
                                    $('#sub_speciality').find('option[parent_id="' + dicId + '"]').prop('selected', true);
                                }
                            });
                        }
                    }, 1);

                } else if (dicId == 1008358) {
                    $('.structure-name-filter').removeClass('hidden');
                    $('.sub_speciality').removeClass('hidden');
                    $('#sub_speciality').attr('required', 'true');
                    $('.structure-name-input').addClass('hidden');
                    $('#orgCode').parent('.structure-name-input').removeClass('hidden');
                    $('#orgName').removeAttr('required');
                    $('#orgCode').removeAttr('required');
                    $('#speciality_types').parent('.structure-name-filter').addClass('hidden');
                    $('#speciality_levels').find('option').not('option[value="1000046"]').remove();
                    $('#org_name_select').attr('required', 'true');
                    $('#org_name_select').attr('disabled', 'disabled');
                    Hsis.Proxy.getFilteredStructureList(Hsis.structureId, '1000057', 0, function (specialities) {
                        if (specialities) {
                            var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                            $.each(specialities, function (k, l) {
                                html += '<option dic-id="' + l.type.typeId + '" value="' + l.id + '">' + l.name[Hsis.lang] + ' - ' + l.code + '</option>'
                            })
                            $('#org_name_select').html(html);
                            $('#org_name_select').find('option[value="' + parentNodeId + '"]').prop('selected', true);
                            var dicId = $('#org_name_select').find('option:selected').attr('dic-id');
                            Hsis.Proxy.loadDictionariesByTypeId('1000056', dicId, function (subSpeciality) {
                                if (subSpeciality) {
                                    var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                    $.each(subSpeciality, function (p, q) {
                                        html += '<option parent_id ="' + q.parentId + '" value="' + q.id + '">' + q.value[Hsis.lang] + '</option>'
                                    });
                                    $('#sub_speciality').html(html);
                                    $('#sub_speciality').find('option[parent_id="' + dicId + '"]').prop('selected', true);
                                }
                            });
                        }
                    }, 1);

                }
                $('body').find('.add-new').css('right', '0');
                $('body').find('#confirmOrgTree').text(Hsis.dictionary[Hsis.lang]['edit']);
                $('#main-div #confirmOrgTree').attr('data-org-id', dicId);
                $('body').find('#orgId').val(id);

            });
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1000025', function () {
        try {
            var selected = $("#jstree").jstree('get_selected');

            if (selected.length == 0) {
                $.notify(Hsis.dictionary[Hsis.lang]['selcet_parent_node'], {
                    type: 'warning'
                });
                return false;
            } else {
                var children = $("#jstree").jstree('get_children_dom', selected);
                if (children.length > 0) {
                    $.notify(Hsis.dictionary[Hsis.lang]['cant_delete_node_with_children'], {
                        type: 'warning'
                    });
                    return false;
                }

                $.confirm({
                    title: Hsis.dictionary[Hsis.lang]['warning'],
                    content: Hsis.dictionary[Hsis.lang]['delete_info'],
                    confirm: function () {
                        var $li = $('.main-content-upd #jstree #' + Hsis.tempData.org);
                        Hsis.Proxy.removeOrgTree(Hsis.tempData.org, function (data) {
                            if (data) {
                                if (data.code == Hsis.statusCodes.OK) {
                                    var instance = $('#jstree').jstree(true);
                                    instance.delete_node(instance.get_selected());

                                }
                            }
                        });
                    },
                    cancel: function () {
                        $.notify(Hsis.dictionary[Hsis.lang]['сancelled'], {
                            type: 'warning'
                        });
                    },
                    theme: 'material'
                });
            }


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#orgType a', function (e) {
        try {
            var name = $(this).html();
            $('body').find('#orgTypeName').html(name);
            var typeId = $(this).attr('data-id');
            var atmType = $('#atm_type').val();
            $('#main-div #orgType').attr('data-type', typeId);
            if (typeId == "0") {
                $('.module-block[data-id="' + Hsis.currModule + '"] a').click();
            } else {
                Hsis.Proxy.loadOrgTreeByTypeAndATM(typeId, atmType, function (tree) {
                    $('body').find('#jstree').jstree('destroy').empty();
                    Hsis.Service.parseOrgTree(tree);
                    var structureId = $('#main-div #tree_list_child_table').attr("data-structure-id");
                    if (structureId) {
                        Hsis.Proxy.getFilteredStructureList(structureId, typeId, 0, function (data) {
                            var html = '';
                            $.each(data, function (i, v) {
                                html += '<tr data-id= "' + v.id + '">' +
                                    '<td>' + (++i) + '</td>' +
                                    '<td>' + (v.parent.name ? v.parent.name[Hsis.lang] + ' / ' + v.name[Hsis.lang] : v.name[Hsis.lang]) + '</td>' +
                                    '<td>' + v.type.value[Hsis.lang] + '</td>' +
                                    '<td>' + (v.code ? v.code : '-') + '</td>' +
                                    '</tr>';
                            });

                            $('#main-div  #tree_list_child_table tbody').html(html);
                        }, 0, 0);
                    }
                });
            }
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#confirmOrgTree', function (e) {
        try {
            var formData = new FormData();
            var orgId = $('#orgId').val().trim();
            var orgTypeId;
            var specialityLevels = $('#speciality_levels').val();
            var dataOrgId = $('#confirmOrgTree').attr('data-org-id');
            switch (specialityLevels) {
                case '1000046' :
                    orgTypeId = (dataOrgId == '1008358') ? '1008358' : '1000057';
                    break;
                case '1000047' :
                    orgTypeId = (dataOrgId == '1002306') ? '1002306' : '1000604';
                    break;
                default:
                    orgTypeId = dataOrgId;
                    break;
            }


            var allValid = true;
            var orgTree = {
                contact: [],
                eduLang: [],
                scholarship: []
            };

            if (orgTypeId == 1000073 || orgTypeId == 1000057 || orgTypeId == 1000604) {

                if ($('#main-div #scholarplan_div .scholarship-item').length > 0) {
                    $('#main-div #scholarplan_div .scholarship-item').each(function () {
                        var scholarShip = {
                            eduYearId: $(this).attr('data-year'),
                            placeCount: $(this).attr('data-count')
                        }

                        orgTree.scholarship.push(scholarShip);
                    })

                }
                if ($('#main-div #org_edulang_div .language-item').length > 0) {
                    $('#main-div #org_edulang_div .language-item').each(function () {
                        orgTree.eduLang.push($(this).attr('data-id'));
                    })

                }

                if ($('#main-div #org_contact_div .orgcontact-item').length > 0) {
                    $('#main-div #org_contact_div .orgcontact-item').each(function () {
                        var contact = {
                            typeId: $(this).attr('data-contact-type'),
                            contact: $(this).attr('data-contact')
                        }

                        orgTree.contact.push(contact);
                    })

                }

                if ($('#main-div #applyandgradplan_div .applyandgrad-item').length > 0 && (orgTypeId == 1000057 || orgTypeId == 1000604)) {
                    $('#main-div #applyandgradplan_div .applyandgrad-item').each(function () {
                        var scholarShip = {
                            gradCount: $(this).attr('graduate-count'),
                            applyCount: $(this).attr('apply-count')
                        }

                        orgTree.scholarship.push(scholarShip);
                    })

                }
            }

            var lang = Hsis.lang[0].toUpperCase() + Hsis.lang.slice(1);


            var numberValid = true;
            $('input[numberRequired]').each(function (e) {
                if (this.value.length && !Hsis.Validation.validateNumber(this.value)) {
                    $(this).addClass('error-border');
                    numberValid = false;
                }
            });

            $('input[numberRequired]').off('blur').on('blur', function (e) {
                if (this.value.length && !Hsis.Validation.validateNumber(this.value)) {
                    $(this).addClass('error-border');
                    numberValid = false;
                }
            });

            var decimalNumberValid = true;
            $('input[decimalNumberValid]').each(function (e) {
                if (this.value.length && !Hsis.Validation.validateDecimalNumber(this.value)) {
                    $(this).addClass('error-border');
                    decimalNumberValid = false;
                }
            });

            $('input[decimalNumberValid]').off('blur').on('blur', function (e) {
                if (this.value.length && !Hsis.Validation.validateDecimalNumber(this.value)) {
                    $(this).addClass('error-border');
                    numberValid = false;
                }
            });

            if (!numberValid || !decimalNumberValid) {
                $.notify(Hsis.dictionary[Hsis.lang]['wrong_fields'], {
                    type: 'warning'
                });
                return false;
            }
            var dataNodeId = $('#main-div #address').attr('data-node-id');
            if (allValid && Hsis.Validation.validateRequiredFields("required")) {
                orgTree["name" + lang] = $('#main-div #orgName').val().trim();
                orgTree["shortName" + lang] = $('#main-div #shortName').val().trim();
                orgTree["about" + lang] = $('#main-div #orgAbout').val();
                orgTree.uniType = $('#main-div #typeUniversity').find('option:selected').val();
                orgTree.typeId = orgTypeId;
                orgTree.code = (orgTypeId == 0 || orgTypeId == 1000604 || orgTypeId == 1000057) ? $('#main-div #org_name_select').find('option:selected').attr('code') : $('#main-div #orgCode').val().trim();
                orgTree.addressId = ((orgTypeId == 1000056 || orgTypeId == 1000073 || orgTypeId == 1000418) && dataNodeId != undefined && dataNodeId.length > 0) ? $('#main-div #address').attr('data-node-id') : ''
                orgTree.street = (orgTypeId == 1000056 || orgTypeId == 1000073 || orgTypeId == 1000418) ? $('#main-div #street_address').val().trim() : ''
                orgTree.startDate = $('#created_date').val();
                orgTree.endDate = $('#closed_date').val();

                if (orgTypeId != 1007366 && orgTypeId != 1000083 && orgTypeId != 1000057 && orgTypeId != 1000604 && orgTypeId != 1000074 && orgTypeId != 1000072 && orgTypeId != 1002306 && orgTypeId != 1008358) {
                    orgTree.structureInfoForm = {
                        orgId: orgId.length !== 0 ? orgId : 0,
                        buildingCount: $('#buildingCount').val().trim().length != 0 ? $('#buildingCount').val().trim() : 0,
                        commonArea: $('#commonArea').val().trim().length != 0 ? $('#commonArea').val().trim() : 0.0,
                        eduLabArea: $('#eduLabArea').val().trim().length != 0 ? $('#eduLabArea').val().trim() : 0.0,
                        sportArea: $('#sportArea').val().trim().length != 0 ? $('#sportArea').val().trim() : 0.0,
                        campusArea: $('#campusArea').val().trim().length != 0 ? $('#campusArea').val().trim() : 0.0,
                        pcCount: $('#pcCount').val().trim().length != 0 ? $('#pcCount').val().trim() : 0,
                        orgUrl: $('#orgUrl').val().trim(),
                        lastAccreditaionDate: $('#lastAccreditaionDate').val().trim(),
                        eduProgramCount: $('#eduProgramCount').val().trim().length != 0 ? $('#eduProgramCount').val().trim() : 0,
                        accrProgramCount: $('#accrProgramCount').val().trim().length != 0 ? $('#accrProgramCount').val().trim() : 0,
                        studUnityCount: $('#studUnityCount').val().trim().length != 0 ? $('#studUnityCount').val().trim() : 0,
                        theatreCount: $('#theatreCount').val().trim().length != 0 ? $('#theatreCount').val().trim() : 0,
                        sportTeamCount: $('#sportTeamCount').val().trim().length != 0 ? $('#sportTeamCount').val().trim() : 0,
                        otherBodyCount: $('#otherBodyCount').val().trim().length != 0 ? $('#otherBodyCount').val().trim() : 0,
                        hospitalCount: $('#hospitalCount').val().trim().length != 0 ? $('#hospitalCount').val().trim() : 0,
                        sportHallCount: $('#sportHallCount').val().trim().length != 0 ? $('#sportHallCount').val().trim() : 0,
                        preventoriumCount: $('#preventoriumCount').val().trim().length != 0 ? $('#preventoriumCount').val().trim() : 0,
                        restBodyCount: $('#restBodyCount').val().trim().length != 0 ? $('#restBodyCount').val().trim() : 0,
                        studExchangeCount: $('#studExchangeCount').val().trim().length != 0 ? $('#studExchangeCount').val().trim() : 0,
                        teacherExchangeCount: $('#teacherExchangeCount').val().trim().length != 0 ? $('#teacherExchangeCount').val().trim() : 0,
                        foreignUniEduPlanExchangeCount: $('#foreignUniEduPlanExchangeCount').val().trim().length != 0 ? $('#foreignUniEduPlanExchangeCount').val().trim() : 0
                    };
//                    orgTree['structureInfoForm.orgId'] = orgId.length !== 0 ? orgId : 0;
//                    orgTree['structureInfoForm.buildingCount'] = $('#buildingCount').val().trim().length != 0 ? $('#buildingCount').val().trim() : 0;
//                    orgTree['structureInfoForm.commonArea'] = $('#commonArea').val().trim().length != 0 ? $('#commonArea').val().trim() : 0.0;
//                    orgTree['structureInfoForm.eduLabArea'] = $('#eduLabArea').val().trim().length != 0 ? $('#eduLabArea').val().trim() : 0.0;
//                    orgTree['structureInfoForm.sportArea'] = $('#sportArea').val().trim().length != 0 ? $('#sportArea').val().trim() : 0.0;
//                    orgTree['structureInfoForm.campusArea'] = $('#campusArea').val().trim().length != 0 ? $('#campusArea').val().trim() : 0.0;
//                    orgTree['structureInfoForm.pcCount'] = $('#pcCount').val().trim().length != 0 ? $('#pcCount').val().trim() : 0;
//                    orgTree['structureInfoForm.orgUrl'] = $('#orgUrl').val().trim();
//                    orgTree['structureInfoForm.lastAccreditaionDate'] = $('#lastAccreditaionDate').val().trim();
//                    orgTree['structureInfoForm.eduProgramCount'] = $('#eduProgramCount').val().trim().length != 0 ? $('#eduProgramCount').val().trim() : 0;
//                    orgTree['structureInfoForm.accrProgramCount'] = $('#accrProgramCount').val().trim().length != 0 ? $('#accrProgramCount').val().trim() : 0;
//                    orgTree['structureInfoForm.studUnityCount'] = $('#studUnityCount').val().trim().length != 0 ? $('#studUnityCount').val().trim() : 0;
//                    orgTree['structureInfoForm.theatreCount'] = $('#theatreCount').val().trim().length != 0 ? $('#theatreCount').val().trim() : 0;
//                    orgTree['structureInfoForm.sportTeamCount'] = $('#sportTeamCount').val().trim().length != 0 ? $('#sportTeamCount').val().trim() : 0;
//                    orgTree['structureInfoForm.otherBodyCount'] = $('#otherBodyCount').val().trim().length != 0 ? $('#otherBodyCount').val().trim() : 0;
//                    orgTree['structureInfoForm.hospitalCount'] = $('#hospitalCount').val().trim().length != 0 ? $('#hospitalCount').val().trim() : 0;
//                    orgTree['structureInfoForm.sportHallCount'] = $('#sportHallCount').val().trim().length != 0 ? $('#sportHallCount').val().trim() : 0;
//                    orgTree['structureInfoForm.preventoriumCount'] = $('#preventoriumCount').val().trim().length != 0 ? $('#preventoriumCount').val().trim() : 0;
//                    orgTree['structureInfoForm.restBodyCount'] = $('#restBodyCount').val().trim().length != 0 ? $('#restBodyCount').val().trim() : 0;
//                    orgTree['structureInfoForm.studExchangeCount'] = $('#studExchangeCount').val().trim().length != 0 ? $('#studExchangeCount').val().trim() : 0;
//                    orgTree['structureInfoForm.teacherExchangeCount'] = $('#teacherExchangeCount').val().trim().length != 0 ? $('#teacherExchangeCount').val().trim() : 0;
//                    orgTree['structureInfoForm.foreignUniEduPlanExchangeCount'] = $('#foreignUniEduPlanExchangeCount').val().trim().length != 0 ? $('#foreignUniEduPlanExchangeCount').val().trim() : 0;
                } else if (orgTypeId == 1002306 || orgTypeId == 1008358) {
                    orgTree.subSpecDicId = $('#sub_speciality').find('option:selected').val();
                }

                if (Hsis.operationList == "edit") {
                    orgTree.id = orgId;

                    formData.append('form', new Blob([JSON.stringify(orgTree)], {
                        type: "application/json"
                    }))

                    Hsis.Proxy.editOrgTree(formData, orgId);


                } else {
                    orgTree.parentId = $('#parentId').val().trim();
                    orgTree.operationId = Hsis.operationList[0].id;


                    formData.append('form', new Blob([JSON.stringify(orgTree)], {
                        type: "application/json"
                    }))

                    Hsis.Proxy.addOrgTree(formData, function (data) {
                        if (data && data.code == Hsis.statusCodes.OK) {
                            var container = $('#confirmOrgTree').parents('.second-page');
                            container.find('input, textarea').val('');
                            container.find('select').find('option:first').prop('selected', true);

                            var tree = $('#jstree');
                            tree.jstree('destroy')
                            Hsis.Proxy.loadOrgTree(function (tree) {
                                Hsis.Service.parseOrgTree(tree);

                            }, tree);
                        }
                    });
                }

            }

        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '#orgBack', function () {
        $('ul.module').find('.module-item[data-id="' + Hsis.currModule + '"]').click();
    });

    $('body').on('click', '#student_list tbody tr', function (e) {
        try {
            var tr = $(this);
            var id = $(this).attr('data-id');
            var pelcId = $(this).attr('data-pelc-id');
            var imagePath = $(this).attr('data-image');
            Hsis.Proxy.loadPelcShortInfo(pelcId, function (data) {
                $('body').attr('data-pelc-id', pelcId);
                $('body').find('dd[data-firstname]').html(data.firstName);
                $('body').find('dd[data-lastname]').html(data.lastName);
                $('body').find('dd[data-mname]').html(data.middleName);
                $('body').find('dd[data-speciality]').html(data.specialty[Hsis.lang]);
                $('body').find('dd[data-edu-type]').html(data.eduType.value[Hsis.lang]);
                $('body').find('dd[data-edu-level]').html(data.eduLevel.value[Hsis.lang]);
                $('body').find('dd[data-edu-pay-type]').html(data.eduPayType.value[Hsis.lang]);
                if (imagePath && imagePath.trim().length > 0) {
                    $('.main-content-upd #studentphoto').attr('src', Hsis.urls.HSIS + 'students/image/' + imagePath + '?token=' + Hsis.token + '&size=50x50&' + Math.random());
                    $('.main-content-upd #studentphoto').on('error', function (e) {
                        $(this).attr('src', 'assets/img/guest.png');
                    })
                } else {
                    $('.main-content-upd #studentphoto').attr('src', 'assets/img/guest.png');
                }
                $('#buttons_div').attr('data-id', id);
                var statusId = tr.attr('data-status-id');
                var obj = {
                    status: {
                        id: statusId.length > 0 ? statusId : 0
                    }
                };
                $('.type_2_btns').html(Hsis.Service.parseOperations(Hsis.operationList, '2', obj));

                $('body').find('.col-sm-12.data').removeClass('col-sm-12').addClass('col-sm-9');
                $('body').find('.col-sm-3.info').fadeIn(1).css('right', '0');
            });


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#abroad_student_list tbody tr', function (e) {
        try {
            var tr = $(this);
            var firstName = $(this).attr('data-firstname');
            var lastName = $(this).attr('data-lastname');
            var university = $(this).attr('data-university');
            var abroadNumber = $(this).attr('data-abroad-number');
            var note = $(this).attr('data-note');
            var id = $(this).attr('data-id');
            var pelcId = $(this).attr('data-pelc-id');
            var imagePath = $(this).attr('data-image');
            var pincode = $(this).attr('data-pincode')
            var country = $(this).attr('data-country');
            var fatherName = $(this).attr('data-father-name');

            $('body').attr('data-pelc-id', pelcId);
            $('body').find('dd[data-firstname]').html(firstName);
            $('body').find('dd[data-lastname]').html(lastName);
            $('body').find('dd[data-speciality]').html(university);
            $('body').find('dd[data-abroad-number]').html(abroadNumber);
            $('body').find('dd[data-country]').html(country);
            $('body').find('dd[data-father-name]').html(fatherName);
            $('body').find('dd[data-note]').html(note);

            if (imagePath && imagePath.trim().length > 0) {
                $('.main-content-upd #studentphoto').attr('src', Hsis.urls.HSIS + 'students/image/' + imagePath + '?token=' + Hsis.token + '&size=50x50&' + Math.random());
                $('.main-content-upd #studentphoto').on('error', function (e) {
                    $(this).attr('src', 'assets/img/guest.png');
                })
            } else {
                
                Hsis.Proxy.getPersonInfoByPinCode(pincode, function (result) {
                    if (result && result.firstName && result.lastName && result.middleName && result.birthDate) {
                        if (result.image.file !== null) {
//                            $('body .input-file-con .new-img-con').fadeIn(1);
                            $('.main-content-upd .flex-img img').attr('src', "data:image/png;base64," + result.image.file);
//                            $('.main-content-upd #studentphoto').on('error', function (e) {
//                                $('.main-content-upd #studentphoto').attr('src', 'assets/img/guest.png');
//                            });
                        }

                    } else{
                        $('.main-content-upd #studentphoto').attr('src', 'assets/img/guest.png');
                        
                    }

                });
                                
                                
                
                
            }
            $('#buttons_div').attr('data-id', id);
            var obj = {};
            $('.type_2_btns').html(Hsis.Service.parseOperations(Hsis.operationList, '2', obj));
            $('body').find('.col-sm-12.data').removeClass('col-sm-12').addClass('col-sm-9');
            $('body').find('.col-sm-3.info').fadeIn(1).css('right', '0');
        } catch (err) {
            console.error(err);
        }
    });
    $('body').on('click', '#abroad_archive_student_list tbody tr', function (e) {
        try {
            var tr = $(this);
            var firstName = $(this).attr('data-firstname');
            var lastName = $(this).attr('data-lastname');
            var university = $(this).attr('data-university');
            var abroadNumber = $(this).attr('data-abroad-number');
            var note = $(this).attr('data-note');
            var id = $(this).attr('data-id');
            var pelcId = $(this).attr('data-pelc-id');
            var imagePath = $(this).attr('data-image');
            var pincode = $(this).attr('data-pincode')
            var country = $(this).attr('data-country');
            var fatherName = $(this).attr('data-father-name');

            $('body').attr('data-pelc-id', pelcId);
            $('body').find('dd[data-firstname]').html(firstName);
            $('body').find('dd[data-lastname]').html(lastName);
            $('body').find('dd[data-speciality]').html(university);
            $('body').find('dd[data-abroad-number]').html(abroadNumber);
            $('body').find('dd[data-country]').html(country);
            $('body').find('dd[data-father-name]').html(fatherName);
            $('body').find('dd[data-note]').html(note);

            if (imagePath && imagePath.trim().length > 0) {
                $('.main-content-upd #studentphoto').attr('src', Hsis.urls.HSIS + 'students/image/' + imagePath + '?token=' + Hsis.token + '&size=50x50&' + Math.random());
                $('.main-content-upd #studentphoto').on('error', function (e) {
                    $(this).attr('src', 'assets/img/guest.png');
                })
            } else {
                
                Hsis.Proxy.getPersonInfoByPinCode(pincode, function (result) {
                    if (result && result.firstName && result.lastName && result.middleName && result.birthDate) {
                        if (result.image.file !== null) {
//                            $('body .input-file-con .new-img-con').fadeIn(1);
                            $('.main-content-upd .flex-img img').attr('src', "data:image/png;base64," + result.image.file);
//                            $('.main-content-upd #studentphoto').on('error', function (e) {
//                                $('.main-content-upd #studentphoto').attr('src', 'assets/img/guest.png');
//                            });
                        }

                    } else{
                        $('.main-content-upd #studentphoto').attr('src', 'assets/img/guest.png');
                        
                    }

                });
                                
                                
                
                
            }
            $('#buttons_div').attr('data-id', id);
            var obj = {};
            $('.type_2_btns').html(Hsis.Service.parseOperations(Hsis.operationList, '2', obj));
            $('body').find('.col-sm-12.data').removeClass('col-sm-12').addClass('col-sm-9');
            $('body').find('.col-sm-3.info').fadeIn(1).css('right', '0');
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('dblclick', '#student_list tbody tr, #foreign_student_list tbody tr', function (e) {
        try {

            var id = $(this).attr('data-id');
            var status = $(this).attr('data-status');
            if (status == 1000341) {
                $('#main-div .student-operation-div').remove();
            }
            if (localStorage.button == undefined) {
                localStorage.setItem('button', 'operation_1000057');
                localStorage.setItem('personId', id)
            }
            window.open(window.location.href, '_blank');


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('dblclick', '#abroad_student_list tbody tr', function (e) {
        try {
            var dataPageType = $(this).parents('#abroad_student_list').attr('data-page-type');
            if(dataPageType ==='archive') {
                return false;
            }
            var id = $(this).attr('data-id');
            var pelcId = $(this).attr('data-pelc-id');
            var status = $(this).attr('data-status');
            if (status == 1000341) {
                $('#main-div .student-operation-div').remove();
            }
            if (localStorage.button == undefined) {
                localStorage.setItem('button', 'operation_1001362');
                localStorage.setItem('personId', id)
                localStorage.setItem('pelcId', pelcId)
            }
            window.open(window.location.href, '_blank');


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1001362', function (e) {
        try {
            if (!$('#buttons_div').attr('data-id')) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'warning'
                });
                return false;
            }
            var id = $('.main-content-upd #buttons_div').attr('data-id');
            var status = $(this).attr('data-status');
            if (status == 1000341) {
                $('#main-div .student-operation-div').remove();
            }
            if (localStorage.button == undefined) {
                localStorage.setItem('button', 'operation_1001362');
                localStorage.setItem('personId', id)
            }
            window.open(window.location.href, '_blank');
        } catch (err) {
            console.error(err);
        }
    });


    //remove function  to module_1000131
    $('body').on('click', '#operation_1001381', function (e) {
        try {
            var id = $(this).parents('tr').attr('data-id');
            $.confirm({
                title: Hsis.dictionary[Hsis.lang]['warning'],
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    Hsis.Proxy.removeAbroadStructure(id, function (data) {
                        var queryparams = $('.main-content-upd .xtms-structure-form').serialize();
                        Hsis.Proxy.getAbroadStructure('', queryparams);
                    })
                },
                theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }
    });


    //remove function  to module_1000132
    $('body').on('click', '#operation_1001385', function (e) {
        try {
            //var id = $('#abroad-structure-address tbody tr').attr('data-id');
			var id = $(this).parents('tr').attr('data-id');
            $.confirm({
                title: Hsis.dictionary[Hsis.lang]['warning'],
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    Hsis.Proxy.removeAbroadAddress(id, function (data) {
                        var f = $('.main-content-upd .xtms-address-form').serialize();
                        Hsis.Proxy.getAbroadAddress('', f);
                    })
                },
                theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }
    });


    // edit function xtms-structure-address to module_1000132
    $('body').on('click', '#operation_1001384', function () {
        try {
            var countryId = $(this).parents('tr').attr('data-country-id');
            var cityId = $(this).parents('tr').attr('data-city-id');
            var id = $(this).parents('tr').attr('data-id');
            $('body .xtms-approve-address').attr('data-type', 'edit');
            $('body .xtms-approve-address').attr('data-id', id);
            Hsis.Proxy.loadAbroadAddress('1000323', '', function (country) {
                var html = Hsis.Service.parseDictionaryForSelect(country);
                $('#foreign_country').html(html);
                $('#foreign_country').val(countryId)
                $('#xtm-city').val(cityId);
                $('body').find('.new-upd').css('right', '0');

            });
        } catch (err) {
            console.error(err);
        }
    });

    // edit function xtms-structure-address to module_1000131
    $('body').on('click', '#operation_1001380', function () {
        try {
            var countryId = $(this).parents('tr').attr('data-country-id');
            var cityId = $(this).parents('tr').attr('data-city-id');
            var uniName = $(this).parents('tr').attr('data-uni-name');
            var id = $(this).parents('tr').attr('data-id');
            $('body .xtms-approve').attr('data-type', 'edit');
            $('body .xtms-approve').attr('data-id', id);
            Hsis.Proxy.loadAbroadAddress('1000323', '', function (country) {
                var html = Hsis.Service.parseDictionaryForSelect(country);
                $('#foreign_country').html(html);
                $('#foreign_country').val(countryId)
                Hsis.Proxy.loadAbroadAddress('1000324', countryId, function (city) {
                    var html = Hsis.Service.parseDictionaryForSelect(city);
                    $('#main-div #foreign_city').html(html);
                    $('#main-div #foreign_city').val(cityId)
                    $('#xtm-university').val(uniName);
                    $('body').find('.new-upd').css('right', '0');
                });

            });
        } catch (err) {
            console.error(err);
        }
    });


    // add function xtms-structure to module_1000131
    $('body').on('click', '#operation_1001379', function () {
        try {
            $('body .xtms-approve').attr('data-type', 'add');
            Hsis.Proxy.loadAbroadAddress('1000323', '', function (country) {
                var html = Hsis.Service.parseDictionaryForSelect(country);
                $('#foreign_country').html(html);
                $('#main-div #foreign_city').html('');
                $('#xtm-university').val('');
                $('body').find('.new-upd').css('right', '0');
            });
        } catch (err) {
            console.error(err);
        }
    });

    //add function xtms-structure-address to module_1000132
    $('body').on('click', '#operation_1001383', function () {
        try {
            $('body .xtms-approve-address').attr('data-type', 'add');
            $('body #xtm-city').val('');
            Hsis.Proxy.loadAbroadAddress('1000323', '', function (country) {
                var html = Hsis.Service.parseDictionaryForSelect(country);
                $('#foreign_country').html(html);
                $('#main-div #foreign_city').html('');
                $('body').find('.new-upd').css('right', '0');
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.xtms-approve', function () {
        var objectForm = $('body #add_abroad_structure_form').serialize();
        var id = $(this).attr('data-id');
        var type = $(this).attr('data-type');

        if (Hsis.Validation.validateRequiredFields('xtmis-structure-required')) {
            if (type === 'add') {
                Hsis.Proxy.addAbroadStructure(objectForm, function (data) {
                    if (data) {
                        $('body').find('#main-div .select-with-search').select2('val', ' ', true);
                        $('body').find('#main-div #xtm-university').val(' ');
                        $('body').find('#main-div #xtm-city').val(' ');
                        var queryparams = $('.main-content-upd .xtms-structure-form').serialize();
                        Hsis.Proxy.getAbroadStructure('', queryparams);
                    }
                });
            } else if (type === 'edit') {
                Hsis.Proxy.editAbroadStructure(id, objectForm, function (data) {
                    if (data) {
                        var queryparams = $('.main-content-upd .xtms-structure-form').serialize();
                        Hsis.Proxy.getAbroadStructure('', queryparams);
                    }
                });
            }
        }
    });
    //approve-address
    $('body').on('click', '.xtms-approve-address', function () {
        var objectForm = $('body #add_abroad_address_form').serialize();
        var id = $(this).attr('data-id');
        var type = $(this).attr('data-type');

        if (Hsis.Validation.validateRequiredFields('abroad-address-required')) {
            if (type === 'add') {
                Hsis.Proxy.addAbroadAddress(objectForm, function (data) {
                    if (data) {
                        $('body').find('#main-div #foreign_country').select2('val', ' ', true);
                        $('body').find('#main-div #xtm-city').val(' ');
                        var f = $('.main-content-upd .xtms-address-form').serialize();
                        Hsis.Proxy.getAbroadAddress('', f);
                    }
                });
            } else if (type === 'edit') {
                Hsis.Proxy.editAbroadAddress(id, objectForm, function (data) {
                    if (data) {
                        var f = $('.main-content-upd .xtms-address-form').serialize();
                        Hsis.Proxy.getAbroadAddress('', f);
                    }
                });
            }
        }


    });


    $('body').on('click', '.panel-close', function () {
        $('body').find('.col-sm-3.info').fadeOut(1).css('right', '-100%');
        $('body').find('.col-sm-9.data').removeClass('col-sm-9').addClass('col-sm-12');
    });

    $('body').on('click', '#operation_1000052', function (e) {
        $('body').find('.add-new .search-scroll').load('partials/groups.html', function () {
            Hsis.Proxy.loadDictionariesByTypeId('1000002', 1000700, function (eduLevel) {
                var html = Hsis.Service.parseDictionaryForSelect(eduLevel);
                $('#main-div #edu_level').html(html);
                $('#main-div #edu-level-list').html(html);
                $('body').find('.add-new').css('right', '0');
            });

            Hsis.Proxy.loadDictionariesByTypeId('1000017', 0, function (eduTypes) {
                var html = Hsis.Service.parseDictionaryForSelect(eduTypes);
                $('#main-div #edu_type_2').html(html);
            });

            Hsis.Proxy.loadDictionariesByTypeId('1000053', 0, function (groupTypes) {
                var html = Hsis.Service.parseDictionaryForSelect(groupTypes);
                $('#main-div #group-type').html(html);
            });
            $('#confirmGroup').attr('action-status', 'new');
        });
    });

    $('body').on('click', '#operation_1000055', function (e) {
        try {
            var id = $('.main-content-upd #buttons_div').attr('data-id');
            $('body').find('.add-new .search-scroll').load('partials/add_student_to_group.html', function () {
                $('#main-div').attr('data-id', id);

                Hsis.Proxy.getAcademicGroupDetails(id, function (data) {
                    $('.tree-search').val(data.speciality.value[Hsis.lang]);
                    $('.btn.tree-modal').text(data.speciality.value[Hsis.lang]);
                    $('.btn.tree-modal').attr('data-id', data.speciality.id);
                    var eduLevel;
                    switch (data.educationLevel.id) {
                        case 1000057:
                            eduLevel = '1000184';
                            break;
                        case 1000604:
                            eduLevel = '1000218';
                            break;
                        default:
                            eduLevel = data.educationLevel.id;
                            break;
                    }
                    $('#edu-level-list').find('option[value="' + eduLevel + '"]').prop('selected', true);
                    var selected = $('#edu-level-list').val();
                    if (selected > 0) {
                        $('#edu-level-list').attr('disabled', 'disabled');
                    }
                    $('#filter_form input[name="id"]').val(id);
                    $('#filter_form input[name="orgId"]').val(data.speciality.id);
                    $('#filter_form input[name="eduLevelId"]').val(eduLevel);
                    $('#filter_form input[name="citizenshipType"]').val(0);
                    $('#filter_form input[name="eduType"]').val(0);
                    var params = $('#filter_form').serialize();

                    Hsis.Proxy.getStudentListByOrgId(params);
                });

                Hsis.Proxy.getAcademicGroupStudentList(id, function (data) {
                    if (data) {
                        var students = [];
                        $.each(data, function (i, d) {

                            var e = $(document.createElement('option'));
                            e.attr('class', 'option_class');
                            e.attr('onclick', 'removeFromSelectedStudentList($(this))');
                            e.text(d.lastName + " " + d.firstName + " " + d.middleName);
                            e.val(d.id);
                            e.attr('index', students.indexOf(d.id));

                            var selectedList = $('#selectedStudent');
                            selectedList.append(e);
                            students.push(parseInt(d.id));

                            var html = '<input id="' + d.id + '" class="hidden" name="studentIdArray">';
                            $('#main-div .acad-group-form').append(html);
                            $('#main-div .acad-group-form input[id="' + d.id + '"]').val(d.id);

                        });
                    }
                });
                $('#confirmStudentGroup').attr('data-id', id);
            });
            $('body').find('.add-new').css('right', '0');
        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '#group-list tbody tr', function (e) {
        try {
            var id = $(this).attr('data-id');
            Hsis.Proxy.getAcademicGroupStudentList(id, function (data) {
                if (data) {
                    var html = '';
                    $.each(data, function (i, d) {
                        html += '<label>' + (++i) + '. ' + d.lastName + ' ' + d.firstName + ' ' + d.middleName + '</label> <br/>';
                    });
                    $('.dl-horizontal').html(html);
                }

            });
            $('.main-content-upd #buttons_div').attr('data-id', id);
            $('.type_2_btns').html(Hsis.Service.parseOperations(Hsis.operationList, '2'));
            $('body').find('.col-sm-12.data').removeClass('col-sm-12').addClass('col-sm-9 add-padding');
            $('body').find('.col-sm-3.info').fadeIn(1).css('right', '0');
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1000053', function () {
        try {
            var id = $('.main-content-upd #buttons_div').attr('data-id');
            $('body').find('.add-new .search-scroll').load('partials/groups.html', function () {
                Hsis.Proxy.getAcademicGroupDetails(id, function (data) {

                    $('#group-name').val(data.name[Hsis.lang]);
                    $('#confirmGroup').attr('action-status', 'edit');
                    $('#confirmGroup').attr('data-id', id);


                    var eduLevelId;
                    switch (data.educationLevel.id) {
                        case 1000184:
                            eduLevelId = '1000057';
                            break;
                        case 1000218:
                            eduLevelId = '1000604';
                            break;
                        default:
                            eduLevelId = data.educationLevel.id;
                            break;
                    }
                    Hsis.Proxy.loadDictionariesByTypeId('1000002', 1000700, function (eduLevel) {
                        var html = Hsis.Service.parseDictionaryForSelect(eduLevel);
                        $('#main-div #edu_level').html(html);
                        $('#main-div #edu-level-list').html(html);
                        $('#edu-level-list').find('option[value="' + eduLevelId + '"]').prop('selected', true);
                        $('#edu-level-list').attr('disabled', 'disabled');
                    });

                    Hsis.Proxy.loadDictionariesByTypeId('1000017', 0, function (eduTypes) {
                        var html = Hsis.Service.parseDictionaryForSelect(eduTypes);
                        $('#main-div #edu_type, #main-div #edu_type_2').html(html);

                        $('#edu_type_2').find('option[value="' + data.eduTypeId + '"]').attr('selected', 'selected');
                    });

                    Hsis.Proxy.loadDictionariesByTypeId('1000053', 0, function (groupTypes) {
                        var html = Hsis.Service.parseDictionaryForSelect(groupTypes);
                        $('#main-div #group-type').html(html);
                        $('#group-type').find('option[value="' + data.type.id + '"]').attr('selected', 'selected');
                        $('#group-type').attr('disabled', 'disabled');
                    });


                    Hsis.Proxy.getFilteredStructureList(Hsis.structureId, data.speciality.typeId, 0, function (specialities) {
                        if (specialities) {
                            var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                            $.each(specialities, function (i, v) {
                                html += '<option value="' + v.id + '">' + v.name[Hsis.lang] + '</option>'
                            })
                        }
                        $('#orgId').html(html);
                        $('#orgId').find('option[value="' + data.speciality.id + '"]').prop('selected', true);
                        $('#orgId').attr('disabled', 'disabled');
                    });
                    $('#main-div').attr('data-id', data.id);
                    $('body').find('.add-new').css('right', '0');
                });
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1000054', function () {
        try {

            if (!$('#buttons_div').attr('data-id')) {
                $.alert({
                    title: Hsis.dictionary[Hsis.lang]['warning'],
                    content: Hsis.dictionary[Hsis.lang]['select_information'],
                    theme: 'material'
                });
                return false;
            }

            $.confirm({
                title: Hsis.dictionary[Hsis.lang]['warning'],
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    Hsis.Proxy.removeAcademicGroup(function () {
                        var params = $('.content-body .group-search-form').serialize();
                        Hsis.Proxy.loadAcademicGroups('', params);
                    });
                },
                theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1000096', function (e) {
        $('body').find('.add-new .search-scroll').load('partials/shares.html', function () {
            $('#confirmShare').attr('action-status', 'new');
            $('body').find('.add-new').css('right', '0');
        });
    });

    $('body').on('click', '#operation_1000097', function () {
        try {
            var id = $(this).parents('.info').attr('data-id');
            $('body').find('.add-new .search-scroll').load('partials/shares.html', function () {
                Hsis.Proxy.getShareDetails(id, function (data) {
                    $('#main-div .share-form input[name="id"]').val(id);
                    $('#confirmShare').attr('action-status', 'edit');
                    $('#confirmShare').attr('data-id', id);

                    $('#share-type-list').find('option[value="' + data.type.id + '"]').attr('selected', 'selected');
                    $('#share-content').val(data.content);
                    $('#share-priority-list').find('option[value="' + data.priority.id + '"]').attr('selected', 'selected');

                    $('#share-start-date').val(data.startDate);
                    $('#start-time').val(data.startTime);

                    $('#share-end-date').val(data.endDate);
                    $('#end-time').val(data.endTime);

                    $('#main-div').attr('data-id', data.id);

                    Hsis.Proxy.loadVisibleToList(id, function (data) {
                        if (data !== null) {
                            $.each(data, function (i, d) {
                                $('.select2-selection__rendered').append('<li class="select2-selection__choice" title="' + d.value[Hsis.lang] + '">' +
                                    '<span class="select2-selection__choice__remove" role="presentation">×</span>' + d.value[Hsis.lang] + '</li>');
                                $('#share-visible-to').find('[value="' + d.id + '"]').attr('selected', 'selected');
                            });
                        }
                        Hsis.Proxy.loadShareOrgList(id, function (data) {
                            if (data !== null) {
                                $.each(data, function (i, d) {
                                    $('.tree-search').val(d.value[Hsis.lang]);
                                    $('.btn.tree-modal').text(d.value[Hsis.lang]);
                                    $('.btn.tree-modal').attr('data-id', d.id);
                                    $('#main-div .share-form input[name="orgIdArray"]').val(d.id);
                                });
                            }
                        });
                    });
                });
                $('body').find('.add-new').css('right', '0');
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#share-list tbody tr', function (e) {
        try {
            var id = $(this).attr('data-id');
            Hsis.Proxy.getShareDetails(id, function (data) {
                $('.dl-horizontal').html('');
                $('.col-sm-3.info').attr('data-id', id);
                $('.dl-horizontal').append('<label><b> Elan tipi </b>: ' + data.type.value[Hsis.lang] + '</label> <br/>');
                $('.dl-horizontal').append('<label><b> Elan dərəcəsi </b>: ' + data.priority.value[Hsis.lang] + '</label> <br/>');
                $('.dl-horizontal').append('<label><b> Məzmun </b>: ' + data.content + '</label> <br/>');
                $('.dl-horizontal').append('<label><b> Başlama tarixi </b>: ' + data.startDate + ' ' + data.startTime + '</label> <br/>');
                $('.dl-horizontal').append('<label><b> Bitmə tarixi </b>: ' + data.endDate + ' ' + data.endTime + '</label> <br/>');

                Hsis.Proxy.loadVisibleToList(id, function (data) {
                    var visibleTo = '';
                    if (data !== null) {
                        $.each(data, function (i, d) {
                            visibleTo += d.value[Hsis.lang];
                            visibleTo += ((i + 1) < data.length) ? ', ' : '';
                        });
                        $('.dl-horizontal').append('<label><b> Kimlər </b>: ' + visibleTo + '</label> <br/>');
                    }
                    Hsis.Proxy.loadShareOrgList(id, function (data) {
                        var orgList = '';
                        if (data !== null) {
                            $.each(data, function (i, d) {
                                orgList += d.value[Hsis.lang];
                                orgList += ((i + 1) < data.length) ? ', ' : '';
                            });
                            $('.dl-horizontal').append('<label><b> Təşkilatı struktur </b>: ' + orgList + '</label> <br/>');
                        }
                    });
                });
            });
            $('.main-content-upd #buttons_div').attr('data-id', id);
            $('body').find('.type_2_btns').html(Hsis.Service.parseOperations(Hsis.operationList, '2'));

            $('body').find('.col-sm-12.data').removeClass('col-sm-12').addClass('col-sm-9');
            $('body').find('.col-sm-3.info').fadeIn(1).css('right', '0');
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1000098', function () {
        try {

            if (!$('#buttons_div').attr('data-id')) {
                $.alert({
                    title: Hsis.dictionary[Hsis.lang]['warning'],
                    content: Hsis.dictionary[Hsis.lang]['select_information'],
                    theme: 'material'
                });
                return false;
            }

            $.confirm({
                title: Hsis.dictionary[Hsis.lang]['warning'],
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    Hsis.Proxy.removeShare();
                },
                theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#add_contact', function (e) {
        try {
            $('#add_contact_modal .blank-required-field').removeClass('blank-required-field');
            $('#add_contact_modal input').val('');
            $('#add_contact_modal input').attr('placeholder', ' ');
            $('#add_contact_modal select').find('option[value="0"]').prop('selected', true);
            $('#add_contact_modal').modal();
            $('#add_contact_modal [confirm]').attr('id', "confirm_contact_add");
        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '#confirm_contact_add', function (e) {
        try {
            var typeId = $('#contact_type').find('option:selected').val();
            var typeText = $('#contact_type').find('option:selected').text();
            var contact = $('#contact').val().trim();
            var html = '<div class="col-md-12 for-align contact-item">' +
                '<table class="table-block col-md-12">' +
                '<thead>' +
                '<tr><th>' + Hsis.dictionary[Hsis.lang]['contact_type'] + '</th>' +
                '<th>' + Hsis.dictionary[Hsis.lang]['contact'] + '</th>' +
                '</tr></thead>' +
                '<tbody>' +
                '<tr data-contact="' + contact + '" data-type-id="' + typeId + '">' +
                '<td style="width: 50%;">' + typeText + '</td>' +
                '<td style="width: 50%;">' + contact + '</td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '<div class="operations-button">' +
                '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span' +
                ' class="glyphicon glyphicon-list"></span></div>' +
                '<ul class="dropdown-menu student-dropdown">' +
                '<li><a edit-contact data-contact="' + contact + '" data-type-id="' + typeId + '" href="#" class="edit">' + Hsis.dictionary[Hsis.lang]['edit'] + '</a></li>' +
                '<li><a delete-contact href="#" class="erase">' + Hsis.dictionary[Hsis.lang]['erase'] + '</a></li>' +
                '</ul>' +
                '</div>' +
                '</div>';


            if (Hsis.Validation.validateRequiredFields('contact-required')) {
                $('[contact-required]').removeClass('blank-required-field');
                // var valid = true;
                if (typeId == '1000158' && !Hsis.Validation.validateEmail(contact)) {
                    $('#contact').addClass('blank-required-field');

                    /*$.notify(Hsis.dictionary[Hsis.lang]['wrong_email'], {
                        type: 'warning'
                    });*/
                    // var valid = false
                } /*else if (typeId != '1000158' && !Hsis.Validation.validatePhoneNumber(contact)) {
                    $('#contact').addClass('blank-required-field');

                    $.notify(Hsis.dictionary[Hsis.lang]['wrong_phone_number'], {
                        type: 'warning'
                    });
                    var valid = false

                }*/ else {
                    /*if (typeId != '1000158' && !Hsis.Validation.validatePhoneNumber(contact)) {
                        $('#contact').addClass('blank-required-field');
                        $.notify(Hsis.dictionary[Hsis.lang]['wrong_phone_number'], {
                            type: 'warning'
                        });
                    }*/ //else {

                        $('#append_contact').append(html);
                        $('#add_contact_modal').modal('hide');
                        $('#append_contact').has('.blank-panel').children('.blank-panel').remove();
                    //}
                    // var valid = false

                }

            }
        } catch (err) {
            console.error(err)
        }

    });

    $('body').on('click', 'a[edit-contact]', function (e) {
        try {
            e.preventDefault();
            $('#add_contact_modal .blank-required-field').removeClass('blank-required-field');
            $('.contact-item').removeClass('selected');
            $(this).parents('.contact-item').addClass('selected');
            var typeId = $(this).attr('data-type_id');
            var contact = $(this).attr('data-contact');
            $('#contact_type').find('option[value="' + typeId + '"]').prop('selected', true);
            $('#contact').val(contact);
            $('#add_contact_modal').modal();
            $('#add_contact_modal [confirm]').attr('id', "confirm_contact_edit");
        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '#confirm_contact_edit', function (e) {
        try {
            var typeId = $('#contact_type').find('option:selected').val();
            var typeText = $('#contact_type').find('option:selected').text();
            var contact = $('#contact').val().trim();
            var tr = $('.contact-item.selected').find('tbody tr');
            tr.attr('data-type-id', typeId);
            var html = '<td>' + typeText + '</td>' +
                '<td>' + contact + ' </td>';

            if (Hsis.Validation.validateRequiredFields('contact-required')) {
                if (typeId == '1000158' && !Hsis.Validation.validateEmail(contact)) {
                    $('#contact').addClass('blank-required-field');
                    $.notify(Hsis.dictionary[Hsis.lang]['wrong_email'], {
                        type: 'warning'
                    });
                } else if (typeId != '1000158' && !Hsis.Validation.validatePhoneNumber(contact)) {
                    $('#contact').addClass('blank-required-field');
                    $.notify(Hsis.dictionary[Hsis.lang]['wrong_phone_number'], {
                        type: 'warning'
                    });

                } else {
                    tr.html(html);
                    $('body #add_contact_modal').modal('hide');
                }

            }
        } catch (err) {
            console.error(err);
        }

    });


    $(document).on('click', '.dropdown-menu a.erase', function (e) {
        try {
            var obj = $(this);
            e.preventDefault();
            var parent = obj.parent().closest('.panel-body');
            $.confirm({
                title: Hsis.dictionary[Hsis.lang]['warning'],
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    obj.parents('.for-align').remove();
                    if (parent.children('.for-align').length == 0) {
                        parent.append('<div class="blank-panel"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
                    }
                },
                theme: 'black'
            });

        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1000029, #operation_1001347', function () {
        try {

            var id = $('body').attr('data-pelc-id');
            if (!id) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_info_to_delete'], {
                    type: 'warning'
                });
                return false;
            }


            $.confirm({
                title: Hsis.dictionary[Hsis.lang]['warning'],
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    Hsis.Proxy.removeAbroadStudent(id, function () {
                        var queryparams = $('.main-content-upd .abroad_student-search-form').serialize();
                        Hsis.Proxy.loadAbroadStudents('', queryparams);
//                        $('.module-block[data-id="' + Hsis.currModule + '"] a').click();
                    });
                },
                theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }
    });
    $('body').on('click', '.student-gender li', function () {
        try {
            var id = $(this).attr('data-id');
            var genderName = $(this).find('a').text();
            if (id != 0) {
                $('.main-content-upd .student-search-form input[name="genderId"]').val(id);
                $('.main-content-upd .student-search-form input[name="genderName"]').val(genderName);
            } else {
                $('.main-content-upd .student-search-form input[name="genderId"]').val('');
                $('.main-content-upd .student-search-form input[name="genderId"]').val('');
            }
            $('.btn-load-more').removeAttr('data-page');
            var params = $('.main-content-upd .student-search-form').serialize();
            Hsis.Proxy.loadStudents('', params + '&subModuleId=' + Hsis.subModuleId);
        } catch (err) {
            console.error(err)
        }
    });


    $('body').on('click', '.student-status li', function () {
        try {
            var id = $(this).attr('data-id');
            var statusName = $(this).find('a').text();
            if (id != 0) {
                $('.main-content-upd .student-search-form input[name="statusId"]').val(id);
                $('.main-content-upd .student-search-form input[name="status"]').val(id);
                $('.main-content-upd .student-search-form input[name="statusName"]').val(statusName);
            } else {
                $('.main-content-upd .student-search-form input[name="statusId"]').val('');
                $('.main-content-upd .student-search-form input[name="status"]').val('');
                $('.main-content-upd .student-search-form input[name="statusName"]').val('');
            }
            $('.btn-load-more').removeAttr('data-page');
            var params = $('.main-content-upd .student-search-form').serialize();
            Hsis.Proxy.loadStudents('', params + '&subModuleId=' + Hsis.subModuleId);

        } catch (err) {
            console.error(err)
        }

    });

    $('body').on('click', '#student-sub-action-type', function () {
        try {
            var id = $(this).val();
            var actionName = $(this).find('option:selected').text();
            var hide = true;
            if (id != 0) {
                $('.main-content-upd .student-search-form input[name="actionTypeId"]').val(id);
                $('.main-content-upd .student-search-form input[name="actionName"]').val(actionName);
                if (id == 1000260) {
                    hide = false;
                }

            } else {
                $('.main-content-upd .student-search-form input[name="actionTypeId"]').val('');
                $('.main-content-upd .student-search-form input[name="actionName"]').val('');
            }
            $('.btn-load-more').removeAttr('data-page');
            if (hide) {
                $('#edu_start_year').addClass('hidden');
            } else {
                $('#edu_start_year').removeClass('hidden');
            }

            var params = $('.main-content-upd .student-search-form').serialize();
            Hsis.Proxy.loadStudents('', params + '&subModuleId=' + Hsis.subModuleId);

        } catch (err) {
            console.error(err)
        }

    });

    $('.main-content-upd ').on('click', '.teacher-gender li', function () {
        try {
            var id = $(this).attr('data-id');
            if (id != 0) {
                $('.main-content-upd .teacher-search-form input[name="genderId"]').val($(this).attr('data-id'));

            } else {
                $('.main-content-upd .teacher-search-form input[name="genderId"]').val('');
            }
            $('.btn-load-more').removeAttr('data-page');
            Hsis.Proxy.loadTeachers('', $('.main-content-upd .teacher-search-form').serialize());
        } catch (err) {
            console.error(err);
        }

    });

    $('.main-content-upd ').on('click', '.staff-table-gender li', function () {
        try {
            var id = $(this).attr('data-id');
            if (id != 0) {
                $('.main-content-upd .teacher-search-form input[name="genderId"]').val($(this).attr('data-id'));

            } else {
                $('.main-content-upd .teacher-search-form input[name="genderId"]').val('');
            }
            $('.btn-load-more').removeAttr('data-page');
            Hsis.Proxy.loadStaffTable('', $('.main-content-upd .teacher-search-form').serialize());
        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '.teacher-status li', function () {
        try {
            var id = $(this).attr('data-id');
            if (id != 0) {
                $('.main-content-upd .teacher-search-form input[name="statusId"]').val($(this).attr('data-id'));

            } else {
                $('.main-content-upd .teacher-search-form input[name="statusId"]').val('');
            }
            $('.btn-load-more').removeAttr('data-page');
            var params = $('.main-content-upd .teacher-search-form').serialize();
            Hsis.Proxy.loadTeachers('', params);

        } catch (err) {
            console.error(err)
        }

    })

    $('body').on('click', '#operation_1000028', function () {
        try {

            if (!$('#buttons_div').attr('data-id')) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'warning'
                });
                return false;
            }

            var id = $('.main-content-upd #buttons_div').attr('data-id');
            $('.add-new .search-scroll').load('partials/student_edit.html', function () {
                Hsis.Proxy.getStudentDetails(id, function (data) {
                    if (data) {
                        var html = '';
                        $('body .input-file-con .new-img-con').fadeIn(1);

                        if (data.image && data.image.path) {
                            $('body .input-file-con .new-img-con img').attr('src', Hsis.urls.HSIS + 'students/image/' + (data.image.path ? data.image.path : '') + '?token=' + Hsis.token + '&size=200x200&' + Math.random());

                            $('body .input-file-con .new-img-con img').on('error', function (e) {
                                $('.edit-common-info-image').attr('src', 'assets/img/guest.png');
                            });
                        } else {
                            $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                        }

                        $('#firstname').text(data.firstName);
                        $('#lastname').text(data.lastName);
                        $('#middlename').text(data.middleName);
                        $('#pincode').text(data.pinCode);
                        $('#citizenship').text(data.citizenship.value[Hsis.lang] ? data.citizenship.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                        $('#gender').text(data.gender.value[Hsis.lang]);
                        $('#marital_status').text(data.maritalStatus.value[Hsis.lang] ? data.maritalStatus.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                        $('#social_status').text(data.socialStatus.value[Hsis.lang] ? data.socialStatus.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                        $('#orphan_degree').text(data.orphanDegree.value[Hsis.lang] ? data.orphanDegree.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                        $('#military_status').text(data.militaryService.value[Hsis.lang] ? data.militaryService.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                        $('#nationality').text(data.nationality.value[Hsis.lang] ? data.nationality.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                        $('.date-birthdate').text(data.birthDate);
                        $('#main-div').attr('data-id', data.id);
                        $('#main-div').attr('data-pelc-id', data.pelcId);
                        $('#disability_degree').text(data.disabilityDegree.value[Hsis.lang]).attr('disabled', 'disabled').attr('data-id', data.disabilityDegree.id);

                        Hsis.Service.parseEditStudentAddress(data);
                        if (data.contacts.length > 0) {
                            $('.contact-info .panel-body').html(Hsis.Service.parseViewStudentContact(data));
                        }

                        var personal = 'personal';
                        var academic = 'academic';
                        var school = 'school';
                        if (data.documents.length > 0) {
                            $('.add-doc-block #personal_doc').html(Hsis.Service.parseViewStudentDocument(data.documents, personal));
                        }

                        $('.activity_name #acad_doc_add').html(Hsis.Service.parseEditStudentDocument(data.pelcDocuments, academic));
                        $('#past_edu_doc').html(Hsis.Service.parseEditStudentDocument(data.schoolDocuments, school));

                        $('.action-students #student_action_block').html(Hsis.Service.parseStudentActions(data.pelcAction));
                        $('#student_action_block .student-action').addClass('past_edu');
                        $('.action-students .student-action[data-action-date="' + data.actionDate + '"]').remove();
                        var orderType;
                        var orderAttr;
                        if (data.endActionType.id != "0") {
                            $('.edit-student-action,.erase-student-action ').each(function () {
                                $(this).parent('li').remove();
                            });
                            $('#main-div').attr('end-action-type', data.endActionType.id);
                            $('.in-action').addClass('hidden');
                            $('.out-action').removeClass('hidden');
                            $('.add-edulifecycle, #edu_org, #past_edu_doc_info').addClass('out-action-type');
                            $('#student-academic-action-date').val(data.endActionDate);
                            Hsis.Proxy.loadDictionariesByTypeId('1000025', 1000259, function (actionType) {
                                var html = Hsis.Service.parseDictionaryForSelect(actionType);
                                $('#main-div .student-action-type').html(html);
                                $('#main-div .student-action-type').find('option[value="' + data.endActionType.id + '"]').prop('selected', true);
                                $('#main-div #student-academic-note').html(data.note);
                            });
                            Hsis.Proxy.loadDictionariesByTypeId(1000050, 0, function (reasons) {
                                var html = Hsis.Service.parseDictionaryForSelect(reasons);
                                $('#reasonId').html(html);
                                $('#reasonId').find('option[value="' + data.reasonId + '"]').prop('selected', true);
                            });
                            orderType = data.endActionType.id;
                            orderAttr = "out";
                        } else {
                            $('.out-action').remove();
                            orderType = data.actionType.id;
                            orderAttr = "in";
                        }

                        Hsis.Proxy.getOrderDocumentsByType(orderType, Hsis.structureId, function (order) {
                            if (order) {
                                var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]["select"] + '</option>';
                                var st = '';
                                $.each(order, function (i, v) {
                                    st = v.startDate == null ? '' : '-' + (v.startDate).toString().slice(6, 10);
                                    html += '<option value="' + v.id + '">' + v.serial + v.number + st + '</option>';
                                });
                                $('#order').html(html);
                                $('#order').attr('order-type', orderAttr);
                                $('#main-div #order').find('option[value="' + data.orderId + '"]').attr('selected', 'selected').trigger('change');
                            }
                        });


                        $('.student-relationships-div .panel-body').html(Hsis.Service.parseViewStudentRelationShip(data.relations));

                        $('#action_type').find('option[value="' + data.actionType.id + '"]').attr('selected', 'selected');
                        $('#edu_line').find('option[value="' + data.eduLineId.id + '"]').attr('selected', 'selected');
                        $('#edu_lang').find('option[value="' + data.eduLangId.id + '"]').attr('selected', 'selected');
                        $('#edu_type').find('option[value="' + data.eduType.id + '"]').attr('selected', 'selected');
                        $('#edu_pay_type').find('option[value="' + data.eduPayType.id + '"]').attr('selected', 'selected');
                        $('#main-div').attr('data-status', data.status.id);
                        $('.second-info-date').val(data.actionDate);
                        $('.student-card-number').val(data.studentCardNo);


                        if (data.eduLifeCycleByOrgs) {

                            $.each(data.eduLifeCycleByOrgs, function (i, v) {
                                if (v.type.id == 1000057 || v.type.id == 1000604) {
                                    Hsis.Proxy.getFilteredStructureList(Hsis.structureId, v.type.id, 0, function (specialities) {
                                        if (specialities) {
                                            var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                            $.each(specialities, function (k, l) {
                                                html += '<option value="' + l.id + '">' + l.name[Hsis.lang] + ' - ' + l.parent.name[Hsis.lang] + '</option>'
                                            })
                                            $('#main-div #orgId').html(html);
                                            $('#main-div #edit_uni_action_orgId').html(html);
                                        }


                                        $('#main-div #edu_level').find('option[value="' + v.type.id + '"]').attr('selected', 'selected');
                                        $('#main-div #orgId').find('option[value="' + v.id + '"]').attr('selected', 'selected');

                                        if (v.type.id == 1000604) {
                                            var specId = $('#main-div #orgId').find('option:selected').val();
                                            Hsis.Proxy.getFilteredStructureList(specId, '1002306', 0, function (subSpeciality) {
                                                if (subSpeciality) {
                                                    var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                                    $.each(subSpeciality, function (i, v) {
                                                        html += '<option value="' + v.id + '">' + v.name[Hsis.lang] + '</option>'
                                                    })
                                                    $('#sub_speciality').html(html);
                                                    $('.sub_speciality').removeClass('hidden');
                                                } else {
                                                    $('.sub_speciality').addClass('hidden');
                                                }
                                            })
                                        } else if (v.type.id == 1000057) {
                                            var specId = $('#main-div #orgId').find('option:selected').val();
                                            Hsis.Proxy.getFilteredStructureList(specId, '1008358', 0, function (subSpeciality) {
                                                if (subSpeciality) {
                                                    var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                                    $.each(subSpeciality, function (i, v) {
                                                        html += '<option value="' + v.id + '">' + v.name[Hsis.lang] + '</option>'
                                                    })
                                                    $('#sub_speciality').html(html);
                                                    $('.sub_speciality').removeClass('hidden');
                                                } else {
                                                    $('.sub_speciality').addClass('hidden');
                                                }
                                            })
                                        }

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
                                        $('#graduatedDate').val(v.actionDate);
                                    })
                                } else if (v.type.id == 1002306) {
                                    $('#main-div #edu_level').find('option[value="1000604"]').prop('selected', true);
                                    var eduLevel = 1000604;
                                    Hsis.Proxy.getFilteredStructureList(Hsis.structureId, eduLevel, 0, function (specialities) {
                                        if (specialities) {
                                            var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                            $.each(specialities, function (i, v) {
                                                html += '<option value="' + v.id + '">' + v.name[Hsis.lang] + '</option>'
                                            })
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
                                                } else {
                                                    $('.sub_speciality').addClass('hidden');
                                                }
                                            })
                                        }
                                    });

                                } else if (v.type.id == 1008358) {
                                    $('#main-div #edu_level').find('option[value="1000057"]').prop('selected', true);
                                    var eduLevel = 1000057;
                                    Hsis.Proxy.getFilteredStructureList(Hsis.structureId, eduLevel, 0, function (specialities) {
                                        if (specialities) {
                                            var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                            $.each(specialities, function (i, v) {
                                                html += '<option value="' + v.id + '">' + v.name[Hsis.lang] + '</option>'
                                            })
                                            $('#main-div #orgId').html(html);
                                            $('#main-div #orgId').find('option[value="' + v.type.parentId + '"]').prop('selected', true);
                                            $('#main-div #edit_uni_action_orgId').html(html);
                                            Hsis.Proxy.getFilteredStructureList(v.type.parentId, '1008358', 0, function (subSpeciality) {
                                                if (subSpeciality) {
                                                    var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                                    $.each(subSpeciality, function (i, g) {
                                                        html += '<option value="' + g.id + '">' + g.name[Hsis.lang] + '</option>'
                                                    })
                                                    $('#sub_speciality').html(html);
                                                    $('#sub_speciality').find('option[value="' + v.id + '"]').prop('selected', true);
                                                    $('.sub_speciality').removeClass('hidden');
                                                } else {
                                                    $('.sub_speciality').addClass('hidden');
                                                }
                                            })
                                        }
                                    });

                                }
                            })
                        }


                        $('#score').val(data.score);
                    }


                });
            });
            $('.add-new').css('right', '0');
        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '.edit-contact-li', function () {
        try {

            var id = $(this).attr('data-id');
            var typeId = $(this).attr('data-type-id');
            var contactText = $(this).attr('data-contact');
            var modulType = $('#main-div').attr('data-type');
            $('#edit-contact-modal .blank-required-field').removeClass('blank-required-field');
            $('#edit-contact-modal').modal({
                backdrop: false
            });

            Hsis.Proxy.loadDictionariesByTypeId('1000011', 0, function (contactType) {
                var html = Hsis.Service.parseDictionaryForSelect(contactType);
                $('#main-div .contact-type-select').html(html);
                $('#main-div .contact-type-select').find('option[value="' + typeId + '"]').attr('selected', 'selected');
                $('#main-div .contact-text').val(contactText);
                $('#main-div .btn-contact-modal-submit').attr('data-id', id).attr('data-operation', 'edit');

            });
        } catch (err) {
            console.error(err);
        }

    });
    $('body').on('click', '.btn-contact-modal-submit', function () {
        try {
            var contactId = $(this).attr('data-id');
            var operation = $(this).attr('data-operation');
            var typeId = $('#main-div .contact-type-select').find('option:selected').val();
            var contactName = $('#main-div .contact-text').val();
            var id = $('#main-div').attr('data-id');
            var modulType = $('#main-div').attr('data-type');

            var contact = {};
            contact.id = contactId;
            contact.typeId = typeId;
            contact.contact = contactName;


            if (Hsis.Validation.validateRequiredFields('contact-required')) {
                var typeId = $('.contact-type-select').find('option:selected').val();
                if (operation == 'edit') {

                    if (modulType === 'E') {

                        if (Hsis.Validation.validateRequiredFields('contact-required')) {
                            var valid = true;
                            var contactValue = $('#contact').val();
                            $('[contact-required]').removeClass('blank-required-field');
                            if (typeId == '1000158' && !Hsis.Validation.validateEmail(contactValue)) {
                                $('#contact').addClass('blank-required-field');

                                $.notify(Hsis.dictionary[Hsis.lang]['wrong_email'], {
                                    type: 'warning'
                                });
                                valid = false;
                            } else if (typeId != '1000158' && !Hsis.Validation.validatePhoneNumber(contactValue)) {
                                $('#contact').addClass('blank-required-field');

                                $.notify(Hsis.dictionary[Hsis.lang]['wrong_phone_number'], {
                                    type: 'warning'
                                });
                                valid = false;

                            } else {
                                if (typeId != '1000158' && !Hsis.Validation.validatePhoneNumber(contactValue)) {
                                    $('#contact').addClass('blank-required-field');
                                    $.notify(Hsis.dictionary[Hsis.lang]['wrong_phone_number'], {
                                        type: 'warning'
                                    });
                                    valid = false;
                                }

                            }

                            if (valid) {
                                Hsis.Proxy.editContactTeacher(contact, function (data) {
                                    var html = '';
                                    if (data) {
                                        if (data.code == Hsis.statusCodes.OK) {
                                            Hsis.Proxy.getTeacherContactDetails(id, function (data) {
                                                $('.contact-info .panel-body').html(Hsis.Service.parseEditStudentContact(data));
                                            });

                                            $('#edit-contact-modal').modal('hide');
                                        }
                                    }
                                });
                            }


                        }

                    } else {
                        Hsis.Proxy.editContactStudent(contact, function (data) {
                            var html = '';
                            if (data) {
                                if (data.code == Hsis.statusCodes.OK) {
                                    Hsis.Proxy.getStudentContactDetails(id, function (data) {
                                        $('.contact-info .panel-body').html(Hsis.Service.parseEditStudentContact(data));
                                    });

                                    $('#edit-contact-modal').modal('hide');
                                }
                            }
                        });
                    }

                } else if (operation == 'add') {

                    if (modulType === 'E') {
                        Hsis.Proxy.addTeacherContact(id, contact, function (data) {
                            if (data && data.code === Hsis.statusCodes.OK) {
                                Hsis.Proxy.getTeacherContactDetails(id, function (data) {
                                    $('.contact-info .panel-body').html(Hsis.Service.parseEditStudentContact(data));
                                });

                                $('#edit-contact-modal').modal('hide');
                            }
                        });
                    } else {
                        Hsis.Proxy.addStudentContact(id, contact, function (data) {
                            if (data && data.code === Hsis.statusCodes.OK) {
                                Hsis.Proxy.getStudentContactDetails(id, function (data) {
                                    $('.contact-info .panel-body').html(Hsis.Service.parseEditStudentContact(data));
                                });

                                $('#edit-contact-modal').modal('hide');
                            }
                        });
                    }


                }
            }
        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '.edit-common-info', function () {
        try {
            if (Hsis.Validation.validateRequiredFields('common-required')) {
                var formData = new FormData();
                var modulType = $('#main-div').attr('data-type');
                var id = $('#main-div').attr('data-id');
                var imageId = $('body .input-file-con .new-img-con').attr('data-id');

                var info = {};
                if (imageId) {
                    info.imageId = imageId
                }
                info.firstName = $('#firstname').val();
                info.lastName = $('#lastname').val();
                info.middleName = $('#middlename').val();
                info.pinCode = $('#pincode').val();
                info.genderId = $('#gender').find('option:selected').val();
                info.socialStatusId = $('#social_status').find('option:selected').val();
                info.citizenshipId = $('#citizenship').find('option:selected').val();
                info.maritalStatusId = $('#marital_status').find('option:selected').val();
                if (modulType !== 'E') {
                    info.orphanDegreeId = $('#orphan_degree').find('option:selected').val();
                    info.disabilityDegree = $('#disability_degree').find('option:selected').val();
                }
                info.militaryServiceId = $('#military_status').find('option:selected').val();
                info.nationalityId = $('#nationality').find('option:selected').val();
                info.birthDate = $('.date-birthdate').val();
                info.token = Hsis.token;
                info.disabilityDegree = $('#disability_degree').find('option:selected').val();


                cropForm.append('form', new Blob([JSON.stringify(info)], {
                    type: "application/json"
                }));

                var src = $('.thumbnail img').attr('src');


                if (modulType === 'E') {
                    Hsis.Proxy.editCommonInfoTeacher(cropForm, function (data) {
                        if (data) {
                            Hsis.Proxy.getTeacherDetails(id, function (result) {
                                if (result.image && result.image.path) {
                                    $('body #teacher_list tbody tr[data-id="' + id + '"]').attr('data-image', result.image.path);
                                    $('.main-content-upd #teacherphoto').attr('src', Hsis.urls.HSIS + 'teachers/image/' + result.image.path + '?token=' + Hsis.token + '&size=50x50&' + Math.random());
                                    $('.main-content-upd #teacherphoto').on('error', function (e) {
                                        $(this).attr('src', 'assets/img/guest.png');
                                    })
                                }
                            })
                        }
                    });
                } else {
                    Hsis.Proxy.editCommonInfoStudent(cropForm, function (data) {
                        if (data) {
                            Hsis.Proxy.getStudentDetails(id, function (result) {
                                if (result.image && result.image.path) {
                                    $('body #student_list tbody tr[data-id="' + id + '"]').attr('data-image', result.image.path);
                                    $('.main-content-upd #studentphoto').attr('src', Hsis.urls.HSIS + 'students/image/' + result.image.path + '?token=' + Hsis.token + '&size=50x50&' + Math.random());
                                    $('.main-content-upd #studentphoto').on('error', function (e) {
                                        $(this).attr('src', 'assets/img/guest.png');
                                    })

                                }
                            })
                        }
                    });
                }
            }

        } catch (err) {
            console.error(err);
        }


    });
    $('body').on('click', '.remove-contact-li', function () {
        try {
            var contactId = $(this).attr('data-id');
            var id = $('#main-div').attr('data-id');
            var modulType = $('#main-div').attr('data-type');

            $.confirm({
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {

                    if (modulType === 'E') {
                        Hsis.Proxy.removeTeacherContact(contactId, function (data) {
                            if (data) {
                                if (data.code == Hsis.statusCodes.OK) {
                                    $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                        type: 'success'
                                    });
                                    Hsis.Proxy.getTeacherContactDetails(id, function (data) {
                                        if (data.contacts.length > 0) {
                                            $('.contact-info .panel-body').html(Hsis.Service.parseEditStudentContact(data));
                                        } else {
                                            $('.contact-info .panel-body').html('<div class="blank-panel"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
                                        }

                                    });
                                }
                            }
                        });
                    } else {
                        Hsis.Proxy.removeStudentContact(contactId, function (data) {
                            if (data) {
                                if (data.code == Hsis.statusCodes.OK) {
                                    $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                        type: 'success'
                                    });
                                    Hsis.Proxy.getStudentContactDetails(id, function (data) {
                                        if (data.contacts.length > 0) {
                                            $('.contact-info .panel-body').html(Hsis.Service.parseEditStudentContact(data));
                                        } else {
                                            $('.contact-info .panel-body').html('<div class="blank-panel"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
                                        }
                                    });
                                }
                            }
                        });
                    }

                },
                theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.add-new-contact', function () {
        var modulType = $('#main-div').attr('data-type');
        try {
            $('#edit-contact-modal .blank-required-field').removeClass('blank-required-field');
            $('#edit-contact-modal').modal({
                backdrop: false
            });

            Hsis.Proxy.loadDictionariesByTypeId('1000011', 0, function (contactType) {
                var html = Hsis.Service.parseDictionaryForSelect(contactType);
                $('#main-div .contact-type-select').html(html);
                $('#main-div .contact-text').val('');
                $('#main-div .btn-contact-modal-submit').attr('data-id', '').attr('data-operation', 'add');
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#get_permanent_address_edit', function () {
        try {
            // var street = $('#permanent_street_edit').val().trim();
            var street = $('#permanent_street_edit').val() ? $('#permanent_street_edit').val() : "-";
            var addrTreeId = $('#permanent_address_tree_edit').find('li[aria-selected="true"]').attr('id') ? $('#permanent_address_tree_edit').find('li[aria-selected="true"]').attr('id') : $('#permanent_address_edit').attr('data-addresstree-id');
            var addrTypeId = $('#permanent_address_edit').attr('data-address-type-id');
            var addrId = $('#permanent_address_edit').attr('data-id');
            var moduleType = $('#main-div').attr('data-type');

            var address = {};
            // if (street.length <= 0) {
            //     $.notify(Hsis.dictionary[Hsis.lang]['fill_street'], {
            //         type: 'warning'
            //     });
            //
            //     return false;
            // }

            address.id = addrId;
            address.typeId = addrTypeId;
            address.treeId = addrTreeId;
            address.address = street;

            if (moduleType === 'E') {
                Hsis.Proxy.editTeacherAddress(address, function (code) {
                    if (code == Hsis.statusCodes.OK) {
                        var text = $('#main-div #permanent_address_edit').attr('data-node-text');
                        var id = $('#main-div').attr('data-id');
                        Hsis.Proxy.getTeacherAddressDetails(id, function (data) {
                            Hsis.Service.parseEditStudentAddress(data);
                            $('[permanent-address-edit] .modal-content').addClass('hidden');
                        });
                    }

                });
            } else {
                Hsis.Proxy.editStudentAddress(address, function (code) {
                    if (code == Hsis.statusCodes.OK) {
                        var text = $('#main-div #permanent_address_edit').attr('data-node-text');

                        var id = $('#main-div').attr('data-id');
                        Hsis.Proxy.getStudentAddressDetails(id, function (data) {
                            Hsis.Service.parseEditStudentAddress(data);
                            $('[permanent-address-edit] .modal-content').addClass('hidden');
                        });
                    }

                });
            }

        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '#get_temporary_address_edit', function () {
        try {
            var street = $('#temporary_street_edit').val().trim() ? $('#temporary_street_edit').val().trim() : "-";
            var addrTreeId = $('#temporary_address_tree_edit').find('li[aria-selected="true"]').attr('id') ? $('#temporary_address_tree_edit').find('li[aria-selected="true"]').attr('id') : $('#temporary_address_edit').attr('data-addresstree-id');
            var addrTypeId = $('#temporary_address_edit').attr('data-address-type-id');
            var addrId = $('#temporary_address_edit').attr('data-id');
            var moduleType = $('#main-div').attr('data-type');
            var address = {};
//            if (street.length <= 0) {
//                $.notify(Hsis.dictionary[Hsis.lang]['fill_street'], {
//                    type: 'warning'
//                });
//
//                return false;
//            }

            address.id = addrId;
            address.typeId = addrTypeId;
            address.treeId = addrTreeId;
            address.address = street;

            if (moduleType === 'E') {
                Hsis.Proxy.editTeacherAddress(address, function (code) {
                    if (code == Hsis.statusCodes.OK) {
                        var text = $('#main-div #temporary_address_edit').attr('data-node-text');
                        var id = $('#main-div').attr('data-id');
                        Hsis.Proxy.getTeacherAddressDetails(id, function (data) {
                            Hsis.Service.parseEditStudentAddress(data);
                            $('[temporary-address-edit] .modal-content').addClass('hidden');
                        });
                    }

                });
            } else {
                Hsis.Proxy.editStudentAddress(address, function (code) {
                    if (code == Hsis.statusCodes.OK) {
                        var text = $('#main-div #temporary_address_edit').attr('data-node-text');
                        var id = $('#main-div').attr('data-id');
                        Hsis.Proxy.getStudentAddressDetails(id, function (data) {
                            Hsis.Service.parseEditStudentAddress(data);
                            $('[temporary-address-edit] .modal-content').addClass('hidden');
                        });
                    }

                });
            }


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#get_birth_place_edit', function () {
        try {
            var addrTreeId = $('#birth_place_tree_edit').find('li[aria-selected="true"]').attr('id') ? $('#birth_place_tree_edit').find('li[aria-selected="true"]').attr('id') : $('#birth_place_edit').attr('data-addresstree-id');
            var addrTypeId = $('#birth_place_edit').attr('data-address-type-id');
            var addrId = $('#birth_place_edit').attr('data-id');
            var moduleType = $('#main-div').attr('data-type');
            var address = {};

            address.id = addrId;
            address.typeId = addrTypeId;
            address.treeId = addrTreeId;

            if (moduleType === 'E') {
                /*Hsis.Proxy.editTeacherAddress(address, function (code) {
                    alert('3');
                    if (code == Hsis.statusCodes.OK) {
                        var text = $('#main-div #birth_place_edit').attr('data-node-text');
                        var id = $('#main-div').attr('data-id');
                        Hsis.Proxy.getTeacherAddressDetails(id, function (data) {
                            Hsis.Service.parseEditStudentAddress(data);
                            $('[birth-place-edit] .modal-content').addClass('hidden');
                        });
                    }

                });*/
            } else {
                Hsis.Proxy.editStudentAddress(address, function (code) {
                    if (code == Hsis.statusCodes.OK) {
                        var text = $('#main-div #birth_place_edit').attr('data-node-text');
                        var id = $('#main-div').attr('data-id');
                        Hsis.Proxy.getStudentAddressDetails(id, function (data) {
                            Hsis.Service.parseEditStudentAddress(data);
                            $('[birth-place-edit] .modal-content').addClass('hidden');
                        });
                    }
                });
            }
        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '.edit-academic-info', function () {
        try {
            if (Hsis.Validation.validateRequiredFields('academic-required')) {
                var endActionType = $('#main-div').attr('end-action-type');
                var studentAcademicInfo = {};
                var order = $('#order').find('option:selected').val();

                if (typeof endActionType !== undefined && endActionType !== false && endActionType > 0) {
                    studentAcademicInfo.endActionTypeId = $('.student-action-type').find('option:selected').val(),
                        studentAcademicInfo.endActionDate = $('#student-academic-action-date').val();
                    studentAcademicInfo.reasonId = $('#reasonId').find('option:selected').val();
                    if ($('#order').attr('order-type').length > 0 && $('#order').attr('order-type') == "out") {
                        studentAcademicInfo.endOrdeId = order;
                    }

                }

                var actionDate = $('.second-info-date').val();
                var eduLevelId = $('#edu_level').find('option:selected').val();
                var actionTypeId = $('#action_type').find('option:selected').val();
                var eduLineId = $('#edu_line').find('option:selected').val();
                var eduLangId = $('#edu_lang').find('option:selected').val();
                var eduTypeId = $('#edu_type').find('option:selected').val();
                var edupayTypeId = $('#edu_pay_type').find('option:selected').val();
                var studentCardNumber = $('.student-card-number').val();
                var applyScore = $('#score').val();
                var pelcId = $('#main-div').attr('data-pelc-id');
                var specId = $('#orgId').find('option:selected').val();
                var status = $('#main-div').attr('data-status');
                var subValue = $('#sub_speciality').find('option:selected').val();

                studentAcademicInfo.status = status;
                studentAcademicInfo.orgId = (typeof subValue !== undefined && subValue > 0) ? subValue : specId;
                studentAcademicInfo.actionDate = actionDate;
                studentAcademicInfo.cardNo = studentCardNumber;
                studentAcademicInfo.eduLevelId = eduLevelId;
                studentAcademicInfo.actionTypeId = actionTypeId;
                studentAcademicInfo.eduLineId = eduLineId;
                studentAcademicInfo.eduLangId = eduLangId;
                studentAcademicInfo.eduTypeId = eduTypeId;
                studentAcademicInfo.edupayTypeId = edupayTypeId;
                studentAcademicInfo.applyScore = applyScore;


                studentAcademicInfo.id = pelcId;
                if (Hsis.Validation.validateRequiredFields('data-required-ac')) {
                    Hsis.Proxy.editStudentAcademicInfo(studentAcademicInfo, function (data) {

                    });
                }
            }

        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '.student-gender a, .student-citizenship a, .student-status a , .student-action-type a, .student-sub-action-type a, .edu_type a, .citizenship a', function (e) {
        var text = $(this).text();
        $(this).parents('.btn-group').find('button span').text(text);
    });

    $('body').on('click', '.staff-table-gender a, .teacher-gender a, .teacher-citizenship a, .teacher-status a, .teacher-staff-type a, .staff-table-type a', function (e) {
        var text = $(this).text();
        $(this).parents('.btn-group').find('button span').text(text);
    });

    $('body').on('click', '#edu_type a, #student_status a, #citizenship a, #student_action_type a, #student_sub_action_type a', function (e) {
        var text = $(this).text();
        $(this).parents('.btn-group').find('button span').text(text);
    });

    $('body').on('click', '.university-list-filter a, .faculty-list-filter a, .speciality-list-filter a, .edu-level-list-filter a, .group_type a', function (e) {
        var text = $(this).text();
        $(this).parents('.btn-group').find('button span').text(text);
    });

    $('body').on('click', '.share-type-list-filter a, .share-priority-list-filter a', function (e) {
        var text = $(this).text();
        $(this).parents('.btn-group').find('button span').text(text);
    })


    $('#main-div ').on('click', '.doc-delete', function () {
        try {
            var docFileId = $(this).parent('.user-doc-file').attr('data-file-id');
            var docFilePath = $(this).parent('.user-doc-file').attr('data-file-path');
            var $obj = $(this);
            $.confirm({
                content: Hsis.dictionary[Hsis.lang]['remove_file'],
                confirm: function () {
                    Hsis.Proxy.removeDocFiles(docFileId, docFilePath, function (data) {
                        if (data.code == Hsis.statusCodes.OK) {
                            $obj.parent('.user-doc-file').remove();
                        }
                    })
                },
                theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.student_doc_edit', function () {

        try {
            $('.add-document-modal .blank-required-field').removeClass('blank-required-field');
            $('.edit-document-modal').modal({
                backdrop: false
            });


            var docId = $(this).attr('data-id');
            var documentType = $(this).attr('data-doc-type')
            var docTypeId = $(this).attr('data-type-id');
            var docSerial = $(this).attr('data-doc-serial');
            var docNumber = $(this).attr('data-doc-number');
            var docStartDate = $(this).attr('data-doc-start-date') === '-' ? '' : $(this).attr('data-doc-start-date');
            var docEndDate = $(this).attr('data-doc-end-date') && $(this).attr('data-doc-end-date').trim().length > 0 ? '' : $(this).attr('data-doc-end-date').trim();
            var parentId = $('#main-div #citizenship').find('option:selected').attr('parent');
            if (documentType === 'personal') {
                Hsis.Proxy.loadDictionariesByTypeId('1000029', parentId, function (docTypes) {
                    var html = Hsis.Service.parseDictionaryForSelect(docTypes);
                    $('.edit-document-modal .edit-document-type').html(html);
                    $('.edit-document-modal .edit-document-type').find('option[value="' + docTypeId + '"]').attr('selected', 'selected');
                });
            } else if (documentType === 'academic') {
                Hsis.Proxy.loadDictionariesByTypeId('1000040', 0, function (docTypes) {
                    var html = Hsis.Service.parseDictionaryForSelect(docTypes);
                    $('.edit-document-modal .edit-document-type').html(html);
                    $('.edit-document-modal .edit-document-type').find('option[value="' + docTypeId + '"]').attr('selected', 'selected');
                });
            } else if (documentType === 'school') {
                Hsis.Proxy.loadDictionariesByTypeId('1000040', 0, function (docTypes) {
                    var html = Hsis.Service.parseDictionaryForSelect(docTypes);
                    $('.edit-document-modal .edit-document-type').html(html);
                    $('.edit-document-modal .edit-document-type').find('option[value="' + docTypeId + '"]').attr('selected', 'selected');
                });
            } else if (documentType === 'work') {
                Hsis.Proxy.loadDictionariesByTypeId('1000041', 0, function (docTypes) {
                    var html = Hsis.Service.parseDictionaryForSelect(docTypes);
                    $('.edit-document-modal .edit-document-type').html(html);
                    $('.edit-document-modal .edit-document-type').find('option[value="' + docTypeId + '"]').attr('selected', 'selected');
                });
            }

            $('.edit-document-modal .edit-document-serial').val(docSerial);
            $('.edit-document-modal .edit-document-number').val(docNumber);
            $('.edit-document-modal .edit-document-date').val(docStartDate);
            $('.edit-document-modal .edit-document-endDate').val(docEndDate);
            $('.edit-document-modal .edit-document-submit').attr('data-id', docId);
        } catch (err) {
            console.error(err);
        }

    })

    $('#main-div ').on('click', '.edit-document-submit', function () {
        try {
            if (Hsis.Validation.validateRequiredFields('edit-doc-required')) {
                var docId = $(this).attr('data-id');
                var docTypeId = $('#main-div .edit-document-type').find('option:selected').val();
                var docSerial = $('#main-div .edit-document-serial').val();
                var docNumber = $('#main-div .edit-document-number').val();
                var docStartDate = $('#main-div .edit-document-date').val();
                var docEndDate = $('#main-div .edit-document-endDate').val().trim();
                var moduleType = $('#main-div').attr('data-type');
                var document = {};
                document.id = docId;
                document.type = docTypeId;
                document.serial = docSerial;
                document.number = docNumber;
                document.startDate = $.trim(docStartDate);
                document.endDate = $.trim(docEndDate);

                if (moduleType === 'E') {
                    Hsis.Proxy.editTeacherDocument(document, function (data) {
                        if (data.code == Hsis.statusCodes.OK) {
                            $('.edit-document-modal').modal('hide');
                            var id = $('#main-div').attr('data-id');
                            Hsis.Proxy.getTeacherDetails(id, function (data) {
                                var html = '';
                                var personal = 'personal';
                                var work = 'work';
                                if (data.documents.length > 0) {
                                    $('.add-doc-block .panel-body').html(Hsis.Service.parseEditTeacherDocument(data.documents, personal));
                                }
                                if (data.pwlcDocuments.length > 0) {
                                    $('.activity_name #work_doc_add').html(Hsis.Service.parseEditTeacherDocument(data.pwlcDocuments, work));
                                }


                            })
                        }
                    })
                } else {
                    Hsis.Proxy.editStudentDocument(document, function (data) {
                        if (data.code == Hsis.statusCodes.OK) {
                            $('.edit-document-modal').modal('hide');
                            var id = $('#main-div').attr('data-id');
                            Hsis.Proxy.getStudentDetails(id, function (data) {
                                var html = '';
                                var personal = 'personal';
                                var academic = 'academic';
                                var school = 'school';

                                if (data.documents.length > 0) {
                                    $('.add-doc-block .panel-body').html(Hsis.Service.parseEditStudentDocument(data.documents, personal));
                                }
                                if (data.pelcDocuments.length > 0) {
                                    $('.activity_name #acad_doc_add').html(Hsis.Service.parseEditStudentDocument(data.pelcDocuments, academic));
                                }
                                if (data.schoolDocuments.length > 0) {
                                    $('#past_edu_doc').html(Hsis.Service.parseEditStudentDocument(data.schoolDocuments, school));
                                }

                            })
                        }
                    })
                }
            }
        } catch (err) {
            console.error(err);
        }
    })

    $('body').on('click', '.student_doc_remove', function () {
        var docId = $(this).attr('data-id');
        var $obj = $(this);
        var moduleType = $('#main-div').attr('data-type');
        var parent = $obj.parents('.panel-body').first();
        try {
            $.confirm({
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    if (moduleType === 'E') {
                        Hsis.Proxy.removeTeacherDocument(docId, function (data) {
                            if (data) {
                                if (data.code == Hsis.statusCodes.OK) {

                                    $obj.parents('.doc-item').remove();
                                    if (parent.children('.for-align').length == 0) {
                                        parent.html('<div class="blank-panel"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
                                    }
                                }
                            }
                        });
                    } else {
                        Hsis.Proxy.removeStudentDocument(docId, function (data) {
                            if (data) {
                                if (data.code == Hsis.statusCodes.OK) {
                                    $obj.parents('.doc-item').remove();
                                    $obj.parents('.doc-item').remove();
                                    if (parent.children('.for-align').length == 0) {
                                        parent.html('<div class="blank-panel"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
                                    }
                                }
                            }
                        });
                    }

                },
                theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.static-doc-edit', function () {
        try {
            var attr = $(this).attr('data-unique-attr');
            var divInfo = $('#main-div').find('div[data-unique-attr="' + attr + '"]')
            $('.edit-document-modal').modal();

            $('.edit-document-modal .edit-document-submit').removeClass('edit-document-submit').addClass('static-edit-submit')
            $('.edit-document-modal .static-edit-submit').attr('data-unique-attr', attr);

            var docTypeId = divInfo.find('.add-doc-type').attr('data-id');
            var docSerial = divInfo.find('.add-doc-serial').text();
            var docNumber = divInfo.find('.add-doc-number').text();
            var docStartDate = divInfo.find('.add-doc-date').text();

            $('.edit-document-modal .edit-document-type').find('option[value="' + docTypeId + '"]').attr('selected', 'selected');
            $('.edit-document-modal .edit-document-serial').val(docSerial);
            $('.edit-document-modal .edit-document-number').val(docNumber);
            $('.edit-document-modal .edit-document-date').val(docStartDate);
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.static-edit-submit', function () {
        try {
            var attr = $(this).attr('data-unique-attr');
            var divInfo = $('#main-div').find('div[data-unique-attr="' + attr + '"]')
            var typeId = $('.edit-document-modal .edit-document-type').find('option:selected').val();
            var type = $('.edit-document-modal .edit-document-type').find('option:selected').text();
            var serial = $('.edit-document-modal .edit-document-serial').val();
            var number = $('.edit-document-modal .edit-document-number').val();
            var date = $('.edit-document-modal .edit-document-date').val();
            var endDate = $('.edit-document-modal .edit-document-endDate').val();
            divInfo.find('.add-doc-type').removeAttr('data-id').attr('data-id', typeId);
            divInfo.find('.add-doc-type').text(type);
            divInfo.find('.add-doc-serial').text(serial);
            divInfo.find('.add-doc-number').text(number);
            divInfo.find('.add-doc-date').text(date);
            divInfo.find('.add-doc-file').removeAttr('data-type-id data-serial data-number data-date data-end-date')
            divInfo.find('.add-doc-file').attr({
                'data-type-id': typeId,
                'data-serial': serial,
                'data-number': number,
                'data-date': date,
                'data-end-date': endDate
            });
            $('.edit-document-modal .static-edit-submit').removeClass('static-edit-submit').addClass('edit-document-submit')
            $('.edit-document-modal .edit-document-submit').removeAttr('data-unique-attr');
            $('.edit-document-modal').hide();
        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('change', '.add-doc-file', function (e) {
        var docId = $(this).attr('data-doc-id');
        var moduleType = $('#main-div').attr('data-type');
        var count = 0;
        try {
            var formData = new FormData();
            if ($(this)[0].files) {
                for (var i = 0; i < $(this)[0].files.length; i++) {
                    
                    if (Hsis.Validation.checkFile($(this)[0].files[i].type, fileTypes.FILE_CONTENT_TYPE)) {
                
                        formData.append("file", $(this)[0].files[i])
                        ++count;
                        
                    } else {
                        $.notify(Hsis.dictionary[Hsis.lang]['wrong_format'] + $(this)[0].files[i].name, {
                            type: 'warning'
                        });
                    }
                    
                    
                }
            }

            if(count > 0) {
                if (moduleType === 'E') {
                    Hsis.Proxy.addTeacherFiles(docId, formData, function (data) {
                        if (data.code = Hsis.statusCodes.OK) {
                            var id = $('#main-div').attr('data-id');
                            Hsis.Proxy.getTeacherDetails(id, function (data) {
                                var html = '';
                                var personal = 'personal';
                                var work = '';
                                if (data.documents.length > 0) {
                                    $('.add-doc-block .panel-body').html(Hsis.Service.parseEditTeacherDocument(data.documents, personal));
                                }
                                if (data.pwlcDocuments.length > 0) {
                                    $('.activity_name #work_doc_add').html(Hsis.Service.parseEditTeacherDocument(data.pwlcDocuments, work));
                                }

                            })
                        }
                    })
                } else {
                    Hsis.Proxy.addStudentFiles(docId, formData, function (data) {
                        if (data.code = Hsis.statusCodes.OK) {
                            var id = $('#main-div').attr('data-id')
                            Hsis.Proxy.getAbroadStudentDetails(id, function (data) {
                                var html = '';
                                var personal = 'personal';
                                var academic = 'academic';
                                var school = 'school'
                                if (data.documents.length > 0) {
                                    $('.add-doc-block .panel-body').html(Hsis.Service.parseEditStudentDocument(data.documents, personal));
                                }
                                if (data.pelcDocuments.length > 0) {
                                    $('.activity_name #acad_doc_add').html(Hsis.Service.parseEditStudentDocument(data.pelcDocuments, academic));
                                }
                                if (data.schoolDocuments.length > 0) {
                                    $('#past_edu_doc').html(Hsis.Service.parseEditStudentDocument(data.schoolDocuments, school));
                                }
                            })
                        }
                    })
                }
                
            }

            

        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '#operation_1000030', function (e) {
        ;
        $('body').find('.new-upd').css('right', '0');
    });

    $('#main-div').on('click', '.teacher-pincode-button-next', function () {
        var obj = $(this);
        var dataAttr = obj.attr('data-attr');
        var count = obj.attr('data-count');
        var pincode = $('#main-div .search-pincode').val();
        if (!pincode) {
            $.notify(Hsis.dictionary[Hsis.lang]['add_pincode'], {

                type: 'warning'
            });
            return false;
        }

        if (dataAttr !== '2') {
            obj.attr('data-attr', '2');
            Hsis.Proxy.getTeacherByPincode(pincode, function (data) {

                if (data == 0) {
                    $('#main-div .teacher-pincode').text(pincode);
                    $('#main-div .teacher-pincode-label').text("Axtardiginiz pinkoda uygun istifad?çi tapilmadi!");
                    $('#main-div .teacher-pincode-div-first').addClass('hidden');
                    $('#main-div .teacher-pincode-button-back').removeClass('hidden');
                    $('#main-div .teacher-pincode-div-second').removeClass('hidden');
                } else {
                    $('#main-div .teacher-pincode-button-next').removeAttr('data-attr');
                    $('#main-div .teacher-pincode-div-first').removeClass('hidden');
                    $('#main-div .teacher-pincode-button-back').addClass('hidden');
                    $('#main-div .teacher-pincode-div-second').addClass('hidden');
                    $('#main-div .teacher-pincode-label').text('');
                    $('#main-div .teacher-pincode').text('');
                    $('#main-div .search-pincode').val('');
                    obj.removeAttr('data-attr');
                    obj.removeAttr('data-count');
                    Hsis.Proxy.getTeacherDetailsByPincode(pincode, function (result) {

                        $('#main-div .search-pincode-teacher-modal').modal("hide");
                        $('body').find('.new-upd').css('right', '-100%');
                        setTimeout(function () {
                            $('body').find('.add-new').css('right', '0');
                        }, 400);
                        $('body').find('.add-new .search-scroll').load('partials/teacher_edit.html', function () {
                            if (result && result.code == Hsis.statusCodes.OK) {
                                if (result.data.image && result.data.image.path) {
                                    $('body .input-file-con .new-img-con').fadeIn(1);
                                    $('body .input-file-con .new-img-con img').attr('src', Hsis.urls.HSIS + 'students/image/' + (result.data.image.path ? result.data.image.path : '') + '?token=' + Hsis.token + '&size=200x200&' + Math.random());


                                    $('body .input-file-con .new-img-con img').on('error', function (e) {
                                        $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                                    });
                                } else {
                                    $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                                }

                                var data = result.data;
                                $('#firstname').text(data.firstName);
                                $('#lastname').text(data.lastName);
                                $('#middlename').text(data.middleName);
                                $('#pincode').text(pincode).attr('disabled', 'disabled');
                                $('#citizenship').text(data.citizenship.value[Hsis.lang]);
                                $('#gender').text(data.gender.value[Hsis.lang])
                                $('#marital_status').text(data.maritalStatus.value[Hsis.lang] ? data.maritalStatus.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                                $('#social_status').text(data.socialStatus.value[Hsis.lang] ? data.socialStatus.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                                $('#orphan_degree').text(data.orphanDegree.value[Hsis.lang] ? data.orphanDegree.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                                $('#military_status').text(data.militaryService.value[Hsis.lang] ? data.militaryService.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                                $('#nationality').text(data.nationality.value[Hsis.lang] ? data.nationality.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information'])
                                $('#birthdate').text(data.birthDate);
                                $('#main-div').attr('data-id', data.id);
                                $('#main-div').attr('data-type', 'E');
                                $('#main-div #confirmTeacher').attr('data-id', data.id);

                                Hsis.Service.parseEditStudentAddress(data);
                                if (data && data.personEduLifeCycles) {
                                    $('#main-div .edu_info-block .panel-body').html(Hsis.Service.parseTeacherAction(data.personEduLifeCycles));
                                }

                                $('.contact-info .panel-body').html(Hsis.Service.parseViewStudentContact(data));
                                var personal = 'personal';

                                if (data.documents.length > 0) {
                                    $('.add-doc-block .panel-body[data-doc-type="personal"]').html(Hsis.Service.parseViewTeacherDocument(data.documents, personal));
                                }

                                $('.edu_info .edu-info-block').html(Hsis.Service.parseViewTeacherEduLifeCycle(data));

                                if (data.pwlcDocuments.length > 0) {
                                    $('#work_doc_add').html(Hsis.Service.parseViewTeacherDocument(data.pwlcDocuments, 'academic'));
                                }

                                if (data.subjects.length > 0) {
                                    $('#append_subjects').html(Hsis.Service.parseViewTeacherSubjects(data));
                                }
                                if (data.languages.length > 0) {
                                    $('#append_languages').html(Hsis.Service.parseViewTeacherLanguages(data));
                                }

                                if (data.academicDegrees.length > 0) {
                                    $('.edit-academic-degree-info .panel-body').html(Hsis.Service.parseTeacherAcademicDegree(data.academicDegrees));
                                }
                                if (data.academicActivitys.length > 0) {
                                    $('.research-history-info .panel-body').html(Hsis.Service.parseTeacherAcademicActivity(data.academicActivitys));
                                }

                                Hsis.Service.parseWorkLifeCycle(data.workActions);
                                $('li .edit-work-action,li .erase-work-action').remove();
                            }
                        });
                    })
                }
            })

        } else {
            $('#main-div .teacher-pincode-button-next').removeAttr('data-attr');
            $('#main-div .teacher-pincode-div-first').removeClass('hidden');
            $('#main-div .teacher-pincode-button-back').addClass('hidden');
            $('#main-div .teacher-pincode-div-second').addClass('hidden');
            $('#main-div .teacher-pincode-label').text('');
            $('#main-div .teacher-pincode').text('');
            $('#main-div .search-pincode').val('');
            obj.removeAttr('data-attr');
            obj.removeAttr('data-count')

            if ($("#main-div .check-iamas-input").is(':checked')) {
                Hsis.Proxy.getPersonInfoByPinCode(pincode, function (data) {
                    if (data && data.firstName && data.lastName && data.middleName && data.birthDate) {
                        $('#main-div .search-pincode-teacher-modal').modal("hide");
                        $('body').find('.new-upd').css('right', '-100%');
                        setTimeout(function () {
                            $('body').find('.add-new').css('right', '0');
                        }, 400);
                        $('body').find('.add-new .search-scroll').load('partials/teacher_add.html', function () {
                            $('body').removeClass('modal-open');
                            $('#pincode').val(pincode).attr('disabled', 'disabled')
                            $('#main-div #firstname').val(data.firstName);
                            $('#main-div #lastname').val(data.lastName);
                            $('#main-div #middlename').val(data.middleName.split(' ')[0]);
                            $('#main-div #birthdate').val(data.birthDate);
                            $('#main-div #citizenship').find('option[value="' + (data.citizenship.value[Hsis.lang] === "AZE" ? 1000118 : 0) + '"]').attr('selected', 'selected');
                            $('#main-div #gender').find('option[value="' + (data.gender.value[Hsis.lang] === "Kisi" ? 1000036 : (data.gender.value[Hsis.lang] === "Qadin" ? 1000035 : 0)) + '"]').attr('selected', 'selected');
                            $('#main-div #marital_status').find('option[value="' + (data.socialStatus.value[Hsis.lang] === "Evli" ? 1000379 : (data.socialStatus.value[Hsis.lang] === "Subay" ? 1000189 : 0)) + '"]').attr('selected', 'selected');

                            $('#main-div #studentphoto').attr('src', data.image.file);
                            $('#main-div #studentphoto').on('error', function (e) {
                                $(this).attr('src', 'assets/img/guest.png');
                            });
                        });
                    } else {
                        $.notify('Axtardiginiz pinkod mövcud deyil!', {
                            type: 'warning'
                        });
                    }
                });
            } else {

                $('#main-div .search-pincode-teacher-modal').modal("hide");
                $('body').find('.new-upd').css('right', '-100%');
                setTimeout(function () {
                    $('body').find('.add-new').css('right', '0');
                }, 400);
                $('body').find('.add-new .search-scroll').load('partials/teacher_add.html', function () {
                    $('body').removeClass('modal-open');
                    $('#pincode').val(pincode).attr('disabled', 'disabled')

                });
            }

        }

    })


    $('#main-div').on('click', '.teacher-pincode-button-back', function () {
        $('#main-div .teacher-pincode-button-next').removeAttr('data-attr');
        $('#main-div .teacher-pincode-div-first').removeClass('hidden');
        $('#main-div .teacher-pincode-button-back').addClass('hidden');
        $('#main-div .teacher-pincode-div-second').addClass('hidden');
        $('#main-div .teacher-pincode-label').text('');
        $('#main-div .teacher-pincode').text('');

    })

    $('body').on('click', '#teacher_list tbody tr', function (e) {
        try {
            var firstName = $(this).attr('data-firstname');
            var lastName = $(this).attr('data-lastname');
            var id = $(this).attr('data-id');
            var pwlcId = $(this).attr('data-pwlc-id');
            var orgName = $(this).attr('data-orgname');
            var imagePath = $(this).attr('data-image');
            $('body').attr('data-pwlc-id', pwlcId);
            $('body').find('dd[data-firstname]').html(firstName);
            $('body').find('dd[data-lastname]').html(lastName);
            $('body').find('dd[data-orgname]').html(orgName);
            if (imagePath && imagePath.trim().length > 0) {
                $('.main-content-upd #teacherphoto').attr('src', Hsis.urls.HSIS + 'teachers/image/' + imagePath + '?token=' + Hsis.token + '&size=50x50&' + Math.random());
                $('.main-content-upd #teacherphoto').on('error', function (e) {
                    $(this).attr('src', 'assets/img/guest.png');
                })
            } else {
                $('.main-content-upd #teacherphoto').attr('src', 'assets/img/guest.png');
            }

            $('.main-content-upd #buttons_div').attr('data-id', id);
            $('.main-content-upd #buttons_div').attr('data-pwlc-id', pwlcId);
            var statusId = $(this).attr('data-status-id');
            var obj = {
                status: {
                    id: statusId.length > 0 ? statusId : 0
                }
            };
            $('.type_2_btns').html(Hsis.Service.parseOperations(Hsis.operationList, '2', obj))
            $('body').find('.col-sm-12.data').removeClass('col-sm-12').addClass('col-sm-9');
            $('body').find('.col-sm-3.info').fadeIn(1).css('right', '0');
        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '#operation_1000033', function () {
        try {

            if (!$('#buttons_div').attr('data-id')) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'warning'
                });
                return false;
            }

            $.confirm({
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    var id = $('.main-content-upd #buttons_div').attr('data-pwlc-id');
                    Hsis.Proxy.removeTeacher(id, function () {
                        $('.module-block[data-id="' + Hsis.currModule + '"] a').click();
                    });
                },
                theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1000032', function () {
        try {
            if (!$('#buttons_div').attr('data-id')) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'warning'
                });
                return false;
            }
            var id = $('.main-content-upd #buttons_div').attr('data-id');
            $('.add-new .search-scroll').load('partials/teacher_edit.html', function () {
                Hsis.Proxy.getTeacherDetails(id, function (data) {
                    var html = '';

                    if (data.image && data.image.path) {
                        $('body .input-file-con .new-img-con').fadeIn(1)
                        $('body .input-file-con .new-img-con img').attr('src', Hsis.urls.HSIS + 'teachers/image/' + data.image.path + '?token=' + Hsis.token + '&size=200x200&' + Math.random());

                        $('body .input-file-con .new-img-con img').on('error', function (e) {
                            $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                        });
                    }
                    $('#firstname').text(data.firstName);
                    $('#lastname').text(data.lastName);
                    $('#middlename').text(data.middleName);
                    $('#pincode').text(data.pinCode);
                    $('#citizenship').text(data.citizenship.value[Hsis.lang]);
                    $('#gender').text(data.gender.value[Hsis.lang])
                    $('#marital_status').text(data.maritalStatus.value[Hsis.lang] ? data.maritalStatus.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                    $('#social_status').text(data.socialStatus.value[Hsis.lang] ? data.socialStatus.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                    $('#orphan_degree').text(data.orphanDegree.value[Hsis.lang] ? data.orphanDegree.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                    $('#military_status').text(data.militaryService.value[Hsis.lang] ? data.militaryService.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                    $('#nationality').text(data.nationality.value[Hsis.lang] ? data.nationality.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information'])
                    $('#disability_degree').text(data.disabilityDegree.value[Hsis.lang] ? data.disabilityDegree.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information'])
                    $('.date-birthdate').text(data.birthDate);

                    $('#main-div').attr('data-id', data.id);
                    $('#main-div').attr('data-pwlc-id', data.pwlcId);
                    $('#main-div').attr('data-type', 'E');

                    Hsis.Service.parseEditStudentAddress(data);

                    $('.contact-info .panel-body').html(Hsis.Service.parseViewStudentContact(data));
                    var personal = 'personal';
                    var work = 'work';

                    if (data.documents.length > 0) {
                        $('.add-doc-block .panel-body').html(Hsis.Service.parseViewTeacherDocument(data.documents, personal));
                    }

                    if (data.pwlcDocuments.length > 0) {
                        $('.activity_name #work_doc_add').html(Hsis.Service.parseEditTeacherDocument(data.pwlcDocuments, work));
                    }


                    if (data.languages.length > 0) {
                        $('#append_languages').html(Hsis.Service.parseTeacherLanguages(data));
                    }

                    if (data.subjects.length > 0) {
                        $('#append_subjects').html(Hsis.Service.parseTeacherSubjects(data));
                    }

                    if (data.personEduLifeCycles.length > 0) {
                        $('#main-div .edu_info .edu-info-block').html(Hsis.Service.parseEditTeacherEduLifeCycle(data));
                    }


                    if (data.academicDegrees.length > 0) {
                        $('.edit-academic-degree-info .panel-body').html(Hsis.Service.parseTeacherAcademicDegree(data.academicDegrees));
                    }
                    if (data.academicActivitys.length > 0) {
                        $('.edit-research-history-info .panel-body').html(Hsis.Service.parseTeacherAcademicActivity(data.academicActivitys));
                    }

                    Hsis.Service.parseWorkLifeCycle(data.workActions);


                });
            });
            $('.add-new').css('right', '0')
        } catch (err) {
            console.error(err);
        }


    });

    $('body').on('click', '#operation_1000076', function () {
        try {

            if (!$('#buttons_div').attr('data-id')) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'warning'
                });
                return false;
            }

            var id = $('.main-content-upd #buttons_div').attr('data-id');
            $('.advanced-upd .search-scroll').load('partials/teacher_edit_personal_info.html', function () {
                Hsis.Proxy.getTeacherDetails(id, function (data) {
                    var html = '';

                    if (data.image && data.image.path) {
                        $('body .input-file-con .new-img-con').fadeIn(1);
                        $('body .input-file-con .new-img-con img').attr('src', Hsis.urls.HSIS + 'teachers/image/' + data.image.path + '?token=' + Hsis.token + '&size=200x200&' + Math.random());
                        $('body .input-file-con .new-img-con').attr('data-id', data.image.id);
                        $('body .input-file-con .new-img-con').on('error', function (e) {
                            $('body .input-file-con .new-img-con').attr('src', 'assets/img/guest.png');
                        });
                    } else {

                    }
                    $('.search-scroll #firstname').val(data.firstName);
                    $('.search-scroll #lastname').val(data.lastName);
                    $('.search-scroll #middlename').val(data.middleName);
                    $('.search-scroll #pincode').val(data.pinCode).attr('disabled', 'disabled');
                    $('.search-scroll #citizenship').find('option[value="' + data.citizenship.id + '"]').attr('selected', 'selected');
                    $('.search-scroll #gender').find('option[value="' + data.gender.id + '"]').attr('selected', 'selected');
                    $('.search-scroll #marital_status').find('option[value="' + data.maritalStatus.id + '"]').attr('selected', 'selected');
                    $('.search-scroll #social_status').find('option[value="' + data.socialStatus.id + '"]').attr('selected', 'selected');
                    $('.search-scroll #orphan_degree').find('option[value="' + data.orphanDegree.id + '"]').attr('selected', 'selected');
                    $('.search-scroll #disability_degree').find('option[value="' + data.disabilityDegree.id + '"]').attr('selected', 'selected');
                    $('.search-scroll #military_status').find('option[value="' + data.militaryService.id + '"]').attr('selected', 'selected');
                    $('.search-scroll #nationality').find('option[value="' + data.nationality.id + '"]').attr('selected', 'selected');
                    $('.search-scroll .date-birthdate').val(data.birthDate);
                    $('#main-div').attr('data-id', data.id);
                    $('#main-div').attr('data-pwlc-id', data.pwlcId);
                    $('#main-div').attr('data-type', 'E');

                    Hsis.Service.parseEditStudentAddress(data);

                    if (data.contacts.length > 0) {
                        $('.contact-info .panel-body').html(Hsis.Service.parseEditStudentContact(data));
                    } else {
                        $('.contact-info .panel-body').html('<div class="blank-panel"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
                    }

                    var personal = 'personal';
                    var work = 'work';

                    if (data.documents.length > 0) {
                        $('.add-doc-block .panel-body').html(Hsis.Service.parseEditTeacherDocument(data.documents, personal));
                    } else {
                        $('.add-doc-block .panel-body').html('<div class="blank-panel"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
                    }


                });
            });
            $('.advanced-upd').css('right', '0')
        } catch (err) {
            console.error(err);
        }


    });
    $('.main-content-upd').on('keypress', '#student_search', function (e) {
        try {

            if (e.keyCode == 13) {
                var keyword = $('#student_search').val();

                if (keyword.trim().length > 2) {
                    $('.btn-load-more').removeAttr('data-page');
                    $('.student-search-form input[name="keyword"]').val(keyword);
                    var queryparams = $('.main-content-upd .student-search-form').serialize();
                    Hsis.Proxy.searchStudent('', queryparams + '&subModuleId=' + Hsis.subModuleId);
                } else if (keyword.trim().length == 0) {
                    $('.btn-load-more').removeAttr('data-page');
                    $('.student-search-form input[name="keyword"]').val('');
                    var params = $('.main-content-upd .student-search-form').serialize();
                    Hsis.Proxy.loadStudents('', params + '&subModuleId=' + Hsis.subModuleId);
                }
            }

        } catch (err) {
            console.error(err);
        }
    });
    $('.main-content-upd').on('keypress', '#abroad_student_search', function (e) {
        try {

            if (e.keyCode == 13) {
                $('body').removeAttr('search-param');
                $('body').attr('search-param', '0');
                var keyword = $('#abroad_student_search').val();
                if (keyword.trim().length > 0) {
                    /*length en azi 2 simvol olmalidir. 0 test olaraqdan qoyulub*/
                    $('.btn-load-more').removeAttr('data-page');
                    $('.abroad_student-search-form input[name="keyword"]').val(keyword);
                    var queryparams = $('.main-content-upd .abroad_student-search-form').serialize();
                    Hsis.Proxy.loadAbroadStudents('', queryparams);
                } else if (keyword.trim().length == 0) {
                    $('.btn-load-more').removeAttr('data-page');
                    $('.abroad_student-search-form input[name="keyword"]').val('');
                    var params = $('.main-content-upd .abroad_student-search-form').serialize();
                    Hsis.Proxy.loadAbroadStudents('', params);
                }
            }

        } catch (err) {
            console.error(err);
        }
    });

    $('.main-content-upd').on('keypress', '#abroad_archive_student_search', function (e) {
        try {

            if (e.keyCode == 13) {
                var keyword = $('#abroad_archive_student_search').val();

                if (keyword.trim().length > 0) { /*length en azi 2 simvol olmalidir. 0 test olaraqdan qoyulub*/
                    $('.btn-load-more').removeAttr('data-page');
                    $('.abroad_student-search-form input[name="keyword"]').val(keyword);
                    var queryparams = $('.main-content-upd .abroad_student-search-form').serialize();
                    Hsis.Proxy.loadArchiveAbroadStudents('', queryparams);
                } else if (keyword.trim().length == 0) {
                    $('.btn-load-more').removeAttr('data-page');
                    $('.abroad_student-search-form input[name="keyword"]').val('');
                    var params = $('.main-content-upd .abroad_student-search-form').serialize();
                    Hsis.Proxy.loadArchiveAbroadStudents('', params);
                }
            }

        } catch (err) {
            console.error(err);
        }
    });
    $('.main-content-upd').on('keypress', '#technical_search', function (e) {
        try {

            if (e.keyCode == 13) {
                var keyword = $('#technical_search').val();

                if (keyword.trim().length > 2) {
                    $('.btn-load-more').removeAttr('data-page');
                    $('.technical-search-form input[name="name"]').val(keyword);
                    var queryparams = $('.main-content-upd .technical-search-form').serialize();
                    Hsis.Proxy.getTechnicalBaseList('', queryparams);
                } else if (keyword.trim().length == 0) {
                    $('.btn-load-more').removeAttr('data-page');
                    $('.technical-search-form input[name="name"]').val('');
                    var queryparams = $('.main-content-upd .technical-search-form').serialize();
                    Hsis.Proxy.getTechnicalBaseList('', queryparams);
                }
            }

        } catch (err) {
            console.error(err);
        }
    });

    $('.main-content-upd').on('keypress', '#teacher_search', function (e) {
        try {
            if (e.keyCode == 13) {
                var keyword = $('#teacher_search').val();

                if (keyword.trim().length > 2) {
                    $('.btn-load-more').removeAttr('data-page');
                    $('.teacher-search-form input[name="keyword"]').val(keyword);
                    var queryparams = $('.main-content-upd .teacher-search-form').serialize() + '&subModuleId=' + Hsis.subModuleId;
                    Hsis.Proxy.searchTeacher('', queryparams);
                } else if (keyword.trim().length == 0) {
                    $('.btn-load-more').removeAttr('data-page');
                    $('.teacher-search-form input[name="keyword"]').val('');
                    var params = $('.main-content-upd .teacher-search-form').serialize();
                    Hsis.Proxy.loadTeachers('', params);
                }
            }
        } catch (err) {
            console.error(err);
        }
    });

    //Xtms teskilati struktur
    $('.main-content-upd').on('keypress', '#xtms-structure-search', function (e) {
        try {
            if (e.keyCode == 13) {
                var keyword = $('#xtms-structure-search').val();
                if (keyword.trim().length >= 1) {
                    $('.btn-load-more').removeAttr('data-page');
                    $('.xtms-structure-form input[name="keyWord"]').val(keyword);
                    var queryparams = $('.main-content-upd .xtms-structure-form').serialize();
                    Hsis.Proxy.searchStructure('', queryparams);
                } else if (keyword.trim().length == 0) {
                    $('.btn-load-more').removeAttr('data-page');
                    $('.xtms-structure-form input[name="keyWord"]').val('');
                    var params = $('.main-content-upd .xtms-structure-form').serialize();
                    Hsis.Proxy.loadStructure('', params);
                }
            }
        } catch (err) {
            console.error(err);
        }
    });

    //Xtms teskilati address
    $('.main-content-upd').on('keypress', '#xtms-address-search', function (e) {
        try {
            if (e.keyCode == 13) {
                var keyword = $('#xtms-address-search').val();
                if (keyword.trim().length > 0) {
                    $('.btn-load-more').removeAttr('data-page');
                    $('.xtms-address-form input[name="city"]').val(keyword);
                    $('.xtms-address-form input[name="keyWord"]').val(keyword);
                    var queryparams = $('.main-content-upd .xtms-address-form').serialize();
                    Hsis.Proxy.searchAddress('', queryparams);
                } else if (keyword.trim().length == 0) {
                    $('.btn-load-more').removeAttr('data-page');
                    $('.xtms-address-form input[name="keyWord"]').val('');
                    var params = $('.main-content-upd .xtms-address-form').serialize();
                    Hsis.Proxy.loadAddress('', params);
                }
            }
        } catch (err) {
            console.error(err);
        }
    });


    $('.main-content-upd').on('keypress', '#group_search', function (e) {
        try {
            if (e.keyCode == 13) {
                var keyword = $('#group_search').val();
                var queryparams = $('.main-content-upd .group-search-form').serialize() + '&subModuleId=' + Hsis.subModuleId;
                if (keyword.trim().length > 2) {
                    $('.btn-load-more').removeAttr('data-page')
                    Hsis.Proxy.loadAcademicGroups('', queryparams + '&keyword=' + keyword);
                } else if (keyword.trim().length == 0) {
                    $('.btn-load-more').removeAttr('data-page');
                    Hsis.Proxy.loadAcademicGroups('', queryparams);

                }
            }
        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '.edit-graduated-school', function () {

        try {
            if (Hsis.Validation.validateRequiredFields('graduated-required')) {
                var pelcId = $(this).attr('data-pelc-id');
                var actionDate = $('#main-div #graduatedDate').val();
                var graduationOrgId = $('#main-div #schoolId').find('option:selected').val();

                var graduationInfo = {};

                graduationInfo.pelcId = pelcId;
                graduationInfo.actionDate = actionDate;
                graduationInfo.graduationOrgId = graduationOrgId;

                Hsis.Proxy.editStudentGraduationInfo(graduationInfo);
            }
        } catch (err) {
            console.error(err);
        }

    });


    $('body').on('click', '.add-edu-info', function () {

        try {
            $('#main-div #edu_info_modal .blank-required-field').removeClass('blank-required-field');
            $('#edu_info_modal input').val('');
            $('#edu_info_modal').modal();
            Hsis.Proxy.getFilteredStructureList(Hsis.structureId, 1000073, 0, function (structures) {
                var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                $.each(structures, function (i, v) {
                    html += '<option value="' + v.id + '">' + v.name[Hsis.lang] + '</option>'
                });
                $('#main-div #university_id').html(html);
            }, 1);

            Hsis.Proxy.loadDictionariesByTypeCode(Hsis.Codes.FOREIGN_UNIVERSITY, function (foreignUniversities) {
                if (foreignUniversities) {
                    var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]["select"] + '</option>';
                    $.each(foreignUniversities, function (i, v) {
                        html += '<option value="' + v.id + '">' + v.value[Hsis.lang] + '</option>';
                    });
                    $('#foreign_university_id').html(html);
                }
            });

            Hsis.Proxy.loadDictionariesByTypeId('1000016', 0, function (eduLevel) {
                var html = Hsis.Service.parseDictionaryForSelect(eduLevel);
                $('#main-div #edu_level').html(html);
            });
            Hsis.Proxy.loadDictionariesByTypeId('1000025', '1000258', function (startActionType) {
                var html = Hsis.Service.parseDictionaryForSelect(startActionType);
                $('#main-div #start_action_type').html(html);
            });

            Hsis.Proxy.loadDictionariesByTypeId('1000025', '1000259', function (endActionType) {
                var html = Hsis.Service.parseDictionaryForSelect(endActionType);
                $('#main-div #end_action_type').html(html);
            })
        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '.btn-add-edu-info', function () {
        try {
            if (Hsis.Validation.validateRequiredFields('acad-act-required')) {
                var universityId = $('#main-div #university_id').find('option:selected').val();
                var eduLevelId = $('#main-div #edu_level').find('option:selected').val();
                var startActionType = $('#main-div #start_action_type').find('option:selected').val();
                var endActionType = $('#main-div #end_action_type').find('option:selected').val();
                var eduStartDate = $('#main-div #edu-start-date').val();
                var eduEndDate = $('#main-div #edu-end-date').val();
                var foreignUniId = $('#foreign_university_id').find('option:selected').val();

                if ((universityId === 0 && foreignUniId === 0) || (universityId > 0 && foreignUniId > 0)) {
                    $.alert({
                        title: Hsis.dictionary[Hsis.lang]['warning'],
                        content: Hsis.dictionary[Hsis.lang]['select_uni_or_foreign_uni'],
                        theme: 'material'
                    });
                    return false;
                }
                var eduLifeCycle = {};
                eduLifeCycle.actionTypeId = startActionType;
                eduLifeCycle.actionDate = eduStartDate;
                eduLifeCycle.orgId = universityId;
                eduLifeCycle.eduLevelId = eduLevelId;
                eduLifeCycle.endActionTypeId = endActionType;
                eduLifeCycle.endActionDate = eduEndDate;
                eduLifeCycle.status = 1000380;
                eduLifeCycle.foreignOrgId = foreignUniId;

                Hsis.Proxy.addTeacherEduLifeCycle(eduLifeCycle, function (data) {
                    if (data) {
                        if (data.code == Hsis.statusCodes.OK) {
                            var id = $('#main-div').attr('data-id');
                            Hsis.Proxy.getTeacherDetails(id, function (result) {
                                $('#edu_info_modal').modal('hide');
                                $('.edu_info .edu-info-block').html('');
                                $('#main-div .edu_info .edu-info-block').html(Hsis.Service.parseEditTeacherEduLifeCycle(result));
                            });
                        }
                    }
                });
            }
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.edit-edu-info', function () {

        try {
            var pelcId = $(this).attr('data-id');
            var orgId = $(this).attr('data-org-id');
            var actionTypeId = $(this).attr('data-action-type-id');
            var endActionTypeId = $(this).attr('data-end-action-type-id');
            var dataActionDate = $(this).attr('data-start-date');
            var dataEndActionDate = $(this).attr('data-end-date');
            var eduLevelId = $(this).attr('data-edu-level-id');
            var foreignOrgId = $(this).attr('foreign-org-id');
            $('#edit_edu_info_modal .blank-required-field').removeClass('blank-required-field');
            $('#edit_edu_info_modal').modal({
                backdrop: false
            });
            Hsis.Proxy.getFilteredStructureList(Hsis.structureId, 1000073, 0, function (structures) {
                var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                $.each(structures, function (i, v) {
                    html += '<option value="' + v.id + '">' + v.name[Hsis.lang] + '</option>'
                });
                $('#main-div #edit_university_id').html(html);
                $('#main-div #edit_university_id').find('option[value="' + orgId + '"]').attr('selected', 'selected');
            }, 1);

            if (foreignOrgId > 0) {
                Hsis.Proxy.loadDictionariesByTypeCode(Hsis.Codes.FOREIGN_UNIVERSITY, function (foreignUniversities) {
                    if (foreignUniversities) {
                        var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]["select"] + '</option>';
                        $.each(foreignUniversities, function (i, v) {
                            html += '<option value="' + v.id + '">' + v.value[Hsis.lang] + '</option>';
                        });
                        $('#edit_foreign_university_id').html(html);
                        $('#main-div #edit_foreign_university_id').find('option[value="' + foreignOrgId + '"]').attr('selected', 'selected');
                        $('#main-div #edit_university_id').attr('disabled', 'disabled');
                    }
                });
            } else {
                $('#main-div #edit_foreign_university_id').attr('disabled', 'disabled');
            }

            Hsis.Proxy.loadDictionariesByTypeId('1000025', 1000258, function (startActionType) {
                var html = Hsis.Service.parseDictionaryForSelect(startActionType);
                $('#main-div #edit_edu_action_type').html(html);
                $('#main-div #edit_edu_action_type').find('option[value="' + actionTypeId + '"]').attr('selected', 'selected');
            });

            Hsis.Proxy.loadDictionariesByTypeId('1000025', 1000259, function (endActionType) {
                var html = Hsis.Service.parseDictionaryForSelect(endActionType);
                $('#main-div #edit_edu_end_action_type').html(html);
                $('#main-div #edit_edu_end_action_type').find('option[value="' + endActionTypeId + '"]').attr('selected', 'selected');
            });

            Hsis.Proxy.loadDictionariesByTypeId('1000016', 0, function (eduLevel) {
                var html = Hsis.Service.parseDictionaryForSelect(eduLevel);
                $('#main-div #edit_edu_level').html(html);
                $('#main-div #edit_edu_level').find('option[value="' + eduLevelId + '"]').attr('selected', 'selected');
            });

            $('#main-div #edit_edu_action_date').val(dataActionDate)
            $('#main-div #edit_edu_end_action_date').val(dataEndActionDate)

            $('#main-div .btn-edit-edu-info').attr('data-id', pelcId);
        } catch (err) {
            console.error(err);
        }
    })
    $('body').on('click', '.btn-edit-edu-info', function () {
        try {
            if (Hsis.Validation.validateRequiredFields('edit-edu-info-required')) {
                var pelcId = $(this).attr('data-id');
                var universityId = $('#main-div #edit_university_id').find('option:selected').val();
                var eduLevelId = $('#main-div #edit_edu_level').find('option:selected').val();
                var actionDate = $('#main-div #edit_edu_action_date').val();
                var endActionDate = $('#main-div #edit_edu_end_action_date').val();
                var eduLifeCycle = {};
                eduLifeCycle.id = pelcId;
                eduLifeCycle.orgId = universityId;
                eduLifeCycle.actionDate = actionDate;
                eduLifeCycle.eduLevelId = eduLevelId;
                eduLifeCycle.status = 1000380;
                eduLifeCycle.endActionDate = endActionDate;

                Hsis.Proxy.editTeacherEduLifeCycle(eduLifeCycle, function (data) {
                    if (data) {
                        if (data.code == Hsis.statusCodes.OK) {
                            $('#edu_info_modal').modal('hide');
                            var id = $('#main-div').attr('data-id');
                            Hsis.Proxy.getTeacherDetails(id, function (result) {
                                $('#edit_edu_info_modal').modal('hide');
                                $('.edu_info .edu-info-block').html('');
                                $('.edu_info .edu-info-block').html(Hsis.Service.parseEditTeacherEduLifeCycle(result));
                            })
                        }
                    }
                })
            }
        } catch (err) {
            console.error(err);
        }
    })
    $('body').on('click', '.remove-edu-info', function () {
        try {
            var pelcId = $(this).attr('data-id');
            $.confirm({
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    Hsis.Proxy.removeTeacherEduLifeCycle(pelcId, function (data) {
                        if (data) {
                            if (data.code == Hsis.statusCodes.OK) {
                                var id = $('#main-div').attr('data-id');
                                Hsis.Proxy.getTeacherDetails(id, function (result) {
                                    $('.edu_info .edu-info-block').html('');
                                    $('.edu_info .edu-info-block').html(Hsis.Service.parseEditTeacherEduLifeCycle(result));
                                })
                            }
                        }
                    })
                },
                theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }

    });

    $('#main-div').on('click', '#operation_1000041', function () {
        try {
            var pelcId = $('body').attr('data-pelc-id');
            if (!pelcId) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_row'], {
                    type: 'warning'
                });
                return false;
            }
            $.confirm({
                content: Hsis.dictionary[Hsis.lang]['confirm_student'],
                confirm: function () {
                    Hsis.Proxy.confirmStudent(pelcId, function () {
                        var params = $('.main-content-upd .student-search-form').serialize();
                        Hsis.Proxy.loadStudents('', params + '&subModuleId=' + Hsis.subModuleId);
                    })
                },
                theme: 'black'
            });

        } catch (err) {
            console.error(err);
        }

    });

    $('#main-div').on('click', '#operation_1000042', function () {
        try {
            var pwlcId = $('body').attr('data-pwlc-id');
            if (!pwlcId) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_row'], {
                    type: 'warning'
                });
                return false;
            }

            $.confirm({
                content: Hsis.dictionary[Hsis.lang]['confirm_teacher'],
                confirm: function () {
                    Hsis.Proxy.confirmTeacher(pwlcId, function () {
                        var params = $('.main-content-upd .teacher-search-form').serialize();
                        Hsis.Proxy.loadTeachers('', params);
                    })
                },
                theme: 'black'
            });

        } catch (err) {
            console.error(err);
        }

    });

    $('#main-div').on('click', '.btn-student-advanced-search', function (e) {
        try {

            $('.advanced-upd .search-scroll').load('partials/student_advanced_search.html', function () {
                $('#main-div .search-student').val("1");
                $('#main-div .citizenship-id').val($('#main-div').attr('data-citizenship'));
                $('.advanced-upd').css('right', '0')

            });


        } catch (err) {
            console.error(err);
        }
    });
    $('#main-div').on('click', '.clear_search_button_foreign_student', function (e) {
        try {

            $('.foreign-advanced-search .search-scroll').load('partials/student_advanced_search_foreign.html', function () {
                $('#main-div .search-student').val("1");
                $('#main-div .citizenship-id').val($('#main-div').attr('data-citizenship'));
                $('.foreign-advanced-search').css('right', '0')

            });


        } catch (err) {
            console.error(err);
        }
    });


    $('#main-div').on('click', '.btn-teacher-advanced-search', function (e) {
        try {

            $('.advanced-upd .search-scroll').load('partials/teacher_advanced_search.html', function () {
                $('#main-div .search-teacher').val(1);
                $('#main-div .citizenship-id').val($('#main-div').attr('data-citizenship'));
                $('.advanced-upd').css('right', '0')
            });

        } catch (err) {
            console.error(err);
        }
    });


    $('#main-div').on('click', '.btn-teacher-advanced-search-foreign', function (e) {
        try {

            $('.advanced-upd .search-scroll').load('partials/teacher_advanced_search_foreign.html', function () {
                $('#main-div .search-teacher').val(1);
                $('#main-div .citizenship-id').val($('#main-div').attr('data-citizenship'));
                $('.advanced-upd').css('right', '0')
            });

        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '.btn-advanced-search-button', function (e) {
        try {
            var type = $(this).attr('data-type');
            $('#main-div .student-advanced-search-modal').modal({
                backdrop: false
            });
            var param = $('#main-div .student-advanced-search-form').serialize();


            if (type === 's') {
                Hsis.Proxy.loadStudents('', param, function () {
                    $('#main-div .student-advanced-search-modal').modal('hide');
                });
            } else if (type === 'e') {
                Hsis.Proxy.loadTeachers('', param, function () {
                    $('#main-div .student-advanced-search-modal').modal('hide');
                });
            }

        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.btn-student-add-new-relationship', function (e) {
        try {
            $('.student-relationship-modal .blank-required-field').removeClass('blank-required-field');
            $('.student-relationship-modal input').val('');
            $('.student-relationship-modal select').find('option[value="0"]').prop('selected', true);
            $('.student-relationship-modal').modal({
                backdrop: false
            });
            $('.student-relationship-modal .relation_submit').addClass('add-new-relation-submit').removeClass('edit-new-relation-submit');
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.btn-student-add-relationship', function (e) {
        try {
            $('#main-div .student-relationship-modal .blank-required-field').removeClass('blank-required-field');
            $('#main-div #relation_type_id').find('option:selected').removeAttr('selected', 'selected');
            $('#main-div #relation_fullname').val('');
            $('#main-div #relation_contact').val('');
            $('.student-relationship-modal').modal({
                backdrop: false
            });
            $('#main-div .add_relation_submit').attr('data-type', 'add');
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.add_relation_submit', function () {
        try {
            var dataType = $(this).attr('data-type');
            var id = $(this).attr('data-id');
            var relType = $('#main-div #relation_type_id').find('option:selected').val();
            var fullname = $('#main-div #relation_fullname').val();
            var contact = $('#main-div #relation_contact').val();
            var relation = {};
            relation.id = id;
            relation.typeId = relType;
            relation.fullName = fullname;
            relation.contactNumber = contact;

            if (Hsis.Validation.validateRequiredFields('relation-required')) {
                if (dataType === 'add') {
                    Hsis.Proxy.addStudentRelationship(relation, function (data) {
                        if (data) {
                            if (data.code == Hsis.statusCodes.OK) {
                                var id = $('#main-div').attr('data-id');
                                Hsis.Proxy.getAbroadStudentDetails(id, function (result) {
                                    $('.student-relationships-div .panel-body').html(Hsis.Service.parseStudentRelationShip(result.relations));
                                    $('.student-relationship-modal').modal('hide');
                                })
                            }
                        }
                    });
                } else if (dataType === 'edit') {
                    Hsis.Proxy.editStudentRelationship(relation, function (data) {
                        if (data) {
                            if (data.code == Hsis.statusCodes.OK) {
                                var id = $('#main-div').attr('data-id');
                                Hsis.Proxy.getAbroadStudentDetails(id, function (result) {
                                    $('.student-relationships-div .panel-body').html(Hsis.Service.parseStudentRelationShip(result.relations));
                                    $('.student-relationship-modal').modal('hide');
                                })
                            }
                        }
                    })
                }
            }
        } catch (err) {
            console.error(err);
        }


    })

    $('body').on('click', '.edit-student-relationship', function () {
        try {
            var relationId = $(this).attr('data-id');
            var type = $(this).attr('data-type-id');
            var fullname = $(this).attr('data-fullname');
            var contact = $(this).attr('data-contact');
            $('#main-div .student-relationship-modal .blank-required-field').removeClass('blank-required-field');
            $('.student-relationship-modal').modal('show');
            $('#main-div .add_relation_submit').attr('data-type', 'edit');

            $('#main-div .add_relation_submit').attr('data-id', relationId);

            $('#main-div #relation_type_id').find('option[value="' + type + '"]').attr('selected', 'selected');
            $('#main-div #relation_fullname').val(fullname);
            $('#main-div #relation_contact').val(contact);
        } catch (err) {
            console.error(err);
        }

    })

    $('body').on('click', '.edit-student-relationship', function () {
        try {
            var relationId = $(this).attr('data-id');
            var type = $(this).attr('data-type-id');
            var fullname = $(this).attr('data-fullname');
            var contact = $(this).attr('data-contact');
            $('#main-div .student-relationship-modal .blank-required-field').removeClass('blank-required-field');
            $('.student-relationship-modal').modal('show');
            $('#main-div .add_relation_submit').attr('data-type', 'edit');

            $('#main-div .add_relation_submit').attr('data-id', relationId);

            $('#main-div #relation_type_id').find('option[value="' + type + '"]').attr('selected', 'selected');
            $('#main-div #relation_fullname').val(fullname);
            $('#main-div #relation_contact').val(contact);
        } catch (err) {
            console.error(err);
        }

    })

    $('body').on('click', '.erase-student-relationship', function () {
        try {
            var obj = $(this)
            var id = obj.attr('data-id');

            var relation = {};
            relation.id = id
            $.confirm({
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    Hsis.Proxy.removeStudentRelationship(relation, function (data) {
                        if (data) {
                            if (data.code == Hsis.statusCodes.OK) {
                                obj.parents('.relationship-item').remove();
                            }
                        }
                    })
                },
                theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }

    })

    $('body').on('click', '.add-academic-degree-button', function () {

        try {
            $('#main-div .academic-degree-date').val('');
            $('#main-div .academic-degree-info-modal .academic').find('option:selected').removeAttr('selected');
            $('#main-div .academic-degree-info-modal .academic').find('option[value="0"]').attr('selected', 'selected');
            $('#main-div .academic-degree-info-modal .academic-degree-name').html('');
            $('#main-div .academic-degree-name-label').text('').removeAttr('data-i18n')
            $('#main-div .academic-degree-info-modal .blank-required-field').removeClass('blank-required-field');
            $('#main-div .academic-degree-info-modal').modal("show");
            $('#main-div .teacher-academic-degree-modal-submit').attr('data-type', 'add');
        } catch (err) {
            console.error(err);
        }
    });
    $('body').on('click', '.edit-teacher-academic-degree-name', function () {

        try {

            var id = $(this).attr('data-id');
            var dicType = $(this).attr('data-dic-type-id');
            var startDate = $(this).attr('data-startdate');
            var typeId = $(this).attr('data-type-id');

            Hsis.Proxy.loadDictionariesByTypeId(dicType, 0, function (academicDegrees) {
                var html = Hsis.Service.parseDictionaryForSelect(academicDegrees);
                $('#main-div .academic-degree-info-modal .academic-degree-name').html(html);
                $('#main-div .academic-degree-info-modal .academic-degree-name').find('option[value="' + typeId + '"]').attr('selected', 'selected');
                $('#main-div .academic-degree-info-modal .academic').find('option[value="' + dicType + '"]').attr('selected', 'selected');
                var name = $('#main-div .academic-degree-info-modal .academic').find('option:selected').text();
                $('#main-div .academic-degree-name-label').text(name)

            });
            $('#main-div .academic-degree-date').val(startDate);
            $('#main-div .academic-degree-info-modal .blank-required-field').removeClass('blank-required-field');
            $('#main-div .academic-degree-info-modal').modal("show");
            $('#main-div .teacher-academic-degree-modal-submit').attr('data-type', 'edit');
            $('#main-div .teacher-academic-degree-modal-submit').attr('data-id', id);
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.teacher-academic-degree-modal-submit', function () {

        try {
            if (Hsis.Validation.validateRequiredFields('degree-required')) {
                var dataType = $(this).attr('data-type');
                var dicType = $('#main-div .academic').find('option:selected').val();
                var id = $(this).attr('data-id');
                var acadInfoId = $('#main-div .academic-degree-name').find('option:selected').val();
                var date = $('#main-div .academic-degree-date').val();

                var degree = {};
                degree.id = id;
                degree.acadInfoId = acadInfoId;
                degree.startDate = date;

                if (dataType === 'add') {
                    Hsis.Proxy.addTeacherAcademicDegree(degree, function (data) {
                        if (data) {
                            if (data.code == Hsis.statusCodes.OK) {

                                $('#main-div .academic-degree-info-modal').modal("hide");

                                var personId = $('#main-div').attr('data-id');
                                Hsis.Proxy.getTeacherDetails(personId, function (result) {
                                    if (result) {
                                        $('.edit-academic-degree-info .panel-body').html(Hsis.Service.parseTeacherAcademicDegree(result.academicDegrees));
                                    }
                                })
                            }
                        }
                    })
                } else if (dataType === 'edit') {
                    Hsis.Proxy.editTeacherAcademicDegree(degree, function (data) {
                        if (data) {
                            if (data.code == Hsis.statusCodes.OK) {

                                $('#main-div .academic-degree-info-modal').modal("hide");
                                var personId = $('#main-div').attr('data-id');
                                Hsis.Proxy.getTeacherDetails(personId, function (result) {
                                    if (result) {
                                        $('.edit-academic-degree-info .panel-body').html(Hsis.Service.parseTeacherAcademicDegree(result.academicDegrees));
                                    }
                                })
                            }
                        }
                    })
                }
            }
        } catch (err) {
            console.error(err)
        }

    })

    $('body').on('click', '.academic', function () {
        try {
            var typeId = $(this).find('option:selected').val();
            var name = $(this).find('option:selected').text();
            $('#main-div .academic-degree-name-label').text(name == Hsis.dictionary[Hsis.lang]['select'] ? '' : name);
            if (typeId != 0) {
                Hsis.Proxy.loadDictionariesByTypeId(typeId, 0, function (academicDegrees) {
                    var html = Hsis.Service.parseDictionaryForSelect(academicDegrees);
                    $('#main-div .academic-degree-info-modal .academic-degree-name').html(html);
                });
            } else {
                $('#main-div .academic-degree-info-modal .academic-degree-name').html('');
            }
        } catch (err) {
            console.error(err);
        }
    })

    $('body').on('click', '.erase-teacher-academic-degree-name', function () {
        try {
            var obj = $(this)
            var id = obj.attr('data-id');

            var degree = {};
            degree.id = id
            $.confirm({
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    Hsis.Proxy.removeTeacherAcademicDegree(degree, function (data) {
                        if (data) {
                            if (data.code == Hsis.statusCodes.OK) {
                                obj.parents('.academic-degree-item').remove();
                            }
                        }
                    })
                }, theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }
    })

    $('body').on('click', '.add-research-history-button', function () {
        try {
            $('#main-div .research-history-modal .blank-required-field').removeClass('blank-required-field');
            $('#main-div .research-history-type').find('option:selected').removeAttr('selected');
            $('#main-div .research-history-type').find('option[value="0"]').attr('selected', 'selected');
            $('#main-div .research-history-date').val('');
            $('#main-div .research-history-name').val('');
            $('#main-div .research-history-modal').modal({
                backdrop: false
            });
            $('#main-div .teacher-research-history-modal-submit').attr('data-type', 'add');
        } catch (err) {
            console.error(err);
        }

    })

    $('body').on('click', '.edit-teacher-academic-activity', function () {
        try {
            var id = $(this).attr('data-id');
            var name = $(this).attr('data-research-name');
            var date = $(this).attr('data-publish-date');
            var type = $(this).attr('data-type-id');
            $('#main-div .research-history-modal .blank-required-field').removeClass('blank-required-field');
            $('#main-div .research-history-type').find('option[value="' + type + '"]').attr('selected', 'selected');
            $('#main-div .research-history-date').val(date);
            $('#main-div .research-history-name').val(name);
            $('#main-div .research-history-modal').modal({
                backdrop: false
            });
            $('#main-div .teacher-research-history-modal-submit').attr('data-type', 'edit');
            $('#main-div .teacher-research-history-modal-submit').attr('data-id', id);
        } catch (err) {
            console.error(err);
        }

    })

    $('body').on('click', '.teacher-research-history-modal-submit', function () {

        try {
            if (Hsis.Validation.validateRequiredFields('research-required')) {
                var dataType = $(this).attr('data-type');
                var id = $(this).attr('data-id');
                var type = $('#main-div .research-history-type').find('option:selected').val();
                var date = $('#main-div .research-history-date').val();
                var name = $('#main-div .research-history-name').val();
                var activity = {};
                activity.id = id;
                activity.researchTypeId = type;
                activity.researchName = name;
                activity.publishDate = date;

                if (dataType === 'add') {
                    Hsis.Proxy.addTeacherAcademicActivity(activity, function (data) {
                        if (data) {
                            if (data.code == Hsis.statusCodes.OK) {
                                $('#main-div .research-history-modal').modal("hide");
                                var personId = $('#main-div').attr('data-id');
                                Hsis.Proxy.getTeacherDetails(personId, function (result) {
                                    if (result) {
                                        $('.edit-research-history-info .panel-body').html(Hsis.Service.parseTeacherAcademicActivity(result.academicActivitys));
                                    }
                                })
                            }

                        }
                    })
                } else if (dataType === 'edit') {
                    Hsis.Proxy.editTeacherAcademicActivity(activity, function (data) {
                        if (data) {
                            if (data.code == Hsis.statusCodes.OK) {
                                $('#main-div .research-history-modal').modal("hide");
                                var personId = $('#main-div').attr('data-id');
                                Hsis.Proxy.getTeacherDetails(personId, function (result) {
                                    if (result) {
                                        $('.edit-research-history-info .panel-body').html(Hsis.Service.parseTeacherAcademicActivity(result.academicActivitys));
                                    }
                                })
                            }

                        }
                    })
                }
            }
        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '.erase-teacher-academic-activity', function () {
        try {
            var obj = $(this)
            var id = obj.attr('data-id');

            var activity = {};
            activity.id = id
            $.confirm({
                title: 'Warning!',
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    Hsis.Proxy.removeTeacherAcademicActivity(activity, function (data) {
                        if (data) {
                            if (data.code == Hsis.statusCodes.OK) {
                                obj.parents('.academic-activity-item').remove();
                            }
                        }
                    })
                },
                theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('focus', '#contact', function (e) {
        try {
            var select = $('#contact_type').find('option:selected').val();
            var contact = $(this);
            if (select == '0') {
                contact.attr('disabled', 'disabled');
            } else {
                contact.removeAttr('disabled');
            }
        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('focusout', '#contact', function (e) {
        try {
            var contact = $(this);
            var select = $('#contact_type').find('option:selected').val();
            if (select == '1000158') {
                if (!Hsis.Validation.validateEmail(contact.val()) || (contact.val().length == 0)) {
                    contact.addClass('blank-required-field');
                    /*$.notify(Hsis.dictionary[Hsis.lang]['wrong_email'], {
                        type: 'warning'
                    });*/
                } else {
                    contact.removeClass('blank-required-field');
                }

            } else {
                if (!Hsis.Validation.validatePhoneNumber(contact.val()) || (contact.val().length == 0)) {
                    contact.addClass('blank-required-field');
                    /*$.notify(Hsis.dictionary[Hsis.lang]['wrong_email'], {
                        type: 'warning'
                    });*/
                } else {
                    contact.removeClass('blank-required-field');
                }
            }

            contact.off('focusout');

        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('change', '#contact_type', function (e) {
        try {
            var select = $('#contact_type')[0];
            $('#contact').removeAttr('disabled');
            var $okButton = $('#confirm_contact_add,.btn-contact-modal-submit');
            $okButton.removeClass('hidden');
            // if (select.options[select.selectedIndex].value == '1000157' || select.options[select.selectedIndex].value == '1000285') {
                // $(this).closest('.modal-content').find('#contact')[0].placeholder = '(+000)-00-000-00-00';
                // $('#contact').mask(Hsis.MASK.phone);

            // } else if (select.options[select.selectedIndex].value == '1000158') {
                // $(this).closest('.modal-content').find('#contact')[0].placeholder = 'name@email.domen';
                // $('#contact').unmask();
            // }
        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '.add-new-document', function (e) {

        try {
            $('.add-document-modal .add-doc-form')[0].reset();
            $('.add-document-modal .blank-required-field').removeClass('blank-required-field');
            var citizenship = $('#citizenship').find('option:selected').val();
            $('.add-document-modal [doc-confirm]').removeClass('document-edit-submit').addClass('add-new-document-submit');
            var docType = $(this).attr('data-doc-type');
            $('.add-document-modal .add-new-document-submit').attr('data-doc-type', docType);
            var typeId = $(this).attr('data-type-id');
            if (typeId == "1000041") {
                var pwlcId = $('table.selected').parent('.work-action').attr('data-id');
                if (pwlcId == undefined || pwlcId.length == 0) {
                    $.alert({
                        title: Hsis.dictionary[Hsis.lang]['warning'],
                        content: Hsis.dictionary[Hsis.lang]['select_information'],
                        theme: 'material'
                    });
                    return false;
                } else {
                    $('.add-new-document-submit').attr('doc-id', pwlcId);
                }
            }
            var parentId;
            if (docType == 'personal') {
                if (citizenship == 0) {
                    $.notify(Hsis.dictionary[Hsis.lang]['select_citizenship'], {
                        type: 'warning'
                    });
                    return false;
                }
                parentId = $('#citizenship').find('option:selected').attr('parent');
            } else if (docType == 'academic') {
                parentId = 1000258;
            } else if (docType == 'school') {
                parentId = 1000259;
            }
            // parentId
            Hsis.Proxy.loadDictionariesByTypeId(typeId, 0, function (docTypes) {
                var html = Hsis.Service.parseDictionaryForSelect(docTypes);
                $('.add-document-modal select[name="add-document-type"]').html(html);
            });
            $('.add-document-modal').modal('show');

        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.add-new-document-submit', function (e) {
        try {
            var $modal = $(this).parents('.modal-content');
            var docTypeId = $modal.find('select[name="add-document-type"]').val();
            var docType = $modal.find('select option:selected').text();
            var docSerial = $modal.find('input[name="add-document-serial"]').val();
            var docNumber = $modal.find('input[name="add-document-number"]').val();
            var docStartDate = $modal.find('input[name="add-document-start-date"]').val();
            var docEndDate = $modal.find('input[name="add-document-end-date"]').val();
            var dataDocType = $(this).attr('data-doc-type');

            var docId = $(this).attr('doc-id') != undefined ? $(this).attr('doc-id') : '';

            var html = '<div class="col-md-12 for-align doc-item" doc-id ="' + docId + '">' +
                '<table class="table-block col-md-12">' +
                '<thead>' +
                '<tr>' +
                '<td style="width: 20%;" >' + Hsis.dictionary[Hsis.lang]['doc_type'] + '</td>' +
                '<td style="width: 20%;" >' + Hsis.dictionary[Hsis.lang]['serial_number'] + '</td>' +
                '<td style="width: 20%;" >' + Hsis.dictionary[Hsis.lang]['doc_number'] + '</td>' +
                '<td style="width: 20%;" >' + Hsis.dictionary[Hsis.lang]['issue_date'] + '</td>' +
                '<td style="width: 20%;" >' + Hsis.dictionary[Hsis.lang]['end_date'] + '</td>' +
                '</tr>' +
                '</thead>' +
                '<tbody>' +
                '<tr>' +
                '<td style="width: 20%;" data-id="' + docTypeId + '" class="add-doc-type">' + docType + '</td>' +
                '<td style="width: 20%;"  class="add-doc-serial">' + docSerial + '</td>' +
                '<td style="width: 20%;"  class="add-doc-number">' + docNumber + '</td>' +
                '<td style="width: 20%;"  class="add-doc-start-date">' + docStartDate + '</td>' +
                '<td style="width: 20%;" class="add-doc-end-date">' + docEndDate + '</td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '<label><p>' + Hsis.dictionary[Hsis.lang]['choose_files'] + ':</p><span></span><input type="file" multiple class="new-add-doc-file"/></label>' + '<div class="operations-button">' +
                '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span class="glyphicon glyphicon-list"></span></div>' +
                '<ul class="dropdown-menu student-dropdown">' +
                '<li><a href="#" class="edit add-doc-edit">' + Hsis.dictionary[Hsis.lang]['edit'] + '</a></li>' +
                '<li><a href="#" class="erase add-doc-remove">' + Hsis.dictionary[Hsis.lang]['erase'] + '</a></li>' +
                '</ul>' +
                '</div>' +
                '</div>';


            if (Hsis.Validation.validateRequiredFields('document-required')) {
                $('.add-doc-block .panel-body[data-doc-type="' + dataDocType + '"]').append(html);
                $('.add-document-modal').modal('hide');
                $('.add-document-modal .add-doc-form')[0].reset();
                $('[data-doc-type="' + dataDocType + '"]').has('.blank-panel').children('.blank-panel').remove();
            }


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.add-doc-edit', function (e) {
        try {
            $('#main-div .doc-item').removeClass('selected');
            $('.add-document-modal .blank-required-field').removeClass('blank-required-field');
            var div = $(this).parents('.doc-item');
            div.addClass('selected');
            $('.add-document-modal [doc-confirm]').removeClass('add-new-document-submit').addClass('document-edit-submit');
            var docTypeId = div.find('[data-id]').attr('data-id');
            var docSerial = div.find('.add-doc-serial').text();
            var docNumber = div.find('.add-doc-number').text();
            var docStartDate = div.find('.add-doc-start-date').text();
            var docEndDate = div.find('.add-doc-end-date').text();
            var $modal = $('.add-document-modal');
            $modal.find('select[name="add-document-type"]').find('option[value="' + docTypeId + '"]').prop('selected', true);
            $modal.find('input[name="add-document-serial"]').val(docSerial);
            $modal.find('input[name="add-document-number"]').val(docNumber);
            $modal.find('input[name="add-document-start-date"]').val(docStartDate);
            $modal.find('input[name="add-document-end-date"]').val(docEndDate);
            $('.add-document-modal').modal('show');
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.document-edit-submit', function (e) {
        try {
            var $modal = $(this).parents('.modal-content');
            var docTypeId = $modal.find('select[name="add-document-type"]').val();
            var docType = $modal.find('select option:selected').text();
            var docSerial = $modal.find('input[name="add-document-serial"]').val();
            var docNumber = $modal.find('input[name="add-document-number"]').val();
            var docStartDate = $modal.find('input[name="add-document-start-date"]').val();
            var docEndDate = $modal.find('input[name="add-document-end-date"]').val();

            var tr = $('#main-div .doc-item.selected').find('tbody tr');
            var html = '<td data-id="' + docTypeId + '" class="add-doc-type">' + docType + '</td>' +
                '<td class="add-doc-serial">' + docSerial + '</td>' +
                '<td class="add-doc-number">' + docNumber + '</td>' +
                '<td class="add-doc-start-date">' + docStartDate + '</td>' +
                '<td class="add-doc-end-date">' + docEndDate + '</td>';

            if (Hsis.Validation.validateRequiredFields('document-required')) {
                tr.html(html);
                $('.add-document-modal').modal('hide');
            }
        } catch (err) {
            console.error(err);
        }
    });
    $('#main-div').on('click', '#operation_1000058', function () {
        try {
            if (!$('#buttons_div').attr('data-id')) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'warning'
                });
                return false;
            }

            var id = $('.main-content-upd #buttons_div').attr('data-id');
            var status = $(this).attr('data-status');
            if (localStorage.button == undefined) {
                localStorage.setItem('button', 'operation_1000058');
                localStorage.setItem('personId', id)
            }
            window.open(window.location.href, '_blank');

        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#operation_1000057', function (e) {
        try {
            if (!$('#buttons_div').attr('data-id')) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'warning'
                });
                return false;
            }

            var id = $('.main-content-upd #buttons_div').attr('data-id');
            var status = $(this).attr('data-status');
            if (status == 1000341) {
                $('#main-div .student-operation-div').remove();
            }
            if (localStorage.button == undefined) {
                localStorage.setItem('button', 'operation_1000057');
                localStorage.setItem('personId', id)
            }
            window.open(window.location.href, '_blank');


        } catch (err) {
            console.error(err);
        }

    });

    $('#main-div').on('click', '#operation_1001345', function () {
        try {
            $('body').find('.new-upd').css('right', '0');
            $('#main-div .abroad-pincode-button-next').removeClass('hidden');
            $('#main-div .abroad-pincode-button-next').attr('data-step', '1');
            $('#main-div .abroad-pincode-button-next').attr('data-operation-type', 'new');
            $('#main-div .abroad-pincode-button-next').removeAttr('data-person-id');
            $('#main-div .abroad-pincode-button-next').removeAttr('data-person-status');
            $('#main-div .abroad-pincode-button-next').removeAttr('data-useless');
            $('#main-div .abroad-pincode-button-next').removeAttr('data-type');
            $('#main-div .abroad-pincode-div-first').removeClass('hidden');
            $('#main-div .pincode').text('');
            $('#main-div .abroad-pincode-div-second').addClass('hidden');
            $('#main-div .iamas-search').addClass('hidden');
            $('#main-div .abroad-pincode-button-back').addClass('hidden');
            $('#main-div .search-pincode').val('');

        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '#checkPin', function () {
        try {
        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '#operation_1000062', function () {

        try {
            $('body').find('.new-upd').css('right', '0');
            $('#main-div .pincode-button-next').removeClass('hidden');
            $('#main-div .pincode-button-next').attr('data-step', '1');
            $('#main-div .pincode-button-next').attr('data-operation-type', 'transfer');
            $('#main-div .pincode-button-next').removeAttr('data-person-id');
            $('#main-div .pincode-button-next').removeAttr('data-person-status');
            $('#main-div .pincode-button-next').removeAttr('data-useless');
            $('#main-div .pincode-button-next').removeAttr('data-type');
            $('#main-div .pincode-div-first').removeClass('hidden');
            $('#main-div .pincode').text('');
            $('#main-div .pincode-div-second').addClass('hidden');
            $('#main-div .iamas-search').addClass('hidden');
            $('#main-div .pincode-button-back').addClass('hidden');
            $('#main-div .search-pincode').val('');

        } catch (err) {
            console.error(err);
        }

    });
    $('#main-div').on('click', '#operation_1000063', function () {

        try {

            $('body').find('.new-upd').css('right', '0');
            $('#main-div .pincode-button-next').removeClass('hidden');
            $('#main-div .pincode-button-next').attr('data-step', '1');
            $('#main-div .pincode-button-next').attr('data-operation-type', 'restore');
            $('#main-div .pincode-button-next').removeAttr('data-person-id');
            $('#main-div .pincode-button-next').removeAttr('data-person-status');
            $('#main-div .pincode-button-next').removeAttr('data-useless');
            $('#main-div .pincode-button-next').removeAttr('data-type');
            $('#main-div .pincode-div-first').removeClass('hidden');
            $('#main-div .pincode').text('');
            $('#main-div .pincode-div-second').addClass('hidden');
            $('#main-div .iamas-search').addClass('hidden');
            $('#main-div .pincode-button-back').addClass('hidden');
            $('#main-div .search-pincode').val('');

        } catch (err) {
            console.error(err);
        }
    });
    $('#main-div').on('click', '#operation_1000064', function () {

        try {
            $('body').find('.new-upd').css('right', '0');
            $('#main-div .pincode-button-next').removeClass('hidden');
            $('#main-div .pincode-button-next').attr('data-step', '1');
            $('#main-div .pincode-button-next').attr('data-operation-type', 'furlough');
            $('#main-div .pincode-button-next').removeAttr('data-person-id');
            $('#main-div .pincode-button-next').removeAttr('data-person-status');
            $('#main-div .pincode-button-next').removeAttr('data-useless');
            $('#main-div .pincode-button-next').removeAttr('data-type');
            $('#main-div .pincode-div-first').removeClass('hidden');
            $('#main-div .pincode').text('');
            $('#main-div .pincode-div-second').addClass('hidden');
            $('#main-div .iamas-search').addClass('hidden');
            $('#main-div .pincode-button-back').addClass('hidden');
            $('#main-div .search-pincode').val('');

        } catch (err) {
            console.error(err);
        }
    });
    $('#main-div').on('click', '#operation_1001408', function () {

        try {
            $('body').find('.new-upd').css('right', '0');
            $('#main-div .pincode-button-next').removeClass('hidden');
            $('#main-div .pincode-button-next').attr('data-step', '1');
            $('#main-div .pincode-button-next').attr('data-operation-type', 'intransfer');
            $('#main-div .pincode-button-next').removeAttr('data-person-id');
            $('#main-div .pincode-button-next').removeAttr('data-person-status');
            $('#main-div .pincode-button-next').removeAttr('data-useless');
            $('#main-div .pincode-button-next').removeAttr('data-type');
            $('#main-div .pincode-div-first').removeClass('hidden');
            $('#main-div .pincode').text('');
            $('#main-div .pincode-div-second').addClass('hidden');
            $('#main-div .iamas-search').addClass('hidden');
            $('#main-div .pincode-button-back').addClass('hidden');
            $('#main-div .search-pincode').val('');

        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '.pincode-button-next', function () {
        try {
            cropForm = new FormData();
            var $obj = $(this);
            var step = $obj.attr('data-step');
            var accept = false;
            var pincode = $('body').find('.search-pincode').val();
            var dataPersonId;
            var dataPersonStatus;
            $('#main-div').attr('pin', pincode);
            if (step === '1') {

                if (!pincode) {
                    $.notify(Hsis.dictionary[Hsis.lang]['add_pincode'], {
                        type: 'warning'
                    });
                    return false;
                }
                Hsis.Proxy.getStudentByPinCode(pincode, function (data) {
                    if (data) {
                        if (data.code === Hsis.statusCodes.OK) {
                            $obj.attr('data-step', '2');
                            var type = $obj.attr('data-operation-type');

                            if (data.data) {
                                if (data.data.id != 0) {
                                    if (data.data.actionStatus == 1) {
                                        $('#main-div .pincode-div-first').addClass('hidden');
                                        $('#main-div .pincode').text(pincode);
                                        $('#main-div .pincode-div-second').removeClass('hidden');
                                        $obj.addClass('hidden');
                                        $('#main-div .pincode-button-back').removeClass('hidden')
                                        $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['cant_create_student_with_pincode_student_exist']);
                                        $obj.attr('data-useless', 'useless');
                                    } else if (data.data.actionStatus == 2 || data.data.actionStatus == 1000302 || data.data.actionStatus == 0) {
                                        accept = true;
                                    } else if (data.data.actionStatus == 1000303 || data.data.actionStatus == 1000270) {
                                        if (type !== 'transfer' && type !== 'intransfer') {
                                            $('#main-div .pincode-div-first').addClass('hidden');
                                            $('#main-div .pincode').text(pincode);
                                            $('#main-div .pincode-div-second').removeClass('hidden');
                                            $obj.addClass('hidden');
                                            $('#main-div .pincode-button-back').removeClass('hidden')
                                            $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['cant_create_student_with_pincode']);
                                            $obj.attr('data-useless', 'useless');
                                        } else {

                                            accept = true;
                                        }

                                    } else if (data.data.actionStatus == 1000290 || data.data.actionStatus == 1000300) {
                                        if (type !== 'furlough') {
                                            $('#main-div .pincode-div-first').addClass('hidden');
                                            $('#main-div .pincode').text(pincode);
                                            $('#main-div .pincode-div-second').removeClass('hidden');
                                            $obj.addClass('hidden');
                                            $('#main-div .pincode-button-back').removeClass('hidden')
                                            $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['cant_create_student_with_pincode']);
                                            $obj.attr('data-useless', 'useless');
                                        } else {
                                            $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['found_student_with_pincode']);
                                            accept = true;
                                        }
                                    } else if (data.data.actionStatus == 1000274) {
                                        if (type !== 'restore' && type !== 'new') {
                                            $('#main-div .pincode-div-first').addClass('hidden');
                                            $('#main-div .pincode').text(pincode);
                                            $('#main-div .pincode-div-second').removeClass('hidden');
                                            $obj.addClass('hidden');
                                            $('#main-div .pincode-button-back').removeClass('hidden')
                                            $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['cant_create_student_with_pincode']);
                                            $obj.attr('data-useless', 'useless');
                                        } else {
                                            $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['found_student_with_pincode']);
                                            accept = true;
                                        }

                                    }

                                    dataPersonId = data.data.id;
                                    dataPersonStatus = data.data.actionStatus;
                                    $obj.attr('data-person-id', data.data.id);
                                    $obj.attr('data-person-status', data.data.actionStatus);
                                } else {
                                    $('#main-div .pincode-div-first').addClass('hidden');
                                    $('#main-div .iamas-search').removeClass('hidden');
                                    $('#main-div .pincode').text(pincode);
                                    $('#main-div .pincode-div-second').removeClass('hidden');
                                    $('#main-div .pincode-button-back').removeClass('hidden');
                                    $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['not_found_student_with_pincode']);
                                    $obj.attr('data-type', 'new');
                                }
                            }

                        }
                    }
                    if (accept) {
                        $('body').find('.add-new .search-scroll').load('partials/student_action_accept.html', function () {
                            $('body').removeClass('modal-open');
                            $('body').find('.new-upd').css('right', '-100%');
                            setTimeout(function () {
                                $('body').find('.add-new').css('right', '0');
                            }, 400);
                            Hsis.Proxy.getStudentDetailsByPinCode(pincode, function (details) {
                                if (details.data) {
                                    if (details.data.image && details.data.image.path) {
                                        $('body .input-file-con .new-img-con').fadeIn(1);
                                        $('body .input-file-con .new-img-con img').attr('src', Hsis.urls.HSIS + 'students/image/' + (details.data.image.path ? details.data.image.path : '') + '?token=' + Hsis.token + '&size=200x200&' + Math.random());


                                        $('body .input-file-con .new-img-con img').on('error', function (e) {
                                            $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                                        });
                                    } else {
                                        $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                                    }
                                    $('#main-div #confirmStudent').attr('data-type', $obj.attr('data-operation-type'));
                                    $('#main-div #action_type').attr('data-person-id', dataPersonId);
                                    $('.action-students .panel-body').html(Hsis.Service.parseStudentActions(details.data.pelcAction));
                                    $('.action-students .panel-body').find(".edit-student-action").remove();
                                    $('.action-students .panel-body').find(".erase-student-action").remove();
                                    $('#firstname').text(details.data.firstName);
                                    $('#lastname').text(details.data.lastName);
                                    $('#middlename').text(details.data.middleName);
                                    $('#pincode').text(details.data.pinCode);
                                    $('#citizenship').text(details.data.citizenship.value[Hsis.lang]);
                                    $('#gender').text(details.data.gender.value[Hsis.lang]);
                                    $('#marital_status').text(details.data.maritalStatus.value[Hsis.lang] ? details.data.maritalStatus.value[Hsis.lang] : 'Yoxdur');
                                    $('#social_status').text(details.data.maritalStatus.value[Hsis.lang] ? details.data.maritalStatus.value[Hsis.lang] : 'Yoxdur');
                                    $('#orphan_degree').text(details.data.orphanDegree.value[Hsis.lang] ? details.data.orphanDegree.value[Hsis.lang] : 'Yoxdur');
                                    $('#military_status').text(details.data.militaryService.value[Hsis.lang] ? details.data.militaryService.value[Hsis.lang] : 'Yoxdur');
                                    $('#nationality').text(details.data.nationality.value[Hsis.lang]);
                                    $('#birthdate').text(details.data.birthDate);
                                    $('#main-div').attr('data-id', details.data.id);

                                    Hsis.Service.parseOldStudentAddress(details.data);

                                    $('.contact-info-table tbody').html(Hsis.Service.parseViewStudentContact(details.data));
                                    var personal = 'personal';
                                    var academic = 'academic';
                                    var school = 'school';
                                    $('.add-doc-block .panel-body').html(Hsis.Service.parseViewStudentDocument(details.data.documents, personal));
                                    $('.old_activity_name #acad_doc_add').html(Hsis.Service.parseViewStudentDocument(details.data.pelcDocuments, academic));
                                    $('.activity_name #school_doc_add').html(Hsis.Service.parseViewStudentDocument(details.data.schoolDocuments, school));

                                    $('.student-relationships-div .panel-body').html(Hsis.Service.parseViewStudentRelationShip(details.data.relations));
                                    if (type == "furlough") {
//                                        console.log(details.data.pelcAction);
                                        var pelcAction = $.grep(details.data.pelcAction, function (pelc) {
                                            return pelc.id == details.data.pelcId;
                                        });
                                        var lastPelcAction = pelcAction[0];
                                        var eduLevel;

                                        if (eduLevel > 0) {
                                            $.each(details.data.speciality, function (i, v) {
                                                Hsis.Proxy.getFilteredStructureList(Hsis.structureId, eduLevel, 0, function (specialities) {
                                                    if (specialities) {
                                                        var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                                        $.each(specialities, function (i, v) {
                                                            html += '<option value="' + v.id + '">' + v.name[Hsis.lang] + ' - ' + v.parent.name[Hsis.lang] + '</option>'
                                                        });
                                                        $('#orgId').html(html);
                                                        if (v.type.id == 1002306 || v.type.id == 1008358) {
                                                            $('.sub_speciality').removeClass('hidden');
                                                            $('#orgId').find('option[value="' + v.type.parentId + '"]').attr('selected', true);
                                                        } else {
                                                            $('#orgId').find('option[value="' + lastPelcAction.org.id + '"]').attr('selected', true);
                                                            $('.sub_speciality').addClass('hidden');
                                                            $('#sub_speciality').empty();
                                                        }
                                                        $('#main-div #orgId').find('option[value="' + v.type.parentId + '"]').prop('selected', true);
                                                        Hsis.Proxy.getFilteredStructureList(v.type.parentId, '1002306', 0, function (subSpeciality) {
                                                            if (subSpeciality) {
                                                                var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                                                $.each(subSpeciality, function (i, g) {
                                                                    html += '<option value="' + g.id + '">' + g.name[Hsis.lang] + '</option>'
                                                                })
                                                                $('#sub_speciality').html(html);
                                                                $('#sub_speciality').find('option[value="' + v.id + '"]').prop('selected', true);
                                                                $('.sub_speciality').removeClass('hidden');
                                                            } else {
                                                                $('.sub_speciality').addClass('hidden');
                                                            }
                                                        })
                                                    }


                                                });
                                            });


                                        } else if (eduLevel == 0) {
                                            $('#orgId').html('');
                                        }

                                    }


                                }
                            });
                        });
                    }
                });

            } else if (step == 2) {
                var type = $obj.attr('data-person-status');
                var dataUseless = $obj.attr('data-useless');
                if (dataUseless !== 'useless') {

                    if ($obj.attr('data-type') === 'new') {
                        if ($obj.attr('data-operation-type') === 'new') {
                            if ($("#main-div .check-iamas-input").is(':checked')) {
                                Hsis.Proxy.getPersonInfoByPinCode(pincode, function (data) {
                                    if (data && data.firstName && data.lastName && data.middleName && data.birthDate) {
                                        $('#main-div .search-pincode-modal').modal("hide")
                                        $('body').find('.new-upd').css('right', '-100%');
                                        setTimeout(function () {
                                            $('body').find('.add-new').css('right', '0');
                                        }, 400);
                                        $('body').find('.add-new .search-scroll').load('partials/student_add.html', function () {

                                            $('#main-div').attr('data-check-work', 'true');
                                            $('body').find('.new-upd').css('right', '-100%');
                                            setTimeout(function () {
                                                $('body').find('.add-new').css('right', '0');
                                            }, 400);
                                            Hsis.Proxy.loadDictionariesByTypeId('1000004', 0, function (citizenship) {
                                                var html = Hsis.Service.parseDictionaryForSelect(citizenship);
                                                $('#main-div #citizenship').html(html);

                                                Hsis.Proxy.loadDictionariesByTypeId('1000003', 0, function (gender) {
                                                    var html = Hsis.Service.parseDictionaryForSelect(gender);
                                                    $('#main-div #gender').html(html);

                                                    Hsis.Proxy.loadDictionariesByTypeId('1000007', 0, function (maritalStatus) {
                                                        var html = Hsis.Service.parseDictionaryForSelect(maritalStatus);
                                                        $('#main-div #marital_status').html(html);

                                                        $('body').removeClass('modal-open');
                                                        $('#pincode').val(pincode).attr('disabled', 'disabled')
                                                        $('#main-div #firstname').val(data.firstName).attr('disabled', 'disabled');
                                                        $('#main-div #lastname').val(data.lastName).attr('disabled', 'disabled');
                                                        $('#main-div #middlename').val(data.middleName.split(' ')[0]).attr('disabled', 'disabled');
                                                        $('#main-div #birthdate').val(data.birthDate).attr('disabled', 'disabled');
                                                        $('#main-div #citizenship').attr('disabled', 'disabled').find('option[value="' + (data.citizenship.value[Hsis.lang] === "AZE" ? 1000118 : 0) + '"]').attr('selected', 'selected');
                                                        $('#main-div #gender').attr('disabled', 'disabled').find('option[value="' + (data.gender.value[Hsis.lang] === "Kişi" ? 1000036 : (data.gender.value[Hsis.lang] === "Qadın" ? 1000035 : 0)) + '"]').attr('selected', 'selected');
                                                        $('#main-div #marital_status').attr('disabled', 'disabled').find('option[value="' + (data.socialStatus.value[Hsis.lang] === "Evli" ? 1000379 : (data.socialStatus.value[Hsis.lang] === "Subay" ? 1000189 : 0)) + '"]').attr('selected', 'selected');

                                                        if (data.image.file !== null) {
                                                            $('#main-div #studentPhoto').attr('src', "data:image/png;base64," + data.image.file);
                                                            $('#main-div #studentphoto').on('error', function (e) {
                                                                $(this).attr('src', 'assets/img/guest.png');
                                                            });
                                                        }
                                                    });
                                                });
                                            });


                                        });

                                    } else {
                                        $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['cant_create_student_with_pincode']);
                                    }

                                });
                            } else {
                                $('#main-div .search-pincode-modal').modal("hide")
                                $('body').find('.new-upd').css('right', '-100%');
                                setTimeout(function () {
                                    $('body').find('.add-new').css('right', '0');
                                }, 400);
                                $('body').find('.add-new .search-scroll').load('partials/student_add.html', function () {
                                    $('body').removeClass('modal-open');
                                    $('#pincode').val(pincode).attr('disabled', 'disabled')
                                    $('#main-div #confirmStudent').attr('data-type', $obj.attr('data-operation-type'))

                                });


                            }
                        } else {

                            $('#main-div .search-pincode-modal').modal("hide")
                            $('body').find('.new-upd').css('right', '-100%');
                            setTimeout(function () {
                                $('body').find('.add-new').css('right', '0');
                            }, 400);
                            $('body').find('.add-new .search-scroll').load('partials/student_add.html', function () {
                                $('#pincode').val(pincode).attr('disabled', 'disabled')
                                $('body').removeClass('modal-open');
                                $('#main-div #confirmStudent').attr('data-type', $obj.attr('data-operation-type'))
                            });
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '.pincode-button-back', function () {
        var step = $('#main-div .pincode-button-next').attr('data-step');
        if (step === '2') {
            $('#main-div .pincode-div-first').removeClass('hidden')
            $('#main-div .pincode-div-second').addClass('hidden')
            $('#main-div .iamas-search').addClass('hidden');
            $('#main-div .pincode-label').text('');
            $('#main-div .pincode-label').removeAttr('data-type');
            $('#main-div .pincode-button-back').addClass('hidden');
            $('#main-div .pincode-button-next').attr('data-step', '1');
            $('#main-div .pincode-button-next').removeClass('hidden');
            $('#main-div .pincode-button-next').removeAttr('data-person-id');
            $('#main-div .pincode-button-next').removeAttr('data-person-status');
            $('#main-div .pincode-button-next').removeAttr('data-type');
            $('#main-div .pincode-button-next').removeAttr('data-useless');
            $('#main-div .pincode').text('');
            $('#main-div .search-pincode').val('');
        }
    });

    $('body').on('click', '.show-student-action', function () {
        var id = $(this).attr('data-id');
        Hsis.Proxy.getStudentActionDetails(id, function (data) {
            $('#main-div #pelc_action_university').text(data.data.org.value[Hsis.lang]);
            $('#main-div #pelc_action_date').text(data.data.actionDate);
            $('#main-div #end_action_date').text(data.data.endActionDate);
            $('#main-div #pelc_action_type').text(data.data.actionType.value[Hsis.lang]);
            $('#main-div #pelc_action_card_no').text(data.data.cardNo);
            $('#main-div #pelc_action_edu_line').text(data.data.eduLine.value[Hsis.lang]);
            $('#main-div #pelc_action_edu_lang').text(data.data.eduLang.value[Hsis.lang]);
            $('#main-div #pelc_action_edu_type').text(data.data.eduType.value[Hsis.lang]);
            $('#main-div #pelc_action_edupay_type').text(data.data.edupayType.value[Hsis.lang]);
            $('#main-div #pelc_action_edu_level').text(data.data.eduLevel.value[Hsis.lang]);
            $('#main-div #pelc_action_score').text(data.data.applyScore);
            if (data.data.pelcDocument.length > 0) {
                $('#main-div #pelc_action_academic-document').html(Hsis.Service.parseViewStudentDocument(data.data.pelcDocument));
            } else {
                $('#main-div #pelc_action_academic-document').html('<div class="blank-panel"><h3>' + Hsis.dictionary[Hsis.lang]['no_information'] + '</h3></div>');
            }

        });

        $('#main-div .student-pelc-action-modal').modal('show')


    });

    $('body').on('click', '#operation_1000065', function () {
        try {

            if (!$('#buttons_div').attr('data-id')) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'warning'
                });
                return false;
            }

            var id = $('.main-content-upd #buttons_div').attr('data-id');
            $('.add-new .search-scroll').load('partials/student_edit_personal_info.html', function () {
                Hsis.Proxy.getStudentDetails(id, function (data) {
                    var html = '';

                    if (data.image && data.image.path) {
                        $('body .input-file-con .new-img-con').fadeIn(1);
                        $('body .input-file-con .new-img-con img').attr('src', Hsis.urls.HSIS + 'students/image/' + (data.image.path ? data.image.path : '') + '?token=' + Hsis.token + '&size=200x200&' + Math.random());
                        $('body .input-file-con .new-img-con').attr('data-id', data.image.id);
                        $('body .input-file-con .new-img-con img').on('error', function (e) {
                            $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                        });

                    }

                    $('#firstname').val(data.firstName);
                    $('#lastname').val(data.lastName);
                    $('#middlename').val(data.middleName);
                    $('#pincode').val(data.pinCode).attr('disabled', 'disabled');
                    $('#citizenship').find('option[value="' + data.citizenship.id + '"]').attr('selected', 'selected');
                    $('#gender').find('option[value="' + data.gender.id + '"]').attr('selected', 'selected');
                    $('#marital_status').find('option[value="' + data.maritalStatus.id + '"]').attr('selected', 'selected');
                    $('#social_status').find('option[value="' + data.socialStatus.id + '"]').attr('selected', 'selected');
                    $('#orphan_degree').find('option[value="' + data.orphanDegree.id + '"]').attr('selected', 'selected');
                    $('#military_status').find('option[value="' + data.militaryService.id + '"]').attr('selected', 'selected');
                    $('#nationality').find('option[value="' + data.nationality.id + '"]').attr('selected', 'selected');
                    $('.date-birthdate').val(data.birthDate);
                    $('#main-div').attr('data-id', data.id);
                    $('#main-div').attr('data-pelc-id', data.pelcId);
                    $('#disability_degree').find('option[value="' + data.disabilityDegree.id + '"]').prop('selected', true);

                    Hsis.Service.parseEditStudentAddress(data);

                    if (data.contacts.length > 0) {
                        $('.contact-info .panel-body').html(Hsis.Service.parseEditStudentContact(data));
                    }

                    var personal = 'personal';
                    var academic = 'academic';
                    var school = 'school';
                    if (data.documents.length > 0) {
                        $('.add-doc-block .panel-body').html(Hsis.Service.parseEditStudentDocument(data.documents, personal));
                    }


                    $('.student-relationships-div .panel-body').html(Hsis.Service.parseStudentRelationShip(data.relations));


                });
            });
            $('.add-new').css('right', '0');
        } catch (err) {
            console.error(err);
        }
    });


    $('#main-div').on('click', '.change-password-submit', function () {
        var isValid = true;

        $(this).parents('.modal-content').find('input.required').each(function () {
            if (!$(this).val()) {
                $(this).addClass('error-border');
                isValid = false;
            } else {
                $(this).removeClass('error-border');
            }
        });


        if (!isValid)
            return false;

        var lpass = $('#main-div .last-password').val();
        var npass = $('#main-div .new-password').val();
        var cpass = $('#main-div .confirmed-password').val();
        if (npass !== cpass) {

            $.notify(Hsis.dictionary[Hsis.lang]['wrong_repeated_password'], {
                type: 'danger'
            });

            return false;

        }

        var password = {};
        password.lastPassword = lpass;
        password.password = npass;
        password.passwordConfirmation = cpass;

        Hsis.Proxy.changePassword(password, function (data) {
            if (data) {
                if (data.code == Hsis.statusCodes.OK) {
                    $('#main-div .last-password').removeClass('error-border');
                    $('#main-div .settings-password-modal').modal("hide");
                    $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                        type: 'success'
                    });
                    $('#main-div #logoutForm').find('button[type="submit"]').click();

                } else if (data.code == Hsis.statusCodes.INVALID_PARAMS) {
                    $.notify(Hsis.dictionary[Hsis.lang]['wrong_password'], {
                        type: 'danger'
                    });
                    $('#main-div .last-password').addClass('error-border');
                }

            }
        });

    });

    $('body').on('change', '.sub-module-con .chekbox-con input', function () {

        $('body').find('dd[data-firstname]').html('');
        $('body').find('dd[data-lastname]').html('');
        $('body').find('dd[data-speciality]').html('');
        $('.main-content-upd #studentphoto').attr('src', 'assets/img/guest.png');
        $('.student-search-form input[name="groupId"]').val('');
        var thisSubModule = $(this).next('');
        var attr = thisSubModule.attr('data-attr');
        if (attr !== '1') {
            var obj = thisSubModule.find('.state-icon');

            var checkbox = $(this);

            var typeId = checkbox.attr('data-type-id');

            var parent = thisSubModule.attr('data-parent');

            var activeTypeCount = checkbox.parents('.sub-module-group').find('input:checked').length;
            console.log(activeTypeCount);
            if (activeTypeCount > 0) {

                obj.toggleClass("radio-check radio-uncheck");
                var subModuleId = [];
                $.each($('.sub-module-con input'), function () {
                    if ($(this).is(':checked')) {
                        subModuleId.push($(this).val());
                    }
                });
                console.log(subModuleId);
                Hsis.subModuleId = [];
                Hsis.subModuleId = subModuleId;
                var params = '';

                $('.btn-load-more').removeAttr('data-page');
                if (parent == 1000011) {
                    var bachalaur = $.inArray("1000184", Hsis.subModuleId);
                    var master = $.inArray("1000218", Hsis.subModuleId);
                    var qiyabi = $.inArray("1000102", Hsis.subModuleId);
                    var eyani = $.inArray("1000103", Hsis.subModuleId);
                    var localstudents = $.inArray("1000004", Hsis.subModuleId);
                    sessionStorage.setItem('studentSubModules', JSON.stringify(Hsis.subModuleId));

                    var orgId = $('.student-search-form input[name="orgId"]').val();

                    var eduLevels = [];
                    if (bachalaur > 0 && master > 0) {
                        eduLevels.push(1000184);
                        eduLevels.push(1000218);
                    } else {
                        if (bachalaur > 0) {
                            eduLevels.push(1000184);
                        } else if (master > 0) {
                            eduLevels.push(1000218);
                        }
                    }

                    var eduTypes = [];
                    if (qiyabi > 0 && eyani > 0) {
                        eduTypes.push(1000186);
                        eduTypes.push(1000140);
                    } else {
                        if (qiyabi > 0) {
                            eduTypes.push(1000186);
                        } else if (eyani > 0) {
                            eduTypes.push(1000140);
                        }
                    }
                    var groupParams = '&orgId=' + orgId + '&eduLevels=' + eduLevels + '&eduTypes=' + eduTypes;
                    if (localstudents > 0) {
                        Hsis.Proxy.getAcademicGroupForSelect(groupParams, function (groups) {
                            if (groups) {
                                var html = '<option value="">' + Hsis.dictionary[Hsis.lang]["select"] + '</option>' +
                                    '<option value="1">Qrupa daxil olmayanlar</option>';
                                $.each(groups, function (i, v) {
                                    html += '<option value="' + v.id + '">' + v.name[Hsis.lang] + '</option>';
                                });
                                $('#groups').html(html);
                            }
                        });
                    } else {
                        $('#groups').html("");
                    }

                    params = $('.main-content-upd .student-search-form').serialize();
                    var keyword = $('#student_search').val();
                    $('.student-search-form input[name="groupId"]').val('');
                    Hsis.Proxy.loadStudents('', params + '&subModuleId=' + subModuleId, function () {

                    }, 1);


                } else if (parent == 1000010) {
                    sessionStorage.setItem('teacherSubModules', JSON.stringify(Hsis.subModuleId));
                    params = $('.main-content-upd .teacher-search-form').serialize();
                    Hsis.Proxy.loadTeachers('', params, function () {

                    }, 1);

                } else if (parent == 1000038) {
                    params = $('.main-content-upd .group-search-form').serialize();
                    var keyword = $('#group_search').val();
                    Hsis.Proxy.loadAcademicGroups('', params + '&keyword=' + keyword, function () {

                    }, 1);
                }

            } else if (activeTypeCount == 0) {
                $(this).prop('checked', true);
            }
        }


    });


    $('#main-div').on('change', '#speciality_levels', function () {
        try {
            var specialityLevels = $('#speciality_levels').find('option:selected').val();
            var specialityTypes = $('#speciality_types').find('option:selected').val();
            if (specialityLevels > 0) {
                Hsis.Proxy.loadDictionariesByTypeId(specialityLevels, specialityTypes, function (specialities) {
                    if (specialities) {
                        var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                        $.each(specialities, function (i, v) {
                            html += '<option value="' + v.id + '" code="' + v.code + '">' + v.value[Hsis.lang] + ' - ' + v.code + '</option>'
                        });
                        $('#org_name_select').html(html);
                    }
                });
            }

        } catch (err) {
            console.error(err);
        }
    });


    $('#main-div').on('change', '#speciality_types', function () {
        try {
            var specialityLevels = $('#speciality_levels').find('option:selected').val();
            var specialityTypes = $('#speciality_types').find('option:selected').val();
            if (specialityLevels > 0) {
                Hsis.Proxy.loadDictionariesByTypeId(specialityLevels, specialityTypes, function (specialities) {
                    if (specialities) {
                        var html = '<option>' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                        $.each(specialities, function (i, v) {
                            html += '<option value="' + v.id + '" code="' + v.code + '">' + v.value[Hsis.lang] + ' - ' + v.code + '</option>'
                        });
                        $('#org_name_select').html(html);
                    }
                });
            }


        } catch (err) {
            console.error(err);
        }
    });


    $('#main-div').on('click', '[close]', function () {
        try {
            $(this).parents('.modal-content').addClass('hidden');
        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', 'a.button-icon', function (e) {
        try {
            var id = $(this).attr('data-id');
            if (id == Hsis.appId) {
                e.preventDefault();
            }
        } catch (err) {
            console.error(err);
        }
    });


    $('#main-div').on('click', '#operation_1000094', function () {
        try {
            $('#jstree').jstree('deselect_all');

            var id = $(this).parents('#buttons_div').attr('data-id');
            var dicId = $(this).parents('#buttons_div').attr('data-dictype-id');
            if (!id) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_parent_node'], {
                    type: 'warning'
                });
                return false;
            }

            Hsis.operationList = "view";
            $('.main-content-upd').load('partials/org_tree_view.html', function () {
                $('#main-div .show-html').attr('data-id', id);
                if (dicId != 1000073) {
                    $('#main-div .show-html').remove();
                }

                if (dicId != 1000056 && dicId != 1000073) {
                    $('#main-div .org-structure').remove();
                    $('#main-div .org_address').remove();
                } else {
                    $('#main-div .org_address').removeClass('hidden');
                }
                if (dicId == 1000073) {
                    $('#main-div .university-type').removeClass('hidden');
                }
                if (dicId == 1000057) {
                    $('.structure-name-input').addClass('hidden');
                    $('.structure-name-filter').removeClass('hidden');
                    $('#orgName').removeAttr('required');
                    $('#orgCode').removeAttr('required');
                    Hsis.Proxy.loadDictionariesByTypeId('1000035', 0, function (specialityTypes) {
                        var html = Hsis.Service.parseDictionaryForSelect(specialityTypes);
                        $('#speciality_types').html(html);
                    });

                }

                $('#main-div #orgBack').attr('data-org-id', dicId);
                $('body').find('#orgId').val(id);

            });

        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '#search-student-form', function () {


        $('body').find('input[name="tempOrgId"]').val($('body').find('#atm_id').val() + ',' + $('body').find('#advanced_faculty').val() + ',' + $('body').find('#org_name_select_advanced').val())

        $('#main-div .search-student').val("1");
        var formSearch = $('#main-div .student-advanced-search-form').serialize();
        var form = $('#main-div .student-advanced-search-form').serializeArray();
        sessionStorage.setItem('studentSearch', JSON.stringify(form));


        Hsis.tempData.form = formSearch + '&subModuleId=' + Hsis.subModuleId;


        Hsis.Proxy.loadStudents('', Hsis.tempData.form, function () {
            $('.advanced-upd').css('right', '-100%');
        });


        return false
    });


    $('body').on('click', '#search-abroad-student-form', function () {
        $('body').removeAttr('search-param');
        $('body').attr('search-param', '1');
        $('body').find('input[name="tempOrgId"]').val($('body').find('#atm_id').val());
        $('#main-div .search-student').val("1");
        var formSearch = $('#main-div .abroad-student-advanced-search-form').serialize();
        var form = $('#main-div .abroad-student-advanced-search-form').serializeArray();
        sessionStorage.setItem('abroadStudentSearch', JSON.stringify(form));
        Hsis.tempData.form = formSearch + '&subModuleId=' + Hsis.subModuleId;
        Hsis.Proxy.loadAbroadStudents('', Hsis.tempData.form, function () {
            $('.advanced-upd').css('right', '-100%');
        });
        return false
    });


    $('#main-div').on('click', '#search-student-foreign-form', function () {
        $('#main-div .search-student').val("1");
        var formSearch = $('#main-div .student-advanced-search-form').serialize();
        var form = $('#main-div .student-advanced-search-form').serializeArray();

        sessionStorage.setItem('studentForeignSearch', JSON.stringify(form));


        Hsis.tempData.form = formSearch + '&subModuleId=' + Hsis.subModuleId;


        Hsis.Proxy.loadForeignStudents('', Hsis.tempData.form, function () {
            $('.foreign-advanced-search').css('right', '-100%');
        });


        return false
    })

    $('#main-div').on('click', '#search-teacher-form', function () {
        $('body').find('input[name="tempOrgId"]').val($('body').find('#atm_id').val() + ',' + $('body').find('#advanced_faculty').val() + ',' + $('body').find('#advanced_kafedra').val())
        var lang = $('#main-div #teacher_languages').val();
        if (lang != null && lang.length > 0) {
            $('#main-div input[name="teacherLang"]').val(lang);
        }

        $('#main-div .teacher-advanced-search-form .search-teacher').val("1");
        var formSearch = $('#main-div .teacher-advanced-search-form').serialize();
        var form = $('#main-div .teacher-advanced-search-form').serializeArray();

        sessionStorage.setItem('teacherSearch', JSON.stringify(form));

        Hsis.tempData.form = formSearch + '&subModuleId=' + Hsis.subModuleId;

        Hsis.Proxy.loadTeachers('', Hsis.tempData.form, function () {
            $('.advanced-upd').css('right', '-100%');
        });
        $('.advanced-upd').css('right', '-100%');
        return false
    })

    $('#main-div').on('click', '#operation_1000137', function () {

        try {

            var id = $(this).parents('#buttons_div').attr('data-id');

            var parentId = $(this).parents('#buttons_div').attr('data-dictype-id');
            var uniDicId = 1000073;

            if (!id) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_parent_node'], {
                    type: 'danger'
                });
                return false;
            }


            if (uniDicId == parentId || id == 1000001) {
            } else {
                $.notify("Secdiyiniz struktur export oluna bilmez", {
                    type: 'danger'
                });
            }


        } catch (err) {
            console.error(err);
        }

    });

    $('#main-div').on('click', '.show-html', function () {
        var id = $(this).attr('data-id');
        window.open(Hsis.urls.REPORT + 'reports/orgInfo/' + id + '/html?token=' + Hsis.token, '_blank');
    });


    $('body').on('change', '#eduOrg', function () {
        var code = $(this).val();
        if (code == 1000055) {
            $('body').attr('data-org-type', 'K');
            $(this).attr('data-org-type', 'K');
            $('.add-edulifecycle-modal .modal-content').attr('data-unidetailid', '1000055')
        } else if (code == 1000056) {
            $('body').attr('data-org-type', 'M');
            $(this).attr('data-org-type', 'M');
            $('.add-edulifecycle-modal .modal-content').attr('data-unidetailid', '1000056')
        } else {
            $('body').attr('data-org-type', 'U');
            $(this).attr('data-org-type', 'U');
            $('.add-edulifecycle-modal .modal-content').attr('data-unidetailid', '1000073')
        }
    });


    // edit student modal

    $('body').on('click', '.edit-student-action', function () {
        try {
            var type = $(this).attr('data-type-id');
            var id = $(this).attr('data-id');
            var orgId = $(this).attr('data-org-id');
            var orgType = $(this).parents('tr').attr('data-type-id');
            var statusId = $(this).parents('.student-action').attr('data-status-id');
            var dataOrgType = $(this).parents('.student-action').attr('data-org-type');
            $('body').find('#eduOrg').attr('data-org-type', dataOrgType)
            $('body').find('#eduOrg').val(0);
            $('body').find('#eduOrg').attr('data-org-type', dataOrgType)
            var dataTypeId = $(this).parents('.student-action').find("thead tr:eq(0)").attr('data-type-id');
            var structureName = $(this).parents('.student-action').find("table tr td:eq(0)").text();

            var startActiontype = $(this).parents('.student-action').find('table tbody tr td:eq(1)').text();
            var dataActionDate = $(this).parents('.student-action').find('table tbody tr td:eq(2)').text();
            var dataEndActionType = $(this).parents('.student-action').find('table tbody tr td:eq(3)').text();

            $('body #edulifecycle_confirm').attr('data-type', 'edit')
            $('body #edulifecycle_confirm').attr('data-id', id)
            $('.edit-uni-action').attr('data-status-id', statusId);

            Hsis.Proxy.getStudentActionDetails(id, function (data) {
                var eduLevel;
                switch (data.data.eduLevel.id) {
                    case 1000184:
                        eduLevel = '1000057';
                        break;
                    case 1000218:
                        eduLevel = '1000604';
                        break;
                    default:
                        eduLevel = data.data.eduLevel.id;
                        break;
                }


                $('#main-div #past_edu_line').val(data.data.eduLine.id);
                $('#main-div #edit_uni_action_student_card_no').val(data.data.cardNo);
                $('#main-div #edit_uni_action_action_date').val(data.data.actionDate === '-' ? '' : data.data.actionDate);
                $('#main-div #edit_uni_action_end_date').val(data.data.endActionDate === '-' ? '' : data.data.endActionDate);
                $('#main-div #edu-end-date').val(data.data.endActionDate === '-' ? '' : data.data.endActionDate);
                $('#main-div #past_edu_lang').val(data.data.eduLang.id);
                $('#main-div #past_edu_type').val(data.data.eduType.id);
                $('#main-div #past_edu_pay_type').val(data.data.edupayType.id);
                $('#main-div #past_apply_score').val(data.data.applyScore);
                $('#main-div #past_edu_level').val(eduLevel);

                var structureId = Hsis.structureId ? Hsis.structureId : 0;
                Hsis.Proxy.getFilteredStructureList(structureId, type, 0, function (eduOrg) {

                    var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                    if (eduOrg) {
                        $.each(eduOrg, function (i, v) {
                            html += '<option  value="' + v.id + '">' + v.name[Hsis.lang] + '</option>';
                        });
                    }
                    $('#main-div #edu_org_list').html(html);
                    $('#main-div #edu_org_list').val(data.data.org.id)
                }, 1);


                if (data.data.org.typeId = 1000055) {
                    $('body').find('.uni-type').css('display', 'none');
                    $('body').find('#end_action_type').val();
                } else {
                    $('body').find('.uni-type').css('display', 'block');
                }

                Hsis.Proxy.loadDictionariesByTypeId('1000025', '1000258', function (startActionType) {
                    var html = Hsis.Service.parseDictionaryForSelect(startActionType);
                    $('#start_action_type').html(html);
                    $('#start_action_type').val(data.data.actionType.id);
                });

                Hsis.Proxy.loadDictionariesByTypeId('1000025', '1000259', function (endActionType) {
                    var html = Hsis.Service.parseDictionaryForSelect(endActionType);
                    $('#end_action_type').html(html);
                    $('#end_action_type').val(data.data.endActionType.id);
                });

                $('#main-div .edit-uni-action').attr('data-id', id);

                $('#main-div .add-edulifecycle-modal').modal();


                $(".add-edulifecycle-modal").find(".modal-content").attr("data-uniDetailID", dataTypeId);

                $('.add-edulifecycle-modal').find('#edu_org_list').empty().append("<option>" + structureName + "</option>");


                $('.add-edulifecycle-modal').find('#edu-start-date').val(dataActionDate);

            });
        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '.edit-uni-action', function () {
        var id = $(this).attr('data-id');
        var eduLine = $('#main-div #edit_uni_action_edu_line').find('option:selected').val();
        var cardNo = $('#main-div #edit_uni_action_student_card_no').val();
        var actionDate = $('#main-div #edit_uni_action_action_date').val();
        var eduLang = $('#main-div #edit_uni_action_edu_lang').find('option:selected').val();
        var eduType = $('#main-div #edit_uni_action_edu_type').find('option:selected').val();
        var edupayType = $('#main-div #edit_uni_action_edu_pay_type').find('option:selected').val();
        var eduLevel = $('#main-div #edit_uni_action_edu_level').find('option:selected').val();
        var orgId = $('#main-div #edit_edu_org_list').find('option:selected').val();
        var applyScore = $('#main-div #edit_uni_action_apply_score').val();
        var endActiondate = $('#main-div #edit_uni_action_end_date').val();
        var statusId = $(this).attr('data-status-id');
        var type = $(this).attr('data-type-id');

        if (type == '1000073' || type == '1000055') {
            var eduLifeCycle = {
                id: id,
                actionDate: actionDate,
                endActionDate: endActiondate,
                orgId: orgId,
                applyScore: applyScore,
                cardNo: cardNo,
                eduLineId: eduLine,
                eduTypeId: eduType,
                edupayTypeId: edupayType,
                eduLangId: eduLang,
                eduLevelId: eduLevel,
                status: statusId
            };

        } else {
            var eduLifeCycle = {
                id: id,
                actionDate: actionDate,
                endActionDate: endActiondate,
                orgId: orgId,
                applyScore: applyScore,
                cardNo: cardNo,
                eduLineId: eduLine,
                eduTypeId: eduType,
                edupayTypeId: edupayType,
                eduLangId: eduLang,
                eduLevelId: 1000400,
                status: statusId,
                note: ""
            }
        }
        Hsis.Proxy.editStudentAcademicInfo(eduLifeCycle, function (data) {
            if (data && data.code === Hsis.statusCodes.OK) {
                $('#main-div .student-edit-uni-action-modal').modal("hide");
                Hsis.Proxy.getStudentActionDetails(id, function (pelc) {
                    var div = $('.student-action[data-id="' + id + '"]');
                    div.attr('data-action-type', pelc.data.actionType.id);

                    div.attr('data-action-date', pelc.data.actionDate);
                    div.find('[data-org-name]').html(pelc.data.org.value[Hsis.lang]);
                    div.find('[data-action-date]').html(pelc.data.actionDate);
                    div.find('[data-end-action-type]').html(pelc.data.endActionType.value[Hsis.lang]);
                    div.find('[data-end-action-date]').html(pelc.data.endActionDate);
                });
            }
        });
    });

    $('body').on('click', '.edit-school-action', function () {
        var id = $(this).attr('data-id');
        var actionDate = $('#main-div #edit_school_action_date').val();
        var eduLang = $('#main-div #edit_school_lang').find('option:selected').val();
        var schoolId = $('#main-div #schoolId').find('option:selected').val();
        var orgId = (schoolId == undefined || schoolId == "0") ? $(this).attr('data-org-id') : schoolId;
        var endActionDate = $('#main-div #edit_school_end_action_date').val();
        var statusId = $(this).attr('data-status-id');
        var eduLifeCycle = {
            id: id,
            actionDate: actionDate,
            endActionDate: endActionDate,
            orgId: orgId,
            applyScore: '',
            cardNo: '',
            eduLineId: 0,
            eduTypeId: 0,
            edupayTypeId: 0,
            eduLangId: eduLang,
            eduLevelId: 1000400,
            status: statusId,
            note: ""
        };

        Hsis.Proxy.editStudentAcademicInfo(eduLifeCycle, function (data) {
            if (data && data.code === Hsis.statusCodes.OK) {
                $('#main-div .student-edit-school-action-modal').modal("hide");
                Hsis.Proxy.getStudentActionDetails(id, function (pelc) {
                    var div = $('.student-action[data-id="' + id + '"]');
                    div.attr('data-action-type', pelc.data.actionType.id);
                    div.attr('data-action-date', pelc.data.actionDate);
                    div.find('[data-org-name]').html(pelc.data.org.value[Hsis.lang]);
                    div.find('[data-action-date]').html(pelc.data.actionDate);
                    div.find('[data-end-action-type]').html(pelc.data.endActionType.value[Hsis.lang]);
                    div.find('[data-end-action-date]').html(pelc.data.endActionDate);

                });

            }
        });

    });


    $('#main-div').on('click', '#tree_list_table tr', function () {
        var structureId = $(this).attr('data-id');
        $('.main-content-upd #buttons_div').attr('data-id', structureId);
        Hsis.tempData.org = structureId;
        var about = '';
        var dicType;
        $.each(Hsis.array, function (i, v) {
            if (Hsis.tempData.org == v.id) {
                about = v.about;
                dicType = v.dicType
            }
        });
        $('.main-content-upd #buttons_div').attr('data-dicType-id', dicType);
        $('#main-div #tree_list_child_table').attr("data-structure-id", structureId)
        var typeId = $('#main-div #orgType').attr('data-type') ? $('#main-div #orgType').attr('data-type') : 0;
        var children = typeId == 0 ? 2 : 0;
        Hsis.Proxy.getFilteredStructureList(structureId, typeId, 0, function (data) {
            var html = '';
            $.each(data, function (i, v) {
                html += '<tr data-id= "' + v.id + '">' +
                    '<td>' + (++i) + '</td>' +
                    '<td>' + (v.parent.name ? v.parent.name[Hsis.lang] + ' / ' + v.name[Hsis.lang] : v.name[Hsis.lang]) + '</td>' +
                    '<td>' + v.type.value[Hsis.lang] + '</td>' +
                    '<td>' + (v.code ? v.code : '-') + '</td>' +
                    '</tr>';
            });
            $('#main-div  #tree_list_child_table tbody').html(html);
        }, 0, children);

    });

    $('body').on('click', '.add-edulifecycle', function (e) {
        try {

            $('body').find('#student-search-district').html('');
            $('body').find('#student-search-street').val('').html('');
            $('body').find('#edu_org_list').val('').trigger('change');
            $('body').find('#start_action_type').val('').trigger('change');
            $('body').find('#past_apply_score').val('').trigger('change');
            $('body').find('#edu-start-date').val(' ')
            $('body').find('#edu-end-date').val(' ')


            var eduOrg = $('body #eduOrg').val();

            if (eduOrg == 0 || eduOrg == undefined) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'danger'
                });
                return false;
            } else if (eduOrg == 1000073) {
                $('.add-edulifecycle-modal').find('[data-university]').removeClass("hidden");
            } else {
                $('.add-edulifecycle-modal').find('[data-university]').addClass("hidden");
            }

            Hsis.Proxy.loadDictionariesByTypeId('1000025', '1000258', function (startActionType) {
                var html = Hsis.Service.parseDictionaryForSelect(startActionType);
                $('#start_action_type').html(html);
            });

            Hsis.Proxy.loadDictionariesByTypeId('1000025', '1000259', function (endActionType) {
                var html = Hsis.Service.parseDictionaryForSelect(endActionType);
                $('#end_action_type').html(html);
            });


            $('.add-edulifecycle-modal').modal();


        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '#tree_list_child_table tbody tr', function () {

        var structureId = $(this).attr('data-id');
        $('.main-content-upd #buttons_div').attr('data-id', structureId);
        Hsis.tempData.org = structureId;
        var about = '';
        var dicType;
        $.each(Hsis.array, function (i, v) {
            if (Hsis.tempData.org == v.id) {
                about = v.about;
                dicType = v.dicType
            }
        });
        $('.main-content-upd #buttons_div').attr('data-dicType-id', dicType);
    })

    $('body').on('click', '#edulifecycle_confirm', function () {
        var t = $(this);
        try {
            var personId = $('#main-div').attr('data-id');
            var type = t.attr('data-type');
            var id = t.attr('data-id');


            if (personId > 0) {
                var eduOrgType = $('#eduOrg').find('option:selected').val();
                var personEduLifeCycle = {
                    actionTypeId: $('#start_action_type').find('option:selected').val(),
                    actionDate: $('#edu-start-date').val().trim(),
                    orgId: $('#edu_org_list').find('option:selected').val(),
                    applyScore: eduOrgType == 1000073 ? $('#past_apply_score').val().trim() : '',
                    cardNo: '',
                    note: $('#past_edu_note').val().trim(),
                    eduLineId: eduOrgType == 1000073 ? $('#past_edu_line').find('option:selected').val() : 0,
                    eduTypeId: eduOrgType == 1000073 ? $('#past_edu_type').find('option:selected').val() : 0,
                    edupayTypeId: eduOrgType == 1000073 ? $('#past_edu_pay_type').find('option:selected').val() : 0,
                    eduLangId: $('#past_edu_lang').find('option:selected').val(),
                    eduLevelId: eduOrgType == 1000073 ? $('#past_edu_level').find('option:selected').val() : 1000400, //orta tehsil
                    eduBlock: 'school',
                    status: 1000380,
                    endActionTypeId: $('#end_action_type').find('option:selected').val(),
                    endActionDate: $('.add-edulifecycle-modal #edu-end-date').val()
                };
                if (type !== 'edit') {

                    Hsis.Proxy.addPersoneduLifeCycle(personEduLifeCycle, personId, function (pelcId) {
                        if (pelcId > 0) {
                            $('.add-edulifecycle-modal').modal('hide');
                            $('.add-edulifecycle-modal input,textarea').val('');
                            $('.add-edulifecycle-modal select').find('option[value="0"]').prop('selected', true);
                            $('#edu_org_address_h6').html('');
                            $('#headingEduOrg').removeAttr('data-node-id').removeAttr('data-node-text');
                            Hsis.Proxy.getStudentActionDetails(pelcId, function (pelc) {
                                $('#student_action_block').append(Hsis.Service.parseOneStudentAction(pelc.data));
                            });
                        }
                    });
                } else {

                    var personEduLifeCycleEdit = {
                        actionTypeId: $('#start_action_type').find('option:selected').val(),
                        actionDate: $('#edu-start-date').val().trim(),
                        orgId: $('#edu_org_list').find('option:selected').val(),
                        applyScore: $('#past_apply_score').val().trim(),
                        cardNo: '',
                        note: $('#past_edu_note').val().trim(),
                        eduLineId: $('#past_edu_line').find('option:selected').val(),
                        eduTypeId: $('#past_edu_type').find('option:selected').val(),
                        edupayTypeId: $('#past_edu_pay_type').find('option:selected').val(),
                        eduLangId: $('#past_edu_lang').find('option:selected').val(),
                        eduLevelId: $('#past_edu_level').find('option:selected').val(), //orta tehsil
                        eduBlock: 'school',
                        status: 1000380,
                        endActionTypeId: $('#end_action_type').find('option:selected').val(),
                        endActionDate: $('.add-edulifecycle-modal #edu-end-date').val()
                    };

                    Hsis.Proxy.removeEduLifeCycle(id, function (data) {
                        if (data) {
                            $('body .student-action.past_edu[data-id="' + id + '"]').remove();
                            Hsis.Proxy.addPersoneduLifeCycle(personEduLifeCycleEdit, personId, function (pelcId) {
                                if (pelcId > 0) {
                                    $('.add-edulifecycle-modal').modal('hide');
                                    $('.add-edulifecycle-modal input,textarea').val('');
                                    $('.add-edulifecycle-modal select').find('option[value="0"]').prop('selected', true);
                                    $('#edu_org_address_h6').html('');
                                    $('#headingEduOrg').removeAttr('data-node-id').removeAttr('data-node-text');
                                    Hsis.Proxy.getStudentActionDetails(pelcId, function (pelc) {
                                        $('#student_action_block').append(Hsis.Service.parseOneStudentAction(pelc.data));
                                    });
                                }
                            });
                        }

                    })
                }
            }

        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '.student-action table, .work-action table', function () {
        try {
            $('.student-action table,.work-action table').removeClass('selected');
            $(this).addClass('selected');
            $(this).find('.glyphicon').css('color:white');

        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '.add-new-past-edu-doc', function () {
        try {
            var div = $('.student-action table.selected').parent('.student-action');
            var pelcId = div.attr('data-id');
            if (pelcId == undefined || pelcId == 0) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_edu_info'], {
                    type: 'danger'
                });
                return false;
            }
            Hsis.Proxy.loadDictionariesByTypeId('1000040', 0, function (docTypes) {
                var html = Hsis.Service.parseDictionaryForSelect(docTypes);
                $('#past_edu_doc_type').html(html);
                $('.add-past-edu-doc-modal').modal();
            });


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '#past_edu_doc_confirm', function () {
        try {
            if (Hsis.Validation.validateRequiredFields('past-edu-doc-required')) {
                var div = $('.student-action table.selected').parent('.student-action');
                var pelcId = div.attr('data-id');
                var documentType = "academic";
                var docTypeId = $('#past_edu_doc_type').val();
                var docSerial = $('#past_edu_doc_serial').val();
                var docNumber = $('#past_edu_doc_number').val();
                var docDate = $('#past_edu_doc_start_date').val();
                var docEndDate = $('#past_edu_doc_end_date').val();
                var document = {};
                document.type = docTypeId;
                document.serial = docSerial;
                document.number = docNumber;
                document.startDate = docDate;
                document.endDate = docEndDate;
                document.documentType = documentType;
                document.pelcId = pelcId;

                Hsis.Proxy.addStudentDocument(document, function (data) {
                    if (data.code === Hsis.statusCodes.OK) {
                        $('.add-past-edu-doc-modal').find('input').val('');
                        $('.add-past-edu-doc-modal').find('select option[value="0"]').prop('selected', true);
                        $('.add-past-edu-doc-modal').modal('hide');
                        var personId = $('#main-div').attr('data-id');
                        Hsis.Proxy.getAbroadStudentDetails(personId, function (data) {
                            var html = '';
                            var school = 'school';
                            if (data.schoolDocuments.length > 0) {
                                $('#past_edu_doc').html(Hsis.Service.parseEditStudentDocument(data.schoolDocuments, school));
                                $('#past_edu_doc').find('.add-doc-file').addClass('add-past-edu-doc-file').removeClass('add-doc-file');
                            }
                        })
                    }
                });
            }
        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('change', '.add-past-edu-doc-file', function (e) {
        var docId = $(this).attr('data-doc-id');
        try {
            var formData = new FormData();
            if ($(this)[0].files) {
                for (var i = 0; i < $(this)[0].files.length; i++) {
                    formData.append("file", $(this)[0].files[i])
                }
            }

            Hsis.Proxy.addStudentFiles(docId, formData, function (data) {
                if (data.code = Hsis.statusCodes.OK) {
                    var id = $('#main-div').attr('data-id')
                    Hsis.Proxy.getStudentDetails(id, function (data) {
                        var html = '';
                        var academic = 'academic';
                        if (data.pelcDocuments.length > 0) {
                            $('#past_edu_doc').html(Hsis.Service.parseEditStudentDocument(data.pelcDocuments, academic));
                            $('#past_edu_doc').find('.add-doc-file').addClass('add-past-edu-doc-file').removeClass('add-doc-file');
                        }
                    })
                }
            })

        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '.erase-student-action', function () {
        try {
            var pelcId = $(this).attr('data-id');
            var div = $(this).parents('.student-action');
            var school = 'school';
            $.confirm({
                title: Hsis.dictionary[Hsis.lang]['warning'],
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    Hsis.Proxy.removeEduLifeCycle(pelcId, function () {
                        $('#student_action_block').find('.past_edu[data-id="' + pelcId + '"]').remove();
                        var personId = $('#main-div').attr('data-id');
                        if ($('.action-students #student_action_block').length > 0) {
                            Hsis.Proxy.getAbroadStudentDetails(personId, function (data) {
                                $('#past_edu_doc').html(Hsis.Service.parseEditStudentDocument(data.schoolDocuments, school));
                                $('.action-students #student_action_block').html(Hsis.Service.parseStudentActions(data.pelcAction));
                                $('#student_action_block .student-action').addClass('past_edu');
                                $('.action-students .student-action[data-action-date="' + data.actionDate + '"]').remove();
                            });
                        }

                    })
                },
                cancel: function () {
                    $.notify(Hsis.dictionary[Hsis.lang]['сancelled'], {
                        type: 'warning'
                    });
                },
                theme: 'material'
            });
        } catch (err) {
            console.error(err);
        }
    })


    setTimeout(function () {
        window.onpopstate = function (e) {

            if (e.state != null) {
                if ($('.module-item')) {
                    $('.main-content-upd').load('partials/module_' + e.state.page + '.html?' + Math.random(), function () {
                        $('#main-div #buttons_div').attr('title', 'Ümumi əməliyyatlar');

                    });
                }
            }

        }, 0
    });

    $('body').on('click', '#operation_1000148', function () {
        try {

            var id = $(this).parents('#buttons_div').attr('data-id');
            var parentId = $(this).parents('#buttons_div').attr('data-dictype-id');
            var specDicMagId = 1002306;
            var specDicBacId = 1008358;
            var type = 0;
            if (!id) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_parent_node'], {
                    type: 'warning'
                });
                return false;
            }
            Hsis.Proxy.loadDictionariesListByParentId(parentId, function (data) {
                if (data) {
                    if (data.code == Hsis.statusCodes.OK) {
                        $.each(data.data, function (i, v) {
                            if (v.id == specDicMagId || v.id == specDicBacId) {
                                type = v.id;

                            }
                        })
                    }
                }
                console.log('------------------' + type);
                if (type == specDicMagId || type == specDicBacId) {
                    $('.add-new .search-scroll').load('partials/orgtree_modal.html', function () {
                        Hsis.Proxy.loadDictionariesByTypeId('1000035', 0, function (specialityTypes) {
                            var html = Hsis.Service.parseDictionaryForSelect(specialityTypes);
                            $('#speciality_types').html(html);
                        });
                        $('#main-div .org-structure').remove();
                        $('body').find('#confirmOrgTree').text(Hsis.dictionary[Hsis.lang]['add']);
                        $('#main-div #confirmOrgTree').attr('data-org-id', type);
                        $('body').find('#parentId').val(id);
                        $('.structure-name-filter').removeClass('hidden');
                        $('.sub_speciality').removeClass('hidden');
                        $('#sub_speciality').attr('required', 'true');
                        $('.structure-name-input').addClass('hidden');
                        $('#orgCode').parent('.structure-name-input').removeClass('hidden');
                        $('#orgName').removeAttr('required');
                        $('#orgCode').removeAttr('required');
                        $('#speciality_types').parent('.structure-name-filter').addClass('hidden');

                        if (type == specDicMagId)
                            $('#speciality_levels').find('option').not('option[value="1000047"]').remove()
                        else
                            $('#speciality_levels').find('option').not('option[value="1000046"]').remove();

                        $('#org_name_select').attr('required', 'true');
                        if (type == 1002306) {
                            Hsis.Proxy.getFilteredStructureList(Hsis.structureId, '1000604', 0, function (specialities) {
                                if (specialities) {
                                    var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                    $.each(specialities, function (k, l) {
                                        html += '<option dic-id="' + l.type.typeId + '" value="' + l.id + '">' + l.name[Hsis.lang] + ' - ' + l.code + '</option>'
                                    })
                                    $('#org_name_select').html(html);
                                    $('#org_name_select').find('option[value="' + id + '"]').prop('selected', true);
                                    $('#org_name_select').attr('disabled', 'disabled');
                                    var dicId = $('#org_name_select').find('option:selected').attr('dic-id');
                                    Hsis.Proxy.loadDictionariesByTypeId('1000056', dicId, function (subSpeciality) {
                                        if (subSpeciality) {
                                            var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                            $.each(subSpeciality, function (i, v) {
                                                html += '<option value="' + v.id + '" code="' + v.code + '">' + v.value[Hsis.lang] + '</option>'
                                            });
                                            $('#sub_speciality').html(html);
                                            var subId = $('#sub_speciality').find('option:selected').val();
                                        }
                                    });
                                }
                            }, 1);
                        }
                        if (type == 1008358) {
                            Hsis.Proxy.getFilteredStructureList(Hsis.structureId, '1000057', 0, function (specialities) {
                                if (specialities) {
                                    var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                    $.each(specialities, function (k, l) {
                                        html += '<option dic-id="' + l.type.typeId + '" value="' + l.id + '">' + l.name[Hsis.lang] + ' - ' + l.code + '</option>'
                                    })
                                    $('#org_name_select').html(html);
                                    $('#org_name_select').find('option[value="' + id + '"]').prop('selected', true);
                                    $('#org_name_select').attr('disabled', 'disabled');
                                    var dicId = $('#org_name_select').find('option:selected').attr('dic-id');
                                    Hsis.Proxy.loadDictionariesByTypeId('1000056', dicId, function (subSpeciality) {
                                        if (subSpeciality) {
                                            var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                                            $.each(subSpeciality, function (i, v) {
                                                html += '<option value="' + v.id + '" code="' + v.code + '">' + v.value[Hsis.lang] + '</option>'
                                            });
                                            $('#sub_speciality').html(html);
                                            var subId = $('#sub_speciality').find('option:selected').val();
                                        }
                                    });
                                }
                            }, 1);
                        }

                        $('body').find('.add-new').css('right', '0');
                    });
                } else {
                    $.notify(Hsis.dictionary[Hsis.lang]['cant_add_speciality_to_struc'], {
                        type: 'danger'
                    });
                }

            })

        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('change', '#edu_level', function () {
        try {
            var eduLevel = $(this).find('option:selected').val();
            if (eduLevel > 0) {

                Hsis.Proxy.getFilteredStructureList(Hsis.structureId, eduLevel, 0, function (specialities) {
                    if (specialities) {
                        var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                        $.each(specialities, function (i, v) {
                            html += '<option value="' + v.id + '">' + v.name[Hsis.lang] + ' - ' + v.parent.name[Hsis.lang] + '</option>'
                        })
                    }
                    $('#orgId').html(html);
                });
            } else if (eduLevel == 0) {
                $('#orgId').html('');
            }
            if (eduLevel == '1000604') {
                $('.sub_speciality').removeClass('hidden');
            } else {
                $('.sub_speciality').addClass('hidden');
                $('#sub_speciality').empty();
            }

        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('change', '#orgId', function (e) {
        try {
            var specLevel = $('#edu_level').find('option:selected').val();
            var specId = $('#orgId').find('option:selected').val();
            if (specLevel == '1000604') {
                Hsis.Proxy.getFilteredStructureList(specId, '1002306', 0, function (subSpeciality) {
                    var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                    if (subSpeciality) {
                        $.each(subSpeciality, function (i, v) {
                            html += '<option  value="' + v.id + '">' + v.name[Hsis.lang] + '</option>';
                        });

                    }
                    $('#sub_speciality').html(html);
                });
            } else if (specLevel == '1000057') {
                Hsis.Proxy.getFilteredStructureList(specId, '1008358', 0, function (subSpeciality) {
                    var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                    if (subSpeciality) {
                        $.each(subSpeciality, function (i, v) {
                            html += '<option  value="' + v.id + '">' + v.name[Hsis.lang] + '</option>';
                        });

                    }
                    $('#sub_speciality').html(html);
                });
            }


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.teacher-staff-type li', function () {
        try {
            var id = $(this).attr('data-id');
            if (id != 0) {
                $('.main-content-upd .teacher-search-form input[name="staffType"]').val($(this).attr('data-id'));

            } else {
                $('.main-content-upd .teacher-search-form input[name="staffType"]').val('');
            }
            $('.btn-load-more').removeAttr('data-page');
            var params = $('.main-content-upd .teacher-search-form').serialize();
            Hsis.Proxy.loadTeachers('', params);

        } catch (err) {
            console.error(err)
        }

    });

    $('body').on('click', '.staff-table-type li', function () {
        try {
            var id = $(this).attr('data-id');
            if (id != 0) {
                $('.main-content-upd .teacher-search-form input[name="staffType"]').val($(this).attr('data-id'));

            } else {
                $('.main-content-upd .teacher-search-form input[name="staffType"]').val('');
            }
            $('.btn-load-more').removeAttr('data-page');
            var params = $('.main-content-upd .teacher-search-form').serialize();
            Hsis.Proxy.loadStaffTable('', params);

        } catch (err) {
            console.error(err)
        }

    });

    $('#main-div').on('change', '#edit_uni_action_edu_level', function () {
        try {
            var typeId = $(this).find('option:selected').val();
            if (typeId != 0) {
                Hsis.Proxy.getFilteredStructureList(Hsis.structureId, typeId, 0, function (specialities) {
                    if (specialities) {
                        var html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                        $.each(specialities, function (i, v) {
                            html += '<option value="' + v.id + '">' + v.name[Hsis.lang] + '</option>'
                        })
                    }
                    $('#main-div #edit_uni_action_orgId').html(html);
                });
            }

        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('change', '#groups', function (e) {
        try {
            var groupId = $('#groups').find('option:selected').val();
            if (groupId > 0) {
                $('input[name="groupId"]').val(groupId);

            } else {
                $('input[name="groupId"]').val('');
            }
            $('.btn-load-more').removeAttr('data-page');
            var params = $('.main-content-upd .student-search-form').serialize();
            Hsis.Proxy.loadStudents('', params + '&subModuleId=' + Hsis.subModuleId);
        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '#operation_1000166', function () {
        try {

            var id = $(this).parents('#buttons_div').attr('data-id');
            var parentId = $(this).parents('#buttons_div').attr('data-dictype-id');
            var sabahDicId = 1007366;
            var type = 0;
            if (!id) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_parent_node'], {
                    type: 'warning'
                });
                return false;
            }

            Hsis.Proxy.loadDictionariesListByParentId(parentId, function (data) {
                if (data) {
                    if (data.code == Hsis.statusCodes.OK) {
                        $.each(data.data, function (i, v) {
                            if (v.id == sabahDicId) {
                                type++;
                            }
                        })
                    }
                }

                if (type > 0) {
                    $('.add-new .search-scroll').load('partials/orgtree_modal.html', function () {
                        $('#main-div .org-structure').remove();
                        $('body').find('#confirmOrgTree').text(Hsis.dictionary[Hsis.lang]['add']);
                        $('#main-div #confirmOrgTree').attr('data-org-id', sabahDicId);
                        $('body').find('#parentId').val(id);
                        $('body').find('.add-new').css('right', '0');
                    });
                } else {
                    $.notify(Hsis.dictionary[Hsis.lang]['cant_add_sabah_to_struc'], {
                        type: 'danger'
                    });
                }

            })


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.add-scholarship-plan', function (e) {
        try {
            $('#scholarshipModal').modal();
            $('#scholarshipModal .confirmScholarship').attr('add', '0').removeAttr('edit');

            Hsis.Proxy.getEduYears(function (years) {
                if (years) {
                    var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]["select"] + '</option>';
                    $.each(years, function (i, v) {
                        html += '<option value="' + v.id + '">' + v.value[Hsis.lang] + '</option>';
                    });
                    $('#edu_year').html(html);
                }
            });
        } catch (err) {
            console.error(err);
        }
    });
    $('body').on('click', '.add-org-contact', function (e) {
        try {
            $('#orgContactModal .confirmOrgContact').attr('add', '0').removeAttr('edit');

            Hsis.Proxy.loadDictionariesByTypeId('1000011', 0, function (contact) {
                var html = Hsis.Service.parseDictionaryForSelect(contact);
                $('#main-div #orgContactModal #org_contact_type').html(html);

                $('#orgContactModal').modal();

            });

        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.confirmScholarship[add]', function (e) {
        try {
            var eduYear = $('#edu_year').find('option:selected').val();
            var placeCount = $('#placeCount').val();
            var eduyearName = $('#edu_year').find('option:selected').html();
            var html = '<div data-id="0" data-count="' + placeCount + '" data-year="' + eduYear + '" class="col-md-12 for-align scholarship-item">' +
                '<table class="table-block col-md-12">' +
                '<thead>' +
                '<tr>' +
                '<th>' + Hsis.dictionary[Hsis.lang]["edu_year"] + '</th>' +
                '<th>' + Hsis.dictionary[Hsis.lang]["place_count"] + '</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody>' +
                '<tr>' +
                '<td data-year>' + eduyearName + '</td>' +
                '<td data-count>' + placeCount + '</td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '<div class="operations-button">' +
                '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                '<span class="glyphicon glyphicon-list"></span>' +
                '</div>' +
                '<ul class="dropdown-menu">' +
                '<li>' +
                '<a edit-scholarship="" data-year-name="' + eduyearName + '" data-year="' + eduYear + '" data-count="' + placeCount + '"  href="#" class="edit">' + Hsis.dictionary[Hsis.lang]["edit"] + '</a>' +
                '</li>' +
                '<li>' +
                '<a remove-scholarship="" data-id="0"  data-year="' + eduYear + '" data-count="' + placeCount + '"  href="#" class="edit">' + Hsis.dictionary[Hsis.lang]["erase"] + '</a>' +
                '</li>' +
                '</ul>' +
                '</div>' +
                '</div>';
            $('#scholarplan_div').append(html);
            $('#scholarshipModal').find('input').val('');
            $('#scholarshipModal select').find('option[value="0"]').prop('selected', true);
            $('#scholarshipModal').modal('hide');

        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '.confirmOrgContact[add]', function (e) {
        try {
            var contactType = $('#main-div #org_contact_type').val();
            var contactName = $('#main-div #org_contact_type option[value="' + contactType + '"]').text();
            var contact = $('#main-div #org_contact').val();
            var html = '<div data-id="0" data-contact="' + contact + '" data-contact-type="' + contactType + '" class="col-md-12 for-align orgcontact-item">' +
                '<table class="table-block col-md-12">' +
                '<thead>' +
                '<tr>' +
                '<th>Tipi</th>' +
                '<th>Kontakt</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody>' +
                '<tr data-id="0" data-contact="' + contact + '" data-contact-type="' + contactType + '">' +
                '<td>' + contactName + '</td>' +
                '<td>' + contact + '</td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '<div class="operations-button">' +
                '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                '<span class="glyphicon glyphicon-list"></span>' +
                '</div>' +
                '<ul class="dropdown-menu">' +
                '<li>' +
                '<a remove-orgcontact="" data-id="0" href="#" class="edit">' + Hsis.dictionary[Hsis.lang]["erase"] + '</a>' +
                '</li>' +
                '</ul>' +
                '</div>' +
                '</div>';
            $('#main-div #org_contact_div').append(html);
            $('#main-div #orgContactModal').find('input').val('');
            $('#main-div #orgContactModal select').find('option[value="0"]').prop('selected', true);

        } catch (err) {
            console.error(err);
        }

    });


    $('#main-div').on('click', '[remove-scholarship]', function (e) {
        try {

            $(this).parents('.scholarship-item').remove();
        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '[remove-orgcontact]', function (e) {
        try {

            $(this).parents('.orgcontact-item').remove();
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.add-applyandgrad-plan', function (e) {
        try {
            $('#applyAndGradModal').find('input').val('');
            $('#applyAndGradModal select').find('option[value="0"]').prop('selected', true);
            $('#applyAndGradModal').modal();
            if (Hsis.operationList == "edit") {
                $('#applyAndGradModal .confirmApplyAndGrad').attr('data-operation', 'edit-add');
            } else {
                $('#applyAndGradModal .confirmApplyAndGrad').attr('data-operation', 'add');
            }

            Hsis.Proxy.getEduYears(function (years) {
                if (years) {
                    var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]["select"] + '</option>';
                    $.each(years, function (i, v) {
                        html += '<option value="' + v.id + '">' + v.value[Hsis.lang] + '</option>';
                    });
                    $('#edu_year_plan').html(html);
                }
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.confirmApplyAndGrad[data-operation="add"]', function (e) {
        try {
            var eduYear = $('#edu_year_plan').find('option:selected').val();
            var applyCount = $('#applyCount').val();
            var graduateCount = $('#graduateCount').val();
            var eduyearName = $('#edu_year_plan').find('option:selected').html();
            var html = '<div data-id="0" graduate-count="' + graduateCount + '" apply-count="' + applyCount + '" data-year="' + eduYear + '" class="col-md-12 for-align applyandgrad-item">' +
                '<table class="table-block col-md-12">' +
                '<thead>' +
                '<tr>' +
                '<th>' + Hsis.dictionary[Hsis.lang]["edu_year"] + '</th>' +
                '<th>' + Hsis.dictionary[Hsis.lang]["apply_plan"] + '</th>' +
                '<th>' + Hsis.dictionary[Hsis.lang]["graduate_plan"] + '</th>' +
                '</tr>' +
                '</thead>' +
                '<tbody>' +
                '<tr>' +
                '<td data-year>' + eduyearName + '</td>' +
                '<td apply-count>' + applyCount + '</td>' +
                '<td graduate-count>' + graduateCount + '</td>' +
                '</tr>' +
                '</tbody>' +
                '</table>' +
                '<div class="operations-button">' +
                '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                '<span class="glyphicon glyphicon-list"></span>' +
                '</div>' +
                '<ul class="dropdown-menu">' +
                '<li>' +
                '<a edit-applyandgrad="" data-year-name="' + eduyearName + '" data-year="' + eduYear + '" graduate-count="' + graduateCount + '" apply-count="' + applyCount + '"  href="#" class="edit">' + Hsis.dictionary[Hsis.lang]["edit"] + '</a>' +
                '</li>' +
                '<li>' +
                '<a remove-applyandgrad="" data-id="0"  data-year="' + eduYear + '" data-count="' + placeCount + '"  href="#" class="edit">' + Hsis.dictionary[Hsis.lang]["erase"] + '</a>' +
                '</li>' +
                '</ul>' +
                '</div>' +
                '</div>';

            if (eduYear > 0) {
                $('#applyandgradplan_div').html(html);
                $('.add-applyandgrad-plan').addClass('hidden');
                $('#applyAndGradModal').modal('hide');
            }


        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '[edit-applyandgrad]', function (e) {
        try {
            $('.applyandgrad-item').removeClass('active');
            var div = $(this).parents('.applyandgrad-item');
            div.addClass('active');
            var eduYear = $(this).attr('data-year');
            var applyCount = $(this).attr('apply-count');
            var graduateCount = $(this).attr('graduate-count');

            if (Hsis.operationList == "edit") {
                Hsis.Proxy.getEduYears(function (years) {
                    if (years) {
                        var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]["select"] + '</option>';
                        $.each(years, function (i, v) {
                            html += '<option value="' + v.id + '">' + v.value[Hsis.lang] + '</option>';
                        });
                        $('#edu_year_plan').html(html);
                        $('#edu_year_plan').find('option[value="' + eduYear + '"]').prop('selected', true);
                    }
                });
                $('#applyAndGradModal .confirmApplyAndGrad').attr('data-operation', 'edit-edit');
            } else {
                $('#applyAndGradModal .confirmApplyAndGrad').attr('data-operation', 'edit');
                $('#edu_year_plan').find('option[value="' + eduYear + '"]').prop('selected', true);
            }
            $('#applyCount').val(applyCount);
            $('#graduateCount').val(graduateCount);
            $('#applyAndGradModal').modal();
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.confirmApplyAndGrad[data-operation="edit"]', function (e) {
        var eduYear = $('#edu_year_plan').find('option:selected').val();
        var eduYearName = $('#edu_year_plan').find('option:selected').html();
        var applyCount = $('#applyCount').val();
        var graduateCount = $('#graduateCount').val();
        var selected = $('.applyandgrad-item.active');
        selected.attr('apply-count', applyCount);
        selected.attr('graduate-count', graduateCount);
        selected.attr('data-year', eduYear);
        selected.find('td[apply-count]').html(applyCount);
        selected.find('td[graduate-count]').html(graduateCount);
        selected.find('td[data-year]').html(eduYearName);
        selected.find('[edit-applyandgrad]').attr('apply-count', applyCount);
        selected.find('[edit-applyandgrad]').attr('graduate-count', graduateCount);
        selected.find('[edit-applyandgrad]').attr('data-year', eduYear);
        $('#applyAndGradModal').modal('hide');
        $('#applyAndGradModal input').val('');
        $('#applyAndGradModal select').find('option[value="0"]').prop('selected', true);


    });

    $('body').on('click', '.confirmApplyAndGrad[data-operation="edit-add"]', function (e) {
        try {
            var eduYear = $('#edu_year_plan').find('option:selected').val();
            var applyCount = $('#applyCount').val().trim();
            var graduateCount = $('#graduateCount').val().trim();
            var orgId = $('#orgId').val();
            if (eduYear > 0 && (applyCount.length > 0 || graduateCount.length > 0)) {
                var plan = {
                    eduYearId: eduYear,
                    applyPlan: applyCount > 0 ? applyCount : 0,
                    graduatePlan: graduateCount > 0 ? graduateCount : 0,
                    id: orgId
                }
                $('#applyAndGradModal').modal('hide');
                Hsis.Proxy.addOrgPlan(plan, function () {
                    Hsis.Proxy.getOrgPlanByOrgId(orgId, function (plan) {
                        Hsis.Service.parseApplyAndGradPlan(plan);
                    });
                });
            }
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.confirmApplyAndGrad[data-operation="edit-edit"]', function () {
        try {
            var eduYear = $('#edu_year_plan').find('option:selected').val();
            var applyCount = $('#applyCount').val().trim();
            var graduateCount = $('#graduateCount').val().trim();
            var orgId = $('#orgId').val();
            var selected = $('.applyandgrad-item.active');
            var planId = selected.attr('data-id');
            if (eduYear > 0 && (applyCount.length > 0 || graduateCount.length > 0)) {
                var plan = {
                    eduYearId: eduYear,
                    applyPlan: applyCount > 0 ? applyCount : 0,
                    graduatePlan: graduateCount > 0 ? graduateCount : 0,
                    id: orgId
                }
                $('#applyAndGradModal').modal('hide');
                Hsis.Proxy.editOrgPlan(planId, plan, function () {
                    Hsis.Proxy.getOrgPlanByOrgId(orgId, function (plan) {
                        Hsis.Service.parseApplyAndGradPlan(plan);
                    });
                });
            }
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '[remove-applyandgrad]', function (e) {
        try {
            if (Hsis.operationList == "edit") {
                var id = $(this).attr('data-id');
                var orgId = $('#orgId').val();
                $.confirm({
                    title: Hsis.dictionary[Hsis.lang]['warning'],
                    content: Hsis.dictionary[Hsis.lang]['delete_info'],
                    confirm: function () {
                        Hsis.Proxy.removeOrgPlan(id, function () {
                            Hsis.Proxy.getOrgPlanByOrgId(orgId, function (plan) {
                                Hsis.Service.parseApplyAndGradPlan(plan);
                            });
                        });
                    },
                    cancel: function () {
                        $.notify(Hsis.dictionary[Hsis.lang]['сancelled'], {
                            type: 'warning'
                        });
                    },
                    theme: 'material'
                });
            } else {
                $(this).parents('.applyandgrad-item').remove();
                if ($('.applyandgrad-item').length == 0) {
                    $('.add-applyandgrad-plan').removeClass('hidden');
                }
            }
        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('change', '#edu-level-list', function (e) {
        try {
            var id = $('#confirmGroup').data('id');
            $('#filter_form input[name="id"]').val(id);
            $('#filter_form input[name="orgId"]').val($('.btn.tree-modal').attr('data-id'));
            $('#filter_form input[name="eduLevelId"]').val($('#edu-level-list').val());
            $('#filter_form input[name="citizenshipType"]').val(0);

            Hsis.Proxy.getStudentListByOrgId($('#filter_form').serialize());
        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '.add-new-work-lifecycle', function (e) {

        try {
            $('.work-lifecycle-modal input, textarea').val('');
            $('.work-lifecycle-modal select').not('#teaching').find('option[value="0"]').prop('selected', true);
            $('#teaching option[value=""]').prop('selected', true);
            $('.work-lifecycle-modal .work-lifecycle-modal-submit').attr('data-action', 'add');
            $('.work-lifecycle-modal .edit-work-lifecycle-modal-submit').attr('data-action', 'add');

            Hsis.Proxy.loadDictionariesByTypeId('1000002', 0, function (orgType) {
                var html = Hsis.Service.parseDictionaryForSelect(orgType);
                $('#main-div #teacherOrgTypeId').html(html);

            });

            $('.work-lifecycle-modal').modal();

        } catch (err) {
            console.error(err);
        }

    });


    $('#main-div').on('click', '#operation_1001416', function () {
        $('#main-div #add-order-serial').val('');
        $('#main-div #add-order-number').val('');
        $('#main-div #order-start-date').val('');
        $('#main-div .order-type').val(0);
        $('#main-div #university-list-h6').text('');
        $('#collapseUniversity').removeClass('in');
        $('#main-div .new-order-doc-file').val("")
        $('#main-div .file-span').text("")
        $('body').find('.add-new').css('right', '0');
    })

    $('body').on('click', '.add-order-document-submit', function () {
        try {

            var formData = new FormData();
            var seriya = $('#main-div #add-order-serial').val();
            var number = $('#main-div #add-order-number').val();
            var startDate = $('#main-div #order-start-date').val();
            var dataCheck = $(this).attr('data-check');
            if (dataCheck == '1') {
                return false;
            }
            var type = $('#main-div .order-type').find('option:selected').val();
            var document = {
                type: type,
                orgId: 1000001,
                serial: seriya,
                number: number,
                startDate: startDate,
                endDate: ''

            }
            if (Hsis.Validation.validateRequiredFields('order-required')) {
                formData.append('document', new Blob([JSON.stringify(document)], {
                    type: "application/json"
                }))

                if ($('#main-div .new-order-doc-file')[0].files) {
                    var wrongFiles = '';
                    var length = $('#main-div .new-order-doc-file')[0].files.length;
                    if (length <= 5) {
                        for (var i = 0; i < length; i++) {
                            var files = $('#main-div .new-order-doc-file')[0].files;
                            if (Hsis.Validation.checkFile(files[i].type, fileTypes.FILE_CONTENT_TYPE)) {
                                if (files[i].size > 5 * 1024 * 1024) {

                                    $.notify(files[i].name + Hsis.dictionary[Hsis.lang]['exceed_volume'], {
                                        type: 'warning'
                                    });
                                } else {
                                    formData.append('doc_order', $('#main-div .new-order-doc-file')[0].files[i]);
                                }
                            } else {
                                wrongFiles += wrongFiles != '' ? ', ' + files[i].name : files[i].name;

                            }
                        }
                        if (wrongFiles != '') {
                            $.notify(Hsis.dictionary[Hsis.lang]['wrong_format'] + wrongFiles, {
                                type: 'warning'
                            });

                        }
                    } else {
                        $.notify(Hsis.dictionary[Hsis.lang]['file_limit'], {
                            type: 'warning'
                        });
                    }

                }

                Hsis.Proxy.addOrderDocument(formData, function (data) {
                    var params = $('.main-content-upd .order-search-form').serialize();
                    if (data) {
                        $('.btn-load-more').removeAttr('data-page');
                        Hsis.Proxy.getOrderList('', params);
                        $('#main-div .structure-id').val('');
                        $('#main-div #add-order-serial').val('');
                        $('#main-div #add-order-number').val('');
                        $('#main-div .order-type').val(0);
                        $('#main-div #order-start-date').val('');
                        $('#main-div #university-list-h6').text('');
                        $('#collapseUniversity').removeClass('in');
                        $('#main-div .new-order-doc-file').val("")
                        $('#main-div .file-span').text("")
                    }
                })
            }

        } catch (err) {
            console.error(err);
        }

    });

    $('#main-div').on('click', '#operation_1001420', function () {
        var id = $(this).parents('.info').attr('data-id');

        Hsis.Proxy.getOrderDetails(id, function (data) {
            if (data) {

                $('#main-div .edit-order-document-submit').attr('data-id', id);
                $('#main-div .edit-order-type [value="' + data.type.id + '"]').prop('selected', 'selected');
                $('#main-div #edit-order-serial').val(data.serial);
                $('#main-div #edit-order-number').val(data.number);
                $('#main-div #edit-order-start-date').val(data.startDate);
                var html = '';
                if (data.orderFile.path != null) {

                    var v = data.orderFile;
                    html += '<div class = "student-doc-file-div">' +
                        '<div class="panel-heading">' +
                        '<h3 class="panel-title" placeholder="Sənəd məlumatları">Fayllar</h3>' +
                        '<div class="add-new add-order" data-type-id="1000029" data-doc-type="personal">' +
                        '<div add-order-file class="hidden" >' +
                        '<label for="add-order-file"><img style="margin-top: 5px;" class="add-order-img" src="assets/img/AddNew.png" alt="" width="20" height="20"></label>' +
                        '<input id="add-order-file" name = "add-order-file" class= "hidden add-order-file" type="file" >' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="user-doc-file" data-file-id = "' + id + '" data-file-path = "' + v.path + '">' +
                        '<div class="doc-order-delete">✖</div>' +
                        '<img src="' + Hsis.urls.HTP + 'order/file/' + id + '?token=' + Hsis.token + '" alt="" width="50" height="50">' +
                        '<div class="upload-img"><a href="' + Hsis.urls.HTP + 'order/file/' + id + '?token=' + Hsis.token + '" download = "' + v.originalName + '"><img src="assets/img/download.svg" width="20" height="20"></a></div>' +
                        '</div>' +
                        '</div>';
                } else {
                    html += '<div class = "student-doc-file-div">' +
                        '<div class="panel-heading">' +
                        '<h3 class="panel-title" placeholder="Sənəd məlumatları">Fayllar</h3>' +
                        '<div class="add-new add-order" data-type-id="1000029" data-doc-type="personal">' +
                        '<div>' +
                        '<label for="add-order-file"><img style="margin-top: 5px;" class="add-order-img" src="assets/img/AddNew.png" alt="" width="20" height="20"></label>' +
                        '<input id="add-order-file" name = "add-order-file" class= "hidden add-order-file" type="file" >' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                }
                $('#main-div .file-list-div').html(html);
                $('body').find('.edit-new').css('right', '0')
            }
        })

    });

    $('#main-div').on('change', '#add-order-file', function () {
        try {
            var docId = $('#main-div .edit-order-document-submit').attr('data-id');
            var formData = new FormData();
            var count = 0;
            if ($(this)[0].files) {
                for (var i = 0; i < $(this)[0].files.length; i++) {
                    if (Hsis.Validation.checkFile($(this)[0].files[i].type, fileTypes.FILE_CONTENT_TYPE)) {
                
                        formData.append("file", $(this)[0].files[i])
                        ++count;
                        
                    } else {
                        $.notify(Hsis.dictionary[Hsis.lang]['wrong_format'] + $(this)[0].files[i].name, {
                            type: 'warning'
                        });
                    }
                }
            }

            if(count > 0) {
                Hsis.Proxy.addOrderFiles(docId, formData, function () {
                    Hsis.Proxy.getOrderDetails(docId, function (data) {
                        if (data) {
                            var html = '';
                            if (data.orderFile.path.length > 0) {
                                var v = data.orderFile;
                                html += '<div class = "student-doc-file-div">' +
                                    '<div class="panel-heading">' +
                                    '<h3 class="panel-title" placeholder="Sənəd məlumatları">Fayllar</h3>' +
                                    '<div class="add-new add-order" data-type-id="1000029" data-doc-type="personal">' +
                                    '<div add-order-file class="hidden">' +
                                    '<label for="add-order-file"><img style="margin-top: 5px;" class="add-order-img" src="assets/img/AddNew.png" alt="" width="20" height="20"></label>' +
                                    '<input id="add-order-file" name = "add-order-file" class= "hidden add-order-file" type="file">' +
                                    '</div>' +
                                    '</div>' +
                                    '</div>' +
                                    '<div class="user-doc-file" data-file-id = "' + docId + '" data-file-path = "' + v.path + '">' +
                                    '<div class="doc-order-delete">✖</div>' +
                                    '<img src="' + Hsis.urls.HTP + 'order/file/' + docId + '?token=' + Hsis.token + '" alt="" width="50" height="50">' +
                                    '<div class="upload-img"><a href="' + Hsis.urls.HTP + 'order/file/' + docId + '?token=' + Hsis.token + '" download = "' + v.originalName + '"><img src="assets/img/upload-img.png" width="20" height="20"></a></div>' +
                                    '</div>' +
                                    '</div>';
                            }
                            $('#main-div .file-list-div').html(html);
                        }
                    });
                })
            }
        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div ').on('click', '.doc-order-delete', function () {
        try {
            var docFileId = $(this).parent('.user-doc-file').attr('data-file-id');
            var docFilePath = $(this).parent('.user-doc-file').attr('data-file-path');
            var $obj = $(this);
            $.confirm({
                content: Hsis.dictionary[Hsis.lang]['remove_file'],
                confirm: function () {
                    Hsis.Proxy.removeOrderFiles(docFileId, docFilePath, function (data) {
                        if (data.code == Hsis.statusCodes.OK) {
                            $obj.parent('.user-doc-file').remove();
                            $('div[add-order-file]').removeClass('hidden');
                        }
                    })

                },
                theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.edit-order-document-submit', function () {
        try {
            var id = $(this).attr('data-id');
            var orgId = $('#main-div .edit-structure-id').val();
            var seriya = $('#main-div #edit-order-serial').val();
            var number = $('#main-div #edit-order-number').val();
            var startDate = $('#main-div #edit-order-start-date').val();
            var dataCheck = $(this).attr('data-check');
            if (dataCheck == '1') {
                return false;
            }
            var type = $('#main-div .edit-order-type').find('option:selected').val();
            var document = {
                id: id,
                type: type,
                orgId: orgId,
                serial: seriya,
                number: number,
                startDate: startDate,
                endDate: ''

            }
            if (Hsis.Validation.validateRequiredFields('edit-order-required')) {
                Hsis.Proxy.editOrderDocument(document, function (data) {
                    var params = $('.main-content-upd .order-search-form').serialize();
                    if (data) {
                        $('.btn-load-more').removeAttr('data-page');
                        Hsis.Proxy.getOrderList('', params);
                    }
                });
            }

        } catch (err) {
            console.error(err);
        }
    })

    $('#main-div').on('click', '#order-list tbody tr', function () {
        try {
            var id = $(this).attr('data-id');
            var tr = $(this);
            var orderTypeId = tr.attr('data-type-id');
            var orderId = tr.attr('data-id');
            Hsis.Proxy.getOrderDetails(id, function (data) {
                if (data) {
                    $('#main-div .label-order-serial').text(data.serial);
                    $('#main-div .label-order-number').text(data.number);
                    $('#main-div .label-order-date').text(data.startDate);
                    $('#main-div .label-order-type').text(data.type.value[Hsis.lang]);
                    var html = '';
                    if (data.orderFile.path != null) {
                        var v = data.orderFile;
                        html += '<div class = "student-doc-file-div">' +
                            '<div class="">' +
                            '<h3 class="panel-title" placeholder="Sənəd məlumatları">Fayllar:</h3>' +
                            '<div>' +
                            '<div>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '<div class="user-doc-file" data-file-id = "' + id + '"  data-type="view">' +
                            '<img data-type="view-order" src="/HTP/assets/img/pdf-s.png" data-url="' + Hsis.urls.HTP + 'order/file2/' + id + '?token=' + Hsis.token + '" alt="" width="50" height="50">' +
                            // '<img data-type = "' + getUrl(type) + '" src="' + getUrl(j.id, type) + '" alt="" width="50" height="50">' +
                            '<div class="upload-img"><a href="' + Hsis.urls.HTP + 'order/file/' + id + '?fileType=1&token=' + Hsis.token + '" download = "' + v.originalName + '"><img src="assets/img/download.svg" width="20" height="20"></a></div>' +
                            '</div>' +
                            '</div>';
                    }

                    $('body').find('.info').attr('data-id', id);
                    $('body').find('.info').attr('data-tr-orderTypeId', orderTypeId);
                    $('body').find('.info').attr('data-tr-orderId', orderId);
                    $('#main-div .view-file-list-div').html(html);
                    var statusId = tr.attr('data-status-id');
                    var obj = {
                        status: {
                            id: statusId.length > 0 ? statusId : 0
                        }
                    };
                    $('.type_2_btns').html(Hsis.Service.parseOperations(Hsis.operationList, '2', obj));


                    $('body').find('.col-sm-12.data').removeClass('col-sm-12').addClass('col-sm-9');
                    $('body').find('.col-sm-3.info').fadeIn(1).css('right', '0');
                }
            })
        } catch (err) {
            console.error(err)
        }
    });

    $('#main-div').on('click', '#operation_1001424', function () {
        var obj = $(this);
        var id = obj.parents('.info').attr('data-id');

        $.confirm({
            content: Hsis.dictionary[Hsis.lang]['remove_file'],
            confirm: function () {
                Hsis.Proxy.removeOrderDocument(id, function (data) {
                    if (data.code == Hsis.statusCodes.OK) {
                        $('#main-div .label-order-serial').text("");
                        $('#main-div .label-order-number').text("");
                        $('#main-div .label-order-date').text("");
                        $('#main-div .label-order-type').text("");
                        $('#main-div .view-file-list-div').html("");
                        var f = $('.main-content-upd .order-search-form').serialize()
                        Hsis.Proxy.getOrderList('', f);

                    }
                })

            },
            theme: 'black'
        });
    });

    $('body').on('click', '.edit-work-action', function (e) {

        try {
            var parent = $(this).parents('div.work-action');
            var startDate = parent.attr('start-date');
            var endDate = parent.attr('end-date');
            var note = parent.attr('note');
            var cardNo = parent.attr('card-no');
            var startAction = parent.attr('start-action');
            var endAction = parent.attr('end-action');
            var staffType = parent.attr('staff-type');
            var org = parent.attr('org');
            var position = parent.attr('position');
            var teaching = parent.attr('teaching');
            var pwlcId = parent.attr('data-id');
            var parentOrgType = parent.attr('org-parent');
            $('#action_date').val(startDate);
            $('#end_action_date').val(endDate);
            $('#teacher_card_no').val(cardNo);
            $('#note').val(note);
            $('#work_in_actions').find('option[value="' + startAction + '"]').prop('selected', true);
            $('#work_out_actions').find('option[value="' + endAction + '"]').prop('selected', true);
            $('#orgId').find('option[value="' + org + '"]').prop('selected', true);
            $('#orgId').val(org).trigger('change');
            ;
            $('#teaching').find('option[value="' + teaching + '"]').prop('selected', true);
            $('#staff_type').find('option[value="' + staffType + '"]').prop('selected', true);
            $('#staff-position').find('option[value="' + position + '"]').prop('selected', true);
            $('.work-action table').removeClass('selected');
            $(this).parents('div.work-action').find('table').addClass('selected');
            $('.work-lifecycle-modal .work-lifecycle-modal-submit').attr('data-action', 'edit');
            $('.work-lifecycle-modal .edit-work-lifecycle-modal-submit').attr('data-action', 'edit');
            $('.work-lifecycle-modal .edit-work-lifecycle-modal-submit').attr('data-id', pwlcId);


            Hsis.Proxy.loadDictionariesByTypeId('1000002', 0, function (orgType) {
                var html = Hsis.Service.parseDictionaryForSelect(orgType);
                $('#main-div #teacherOrgTypeId').html(html);
                $('#main-div #teacherOrgTypeId').find('option[value="' + parentOrgType + '"]').prop('selected', true);

            });


            $('.work-lifecycle-modal').modal();
        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '.erase-work-action', function (e) {
        try {
            var parent = $(this).parents('div.work-action');
            var id = parent.attr('data-id');
            var docCount = $('.doc-item[doc-id="' + id + '"]').length;
            var page = $(this).attr('data-page');

            if (docCount) {
                $.alert({
                    title: Hsis.dictionary[Hsis.lang]['warning'],
                    content: Hsis.dictionary[Hsis.lang]['remove_doc_info'],
                    theme: 'material'
                });
                return false;
            }
            $.confirm({
                title: Hsis.dictionary[Hsis.lang]['warning'],
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    if (page == "add") {
                        parent.remove();
                    } else if (page == "edit") {
                        var personId = $('#main-div').attr('data-id');
                        Hsis.Proxy.removeTeacher(id, function () {
                            Hsis.Proxy.getTeacherDetails(personId, function (data) {
                                $('#work_action_block').html(Hsis.Service.parseWorkLifeCycle(data.workActions));
                            });
                        });
                    }

                },
                cancel: function () {
                    $.notify(Hsis.dictionary[Hsis.lang]['сancelled'], {
                        type: 'warning'
                    });
                },
                theme: 'material'
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '#operation_1000173', function () {
        $('#main-div .diplom-type [value="0"]').prop('selected', 'selected')
        $('#main-div .edu-level [value="0"]').prop('selected', 'selected')
        $('#main-div .graduate-date [value="0"]').prop('selected', 'selected')
        $('#main-div #add-diplom-serial').val('')
        $('#main-div #add-diplom-start-number').val('')
        $('#main-div #add-diplom-end-number').val('')
        $('#main-div .structure-id').val('')
        $('.add-new').css('right', '0');
    });


    $('body').on('click', '.show-work-action', function (e) {
        try {
            var parent = $(this).parents('div.work-action');
            var startDate = parent.attr('start-date');
            var endDate = parent.attr('end-date');
            var univerName = $(this).attr('university-name');
            var note = parent.attr('note');
            var cardNo = parent.attr('card-no');
            var startActionName = $(this).attr('start-action-name');
            var endActionName = $(this).attr('end-action-name');
            var orgName = $(this).attr('org-name');
            var positionName = $(this).attr('position-name');
            var staffName = $(this).attr('staff-name');
            var teachingName = $(this).attr('teaching-name');
            $('#pwlc_start_action').html(startActionName);
            $('#pwlc_end_action').html(endActionName);
            $('#pwlc_org').html(univerName + ' / ' + orgName);
            $('#pwlc_staff_type').html(staffName);
            $('#pwlc_teaching').html(teachingName);
            $('#pwlc_position').html(positionName);
            $('#pwlc_card_no').html(cardNo);
            $('#pwlc_note').html(note);
            $('#pwlc_start_date').html(startDate);
            $('#pwlc_end_date').html(endDate);
            $('.pwlc-action-modal').modal();
        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '.add-diplom-submit', function () {
        try {
            var valid = true;
            var orgId = $('#main-div .structure-id').val();
            var type = $('#main-div .diplom-type').find('option:selected').val();
            var eduYear = $('#main-div .graduate-date').find('option:selected').val();
            var eduLevel = $('#main-div .edu-level').find('option:selected').val();
            var serial = $('#main-div #add-diplom-serial').val();
            var startNumber = $('#main-div #add-diplom-start-number').val();
            var endNumber = $('#main-div #add-diplom-end-number').val();

            if (!serial.match("[a-zA-z0-9]{6}")) {
                $.alert({
                    title: Hsis.dictionary[Hsis.lang]['warning'],
                    content: "Sənədin seriyası  6 simvoldan ibarət olmalıdır ",
                    theme: 'material'
                });
                valid = false;
            }

            var diplom = {
                orgId: orgId,
                typeId: type,
                eduLevelId: eduLevel,
                graduateDateId: eduYear,
                serial: serial,
                startNumber: startNumber,
                endNumber: endNumber

            }
            if (Hsis.Validation.validateRequiredFields('diplom-add-required') && valid) {
                Hsis.Proxy.addDiplom(diplom, function (data) {
                    if (data) {
                        $('#main-div .diplom-type [value="0"]').prop('selected', 'selected')
                        $('#main-div .edu-level [value="0"]').prop('selected', 'selected')
                        $('#main-div .graduate-date [value="0"]').prop('selected', 'selected')
                        $('#main-div #add-diplom-serial').val('')
                        $('#main-div #add-diplom-start-number').val('')
                        $('#main-div #add-diplom-end-number').val('')
                        var params = $('.main-content-upd .diplom-search-form').serialize()
                        Hsis.Proxy.getDiplomList('', params);
                    }
                });
            }
        } catch (err) {
            console.error(err);
        }

    });

    $('#main-div').on('click', '#diplom-list tbody tr', function () {
        try {
            var serial = $(this).attr('data-serial');
            var orgId = $(this).attr('data-org');
            var graduateDateId = $(this).attr('data-year-id');
            var typeId = $(this).attr('data-type');
            var eduLevelId = $(this).attr('data-level');
            $('#main-div #graduate-student-list tbody').html('');
            $('#main-div .order-no').html('');
            $('#main-div .type_2_btns').attr({
                'data-serial': serial,
                'data-org': orgId,
                'data-year-id': graduateDateId,
                'data-type': typeId,
                'data-level': eduLevelId
            });

            var form = {
                serial: serial,
                orgId: orgId,
                graduateDateId: graduateDateId,
                typeId: typeId,
                eduLevelId: eduLevelId
            }

            $('#main-div .add-student-diplom-form [name="orgId"]').val(orgId);
            $('#main-div .add-student-diplom-form [name="graduateDateId"]').val(graduateDateId);
            $('#main-div .add-student-diplom-form [name="typeId"]').val(typeId);
            $('#main-div .add-student-diplom-form [name="eduLevelId"]').val(eduLevelId);
            $('#main-div .add-student-diplom-form [name="serial"]').val(serial);
            Hsis.Proxy.getDiplomDetails(form, function (data) {
                if (data) {
                    $('#main-div .label-diplom-serial').text(data.serial);
                    $('#main-div .label-diplom-number').text(data.minNumber + ' - ' + data.maxNumber);
                    $('#main-div .label-diplom-date').text(data.graduateDate.value[Hsis.lang]);
                    $('#main-div .label-diplom-edu-level').text(data.eduLevel.value[Hsis.lang]);
                    $('#main-div .label-diplom-type').text(data.type.value[Hsis.lang]);
                    $('#main-div .label-atm-name').text(data.org.value[Hsis.lang]);

                    $('.type_2_btns').html(Hsis.Service.parseOperations(Hsis.operationList, '2'))

                    $('body').find('.col-sm-12.data').removeClass('col-sm-12').addClass('col-sm-9');
                    $('body').find('.col-sm-3.info').fadeIn(1).css('right', '0');

                }
            })
        } catch (err) {
            console.error(err)
        }
    });

    $('#main-div').on('click', '#operation_1000177', function () {
        $('#main-div .technical-type [value="0"]').prop('selected', 'selected')
        $("#main-div #appointment-subject").val('').trigger('change');
        $('#main-div #add-technical-area').val('')
        $('#main-div #add-technical-name').val('')
        $('#main-div #add-technical-volume').val('')
        $('#main-div #technical-start-date').val('')
        $('#main-div #technical-end-date').val('')
        $('#main-div .structure-id').val('')
        $('#main-div #university-list-h6').text('')
        $('#main-div .technical-type-parent').html('');
        $('#main-div .technical-type-filter').val(0);
        $('#main-div #collapseUniversity').removeClass('in')
        $('#main-div .add-technical-submit').attr('data-type', 'add');
        $('#main-div .add-technical-submit').removeAttr('data-id');
        $('body').find('.add-new').css('right', '0');
    })

    $('#main-div').on('click', '#operation_1000178', function () {
        var id = $(this).parents('.info').attr('data-id');


        Hsis.Proxy.getTechnicalBaseDetails(id, function (data) {
            if (data && data.data) {
                $('#main-div .technical-type [value="' + data.data.type.id + '"]').prop('selected', 'selected');
                $('#main-div #add-technical-area').val(data.data.area)
                $('#main-div #add-technical-name').val(data.data.name)
                $('#main-div #add-technical-volume').val(data.data.volume)
                $('#main-div #technical-start-date').val(data.data.startDate ? data.data.startDate : '');
                $('#main-div #technical-end-date').val(data.data.endDate ? data.data.endDate : '');
                $('#main-div #university-list-h6').text(data.data.org.value[Hsis.lang]);
                $('#main-div .structure-id').val(data.data.org.id)
                $('#main-div .technical-type-parent').html('');
                $("#appointment-subject").val('').trigger('change');
                if (data.data.parent && data.data.parent.type && data.data.parent.type.id) {
                    $('#main-div .technical-type-filter').val(data.data.parent.type.id);
                    if (data.data.parent.id > 0) {
                        Hsis.Proxy.getTechnicalBaseByTypeId(data.data.parent.type.id, function (result) {

                            var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]["select"] + '</option>';
                            if (result && result.data) {
                                $.each(result.data, function (i, v) {
                                    html += '<option value="' + v.id + '">' + v.value[Hsis.lang] + '</option>';
                                });

                            }
                            $('#main-div .technical-type-parent').html(html);
                            $('#main-div .technical-type-parent').val(data.data.parent.id);

                        });
                    }
                } else {
                    $('#main-div .technical-type-filter').val(0);
                }

                var html = '';
                var subjectsId = [];
                $.each(data.data.subjects, function (i, v) {
                    subjectsId.push(v.id);

                })
                $('#main-div #appointment-subject').val(subjectsId).trigger("change");

                $('#main-div .add-technical-submit').attr('data-type', 'edit');
                $('#main-div .add-technical-submit').attr('data-id', id);
                // $('#main-div .add-technical-modal').modal('show');
                $('body').find('.add-new').css('right', '0');
            }

        })

    })

    $('#main-div').on('click', '.add-technical-submit', function () {
        var dataType = $(this).attr('data-type');
        var id = $(this).attr('data-id');
        var form = $('#main-div .add-technical-form').serialize();

        if (dataType == 'edit') {

            if (Hsis.Validation.validateRequiredFields('technical-required ')) {

                Hsis.Proxy.editTechnicalBase(id, form, function (data) {
                    if (data) {
                        $('.btn-load-more').removeAttr('data-page');
                        var params = $('.main-content-upd .technical-search-form').serialize()
                        Hsis.Proxy.getTechnicalBaseList('', params);
                    }
                })
            }
        } else if (dataType == 'add') {
            if (Hsis.Validation.validateRequiredFields('technical-required ')) {

                Hsis.Proxy.addTechnicalBase(form, function (data) {
                    if (data) {
                        $('.btn-load-more').removeAttr('data-page');
                        var params = $('.main-content-upd .technical-search-form').serialize()
                        Hsis.Proxy.getTechnicalBaseList('', params);
                        $('#main-div .technical-type [value="0"]').prop('selected', 'selected')
                        $("#main-div #appointment-subject").val('').trigger('change');
                        $('#main-div #add-technical-area').val('')
                        $('#main-div #add-technical-name').val('')
                        $('#main-div #add-technical-volume').val('')
                        $('#main-div #technical-start-date').val('')
                        $('#main-div #technical-end-date').val('')

//                        $('#main-div .structure-id').val('');
//                        $('#main-div #university-list-h6').text('')

                    }
                })
            }
        }


    })

    $('#main-div').on('click', '#operation_1000179', function () {
        try {
            var obj = $(this);
            var id = obj.parents('.info').attr('data-id');
            $.confirm({
                //title: 'Warning!',
                content: Hsis.dictionary[Hsis.lang]['remove_file'],
                confirm: function () {
                    Hsis.Proxy.removeTechnicalBase(id, function (data) {
                        if (data.code == Hsis.statusCodes.OK) {
                            $('#main-div .label-technical-appointment').text('');
                            $('#main-div .label-technical-name').text('');
                            $('#main-div .label-technical-area').text('');
                            $('#main-div .label-technical-volume').text('');
                            $('#main-div .label-technical-type').text('');
                            $('#main-div .label-atm-name').text('');

                            $('body').find('.col-sm-3.info').fadeOut(1).css('right', '-100%');
                            $('body').find('.col-sm-9.data').removeClass('col-sm-9').addClass('col-sm-12');
                            var params = $('.main-content-upd .technical-search-form').serialize();
                            Hsis.Proxy.getTechnicalBaseList('', params);
                        }
                    })

                },
                theme: 'black'
            });


        } catch (err) {
            console.error(err);
        }

    })

    $('#main-div').on('click', '#technical-list tbody tr', function () {
        try {
            var id = $(this).attr('data-id');

            Hsis.Proxy.getTechnicalBaseDetails(id, function (data) {
                if (data && data.data) {
                    $('#main-div .label-technical-appointment').text('');
                    $('#main-div .label-technical-parent-name').text('');
                    $('#main-div .label-technical-name').text(data.data.name);
                    $('#main-div .label-technical-area').text(data.data.area);
                    $('#main-div .label-technical-volume').text(data.data.volume);
                    $('#main-div .label-technical-type').text(data.data.type.value[Hsis.lang]);
                    $('#main-div .label-atm-name').text(data.data.org.value[Hsis.lang]);
                    if (data.data.parent && data.data.parent.id && data.data.parent.id > 0) {
                        $('#main-div .label-technical-parent-name').text(data.data.parent.name + ' (' + data.data.parent.type.value[Hsis.lang] + ')');
                    }
                    $('body').find('.info').attr('data-id', id)

                    var a = '';
                    var length = data.data.subjects.length
                    $.each(data.data.subjects, function (i, v) {
                        a += v.value[Hsis.lang] + ((++i) < length ? ', ' : '');
                    })
                    $('#main-div .label-technical-appointment').text(a);
                    $('.type_2_btns').html(Hsis.Service.parseOperations(Hsis.operationList, '2'))

                    $('body').find('.col-sm-12.data').removeClass('col-sm-12').addClass('col-sm-9');
                    $('body').find('.col-sm-3.info').fadeIn(1).css('right', '0');
                }
            })
        } catch (err) {
            console.error(err)
        }
    });

    $('body').on('click', '.edit-work-lifecycle-modal-submit', function () {
        try {
            var startDate = $('#action_date').val();
            var startAction = $('#work_in_actions').find('option:selected').val();
            var startActionName = $('#work_in_actions').find('option:selected').text();
            var endDate = $('#end_action_date').val();
            var out = $('#work_out_actions').find('option:selected');
            var endAction = out.val();
            var endActionName = endAction > 0 ? out.text() : '';
            var cardNo = $('#teacher_card_no').val();
            var org = $('#orgId').find('option:selected').val();
            var orgName = $('#orgId').find('option:selected').text();
            var teaching = $('#teaching').find('option:selected').val();
            var teachingName = $('#teaching').find('option:selected').text();
            var staffType = $('#staff_type').find('option:selected').val();
            var staffName = $('#staff_type').find('option:selected').text();
            var position = $('#staff-position').find("option:selected").val();
            var positionName = $('#staff-position').find("option:selected").text();
            var note = $('#note').val();
            var count = $('div.work-action').length;

            if (Hsis.Validation.validateRequiredFields('work-required') & Hsis.Validation.validateRequiredFields('default-teaching-required')) {
                var dataAction = $(this).attr('data-action');
                if (dataAction == "add") {
                    var work = {
                        actionDate: startDate,
                        cardNo: cardNo,
                        orgId: org,
                        teaching: teaching,
                        staffTypeId: staffType,
                        positionId: position,
                        note: note,
                        endActionDate: endDate,
                        actionTypeId: startAction,
                        endActionTypeId: endAction,
                        status: 1000341

                    };
                    Hsis.Proxy.addWorkLifeCycle(work, function (data) {
                        if (data) {
                            if (data.code == Hsis.statusCodes.OK) {
                                var id = $('#main-div').attr('data-id');
                                Hsis.Proxy.getTeacherDetails(id, function (result) {
                                    $('#work_action_block .work-action').html('');
                                    $('#work_action_block .work-action').html(Hsis.Service.parseWorkLifeCycle(result.workActions));
                                })
                            }
                        }
                    });

                } else if (dataAction == "edit") {
                    if (Hsis.Validation.validateRequiredFields('work-required')) {
                        var pwlcId = $(this).attr('data-id');
                        var work = {};
                        work.id = pwlcId;
                        work.actionDate = startDate;
                        work.cardNo = cardNo;
                        work.orgId = org;
                        work.teaching = teaching;
                        work.staffTypeId = staffType;
                        work.positionId = position;
                        work.note = note;
                        work.endActionTypeId = endAction;
                        work.endActionDate = endDate;

                        Hsis.Proxy.editTeacherWorkInfo(work, function (data) {
                            if (data) {
                                if (data.code == Hsis.statusCodes.OK) {
                                    var id = $('#main-div').attr('data-id');
                                    Hsis.Proxy.getTeacherDetails(id, function (result) {
                                        $('#work_action_block .work-action').html('');
                                        $('#work_action_block .work-action').html(Hsis.Service.parseWorkLifeCycle(result.workActions));
                                    })
                                }
                            }
                        })
                    }
                }

                $('.work-lifecycle-modal').modal('hide');

            }
        } catch (err) {

        }

    });

    $('body').on('click', '.add-pwlc-document', function () {
        try {
            var pwlcId = $('table.selected').parents('div.work-action').attr('data-id');
            if (pwlcId == undefined || pwlcId.length == 0) {
                $.alert({
                    title: Hsis.dictionary[Hsis.lang]['warning'],
                    content: Hsis.dictionary[Hsis.lang]['select_information'],
                    theme: 'material'
                });
                return false;
            }
            $('.add-document-submit').attr('data-id', pwlcId);
            $('.add-document-modal').modal({
                backdrop: false
            });
            $('#main-div .add-document-submit').attr('data-type', 'work');

            Hsis.Proxy.loadDictionariesByTypeId('1000041', 0, function (docTypes) {
                var html = Hsis.Service.parseDictionaryForSelect(docTypes);
                $('.add-document-modal select[name="add-document-type"]').html(html);
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '#btn_cancel', function () {
        try {
            $('#main-div').load('partials/module_' + Hsis.currModule + '.html');
        } catch (err) {
            console.error(err);
        }
    });


    // $('body').on('click', '.advanced-upd', function(e) {
    //     $('.advanced-upd').css('right', '-100%');
    //     console.log('sss')
    // });


    // $('.search-scroll').on('click', function(e){
    //     e.stopPropagation();
    // });

    $('body').on('click', '#close-search', function (e) {
        $('.advanced-upd').css('right', '-100%');

        // var eduLineId = $('#main-div .edu-line').val();
        // if (eduLineId != null && eduLineId.length > 0) {
        //     $('#main-div input[name="educationLineId"]').val(eduLineId);
        // }

        var form = $('#main-div .student-advanced-search-form').serializeArray();

        sessionStorage.setItem('studentSearch', JSON.stringify(form));


        // Hsis.tempData.form = form + '&subModuleId=' + Hsis.subModuleId;
        // var valArray = [];
        // var formMap = $.map($('.student-advanced-search-form :input'), function (el, idx) {
        //     if (el.value.length > 0 && el.value != 0 && el.name != 'searchAttr') {
        //         valArray.push(el.value);
        //     }
        //     return {
        //         type: el.type,
        //         value: el.value,
        //         name: el.name
        //     };
        // });

        // if (valArray.length > 0) {
        //     sessionStorage.setItem('studentSearch', JSON.stringify(formMap));
        // }
        // else {

        //     return false;
        // }


        return false
    });
//    $('body').on('click', '.close-student-search', function (e) {
//        $('.advanced-upd').css('right', '-100%');
//        $('.add-new').css('right', '-100%');
//        $('.dependency-student').css('right', '-100%');
//        $('.remove-diplom-div').css('right', '-100%');
//        return false
//    });

    $('body').on('click', '#clear-filters', function () {
        $('.search-scroll input').val('');
        $('.search-scroll select').val(0);
        if (sessionStorage.teacherSearch != undefined) {
            sessionStorage.removeItem('teacherSearch');
        }
        return false
    });

    $('body').on('click', '#clear-abroad-filters', function () {
        $('.search-scroll input').val('');
        $('.search-scroll select').val(0);
        $('.search-scroll .adres-modal-btn').text('');
        if (sessionStorage.abroadStudentSearch != undefined) {
            sessionStorage.removeItem('abroadStudentSearch');
            $('body').find('.registration-btn').html('');
        }
        return false
    });
    $('body').on('click', '.close-student-search', function () {
        $('.advanced-upd').css('right', '-100%');
        $('.add-new').css('right', '-100%');
        $('.dependency-student').css('right', '-100%');
        $('.remove-diplom-div').css('right', '-100%');
        return false;
    });
    $('body').find('.table-scroll').slimScroll();


    $('body').on('click', '.add-foreign-relation-submit', function () {
        var type = $(this).attr('data-type');
        var id = $(this).attr('data-id');
        var params = $('#main-div .add-foreign-relation-form').serialize();
//       var filters = $('#main-div')
        if (Hsis.Validation.validateRequiredFields('foreign-relation-required')) {
            if (type == 'add') {

                Hsis.Proxy.addForeignRelation(params, function (data) {
                    if (data) {
                        $('#main-div .foreign-relation-company').val(0)
                        $('#main-div .foreign-relation-country').val(0)
                        $('#main-div .foreign-relation-start-date').val('')
                        $('#main-div .foreign-relation-end-date').val('')
                        $('#main-div .foreign-relation-note').val('')

                        Hsis.Proxy.getForeignRelationList();
                    }
                })

            } else if (type == 'edit') {
                Hsis.Proxy.editForeignRelation(id, params, function (data) {
                    if (data) {
                        Hsis.Proxy.getForeignRelationList();
                    }
                })
            }

        }


    });


    $('#main-div').on('click', '#foreign_relation_list tbody tr', function () {
        try {
            var id = $(this).attr('data-id');
            Hsis.Proxy.getForeignRelationDetails(id, function (data) {
                if (data && data.data) {
                    $('.info').attr('data-id', id)
                    $('#main-div .label-country-name').text(data.data.country.value[Hsis.lang]);
                    $('#main-div .label-company-name').text(data.data.company.value[Hsis.lang]);
                    $('#main-div .label-start-date').text(data.data.startDate);
                    $('#main-div .label-end-date').text(data.data.endDate);
                    $('#main-div .label-note').text(data.data.note);
                    $('#main-div .foreign-relation-company').val(data.data.company.id)
                    $('#main-div .foreign-relation-country').val(data.data.country.id)
                    $('#main-div .foreign-relation-start-date').val(data.data.startDate)
                    $('#main-div .foreign-relation-end-date').val(data.data.endDate)
                    $('#main-div .foreign-relation-note').val(data.data.note)
                    $('#main-div .add-foreign-relation-submit').attr('data-id', data.data.id)

                    $('.type_2_btns').html(Hsis.Service.parseOperations(Hsis.operationList, '2'))

                    $('body').find('.col-sm-12.data').removeClass('col-sm-12').addClass('col-sm-9');
                    $('body').find('.col-sm-3.info').fadeIn(1).css('right', '0');
                }
            })
        } catch (err) {
            console.error(err)
        }
    });


    $('#main-div').on('click', '#operation_1001327', function () {
        $('body').find('.col-sm-3.info').fadeOut(1).css('right', '-100%');
        $('body').find('.col-sm-9.data').removeClass('col-sm-9').addClass('col-sm-12');
        $('#main-div .foreign-relation-company').val(0)
        $('#main-div .foreign-relation-country').val(0)
        $('#main-div .foreign-relation-start-date').val('')
        $('#main-div .foreign-relation-end-date').val('')
        $('#main-div .foreign-relation-note').val('')
        $('#main-div .add-foreign-relation-submit').attr('data-type', 'add');
        $('.add-new').css('right', '0');
    });

    $('#main-div').on('click', '#operation_1001328', function () {
        $('#main-div .add-foreign-relation-submit').attr('data-type', 'edit');
        $('.add-new').css('right', '0');
        $('body').find('.col-sm-3.info').fadeOut(1).css('right', '-100%');
        $('body').find('.col-sm-9.data').removeClass('col-sm-9').addClass('col-sm-12');
    });

    $('body').on('click', '#operation_1001329', function () {
        try {

            var id = $(this).parents('.info').attr('data-id');
            if (!id) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_info_to_delete'], {
                    type: 'warning'
                });
                return false;
            }


            $.confirm({
                title: Hsis.dictionary[Hsis.lang]['warning'],
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    Hsis.Proxy.removeForeignRelation(id, function (data) {
                        if (data) {

                            $('#main-div #foreign_relation_list tbody tr[data-id="' + id + '"]').remove()
                            $('body').find('.col-sm-3.info').fadeOut(1).css('right', '-100%');
                            $('body').find('.col-sm-9.data').removeClass('col-sm-9').addClass('col-sm-12');
                        }
                    });
                },
                theme: 'black'
            });
        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '#operation_1001331', function () {
        var orgId = $(this).parents('.type_2_btns').attr('data-org');
        var eduLevel = $(this).parents('.type_2_btns').attr('data-level');
        var serial = $(this).parents('.type_2_btns').attr('data-serial');
        var graduateDateId = $(this).parents('.type_2_btns').attr('data-year-id');
        var typeId = $(this).parents('.type_2_btns').attr('data-type');

        $('body').find('.dependency-student .search-scroll').load('partials/student_diplom.html', function () {
            $('#main-div').find('#graduate-student-list').attr('data-org', orgId);
            $('#main-div').find('#graduate-student-list').attr('data-level', eduLevel);
            $('#main-div').find('#graduate-student-list').attr('data-serial', serial);
            $('#main-div').find('#graduate-student-list').attr('data-year-id', graduateDateId);
            $('#main-div').find('#graduate-student-list').attr('data-type', typeId);
            $('body').find('.dependency-student').css('right', '0');
            Hsis.Proxy.getLastOrderByActionId(orgId, 1009465, function (data) {
                if (data && data.length > 0) {
                    var html = ''

                    $.each(data, function (i, v) {
                        html += '<option value="' + v.id + '">' + v.serial + ' ' + v.number + '</option>'  // burada cari ilin mezun olma emrleri gelmelidir
                    })

                    $('#main-div #grad_order').html(html);
                    $('#main-div #grad_order_with').html(html);

                    var orderId = $('#main-div #grad_order').val();
                    var obj = {orderId: orderId, eduLevel: eduLevel};
                    Hsis.Proxy.getStudentListByOrderId(obj, function (data) {
                        Hsis.Service.parseStudentsWithoutDiplom(data);
                    });
                    var form = {
                        serial: serial,
                        orgId: orgId,
                        graduateDateId: graduateDateId,
                        typeId: typeId,
                        eduLevelId: eduLevel,
                        orderId: orderId
                    };
                    Hsis.Proxy.getStudentsDiplomListByDiplomParams(form, function (data) {
                        Hsis.Service.parseStudentsWithDiplom(data);
                    });
                }

            });
        });


    });


    $('#main-div').on('click', '.all-check-student', function () {

        var checked = $(this).prop('checked');

        $('#main-div #graduate-student-list tbody tr').each(function () {
            if (!$(this).find('input:checkbox').attr('disabled'))
                $(this).find('input:checkbox').prop('checked', checked);
        })


    });

    $('#main-div').on('click', '.dependency-student-submit', function () {
        var count = 0;
        var pelcId = [];
        $('#main-div #graduate-student-list tbody tr').each(function () {

            if ($(this).find('td input').is(':checked') && $(this).find('td input').attr('name')) {
                pelcId.push($(this).find('td input').val());
                ++count;
            }
        })

        if (count == 0) {
            $.notify('Tələbə seçilməyib', {
                type: 'danger'
            });
            return false;
        }

        if (count > 0) {
            var form = {
                serial: $('#main-div #graduate-student-list').attr("data-serial"),
                orgId: $('#main-div #graduate-student-list').attr("data-org"),
                graduateDateId: $('#main-div #graduate-student-list').attr("data-year-id"),
                typeId: $('#main-div #graduate-student-list').attr("data-type"),
                eduLevelId: $('#main-div #graduate-student-list').attr("data-level"),
            };
            Hsis.Proxy.addStudentDiplom(form, pelcId, function (data) {
                if (data) {
                    var orderId = $('#main-div #grad_order').val();
                    form.orderId = orderId;
                    var obj = {orderId: orderId, eduLevel: form.eduLevelId};
                    Hsis.Proxy.getStudentListByOrderId(obj, function (data) {
                        Hsis.Service.parseStudentsWithoutDiplom(data);
                    });

                    Hsis.Proxy.getStudentsDiplomListByDiplomParams(form, function (data) {
                        Hsis.Service.parseStudentsWithDiplom(data);
                    });
                }
            })
        }

    });

    $('#main-div').on('click', '.remove-student-diplom i', function () {
        var obj = $(this);
        var id = obj.parents('tr').attr('data-id');
        var diplom = obj.parents('tr').attr('data-diplom-id');
        var student = obj.parents('tr').attr('data-pelc-id');

        var form = {
            id: diplom,
            studentDiplomId: id,
            studentId: student
        }

        $.confirm({
            title: Hsis.dictionary[Hsis.lang]['warning'],
            content: Hsis.dictionary[Hsis.lang]['delete_info'],
            confirm: function () {
                Hsis.Proxy.removeStudentDiplom(form, function () {
                    var obj = {
                        serial: $('#main-div #graduate-student-list').attr("data-serial"),
                        orgId: $('#main-div #graduate-student-list').attr("data-org"),
                        graduateDateId: $('#main-div #graduate-student-list').attr("data-year-id"),
                        typeId: $('#main-div #graduate-student-list').attr("data-type"),
                        eduLevelId: $('#main-div #graduate-student-list').attr("data-level"),
                        orderId: $('#main-div #grad_order_with').val(),
                    };
                    Hsis.Proxy.getStudentsDiplomListByDiplomParams(obj, function (students) {
                        Hsis.Service.parseStudentsWithDiplom(students);
                    });
                    var without = {
                        orderId: $('#main-div #grad_order').val(),
                        eduLevel: $('#main-div #graduate-student-list').attr("data-level")
                    };
                    Hsis.Proxy.getStudentListByOrderId(without, function (students) {
                        Hsis.Service.parseStudentsWithoutDiplom(students);
                        $('.btn-load-more').removeAttr('data-page');

                    });

                });
            },
            theme: 'black'
        });


    });


    $('#main-div').on('click', '#operation_1000175', function () {

        var form = $('.add-student-diplom-form').serialize();

        Hsis.Proxy.getAllDiplomList(form, function (data) {
            if (data) {
                var html = '';

                $.each(data, function (i, v) {
                    html += '<tr data-id = "' + v.id + '">' +
                        '<td>' + (++i) + '</td>' +
                        '<td>' + v.serial + '</td>' +
                        '<td>' + v.startNumber + '</td>' +
                        '<td class="info-diplom-td">' + (v.take == 0 ? '' : 'İstifadə edilib') + '</td>' +
                        '<td>' + (v.take == 0 ? '<i class="fa fa-remove remove-diplom"></i>' : '') + '</td>' +
                        '</tr>'
                })

                $('#main-div #remove-diplom-list tbody').html(html);

                $('.remove-diplom-div').css('right', '0');
            }
        });


    });


    $('#main-div').on('click', '.remove-diplom', function () {
        try {
            var obj = $(this);
            var id = obj.parents('tr').attr('data-id');
            $.confirm({
                content: Hsis.dictionary[Hsis.lang]['remove_file'],
                confirm: function () {
                    Hsis.Proxy.removeDiplom(id, function (data) {
                        if (data.code == Hsis.statusCodes.OK) {
                            obj.parents('tr').remove();
                        }
                    })

                },
                theme: 'black'
            });


        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '.adreses-modal-submit', function () {

        var name = $(this).attr('data-adres-type');
        var cityText = $('body').find('#advanced-search-city option:selected').html();
        var districtText = ', ' + $('body').find('#advanced-search-district option:selected').html();
        var streetText = ', ' + $('body').find('#advanced-search-street option:selected').html();
        var cityId = $('body').find('#advanced-search-city option:selected').val();
        var districtId = $('body').find('#advanced-search-district').val();
        var streetId = $('body').find('#advanced-search-street').val();


        var id = (!streetId || streetId == 0) ? ((!districtId || districtId == 0) ? cityId : districtId) : streetId;

        $('body').find('input[name="' + name + '"]').val(id);
        $('body').find('input[name="globalT' + name + '"]').val(cityText + districtText + streetText);

        if (name == 'atmCountryId') {

            var id = (!streetId || streetId == 0) ? ((!districtId || districtId == 0) ? cityId : districtId) : streetId;


            if (cityId === null || cityId === '0') {
                cityText = '';
            }

            if (districtId === null || districtId === '0') {
                districtText = '';
            }

            if (streetId && (streetId === null || streetId === '0')) {
                streetText = '';
            }


            $('body').find('input[name="tempAtmCountyName"]').val(cityText + districtText + streetText);


            $('body').find('input[name="' + name + '"]').val(id);

            // getStructureListByAdress
            if (id > 0) {
                Hsis.Proxy.getStructureListByAdress(id, function (data) {
                    if (data && data.data) {
                        var html = '';

                        html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]["select"] + '</option>'
                        $.each(data.data, function (i, v) {
                            html += '<option value = "' + v.id + '">' + v.value[Hsis.lang] + '</option>'
                        })
                        $('#atm_id').html(html);
                        $('#advanced_faculty, #org_name_select_advanced').html('')

                    }
                })
            }

        }


        if (cityId === null || cityId === '0') {
            cityText = '';
        }

        if (districtId === null || districtId === '0') {
            districtText = '';
        }

        if (streetId && (streetId === null || streetId === '0')) {
            streetText = '';
        }


        $('body').find('.adres-modal-btn[data-modal-type="' + name + '"]').html(cityText + districtText + streetText);
        $('body').find('.adres-modal-btn[data-modal-type="' + name + '"]').attr({
            'data-city': cityId,
            'data-distrcit': districtId,
            'data-street': streetId
        });
        $('#adres-change-modal').modal('hide');
        $('#adres-change-modal select').html('');


    });

    $("body").on('change', '.input-file-con input', function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $("#image").attr("src", e.target.result);
                $("#crop-modal").modal("show");
            }
            reader.readAsDataURL(this.files[0]);
        }
    });

    $("body").on("shown.bs.modal", '#crop-modal', function () {
        var $image = $("#image");
        var cropBoxData;
        var canvasData;
        $image.cropper({
            viewMode: 1,
            aspectRatio: 1 / 1,
            minCropBoxWidth: 200,
            minCropBoxHeight: 200,
            ready: function () {
                $image.cropper("setCanvasData", canvasData);
                $image.cropper("setCropBoxData", cropBoxData);
            }
        });
    }).on('hidden.bs.modal', '#crop-modal', function () {
        var $image = $("#image");
        $image.cropper("destroy");
    })

    $('body').on('click', 'button.crop', function () {
        var $image = $("#image");
        var cropBoxData;
        var canvasData;
        cropBoxData = $image.cropper("getCropBoxData");
        canvasData = $image.cropper("getCanvasData");
        getCanvasT = $image.cropper("getCroppedCanvas", {
            width: 150,
            height: 150
        });

        var canvas = getCanvasT;
        var img = canvas.toDataURL("image/jpeg");


        $('body .input-file-con .new-img-con').fadeIn(1).html('<img src="' + img + '" />');


        $image.cropper('getCroppedCanvas').toBlob(function (blob) {
            cropForm.append('image', blob);
            console.log(blob);
        });
        $image.cropper("destroy");
    });

    var $inputImage = $('#inputImage'),
        URL = window.URL || window.webkitURL,
        blobURL;

    if (URL) {
        $inputImage.change(function () {
            var files = this.files,
                file;

            if (!$image.data('cropper')) {
                return;
            }

            if (files && files.length) {
                file = files[0];

                if (/^image\/\w+$/.test(file.type)) {
                    blobURL = URL.createObjectURL(file);
                    $image.one('built.cropper', function () {
                        URL.revokeObjectURL(blobURL); // Revoke when load complete
                    }).cropper('reset').cropper('replace', blobURL);
                    $inputImage.val('');
                } else {
                    alert('Please choose an image file.');
                }
            }
        });
    } else {
        $inputImage.parent().remove();
    }

    $('#main-div').on('click', '.get-iamas-photo', function () {
        // var pincode = $('body #pincode').text();
        var pincode = $('body #pincode').val();
        cropForm = new FormData();

        Hsis.Proxy.getPersonInfoByPinCode(pincode, function (iamasdata) {
            $('body .input-file-con .new-img-con').fadeIn(1);
            if (iamasdata && iamasdata.image && iamasdata.image.file !== null) {
                $('body .input-file-con .new-img-con img').attr('src', "data:image/png;base64," + iamasdata.image.file);
                $('body .input-file-con .new-img-con img').on('error', function (e) {
                    $(this).attr('src', 'assets/img/guest.png');
                });
            } else {
                $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
            }

        });
    });


//        -------------------- Xaricde tehsil alanlar--------------------


    $('#main-div').on('click', '#operation_1000027', function () {
        try {

            // $('#main-div .search-pincode-modal').modal({
            //     backdrop: false
            // });
            $('body').find('.new-upd').css('right', '0');
            $('#main-div .pincode-button-next').removeClass('hidden');
            $('#main-div .pincode-button-next').attr('data-step', '1');
            $('#main-div .pincode-button-next').attr('data-operation-type', 'new');
            $('#main-div .pincode-button-next').removeAttr('data-person-id');
            $('#main-div .pincode-button-next').removeAttr('data-person-status');
            $('#main-div .pincode-button-next').removeAttr('data-useless');
            $('#main-div .pincode-button-next').removeAttr('data-type');
            $('#main-div .pincode-div-first').removeClass('hidden');
            $('#main-div .pincode').text('');
            $('#main-div .pincode-div-second').addClass('hidden');
            $('#main-div .iamas-search').addClass('hidden');
            $('#main-div .pincode-button-back').addClass('hidden');
            $('#main-div .search-pincode').val('');

        } catch (err) {
            console.error(err);
        }
    });


    $('#main-div').on('click', '.abroad-pincode-button-back', function () {
        var step = $('#main-div .abroad-pincode-button-next').attr('data-step');
        if (step === '2') {
            $('#main-div .abroad-pincode-div-first').removeClass('hidden')
            $('#main-div .abroad-pincode-div-second').addClass('hidden')
            $('#main-div .iamas-search').addClass('hidden');
            $('#main-div .pincode-label').text('');
            $('#main-div .pincode-label').removeAttr('data-type');
            $('#main-div .abroad-pincode-button-back').addClass('hidden');
            $('#main-div .abroad-pincode-button-next').attr('data-step', '1');
            $('#main-div .abroad-pincode-button-next').removeClass('hidden');
            $('#main-div .abroad-pincode-button-next').removeAttr('data-person-id');
            $('#main-div .abroad-pincode-button-next').removeAttr('data-person-status');
            $('#main-div .abroad-pincode-button-next').removeAttr('data-type');
            $('#main-div .abroad-pincode-button-next').removeAttr('data-useless');
            $('#main-div .pincode').text('');
            $('#main-div .search-pincode').val('');
        }
    });

    $('#main-div').on('click', '.abroad-pincode-button-next', function () {
        try {
            cropForm = new FormData();
            var $obj = $(this);
            var step = $obj.attr('data-step');
            var accept = false;
            var pincode = $('body').find('.search-pincode').val();
            var dataPersonId;
            var dataPersonStatus;
            $('#main-div').attr('pin', pincode);
            if (step === '1') {
                if (!pincode) {
                    $.notify(Hsis.dictionary[Hsis.lang]['add_pincode'], {
                        type: 'warning'
                    });
                    return false;
                }

                Hsis.Proxy.getStudentByPinCode(pincode, function (data) {
                    if (data) {
                        if (data.code === Hsis.statusCodes.OK) {
                            $obj.attr('data-step', '2');
                            var type = $obj.attr('data-operation-type');

                            if (data.data) {
                                if (data.data.id != 0) {
                                    if (data.data.actionStatus == 1) {
                                        $('#main-div .abroad-pincode-div-first').addClass('hidden');
                                        $('#main-div .pincode').text(pincode);
                                        $('#main-div .abroad-pincode-div-second').removeClass('hidden');
                                        $obj.addClass('hidden');
                                        $('#main-div .abroad-pincode-button-back').removeClass('hidden')
                                        $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['cant_create_student_with_pincode_student_exist']);
                                        $obj.attr('data-useless', 'useless');
                                    } else if (data.data.actionStatus == 2 || data.data.actionStatus == 1000302 || data.data.actionStatus == 0) {
                                        accept = true;
                                    } else if (data.data.actionStatus == 1000303 || data.data.actionStatus == 1000270) {
                                        if (type !== 'transfer' && type !== 'intransfer') {
                                            $('#main-div .abroad-pincode-div-first').addClass('hidden');
                                            $('#main-div .pincode').text(pincode);
                                            $('#main-div .abroad-pincode-div-second').removeClass('hidden');
                                            $obj.addClass('hidden');
                                            $('#main-div .abroad-pincode-button-back').removeClass('hidden')
                                            $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['cant_create_student_with_pincode']);
                                            $obj.attr('data-useless', 'useless');
                                        } else {

                                            accept = true;
                                        }

                                    } else if (data.data.actionStatus == 1000290 || data.data.actionStatus == 1000300) {
                                        if (type !== 'furlough') {
                                            $('#main-div .abroad-pincode-div-first').addClass('hidden');
                                            $('#main-div .pincode').text(pincode);
                                            $('#main-div .abroad-pincode-div-second').removeClass('hidden');
                                            $obj.addClass('hidden');
                                            $('#main-div .abroad-pincode-button-back').removeClass('hidden');
                                            $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['cant_create_student_with_pincode']);
                                            $obj.attr('data-useless', 'useless');
                                        } else {
                                            $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['found_student_with_pincode']);
                                            accept = true;
                                        }
                                    } else if (data.data.actionStatus == 1000274) {
                                        if (type !== 'restore' && type !== 'new') {
                                            $('#main-div .abroad-pincode-div-first').addClass('hidden');
                                            $('#main-div .pincode').text(pincode);
                                            $('#main-div .abroad-pincode-div-second').removeClass('hidden');
                                            $obj.addClass('hidden');
                                            $('#main-div .abroad-pincode-button-back').removeClass('hidden')
                                            $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['cant_create_student_with_pincode']);
                                            $obj.attr('data-useless', 'useless');
                                        } else {
                                            $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['found_student_with_pincode']);
                                            accept = true;
                                        }

                                    }

                                    dataPersonId = data.data.id;
                                    dataPersonStatus = data.data.actionStatus;
                                    $obj.attr('data-person-id', data.data.id);
                                    $obj.attr('data-person-status', data.data.actionStatus);
                                } else {
                                    $('#main-div .abroad-pincode-div-first').addClass('hidden');
                                    $('#main-div .iamas-search').removeClass('hidden');
                                    $('#main-div .pincode').text(pincode);
                                    $('#main-div .abroad-pincode-div-second').removeClass('hidden');
                                    $('#main-div .abroad-pincode-button-back').removeClass('hidden');
                                    $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['not_found_student_with_pincode']);
                                    $obj.attr('data-type', 'new');
                                }
                            }

                        }
                    }
                    if (accept) {
                        $('body').find('.add-new .search-scroll').load('partials/abroad_student_accept_add.html', function () {
                            $('body').removeClass('modal-open');
                            $('body').find('.new-upd').css('right', '-100%');
                            $('#main-div .add-new-registr-date').attr('data-type', 'add');
                            $('#main-div .add-new-achievement').attr('data-type', 'add');
                            setTimeout(function () {
                                $('body').find('.add-new').css('right', '0');
                            }, 400);
                            Hsis.Proxy.getStudentDetailsByPinCode(pincode, function (details) {
                                if (details.data) {//

                                    $('body .input-file-con .new-img-con').fadeIn(1);

                                    if (details.data.image && details.data.image.path) {
//                                        $('body .input-file-con .new-img-con').fadeIn(1);
                                        $('body .input-file-con .new-img-con img').attr('src', Hsis.urls.HSIS + 'students/image/' + (details.data.image.path ? details.data.image.path : '') + '?token=' + Hsis.token + '&size=200x200&' + Math.random());
                                        $('body .input-file-con .new-img-con img').on('error', function (e) {
                                            $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                                        });
                                        // $('.get-iamas-photo').trigger('click');
                                    } else {
                                        Hsis.Proxy.getPersonInfoByPinCode(pincode, function (result2) {
                                        if (result2 && result2.image) {
//                                            $('body .input-file-con .new-img-con').fadeIn(1);

                                            $('body .input-file-con .new-img-con img').attr('src', "data:image/png;base64," + result2.image.file);
                                            $('body .input-file-con .new-img-con img').on('error', function (e) {
                                                $(this).attr('src', 'assets/img/guest.png');
                                            });
                                        } else {
                                            $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                                        }

                                    });
                                    }
                                    $('#main-div #confirmStudent').attr('data-type', $obj.attr('data-operation-type'));
                                    $('#main-div #action_type').attr('data-person-id', dataPersonId);
                                    $('.action-students .panel-body').html(Hsis.Service.parseStudentActions(details.data.pelcAction));
                                    $('#firstname').text(details.data.firstName);
                                    $('#citizenship').text("Azərbaycan");
                                    $('#lastname').text(details.data.lastName);
                                    $('#middlename').text(details.data.middleName);
                                    $('#pincode').text(details.data.pinCode);
                                    $('#gender').text(details.data.gender.value[Hsis.lang]);
                                    $('#marital_status').text(details.data.maritalStatus.value[Hsis.lang] ? details.data.maritalStatus.value[Hsis.lang] : 'Yoxdur');
                                    $('#military_status').text(details.data.militaryService.value[Hsis.lang] ? details.data.militaryService.value[Hsis.lang] : 'Yoxdur');
                                    $('#birthdate').text(details.data.birthDate);
                                    $('#main-div').attr('data-id', details.data.id);

                                    Hsis.Service.parseOldStudentAddress(details.data);

                                    $('.contact-info .panel-body').html(Hsis.Service.parseViewStudentContact(details.data));
                                    var personal = 'personal';
                                    var academic = 'academic';
                                    var school = 'school';
                                    $('.add-doc-block .panel-body[data-doc-type="personal"]').html(Hsis.Service.parseViewStudentDocument(details.data.documents, personal));
//                                    $('.old_activity_name #acad_doc_add').html(Hsis.Service.parseViewStudentDocument(details.data.pelcDocuments, academic));
//                                    $('.activity_name #school_doc_add').html(Hsis.Service.parseViewStudentDocument(details.data.schoolDocuments, school));
                                    //
                                    $('.student-relationships-div .panel-body').html(Hsis.Service.parseViewStudentRelationShip(details.data.relations));
//                                    if (details.data.achievements) {
//                                        Hsis.Service.parseAbroadStudentAchievement(details.data.achievements)
//                                    }


                                }


                            });
                        });
                    }

                });

            } else if (step == 2) {
                var type = $obj.attr('data-person-status');
                var dataUseless = $obj.attr('data-useless');
                if (dataUseless !== 'useless') {
                    if ($obj.attr('data-type') === 'new') {
                        if ($obj.attr('data-operation-type') === 'new') {
                            if ($("#main-div .check-iamas-input").is(':checked')) {
                                Hsis.Proxy.getPersonInfoByPinCode(pincode, function (data) {
                                    if (data && data.firstName && data.lastName && data.middleName && data.birthDate) {
                                        $('#main-div .search-pincode-modal').modal("hide");
                                        $('body').find('.new-upd').css('right', '-100%');
                                        setTimeout(function () {
                                            $('body').find('.add-new').css('right', '0');
                                        }, 400);
                                        $('body').find('.add-new .search-scroll').load('partials/study_in_abroad_student_add.html', function () {

                                            $('#main-div #confirmAbroadStudent').attr('data-iamas', 1);
                                            $('#main-div .add-new-registr-date').attr('data-type', 'add');
                                            $('#main-div .add-new-achievement').attr('data-type', 'add');
                                            $('#main-div').attr('data-check-work', 'true');
                                            $('body').find('.new-upd').css('right', '-100%');
                                            setTimeout(function () {
                                                $('body').find('.add-new').css('right', '0');
                                            }, 400);
//                                            Hsis.Proxy.loadDictionariesByTypeId('1000004', 0, function (citizenship) {
//                                                var html = Hsis.Service.parseDictionaryForSelect(citizenship);
//                                                $('#main-div #citizenship').html(html);

                                            Hsis.Proxy.loadDictionariesByTypeId('1000003', 0, function (gender) {
                                                var html = Hsis.Service.parseDictionaryForSelect(gender);
                                                $('#main-div #gender').html(html);

                                                Hsis.Proxy.loadDictionariesByTypeId('1000007', 0, function (maritalStatus) {
                                                    var html = Hsis.Service.parseDictionaryForSelect(maritalStatus);
                                                    $('#main-div #marital_status').html(html);

                                                    $('body').removeClass('modal-open');
                                                    $('#pincode').val(pincode).attr('disabled', 'disabled');
                                                    $('#main-div #firstname').val(data.firstName).attr('disabled', 'disabled');
                                                    $('#main-div #lastname').val(data.lastName).attr('disabled', 'disabled');
                                                    $('#main-div #middlename').val(data.middleName.split(' ')[0]).attr('disabled', 'disabled');
                                                    $('#main-div #birthdate').val(data.birthDate).attr('disabled', 'disabled');
//                                                  $('#main-div #citizenship').attr('disabled', 'disabled').find('option[value="' + (data.citizenship.value[Hsis.lang] === "AZE" ? 1000118 : 0) + '"]').attr('selected', 'selected');
                                                    $('#main-div #gender').attr('disabled', 'disabled').find('option[value="' + (data.gender.value[Hsis.lang] === "Kişi" ? 1000036 : (data.gender.value[Hsis.lang] === "Qadın" ? 1000035 : 0)) + '"]').attr('selected', 'selected');
                                                    $('#main-div #military_status').attr('disabled', 'disabled').find('option[value="' + (data.gender.value[Hsis.lang] === "Kişi" ? 1000191 : (data.gender.value[Hsis.lang] === "Qadın" ? 1000378 : 0)) + '"]').attr('selected', 'selected');
                                                    $('#main-div #marital_status').attr('disabled', 'disabled').find('option[value="' + (data.socialStatus.value[Hsis.lang] === "Evli" ? 1000379 : (data.socialStatus.value[Hsis.lang] === "Subay" ? 1000189 : 0)) + '"]').attr('selected', 'selected');

                                                    $('#permanent_address').text(data.iamasAddress.cityName + " " + data.iamasAddress.address);
                                                    $('#permanent_address').attr('data-street', data.iamasAddress.address);
                                                    $('#permanent_address').attr('data-city', data.iamasAddress.cityName);

                                                    $('#birth_place').text(data.iamasPlaceAddress.cityName + " " + data.iamasPlaceAddress.address);
                                                    $('#birth_place').attr('data-street', data.iamasPlaceAddress.address);
                                                    $('#birth_place').attr('data-city', data.iamasPlaceAddress.cityName);

                                                    if (data.image.file !== null) {
                                                        $('body .input-file-con .new-img-con').fadeIn(1);

                                                        $('body .input-file-con .new-img-con img').attr('src', "data:image/png;base64," + data.image.file);
                                                        $('body .input-file-con .new-img-con img').on('error', function (e) {
                                                            $(this).attr('src', 'assets/img/guest.png');
                                                        });
                                                    } else {
                                                        $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                                                    }
                                                });
                                            });
//                                            });
                                        });

                                    } else {
                                        $('#main-div .pincode-label').text(Hsis.dictionary[Hsis.lang]['cant_create_student_with_pincode']);
                                    }
                                });
                            } else {
                                $('#main-div .search-pincode-modal').modal("hide");
                                $('body').find('.new-upd').css('right', '-100%');
                                setTimeout(function () {
                                    $('body').find('.add-new').css('right', '0');
                                }, 400);
                                $('body').find('.add-new .search-scroll').load('partials/study_in_abroad_student_add.html', function () {
                                    $('#main-div #confirmAbroadStudent').attr('data-iamas', 0);
                                    $('body').removeClass('modal-open');
                                    $('#pincode').val(pincode).attr('disabled', 'disabled');
                                    $('#main-div .add-new-registr-date').attr('data-type', 'add');
                                    $('#main-div .add-new-achievement').attr('data-type', 'add');
                                });
                            }
                        } else {
                            $('body').find('.add-new .search-scroll').load('partials/study_in_abroad_student_add.html', function () {
                                $('#pincode').val(pincode).attr('disabled', 'disabled');
                                $('body').removeClass('modal-open');
                                $('#main-div #confirmStudent').attr('data-type', $obj.attr('data-operation-type'))
                                $('#main-div .add-new-registr-date').attr('data-type', 'add');
                                $('#main-div .add-new-achievement').attr('data-type', 'add');
                            });
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('keypress', 'input.search-pincode', function (e) {
        if (e.keyCode === 13) {
            $('.abroad-pincode-button-next').click();

//                return false;
        }
    });

    $('body').on('keydown', function(e) {
        if(e.keyCode === 13) {
            $('button[data-step="2"]').click();
        }
    });









    $('body').on('click', '.add-new-registr-date', function () {
        var type = $(this).attr('data-type');
        $('#main-div .add-registration-date-submit').attr('data-type', type);
        $('#main-div #registration_date').val('');
        $('#main-div #registration_date_note').val('');
        $('#main-div .add-registration-date-modal').modal("show");
    });

    $('body').on('click', '.add-new-achievement', function () {
        var type = $(this).attr('data-type');
        $('#main-div .add-archievement-submit').attr('data-type', type);
        $('#main-div #archievement_note').val('');
        $('#main-div #archievement_type').val(0);
        $('#main-div .add-archievement-modal').modal("show");
    })

    $('body').on('click', '.add-registration-date-submit', function () {
        var type = $(this).attr('data-type');
        var date = $('#main-div #registration_date').val();
        var note = $('#main-div #registration_date_note').val();
        var liveCost = $('#main-div #live_cost').val().trim();
        var roadCost = $('#main-div #road_cost').val().trim();
        var personId = $('#main-div').attr('data-id');
        var form = {
            date: date,
            note: note,
            liveCost: liveCost,
            roadCost: roadCost
        }
        if (Hsis.Validation.validateRequiredFields("registration-date-required")) {
            if (type === 'add') {
                var html = '<div class="col-md-12 for-align registration-date-item">' +
                    '<table class="table-block col-md-12">' +
                    '<thead>' +
                    '<tr><th style="width: 25%">Tarix</th>' +
                    '<th style="width: 25%">Yaşayış xərci</th>' +
                    '<th style="width: 25%">Yol xərci</th>' +
                    '<th style="width: 25%">Qeyd</th>' +
                    '</tr></thead>' +
                    '<tbody>' +
                    '<tr data-date="' + date + '" data-date-note="' + note + '" data-live = "' + liveCost + '" data-road = "' + roadCost + '">' +
                    '<td style="width: 25%">' + date + '</td>' +
                    '<td style="width: 25%">' + liveCost + ' </td>' +
                    '<td style="width: 25%">' + roadCost + ' </td>' +
                    '<td style="width: 25%">' + note + ' </td>' +
                    '</tr>' +
                    '</tbody>' +
                    '</table>' +
                    '<div class="operations-button">' +
                    '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span' +
                    ' class="glyphicon glyphicon-list"></span></div>' +
                    '<ul class="dropdown-menu">' +
                    '<li><a href="#" class="erase delete-registration-date" data-type="remove">' + Hsis.dictionary[Hsis.lang]['erase'] + '</a></li>' +
                    '</ul>' +
                    '</div>' +
                    '</div>';

                $('#main-div .registration-date-panel .blank-panel').hide();
                $('#main-div .registration-date-panel').prepend(html);
                $('#main-div #registration_date').val('');
                $('#main-div #registration_date_note').val('');
                $('#main-div .add-registration-date-modal').modal("hide");
            } else if (type === 'edit') {
                Hsis.Proxy.addAbroadStudentRegistrationDate(form, personId, function (data) {
                    if (data && data.data) {
                        var html = '<div class="col-md-12 for-align registration-date-item">' +
                            '<table class="table-block col-md-12">' +
                            '<thead>' +
                            '<tr><th style="width: 25%">Tarix</th>' +
                            '<th style="width: 25%">Yaşayış xərci</th>' +
                            '<th style="width: 25%">Yol xərci</th>' +
                            '<th style="width: 25%">Qeyd</th>' +
                            '</tr></thead>' +
                            '<tbody>' +
                            '<tr data-id = "' + data.data + '">' +
                            '<td style="width: 25%">' + date + '</td>' +
                            '<td style="width: 25%">' + liveCost + ' </td>' +
                            '<td style="width: 25%">' + roadCost + ' </td>' +
                            '<td style="width: 25%">' + note + ' </td>' +
                            '</tr>' +
                            '</tbody>' +
                            '</table>' +
                            '<div class="operations-button">' +
                            '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span' +
                            ' class="glyphicon glyphicon-list"></span></div>' +
                            '<ul class="dropdown-menu">' +
                            '<li><a href="#" class="remove-registration-date" data-id = "' + data.data + '">' + Hsis.dictionary[Hsis.lang]['erase'] + '</a></li>' +
                            '</ul>' +
                            '</div>' +
                            '</div>';

                        $('#main-div .registration-date-panel .blank-panel').hide();
                        $('#main-div .registration-date-panel').prepend(html);
                        $('#main-div #registration_date').val('');
                        $('#main-div #registration_date_note').val('');
                        
                        $('#main-div .add-registration-date-modal').modal("hide");
                    }
                })
            }
            
            

        }

    })

    $('body').on('click', '.add-archievement-submit', function () {
        var type = $(this).attr('data-type');
        var archievementType = $('#main-div #archievement_type').val();
        var archievementTypeName = $('#main-div #archievement_type option[value="' + archievementType + '"]').text();
        var personId = $('#main-div').attr('data-id');
        var note = $('#main-div #archievement_note').val();
        var form = {
            typeId: archievementType,
            note: note
        }
        if (Hsis.Validation.validateRequiredFields("archievement-required")) {
            if (type === 'add') {
                var html = '<div class="col-md-12 for-align archievement-item">' +
                    '<table class="table-block col-md-12">' +
                    '<thead>' +
                    '<tr><th style="width: 50%">Tipi</th>' +
                    '<th style="width: 50%">Qeyd</th>' +
                    '</tr></thead>' +
                    '<tbody>' +
                    '<tr data-type="' + archievementType + '" data-note="' + note + '">' +
                    '<td style="width: 50%">' + archievementTypeName + '</td>' +
                    '<td style="width: 50%">' + note + ' </td>' +
                    '</tr>' +
                    '</tbody>' +
                    '</table>' +
                    '<div class="operations-button">' +
                    '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span' +
                    ' class="glyphicon glyphicon-list"></span></div>' +
                    '<ul class="dropdown-menu">' +
                    '<li><a href="#" class="erase delete-archievement" data-type="remove">' + Hsis.dictionary[Hsis.lang]['erase'] + '</a></li>' +
                    '</ul>' +
                    '</div>' +
                    '</div>';

                $('#main-div .archievement-panel .blank-panel').hide();
                $('#main-div .archievement-panel').prepend(html);
                $('#main-div #archievement_note').val('');
                $('#main-div #archievement_type').val(0);
                $('#main-div .add-archievement-modal').modal("hide");
            } else if (type === 'edit') {


                Hsis.Proxy.addAbroadStudentAchievement(form, personId, function (data) {
                    if (data && data.data) {
                        var html = '<div class="col-md-12 for-align archievement-item">' +
                            '<table class="table-block col-md-12">' +
                            '<thead>' +
                            '<tr><th style="width: 50%">Tipi</th>' +
                            '<th style="width: 50%">Qeyd</th>' +
                            '</tr></thead>' +
                            '<tbody>' +
                            '<tr data-id = "' + data.data + '">' +
                            '<td style="width: 50%" >' + archievementTypeName + '</tdst>' +
                            '<td style="width: 50%" >' + note + ' </tdst>' +
                            '</tr>' +
                            '</tbody>' +
                            '</table>' +
                            '<div class="operations-button">' +
                            '<div class="operations dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span' +
                            ' class="glyphicon glyphicon-list"></span></div>' +
                            '<ul class="dropdown-menu">' +
                            '<li><a href="#" class="remove-archievement" data-id = "' + data.data + '">' + Hsis.dictionary[Hsis.lang]['erase'] + '</a></li>' +
                            '</ul>' +
                            '</div>' +
                            '</div>';

                        $('#main-div .archievement-panel .blank-panel').hide();
                        $('#main-div .archievement-panel').prepend(html);
                        $('#main-div #archievement_note').val('');
                        $('#main-div #archievement_type').val(0);
                        $('#main-div .add-archievement-modal').modal("hide");
                    }
                })

            }

        }

    })

    $('body').on('click', '#confirmAbroadStudent', function (e) {

        try {
            var allValid = true;
            var iamasCheck = $(this).attr('data-iamas');


            if (Hsis.Validation.validateRequiredFields('data-required')) {
                var student = {
                    iamasCheck: iamasCheck,
                    pinCode: $('#main-div #pincode').val().trim(),
                    firstName: $('#main-div #firstname').val().trim(),
                    lastName: $('#main-div #lastname').val().trim(),
                    middleName: $('#main-div #middlename').val().trim(),
                    birthDate: $('#main-div #birthdate').val().trim(),
                    genderId: $('#main-div #gender').find('option:selected').val(),
                    citizenshipId: $('#main-div #citizenship').find('option:selected').val(),
                    maritalStatusId: $('#main-div #marital_status').find('option:selected').val(),
                    militaryServiceId: $('#main-div #military_status').find('option:selected').val(),
                    addresses: [],
                    contacts: [],
                    documents: [],
                    relations: [],
                    eduLifeCycle: [],
                    achievement: [],
                    registrationDate: [],
                    token: Hsis.token
                };

                if ($('#main-div #speciality').val() == 0 && $('#main-div #specialityName').val().trim().length == 0) {
                    $.notify('Ixtisas secilmeyib', {
                        type: 'danger'
                    });
                    return false;
                }
                var index = 1;
                $('#main-div .add-doc-block .doc-item').each(function (e) {
                    student.documents.push({
                        id: index,
                        type: $(this).find('.add-doc-type').attr('data-id'),
                        serial: $(this).find('.add-doc-serial').text(),
                        number: $(this).find('.add-doc-number').text(),
                        startDate: $(this).find('.add-doc-start-date').text(),
                        endDate: $(this).find('.add-doc-end-date').text(),
                        documentType: $(this).parents('.panel-body').attr('data-doc-type')
                    });


                    if ($(this).find('.new-add-doc-file')[0].files) {
                        var wrongFiles = '';
                        var length = $(this).find('.new-add-doc-file')[0].files.length;
                        if (length <= 5) {
                            for (var i = 0; i < length; i++) {
                                var files = $(this).find('.new-add-doc-file')[0].files;
                                if (Hsis.Validation.checkFile(files[i].type, fileTypes.FILE_CONTENT_TYPE)) {
                                    if (files[i].size > 5 * 1024 * 1024) {

                                        $.notify(files[i].name + Hsis.dictionary[Hsis.lang]['exceed_volume'], {
                                            type: 'warning'
                                        });
                                    } else {
                                        cropForm.append('doc_' + index, $(this).find('.new-add-doc-file')[0].files[i]);
                                    }
                                } else {
                                    wrongFiles += wrongFiles != '' ? ', ' + files[i].name : files[i].name;

                                }
                            }
                            if (wrongFiles != '') {
                                $.notify(Hsis.dictionary[Hsis.lang]['wrong_format'] + wrongFiles, {
                                    type: 'warning'
                                });
                                allValid = false;

                            }
                        } else {
                            $.notify(Hsis.dictionary[Hsis.lang]['file_limit'], {
                                type: 'warning'
                            });
                            allValid = false;
                        }

                    }

                    index++;
                });

                $('#main-div #append_contact table').each(function () {
                    var contact = {};
                    contact.typeId = $(this).find('tbody tr').attr('data-type-id');
                    contact.contact = $(this).find('tbody tr').attr('data-contact');
                    student.contacts.push(contact);
                });
                var permanentAddressCount = 0;
                var birthPlaceCount = 0;
                $('#main-div button[data-address]').each(function () {
                    
                    if (this.hasAttribute('data-node-id')) {
                        var address = {};
                        if ($(this).attr('data-node-id') > 0) {
                            address.typeId = $(this).attr('data-type-id');
                            address.treeId = $(this).attr('data-node-id');
                            address.address = this.hasAttribute('data-street') ? $(this).attr('data-street') : '';
                        } else {
                            address.typeId = 0;
                            address.treeId = 0;
                            address.address = $(this).html() ? $(this).html() : "-";
                        }
                        if($(this).attr('data-type-id') === '1000178' ) {
                            ++permanentAddressCount;
                        }
                        if($(this).attr('data-type-id') === '1000199' ) {
                            ++birthPlaceCount;
                        }
                        student.addresses.push(address);
                    }
                });
                
                if(permanentAddressCount == 0) {
                    $('#main-div button[data-address]').each(function () {
                        if($(this).attr('data-type-id') === '1000178'  && $(this).attr('data-street')  && $(this).attr('data-street').trim().length > 0 ) {
                            var address = {};
                            address.typeId = $(this).attr('data-type-id');
                            address.treeId = 0;
                            address.address = $(this).attr('data-street');
                            address.iamasAddress = $(this).attr('data-city');
                            student.addresses.push(address);
                        }   
                    });             
                }
                if(birthPlaceCount == 0) {
                    $('#main-div button[data-address]').each(function () {
                        if( $(this).attr('data-type-id') === '1000199' && $(this).attr('data-street') && $(this).attr('data-street').trim().length > 0 ) {
                            var address = {};
                            address.typeId = $(this).attr('data-type-id');
                            address.treeId = 0;
                            address.address = $(this).attr('data-street').split(/ +/)[0];
                            address.iamasAddress = $(this).attr('data-city').split(/ +/)[0];
                            student.addresses.push(address);
                        }   
                    });             
                }
                

                if ($('#main-div .registration-date-panel .registration-date-item').length > 0) {
                    $('#main-div .registration-date-panel .registration-date-item').each(function () {

                        var registration = {};
                        registration.date = $(this).find('table tbody tr').attr('data-date').trim();
                        registration.note = $(this).find('table tbody tr').attr('data-date-note').trim();
                        registration.liveCost = $(this).find('table tbody tr').attr('data-live');
                        registration.roadCost = $(this).find('table tbody tr').attr('data-road');
                        student.registrationDate.push(registration);

                    });
                }

                if ($('#main-div .archievement-panel .archievement-item').length > 0) {
                    $('#main-div .archievement-panel .archievement-item').each(function () {

                        var achievement = {};
                        achievement.typeId = $(this).find('table tbody tr').attr('data-type').trim();
                        achievement.note = $(this).find('table tbody tr').attr('data-note').trim();
                        student.achievement.push(achievement);

                    });
                }

                e.preventDefault();

                var edu = {
                    actionTypeId: 1000260,
                    actionDate: $('#action_date').val().trim(),
                    specId: $('#main-div #speciality').val() > 0 ? $('#main-div #speciality').val() : 0,
                    specName: $('#main-div #specialityName').val().trim().length > 0 ? $('#main-div #specialityName').val().trim() : "",
                    note: $('#note').val(),
                    eduLineId: $('#edu_line').find('option:selected').val(),
                    eduLangId: $('#edu_lang').find('option:selected').val(),
                    eduLevelId: $('#abroad_edu_level').find('option:selected').val(),
                    eduBlock: 'academic',
                    status: $('#main-div #status').val(),
                    graduateDate: $('#main-div #graduate_date').val(),
                    eduPeriod: $('#main-div #edu-period').val(),
                    countryId: $('#main-div #foreign_country').val(),
                    cityId: $('#main-div #foreign_city').val(),
                    atmId: $('#main-div #foreign_university').val(),
                    specDirectionId: $('#main-div #spec_direction').val()
                };

                student.eduLifeCycle.push(edu);

                $('#main-div .relationship-item').each(function () {
                    var tr = $(this).find('tbody tr');
                    var relationTypeId = tr.attr('data-type-id');
                    var fullname = tr.attr('data-value');
                    var contactNumber = tr.attr('data-contact-no');
                    if (relationTypeId > 0 && fullname.trim().length > 0 && contactNumber.trim().length > 0) {
                        var relative = {
                            typeId: relationTypeId,
                            fullName: fullname,
                            contactNumber: contactNumber
                        };
                        student.relations.push(relative);
                    }
                });
                cropForm.append('student', new Blob([JSON.stringify(student)], {
                    type: "application/json"

                }));
                if (allValid) {
                    Hsis.Proxy.addAbroadStudent(cropForm, function (personId) {
                        if (personId > 0) {
                            cropForm = new FormData();
                            $('#main-div').attr('data-id', personId);
                            Hsis.personId = personId;
                            $("#main-div div.past_edu_info").removeClass("hidden");
                            $('#main-div #confirmAbroadStudent').remove();
                            //                            var queryparams = $('#main-div .main-content-upd .student-search-form').serialize();
                            //                            Hsis.Proxy.loadStudents('', queryparams + '&subModuleId=' + Hsis.subModuleId);
//                            $.alert({
//                                title: Hsis.dictionary[Hsis.lang]['warning'],
//                                content: Hsis.dictionary[Hsis.lang]['add_past_edu'],
//                                theme: 'material'
//                            });
                        }

                    });
                }
            }

        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '#operation_1001346', function () {
        try {
            /*
                        if (!$('#buttons_div').attr('data-id')) {
                            $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                                type: 'warning'
                            });
                            return false;
                        }*/

//            var id = $('.main-content-upd #buttons_div').attr('data-id');
            var id = $('body').attr('data-pelc-id');
            $('.add-new .search-scroll').load('partials/abroad_student_edit.html', function () {
                Hsis.Proxy.getAbroadStudentDetailsByPelcId(id, function (data) {
                    if (data) {
                        var html = '';
                        $('body .input-file-con .new-img-con').fadeIn(1);
                        if (data.image.file) {
                            $('body .input-file-con .new-img-con img').attr('src', Hsis.urls.HSIS + 'students/image/' + (data.image.path ? data.image.path : '') + '?token=' + Hsis.token + '&size=200x200&' + Math.random());
                            //an old version was comment
                            //          |
                            //          |

                            $('body .input-file-con .new-img-con img').on('error', function (e) {
                                $('.edit-common-info-image').attr('src', 'assets/img/guest.png');
                            });
                        } else {
                            Hsis.Proxy.getPersonInfoByPinCode(data.pinCode, function (result2) {
                                if (result2 && result2.image) {

                                    $('body .input-file-con .new-img-con').fadeIn(1);

                                    $('body .input-file-con .new-img-con img').attr('src', "data:image/png;base64," + result2.image.file);
                                    $('body .input-file-con .new-img-con img').on('error', function (e) {
                                        $(this).attr('src', 'assets/img/guest.png');
                                    });
                                } else {
                                    $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                                }

                            });

                        }

                        $('#firstname').text(data.firstName);
                        $('#lastname').text(data.lastName);
                        $('#middlename').text(data.middleName);
                        $('#pincode').val(data.pinCode);
                        // $('.get-iamas-photo').trigger('click');

                        $('#gender').text(data.gender.value[Hsis.lang]);
                        $('#marital_status').text(data.maritalStatus.value[Hsis.lang] ? data.maritalStatus.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                        $('#military_status').text(data.militaryService.value[Hsis.lang] ? data.militaryService.value[Hsis.lang] : Hsis.dictionary[Hsis.lang]['no_information']);
                        $('.date-birthdate').text(data.birthDate);
                        $('#main-div').attr('data-id', data.id);
                        $('#main-div').attr('data-pelc-id', data.pelcId);


                        Hsis.Service.parseEditStudentAddress(data);
                        if (data.contacts.length > 0) {
                            $('.contact-info .panel-body').html(Hsis.Service.parseViewStudentContact(data));
                        }
                        var personal = 'personal';
                        var academic = 'academic';
                        var school = 'school';
                        if (data.documents.length > 0) {
                            $('.add-doc-block #personal_doc').html(Hsis.Service.parseViewStudentDocument(data.documents, personal));
                        }
                        $('.activity_name #acad_doc_add').html(Hsis.Service.parseEditStudentDocument(data.pelcDocuments, academic));
                        $('#past_edu_doc').html(Hsis.Service.parseEditStudentDocument(data.schoolDocuments, school));
                        $('.action-students #student_action_block').html(Hsis.Service.parseStudentActions(data.pelcAction));
                        $('#student_action_block .student-action').addClass('past_edu');
                        $('.action-students .student-action[data-action-date="' + data.actionDate + '"]').remove();
                        var orderType;
                        var orderAttr;
                        $('.student-relationships-div .panel-body').html(Hsis.Service.parseViewStudentRelationShip(data.relations));


                        Hsis.Proxy.loadDictionariesByTypeId('1000016', 1000398, function (eduLevel) {
                            var html = Hsis.Service.parseDictionaryForSelect(eduLevel);
                            $('#main-div #abroad_edu_level').html(html);
                            $('#main-div #abroad_edu_level').val(data.eduLevel.id);
                        });
                        Hsis.Proxy.loadDictionariesByTypeId('1000094', 0, function (eduLine) {
                            var html = Hsis.Service.parseDictionaryForSelect(eduLine);
                            $('#main-div #edu_line').html(html);
                            $('#main-div #edu_line').val(data.eduLineId.id);
                        });

                        Hsis.Proxy.loadDictionariesByTypeId('1000027', 0, function (eduLang) {
                            var html = Hsis.Service.parseDictionaryForSelect(eduLang);
                            $('#main-div #edu_lang').html(html);
                            $('#main-div #edu_lang').val(data.eduLangId.id);
                        });

                        Hsis.Proxy.loadDictionariesByTypeId('1000093', 0, function (archivement) {
                            var html = Hsis.Service.parseDictionaryForSelect(archivement);
                            $('#main-div #status').html(html);
                            $('#main-div #status').val(data.abroadStatus.id);
                        });
                        Hsis.Proxy.loadDictionariesByTypeId('1000092', 0, function (archivement) {
                            var html = Hsis.Service.parseDictionaryForSelect(archivement);
                            $('#main-div #speciality').html(html);

                            $('#main-div #speciality').val(data.spec.id);
                        });

                        Hsis.Proxy.loadDictionariesByTypeId('1000091', 0, function (archivement) {
                            var html = Hsis.Service.parseDictionaryForSelect(archivement);
                            $('#main-div #spec_direction').html(html);
                            $('#main-div #spec_direction').val(data.specDicrection.id);
                        });

                        $('#main-div #action_date').val(data.actionDate);
                        $('#main-div #private_work_number').val(data.abroadNumber);
                        $('#main-div #graduate_date').val(data.graduateDate);
                        $('#main-div #edu-period').val(data.eduPeriod);


                        $('#main-div #note').val(data.note);

                        Hsis.Proxy.loadAbroadAddress('1000323', '', function (country) {
                            var html = Hsis.Service.parseDictionaryForSelect(country);
                            $('#main-div #foreign_country').html(html);
                            $('#main-div #foreign_country').val(data.countryId);
                            Hsis.Proxy.loadAbroadAddress('1000324', data.countryId, function (city) {
                                var html = Hsis.Service.parseDictionaryForSelect(city);
                                $('#main-div #foreign_city').html(html);
                                $('#main-div #foreign_city').val(data.cityId);
                                if (data.cityId > 0) {
                                    Hsis.Proxy.getAbroadOrgByAbroadAddr(data.cityId, function (uni) {
                                        if (uni) {
                                            var html = '';

                                            html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]["select"] + '</option>'
                                            $.each(uni, function (i, v) {
                                                html += '<option value = "' + v.id + '">' + v.value[Hsis.lang] + '</option>'
                                            });
                                            $('#foreign_university').html(html);
                                            $('#foreign_university').val(data.curOrgId.id)
                                        }
                                    })
                                } else {
                                    Hsis.Proxy.getAbroadOrgByAbroadAddr(data.countryId, function (uni) {
                                        if (uni) {
                                            var html = '';

                                            html = '<option value = "0">' + Hsis.dictionary[Hsis.lang]["select"] + '</option>'
                                            $.each(uni, function (i, v) {
                                                html += '<option value = "' + v.id + '">' + v.value[Hsis.lang] + '</option>'
                                            });
                                            $('#foreign_university').html(html);
                                            $('#foreign_university').val(data.curOrgId.id)

                                        }
                                    })

                                }

                            });

                        });


//                        $('#main-div').attr('data-status', data.status.id);

                        if (data.achievements) {
                            Hsis.Service.parseAbroadStudentAchievement(data.achievements)
                        }
                        if (data.registrationDates) {
                            Hsis.Service.parseAbroadStudentRegistrationDate(data.registrationDates);
                        }

                    }


                });
            });
            $('.add-new').css('right', '0');
        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('change', '#foreign_university', function () {
        var x = $('#foreign_university').val();
        if (x > 0) {
            $('#foreign_university').removeClass('blank-required-field');
        }
    });

    $('body').on('click', '.remove-registration-date', function () {
        try {
            var obj = $(this);
            var id = obj.attr('data-id');
            var personId = $('#main-div').attr('data-id')
            $.confirm({
                content: Hsis.dictionary[Hsis.lang]['remove_file'],
                confirm: function () {
                    Hsis.Proxy.removeAbroadStudentRegistrationDate(personId, id, function (data) {
                        if (data && data.code == Hsis.statusCodes.OK) {
                            obj.parents('.registration-date-item').remove();
                            if (obj.parents('.registration-date-panel').find('.registration-date-item').length == 0) {
                                obj.parents('.registration-date-panel').find('.blank-panel').show();
                            }
                        }
                    })

                },
                theme: 'black'
            });


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.remove-archievement', function () {
        try {
            var obj = $(this);
            var id = obj.attr('data-id');
            var personId = $('#main-div').attr('data-id')
            $.confirm({
                content: Hsis.dictionary[Hsis.lang]['remove_file'],
                confirm: function () {
                    Hsis.Proxy.removeAbroadStudentAchievement(personId, id, function (data) {

                        if (data && data.code == Hsis.statusCodes.OK) {
                            obj.parents('.archievement-item').remove();
                            if (obj.parents('.archievement-panel').find('.archievement-item').length == 0) {
                                obj.parents('.archievement-panel').find('.blank-panel').show();
                            }
                        }
                    })

                },
                theme: 'black'
            });


        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.edit-abroad-academic-info', function () {
        try {
            if (Hsis.Validation.validateRequiredFields('academic-required')) {
                var personId = $('#main-div').attr('data-id');
                var pelcId = $('#main-div').attr('data-pelc-id');
                var edu = {
                    actionTypeId: 1000260,
                    actionDate: $('#action_date').val().trim(),
                    specId: $('#main-div #speciality').val(),
                    note: $('#note').val(),
                    eduLineId: $('#edu_line').find('option:selected').val(),
                    eduLangId: $('#edu_lang').find('option:selected').val(),
                    eduLevelId: $('#abroad_edu_level').find('option:selected').val(),
                    eduBlock: 'academic',
                    status: $('#main-div #status').val(),
                    graduateDate: $('#main-div #graduate_date').val(),
                    eduPeriod: $('#main-div #edu-period').val(),
                    countryId: $('#main-div #foreign_country').val(),
                    cityId: $('#main-div #foreign_city').val(),
                    orgId: $('#main-div #foreign_university').val(),
                    specDirectionId: $('#main-div #spec_direction').val()
                };


                console.log(edu);
                Hsis.Proxy.editAbroadPelc(personId, pelcId, edu);
            }

        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '#operation_1001363', function () {
        try {

            if (!$('#buttons_div').attr('data-id')) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'warning'
                });
                return false;
            }

            var id = $('.main-content-upd #buttons_div').attr('data-id');
            $('.add-new .search-scroll').load('partials/abroad_student_edit_personal_info.html', function () {
                Hsis.Proxy.getAbroadStudentDetails(id, function (data) {

                    $('body .input-file-con .new-img-con').fadeIn(1);
                    if (data.image.file) {
                        $('body .input-file-con .new-img-con img').attr('src', Hsis.urls.HSIS + 'students/image/' + (data.image.path ? data.image.path : '') + '?token=' + Hsis.token + '&size=200x200&' + Math.random());

                        $('body .input-file-con .new-img-con img').on('error', function (e) {
                            $('.edit-common-info-image').attr('src', 'assets/img/guest.png');
                        });
                    } else {
                        Hsis.Proxy.getPersonInfoByPinCode(data.pinCode, function (result2) {
                            if (result2 && result2.image) {

                                $('body .input-file-con .new-img-con').fadeIn(1);

                                $('body .input-file-con .new-img-con img').attr('src', "data:image/png;base64," + result2.image.file);
                                $('body .input-file-con .new-img-con img').on('error', function (e) {
                                    $(this).attr('src', 'assets/img/guest.png');
                                });
                            } else {
                                $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                            }

                        });

                    }

                    if (data.iamasCheck == 0) {
                        var html = '';
//                        if (data.image && data.image.path) {
////                          $('.edit-common-info-image').attr('src', Hsis.urls.HSIS + 'students/image/'+(data.image.path ? data.image.path : '')+'?token=' + Hsis.token + '&size=200x200&' + Math.random());
//
//                            $('body .input-file-con .new-img-con').attr('data-id', data.image.id);
//                            $('body .input-file-con .new-img-con img').on('error', function (e) {
//                                $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
//                            });
//                        }

                        $('#firstname').val(data.firstName);
                        $('#lastname').val(data.lastName);
                        $('#middlename').val(data.middleName);
                        $('#pincode').val(data.pinCode).attr('disabled', 'disabled');
                        $('#gender').find('option[value="' + data.gender.id + '"]').attr('selected', 'selected');
                        $('#marital_status').find('option[value="' + data.maritalStatus.id + '"]').attr('selected', 'selected');
                        $('#military_status').find('option[value="' + data.militaryService.id + '"]').attr('selected', 'selected');
                        $('.date-birthdate').val(data.birthDate);


                    } else if (data.iamasCheck == 1) {

                        $('#firstname').val(data.firstName).attr('disabled', 'disabled');
                        $('#lastname').val(data.lastName).attr('disabled', 'disabled');
                        $('#middlename').val(data.middleName).attr('disabled', 'disabled');
                        $('#pincode').val(data.pinCode).attr('disabled', 'disabled').attr('disabled', 'disabled');
                        $('#gender').find('option[value="' + data.gender.id + '"]').attr('selected', 'selected').attr('disabled', 'disabled');
                        $('#marital_status').find('option[value="' + data.maritalStatus.id + '"]').attr('selected', 'selected').attr('disabled', 'disabled');
                        $('#military_status').find('option[value="' + data.militaryService.id + '"]').attr('selected', 'selected').attr('disabled', 'disabled');
                        $('.date-birthdate').val(data.birthDate).attr('disabled', 'disabled');
//                        $('#main-div').attr('data-id', data.id).attr('disabled', 'disabled');
//                        $('#main-div').attr('data-pelc-id', data.pelcId).attr('disabled', 'disabled');
                        $('.edit-abroad-common-info').css('display', 'none');
                        $('body #birth_place_edit').attr('data-iamas', '1');
                        $('body #permanent_address_edit').attr('data-iamas', '1');
//                        $('.get-iamas-photo').trigger('click');

                    }
                    $('#main-div').attr('data-id', data.id);
                    $('#main-div').attr('data-pelc-id', data.pelcId);
                    Hsis.Service.parseEditStudentAddress(data);


                    if (data.contacts.length > 0) {
                        setTimeout(function () {
                            $('.contact-info .panel-body').html(Hsis.Service.parseEditStudentContact(data));
                        }, 800);
                    }

                    var personal = 'personal';
                    var academic = 'academic';
                    var school = 'school';

                    if (data.documents.length > 0) {
                        $('.add-doc-block .panel-body').html(Hsis.Service.parseEditStudentDocument(data.documents, personal));
                    }
                    $('.student-relationships-div .panel-body').html(Hsis.Service.parseStudentRelationShip(data.relations));

                });
            });
            $('.add-new').css('right', '0');
        } catch (err) {
            console.error(err);
        }
    });

    //print


    $('body').on('click', '#operation_1001434', function () {
        var id = $('#buttons_div').attr('data-id');
        Hsis.Proxy.getAbroadStudentDetails(id, function (data) {
            Hsis.Service.parseQuestionnaireView(data);
            Hsis.Proxy.getPersonInfoByPinCode(data.pinCode, function (iamasdata) {
                if (iamasdata && iamasdata.image.file !== null) {
                    $('body [data-name = "image"]').attr('src', "data:image/png;base64," + iamasdata.image.file);
                    $('body [data-name = "image"]').on('error', function (e) {
                        $(this).attr('src', 'assets/img/guest.png');
                    });
                } else {
                    $('body [data-name = "image"]').attr('src', 'assets/img/guest.png');
                }
                openWin($('.survey').html());
            });

        });
    });

    $('body').on('click', '#operation_1001474', function () {
//        var id = $('#buttons_div').attr('data-id');
        var id = $('body').attr('data-pelc-id');
        Hsis.Proxy.getArchiveAbroadStudentDetailsByPelcId(id, function (data) {
            Hsis.Service.parseQuestionnaireView(data);
            Hsis.Proxy.getPersonInfoByPinCode(data.pinCode, function (iamasdata) {
                if (iamasdata && iamasdata.image.file !== null) {
                    $('body [data-name = "image"]').attr('src', "data:image/png;base64," + iamasdata.image.file);
                    $('body [data-name = "image"]').on('error', function (e) {
                        $(this).attr('src', 'assets/img/guest.png');
                    });
                } else {
                    $('body [data-name = "image"]').attr('src', 'assets/img/guest.png');
                }
                openWin($('.survey').html());
            });

        });
    });

    function openWin(html) {
        var myWindow = window.open();
        $(myWindow.document.body).html(html);
        // myWindow.document.write(html);
        // myWindow.document.close();
        // myWindow.focus();
        // myWindow.print();
        // myWindow.close();
    }


    // $('body').on('click', '.close-survey', function(){
    //     $('.survey').removeClass('open');
    // });


    $('body').on('click', '.edit-abroad-common-info', function () {
        try {
            if (Hsis.Validation.validateRequiredFields('common-required')) {
                var modulType = $('#main-div').attr('data-type');
                var id = $('#main-div').attr('data-id');
                var imageId = $('body .input-file-con .new-img-con').attr('data-id');

                var info = {};
                if (imageId) {
                    info.imageId = imageId
                }
                info.firstName = $('#firstname').val();
                info.lastName = $('#lastname').val();
                info.middleName = $('#middlename').val();
                info.pinCode = $('#pincode').val();
                info.genderId = $('#gender').find('option:selected').val();
                info.socialStatusId = 0;
                info.orphanDegreeId = 0;
                info.nationalityId = 0;
                info.citizenshipId = $('#citizenship').find('option:selected').val();
                info.maritalStatusId = $('#marital_status').find('option:selected').val();
                info.militaryServiceId = $('#military_status').find('option:selected').val();
                info.birthDate = $('.date-birthdate').val();
                info.token = Hsis.token;

                cropForm.append('form', new Blob([JSON.stringify(info)], {
                    type: "application/json"
                }));

                var src = $('.thumbnail img').attr('src');
                Hsis.Proxy.loadAbroadStudents();
                Hsis.Proxy.editCommonInfoAbroadStudent(cropForm, function (data) {
                    if (data) {
                        Hsis.Proxy.getAbroadStudentDetails(id, function (result) {
                            if (result.image && result.image.path) {
                                $('body #student_list tbody tr[data-id="' + id + '"]').attr('data-image', result.image.path);
                                $('.main-content-upd #studentphoto').attr('src', Hsis.urls.HSIS + 'students/image/' + result.image.path + '?token=' + Hsis.token + '&size=50x50&' + Math.random());
                                $('.main-content-upd #studentphoto').on('error', function (e) {
                                    $(this).attr('src', 'assets/img/guest.png');
                                })

                            }
                        })
                    }
                });
            }

        } catch (err) {
            console.error(err);
        }

    });

    $('body').on('click', '.btn-abroad-student-advanced-search', function (e) {
        try {

            $('.advanced-upd .search-scroll').load('partials/abroad_student_advance_search.html', function () {
                $('#main-div .search-student').val("1");
                $('.advanced-upd').css('right', '0')

            });


        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '#operation_1001365', function () {
        try {

            if (!$('#buttons_div').attr('data-id')) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'warning'
                });
                return false;
            }

            var id = $('.main-content-upd #buttons_div').attr('data-id');
            $('.add-new .search-scroll').load('partials/student_academic_transcript.html', function () {
                Hsis.Proxy.getStudentDetails(id, function (data) {
                    var html = '';

                    if (data.image && data.image.path) {
                        $('body .input-file-con .new-img-con').fadeIn(1);
                        $('body .input-file-con .new-img-con img').attr('src', Hsis.urls.HSIS + 'students/image/' + (data.image.path ? data.image.path : '') + '?token=' + Hsis.token + '&size=200x200&' + Math.random());
//                        $('.edit-common-info-image').attr('src', Hsis.urls.HSIS + 'students/image/'+(data.image.path ? data.image.path : '')+'?token=' + Hsis.token + '&size=200x200&' + Math.random());
                        $('body .input-file-con .new-img-con').attr('data-id', data.image.id);
                        $('body .input-file-con .new-img-con img').on('error', function (e) {
                            $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                        });

                    } else {
                        $('body .input-file-con .new-img-con img').attr('src', 'assets/img/guest.png');
                    }

                    $('#firstname').val(data.firstName);
                    $('#lastname').val(data.lastName);
                    $('#middlename').val(data.middleName);
                    $('#pincode').val(data.pinCode).attr('disabled', 'disabled');
                    $('#citizenship').find('option[value="' + data.citizenship.id + '"]').attr('selected', 'selected');
                    $('#main-div').attr('data-id', data.id);
                    $('#main-div').attr('data-pelc-id', data.pelcId);
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
                                    '<td><select class="form-control subject_type"></select></td>' +
                                    '<td><input name="graduatePoint" class="form-control graduate_point" ></td>' +
                                    '<td><i class="fa fa-check edit-mark"></i></td>' +
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

                });
            });
            $('.add-new').css('right', '0');
        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('click', '.edit-mark', function () {
        var subjectId = $(this).parents('tr').attr('data-subject-id');
        var id = $(this).parents('tr').attr('data-id');
        var pelcId = $(this).parents('tr').attr('data-pelc-id');
        var graduateTypeId = $(this).parents('tr').find('select').val();
        var graduateMark = $(this).parents('tr').find('input').val();

        if (graduateTypeId <= 0 && graduateMark > 0) {
            $.notify("Zəhmət olmasa səbəbi seçin", {
                type: 'danger'
            });
            return false;
        } else if (graduateTypeId > 0 && graduateMark <= 0) {
            $.notify("Zəhmət olmasa qiyməti daxil edin", {
                type: 'danger'
            });
            return false;
        }

        var form = {
            id: id,
            subjectId: subjectId,
            graduateMark: graduateMark ? graduateMark : 0,
            graduateTypeId: graduateTypeId
        }

        Hsis.Proxy.editStudentEduPlanMark(pelcId, form, function (data) {
            if (data) {

            }
        })

    });

    $('body').on('change', '#teacherOrgTypeId', function () {
        var val = $(this).val();
        var subVal = '';
        switch (val) {
            case "1000083":
                subVal = val;
                break;
            case "1012004":
                subVal = val;
                break;
            case "1000073":
                subVal = val;
                break;
            case "1000074":
                subVal = val;
                break;
            case "1000418":
                subVal = val;
                break;
            case "1000072":
                subVal = val;
                break;
            default:
                subVal = "0";
        }


        if (subVal !== "0") {
            Hsis.Proxy.getFilteredStructureList(Hsis.structureId, subVal, 0, function (specialities) {
                if (specialities) {
                    var html = '<option value="0">' + Hsis.dictionary[Hsis.lang]['select'] + '</option>';
                    $.each(specialities, function (i, v) {
                        html += '<option value="' + v.id + '">' + v.name[Hsis.lang] + '</option>';
                    })
                }
                $('#orgId').html(html);
            });

        }

    });

    $('body').on('hidden.bs.modal', '.add-edulifecycle-modal', function () {
        Hsis.Proxy.loadAdressTypes('1000051', function (country) {
            var html = Hsis.Service.parseDictionaryForSelect(country);
            $('#main-div #student-search-city').html(html);
        });
    });

    $('body').on('click', 'button.filter', function () {
        $('.student-filter-group').stop().slideToggle();
        $('body').find('.data').toggleClass('filtered')
    });


//    $('body').on('keypress', '#userSearch', function (e) {
////        e.stopPropagation();
//        try {
//            if (e.keyCode == 13) {
//                var keyword = $('#userSearch').val();
//                var orgId = $('body').find('#student_list_without').attr('org-id');
//                var parentId = $('body').find('#student_list_without').attr('type-parent-id');
//                var orderTypeId = $('body').find('#student_list_without').attr('type-id');
//                var orderId = $('body').find('#student_list_without').attr('order-id');
//                var specId = $('body').find('#org_spec_level_filter-2').val();
//                var id = $('body').find('#org_spec_level_filter').val();
//                var groupId = $('body #aca_group').val();
//                var form = {
//                    orderTypeId: orderTypeId,
//                    orderTypeParentId: parentId,
//                    orgId: orgId,
//                    orderId: orderId,
//                    specId: specId,
//                    specTypeId: id,
//                    keyword: keyword,
//                    groupId: groupId
//                };
//
//                if (keyword.trim().length > 2) {
//                    $('.btn-load-more').removeAttr('data-page');
//                    $('#without_order_filter input[name="keyword"]').val(keyword);
//                    Hsis.Proxy.getStudentsWithoutOrder(form, function (students) {
//                        return false;
//                        Hsis.Service.parseStudentsWithoutOrder(students);
//                    });
//
//                } else if (keyword.trim().length == 0) {
//                    $('.btn-load-more').removeAttr('data-page');
//                    $('#search_without_order').val('');
//                    form.keyword = '';
//                    Hsis.Proxy.getStudentsWithoutOrder(form, function (students) {
//                        Hsis.Service.parseStudentsWithoutOrder(students);
//                    });
//                }
//            }
//
//        } catch (err) {
//            console.error(err);
//        }
//    });


    $('body').on('keypress', '#search_with_order', function (e) {
        try {

            if (e.keyCode == 13) {
                var keyword = $('#search_with_order').val();
                var orgId = $('body').find('#student_list-with').attr('org-id');
                var parentId = $('body').find('#student_list-with').attr('type-parent-id');
                var orderTypeId = $('body').find('#student_list-with').attr('type-id');
                var orderId = $('body').find('#student_list-with').attr('order-id');
                var specId = $('body').find('#org_spec_level_filter-2-with').val();
                var id = $('body').find('#org_spec_level_filter').val();
                var dataType = $('#main-div').attr('data-order-type')
                var form = {
                    orderTypeId: orderTypeId,
                    orderTypeParentId: parentId,
                    orgId: orgId,
                    orderId: orderId,
                    specId: specId,
                    specTypeId: id,
                    keyword: keyword
                };
                if (keyword.trim().length > 2) {
                    console.log('more than 2');
                    $('.btn-load-more').removeAttr('data-page');
                    $('#with_order_filter input[name="keyword"]').val(keyword);


                    Hsis.Proxy.getStudentsWithOrder(form, function (students) {
                        Hsis.Service.parseStudentsWithOrder(students);
                    });
                } else if (keyword.trim().length == 0) {
                    console.log(0);
                    $('.btn-load-more').removeAttr('data-page');
                    $('#search_with_order').val('');
                    form.keyword = '';
                    Hsis.Proxy.getStudentsWithOrder(form, function (students) {
                        Hsis.Service.parseStudentsWithOrder(students, '', dataType);
                    });
                }
            }
        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('keypress', '#userSearch', function (e) {
        try {
            if (e.keyCode == 13) {
                var keyword = $('#userSearch').val();
                 var orgId = $('body').find('#student_list_without').attr('org-id');
                 var parentId = $('body').find('#student_list_without').attr('type-parent-id');
                 var orderTypeId = $('body').find('#student_list_without').attr('type-id');
                 var orderId = $('body').find('#student_list_without').attr('order-id');
                 var specId = $('body').find('#org_spec_level_filter-2').val();
                 var id = $('body').find('#org_spec_level_filter').val();
                 var groupId = $('body #aca_group').val();
                var form = {
                    orderTypeId: orderTypeId,
                    orderTypeParentId: parentId,
                    orgId: orgId,
                    orderId: orderId,
                    specId: specId,
                    specTypeId: id,
                    keyword: keyword,
                    groupId: groupId
                };
                if (keyword.trim().length > 2) {
                    // $('.btn-load-more').removeAttr('data-page');
                    $('#without_order_filter input[name="keyword"]').val(keyword);
                    Hsis.Proxy.getStudentsWithoutOrder(form, function (students) {
                        Hsis.Service.parseStudentsWithoutOrder(students);
                    });

                } else if (keyword.trim().length == 0) {
                    $('.btn-load-more').removeAttr('data-page');
                    $('#search_without_order').val('');
                    form.keyword = '';
                    Hsis.Proxy.getStudentsWithoutOrder(form, function (students) {
                        Hsis.Service.parseStudentsWithoutOrder(students);
                    });
                }
            }

        } catch (err) {
            console.error(err);
        }
    });

    $('body').on('keypress', '#userAbroadSearch', function (e) {
        try {
            if (e.keyCode == 13) {
                var keyword = $('#userAbroadSearch').val();
                 
                if (keyword.trim().length > 0) {
                        Hsis.Proxy.loadUsers('', 'keyword=' + keyword);

                } else if (keyword.trim().length == 0) {
                        Hsis.Proxy.loadUsers();
                }
            }

        } catch (err) {
            console.error(err);
        }
    });


    /* $('.content-part').on('keypress', '#userSearch', function (e) {
         try {
             if (e.keyCode == 13) {
                 var keyword = $('#userSearch').val();
                 console.log(keyword);
                 //var type = $('.user-search-form input[name="type"]').val();
                 // var orgId = $('.user-search-form input[name="orgId"]').val();
                 //  var tableName = $('#main-div .row-table table').attr('id');

                 if (keyword.trim().length > 2) {
                     alert('sdadadadadada -------')
                     // $('.content-part .user-search-form input[name="keyword"]').val();
                     Hsis.Proxy.loadUsers('', 'keyword=' + keyword);
                     //  var params = $('.content-part .user-search-form').serialize();
                     /!*                     if(tableName === 'unregistered-users-table') {
                                             Hsis.Proxy.getUnregistretedUsersList('', type, orgId, function (data) {
                                                 if (data) {
                                                     if (data.code == Hsis.statusCodes.OK) {
                                                         Hsis.Service.parseUnregisteredUsers(data.data, type, '');

                                                     }
                                                 }
                                             }, keyword)
                                         }
                                             else if(tableName === 'users-table')
                                             Hsis.Proxy.loadUsers('',params);*!/

                 }
                 else if (keyword.trim().length == 0) {
                     Hsis.Proxy.loadUsers();

                 }
             }

         }
         catch (err) {
             console.error(err);
         }
     });*/


    $(".main-img").on("click", function () {
        $('.user-info').toggleClass("helloWorld");
    });

    // $(".main-img").on("click", function () {
    //     $(".user-info").removeClass("helloWorld");
    // });


    /*var width = window.innerWidth;
    if(width > 1500) {
        $('.app-list').show();
    } else {
        $(document).on('click','.hide-menu',function(e){
            e.stopPropagation();
            var display = $(".app-list").css('display');
            if(display === "none") {
                $('.app-list').fadeIn();
            } else{
                $('.app-list').fadeOut();
            }
        });

        $("body").on("click",function() {
            $('.app-list').hide();
        });
    }*/

    $('.main-content-upd').on('click', '#operation_1001419', function () {

        try {

//            if (!Hsis.tempDataId) {
//                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
//                    type: 'warning'
//                });
//                return false;
//            }
            var dicId = $(this).parents('tr').attr('data-id');
            $('#main-div .dictionary-modal #' + Hsis.lang + '').val('');
            $('#main-div .dictionary-modal #code').val('');
            $('#main-div .dictionary-modal .dic-type-select').html('');
            $('#main-div .dictionary-modal .parent-select').html('');
            $('#main-div .dictionary-modal #code').removeClass('error-border');
            $('#main-div .dictionary-modal #code').removeClass('.success-border');
            $('#main-div .dictionary-modal .span-code').removeClass('fa fa-close span-code-warning fa-check span-code-success');

            Hsis.Proxy.getDictionaryDetails(dicId, function (result) {
                if (result) {
                    if (result.code === Hsis.statusCodes.OK && result.data) {
                        var html = '';
                        var parentId = result.data.parentId;
                        Hsis.Proxy.loadDictionariTypes(function (data) {
                            $.each(data.data, function (i, v) {
                                html += '<option value="' + v.id + '">' + v.value.az + '</option>';
                            });
                            $('#main-div .dictionary-modal .dic-type-select').html(html);
                            if (parentId != 0) {
                                Hsis.Proxy.getDictionaryDetails(parentId, function (details) {
                                    Hsis.Proxy.loadDictionariesByTypeId(details.data.typeId, 0, function (type) {
                                        var html2 = '';
                                        $.each(type, function (i, v) {
                                            html2 += '<option value="' + v.id + '">' + v.value[Hsis.lang] + '</option>';
                                        });
                                        $('#main-div .dictionary-modal .parent-select').html(html2);
                                        $('#main-div .dictionary-modal .parent-select').prepend('<option value="0">Asılılıq yoxdur</option>');
                                        $('#main-div .dictionary-modal .parent-select').find('option[value=' + parentId + ']').prop('selected', 'selected');
                                        $('#main-div .dictionary-modal .dic-type-select').find('option[value=' + details.data.typeId + ']').prop('selected', 'selected');
                                    })
                                });
                            } else {
                                $('#main-div .dictionary-modal .parent-select').prepend('<option value="0">Asılılıq yoxdur</option>');
                                $('#main-div .dictionary-modal .parent-select').find('option[value=0]').prop('selected', 'selected');
                            }

                        });


                        $('#main-div .dictionary-modal #code').val(result.data.code);
                        $('#main-div .dictionary-modal #code').attr('data-code', result.data.code);
                        $('#main-div .dictionary-modal .btn-dictionary').attr('operation-type', 'edit');
                        $('#main-div .dictionary-modal .btn-dictionary').attr('data-id', dicId);
                        $('#main-div .dictionary-modal').modal({
                            backdrop: false
                        });
                        $('#main-div .dictionary-modal').find('.input-dictionary-name').removeAttr('id').attr('id', Hsis.lang);
                        $('#main-div .dictionary-modal #az').val(result.data.value.az);
                        $('#main-div .dictionary-modal #en').val(result.data.value.en);
                        $('#main-div .dictionary-modal #ru').val(result.data.value.ru);
                    }
                    else {
                        $.notify(Hsis.dictionary[Hsis.lang]['error'], {
                            type: 'danger'
                        });
                    }
                }
            });
        }
        catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('change', '.dictionary-modal .dic-type-select', function () {
        try {
            var type = $(this).find('option:selected').val();
            Hsis.Proxy.loadDictionariesByTypeId(type, 0, function (result) {
                var html2 = '';
                $.each(result, function (i, v) {
                    html2 += '<option value="' + v.id + '">' + v.value[Hsis.lang] + '</option>';
                });
                $('#main-div .dictionary-modal .parent-select').html(html2);
                $('#main-div .dictionary-modal .parent-select').prepend('<option value="0">Asılılıq yoxdur</option>');
                $('#main-div .dictionary-modal .parent-select').find('option').eq(0).prop('selected', 'selected');
            });
        }
        catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '.dictionary-modal .btn-dictionary', function () {

        try {
            var operationType = $(this).attr('operation-type');
            var dicId = $(this).attr('data-id');
            var code = $('#code').val();
            var lang = Hsis.lang[0].toUpperCase() + Hsis.lang.slice(1);
            if (code.trim().length == 0) {
                $.notify(Hsis.dictionary[Hsis.lang]['fill_code'], {
                    type: 'warning'
                });
                return false;
            }

            var dictionary = {
                code: $('#main-div #code').val(),
                parentId: $('#main-div .parent-select').find('option:selected').val(),
                typeId: Hsis.dicTypeId

            };
            var nameLang = $('body #' + Hsis.lang).val();
            dictionary["name" + lang] = nameLang;

            if (nameLang.trim().length == 0) {
                $.notify(Hsis.dictionary[Hsis.lang]['fill_dictionary_name'], {
                    type: 'warning'
                });
                return false;
            }

            if (operationType == 'edit') {
                dictionary.id = dicId;

                Hsis.Proxy.editDictionary(dictionary, function (result) {
                    if (result) {
                        if (result.code === Hsis.statusCodes.OK) {
                            $('#main-div .dictionary-modal').modal('hide');
                            $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                type: 'success'
                            });
                            Hsis.Proxy.loadOperations(Hsis.currModule, function (operations) {
                                $('#buttons_div').find('ul').html(Hsis.Service.parseOperations(operations, 1));

                                Hsis.Proxy.loadDictionariesByTypeId(Hsis.dicTypeId, 0, function (result) {
                                    Hsis.Service.parseDictype(result);
                                });

                            });
                        }
                    }
                });
            }
            else if (operationType == 'add') {

                Hsis.Proxy.addDictionary(dictionary, function (result) {
                    if (result) {
                        if (result.code === Hsis.statusCodes.OK) {
                            $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                type: 'success'
                            });

                            $('.span-code').removeClass('fa fa-close span-code-warning fa-check span-code-success');
                            $('#main-div .dictionary-modal #code').val('');
                            $('#main-div .dictionary-modal #az').val('');
                            $('#main-div .dictionary-modal #en').val('');
                            $('#main-div .dictionary-modal #ru').val('');
                            $('#main-div .dictionary-modal #code').removeClass('error-border success-border');
                            Hsis.Proxy.loadDictionariTypes(function () {
                                Hsis.Proxy.loadOperations(Hsis.currModule, function (operations) {
                                    $('#buttons_div').find('ul').html(Hsis.Service.parseOperations(operations, 1));

                                    Hsis.Proxy.loadDictionariesByTypeId(Hsis.dicTypeId, 0, function (result) {
                                        Hsis.Service.parseDictype(result);
                                    });

                                });
                            });
                        }
                    }
                });
            }
        }
        catch (err) {
            if (console)
                console.error(err);
        }
    });

    $('#main-div').on('click', '#operation_1001415', function () {
        try {
            if (!Hsis.dicTypeId) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'warning'
                });
                return false;
            }

            $('#main-div .dictionary-modal #' + Hsis.lang + '').val('');
            $('#main-div .dictionary-modal #code').val('');
            $('#main-div .dictionary-modal #code').removeClass('error-border success-border');
            $('#main-div .dictionary-modal .span-code').removeClass('fa fa-close span-code-warning fa-check span-code-success');

            var html = '';
            Hsis.Proxy.loadDictionariTypes(function (result) {
                $.each(result.data, function (i, v) {
                    html += '<option value="' + v.id + '">' + v.value.az + '</option>';
                });
                $('#main-div .dictionary-modal .dic-type-select').html(html);
                $('#main-div .dictionary-modal .dic-type-select').find('option').eq(0).attr('selected', 'selected');
                var type = $('.dictionary-modal .dic-type-select').find('option[selected]').val();
                Hsis.Proxy.loadDictionariesByTypeId(type, 0, function (result) {
                    var html2 = '';
                    $.each(result, function (i, v) {
                        html2 += '<option value="' + v.id + '">' + v.value.az + '</option>';
                    });
                    $('#main-div  .dictionary-modal .parent-select').html(html2);
                    $('#main-div .dictionary-modal .parent-select').prepend('<option value="0">' + Hsis.dictionary[Hsis.lang]['no_parent'] + '</option>');
                    $('#main-div .dictionary-modal .parent-select').find('option').eq(0).attr('selected', 'selected');

                    $('#main-div  #code').val('');
                    $('#main-div  #az').val('');
                    $('#main-div  #en').val('');
                    $('#main-div  #ru').val('');
                    $('#main-div .parent-div').hide()
                    $('#main-div .parent-show').attr('data-type', 'show')
                    $('#main-div .dictionary-modal .btn-dictionary').attr('operation-type', 'add');
                    $('#main-div .dictionary-modal').modal({
                        backdrop: false
                    });
                    $('#main-div  .dictionary-modal').find('.input-dictionary-name').removeAttr('id').attr('id', Hsis.lang)
                });
            });
        }
        catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('focusout', '.dictionary-modal #code', function () {
        try {
            var code = $(this).val();
            var type = $(this).attr('data-code');
            var operationType = $('#main-div .dictionary-modal .btn-dictionary').attr('data-type');
            if (code !== type && operationType !== 'edit') {
                Hsis.Proxy.checkDictionaryCode(code, function (data) {
                    if (data.data == "") {
                        $('.span-code').removeClass('fa fa-close span-code-warning').addClass('fa fa-check span-code-success')
                        $('#main-div .dictionary-modal #code').removeClass('error-border').addClass('success-border')
                    }
                    else {
                        $('.span-code').removeClass('fa fa-check span-code-success').addClass('fa fa-close span-code-warning')
                        $('#main-div .dictionary-modal #code').removeClass('success-border').addClass('error-border')
                    }
                });
            }
            ;

        } catch (err) {
            console.error(err);
        }

    });

    $('#main-div').on('click', '#operation_1001423', function () {
        try {
            var id = $(this).parents('tr').attr('data-id');
            var obj = $(this);

            $.confirm({
                title: Hsis.dictionary[Hsis.lang]['warning'],
                content: Hsis.dictionary[Hsis.lang]['delete_info'],
                confirm: function () {
                    Hsis.Proxy.removeDictionary(id, function (code) {
                        if (code) {
                            if (code.code === Hsis.statusCodes.OK) {
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                obj.parents('tr').remove()
                            }
                        }
                    });
                },
                theme: 'black'
            });


        }
        catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '.remove-static-doc-file', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).parents('label').find('input').val('')
        $(this).parents('span').html('');
    });

    $('#main-div').on('click', '#confirmAcceptedAbroadStudent', function (e) {

        try {
            var allValid = true;
            var formData = new FormData();
            var student = {
                eduLifeCycle: [],
                achievement: [],
                registrationDate: [],
                documents: [],
                token: Hsis.token,
                operationId: Hsis.operationList[0].id
            };

            var index = 1;

            if ($('.add-doc-block .doc-item')) {
                $('.add-doc-block .doc-item').each(function (e) {
                    if ($(this).attr('doc-type') != "personal") {
                        student.documents.push({
                            id: index,
                            type: $(this).find('.add-doc-type').attr('data-id'),
                            serial: $(this).find('.add-doc-serial').text(),
                            number: $(this).find('.add-doc-number').text(),
                            startDate: $(this).find('.add-doc-start-date').text(),
                            endDate: $(this).find('.add-doc-end-date').text(),
                            documentType: $(this).parents('.panel-body').attr('data-doc-type')
                        });
                    }


                    if ($(this).find('.new-add-doc-file') && $(this).find('.new-add-doc-file')[0] && $(this).find('.new-add-doc-file')[0].files) {
                        var wrongFiles = '';
                        var length = $(this).find('.new-add-doc-file')[0].files.length;
                        if (length <= 5) {
                            for (var i = 0; i < length; i++) {
                                var files = $(this).find('.new-add-doc-file')[0].files;
                                if (Hsis.Validation.checkFile(files[i].type, fileTypes.FILE_CONTENT_TYPE)) {
                                    if (files[i].size > 5 * 1024 * 1024) {

                                        $.notify(files[i].name + Hsis.dictionary[Hsis.lang]['exceed_volume'], {
                                            type: 'warning'
                                        });
                                        allValid = false;
                                    }
                                    else {
                                        formData.append('doc_' + index, $(this).find('.new-add-doc-file')[0].files[i]);
                                    }
                                }
                                else {
                                    wrongFiles += wrongFiles != '' ? ', ' + files[i].name : files[i].name;

                                }
                            }
                            if (wrongFiles != '') {
                                $.notify(Hsis.dictionary[Hsis.lang]['wrong_format'] + wrongFiles, {
                                    type: 'warning'
                                });
                                allValid = false;
                            }
                        }
                        else {
                            $.notify(Hsis.dictionary[Hsis.lang]['file_limit'], {
                                type: 'warning'
                            });
                            allValid = false;
                        }
                    }

                    index++;
                });
            }


            e.preventDefault();
            var operationType = $(this).attr('data-type');

            var personId = $('#main-div').attr('data-id');
            var subValue = $('#sub_speciality').find('option:selected').val();

//            if ($('#main-div .registration-date-panel .registration-date-item').length > 0) {
//                $('#main-div .registration-date-panel .registration-date-item').each(function () {
//
//                    var registration = {};
//                    registration.date = $(this).find('table tbody tr').attr('data-date'); 
//                    registration.note = $(this).find('table tbody tr').attr('data-date-note');
//                    registration.personId = personId;
//                    registration.token = Hsis.token;
//                    student.registrationDate.push(registration);
//
//                });
//            }
//
//            if ($('#main-div .archievement-panel .archievement-item').length > 0) {
//                $('#main-div .archievement-panel .archievement-item').each(function () {
//
//                    var achievement = {};
//                    achievement.typeId = $(this).find('table tbody tr').attr('data-type');
//                    achievement.note = $(this).find('table tbody tr').attr('data-note');
//                    achievement.personId = personId;
//                    achievement.token = Hsis.token;
//                    student.achievement.push(achievement);
//
//                });
//            }

                if ($('#main-div .registration-date-panel .registration-date-item').length > 0) {
                    $('#main-div .registration-date-panel .registration-date-item').each(function () {

                        var registration = {};
                        registration.date = $(this).find('table tbody tr').attr('data-date');
                        registration.personId = personId;
                        registration.note = $(this).find('table tbody tr').attr('data-date-note');
                        registration.liveCost = $(this).find('table tbody tr').attr('data-live');
                        registration.roadCost = $(this).find('table tbody tr').attr('data-road');
                        student.registrationDate.push(registration);

                    });
                }

                if ($('#main-div .archievement-panel .archievement-item').length > 0) {
                    $('#main-div .archievement-panel .archievement-item').each(function () {

                        var achievement = {};
                        achievement.typeId = $(this).find('table tbody tr').attr('data-type');
                        achievement.note = $(this).find('table tbody tr').attr('data-note');
                        achievement.personId = personId;
                        student.achievement.push(achievement);

                    });
                }

            var edu = {
                actionTypeId: 1000260,
                actionDate: $('#action_date').val().trim(),
//                specId: $('#main-div #speciality').val(),
                specId: $('#main-div #speciality').val() > 0 ? $('#main-div #speciality').val() : 0,
                specName: $('#main-div #specialityName').val().trim().length > 0 ? $('#main-div #specialityName').val().trim() : "",
                note: $('#note').val(),
                eduLineId: $('#edu_line').find('option:selected').val(),
                eduLangId: $('#edu_lang').find('option:selected').val(),
                eduLevelId: $('#abroad_edu_level').find('option:selected').val(),
                eduBlock: 'academic',
                status: $('#main-div #status').val(),
                graduateDate: $('#main-div #graduate_date').val(),
                eduPeriod: $('#main-div #edu-period').val(),
                countryId: $('#main-div #foreign_country').val(),
                cityId: $('#main-div #foreign_city').val(),
                atmId: $('#main-div #foreign_university').val(),
                specDirectionId: $('#main-div #spec_direction').val()

            };


            student.eduLifeCycle.push(edu);


            formData.append('student', new Blob([JSON.stringify(student)], {
                type: "application/json"

            }));


            if (Hsis.Validation.validateRequiredFields('data-required') && allValid) {
                Hsis.Proxy.addAcceptedAbroadStudent(formData, personId != '' ? personId : 0);
            }

        }
        catch (err) {
            console.error(err);
        }
    });


    /*   $('body').on('click','.new-filter',function(){
           var dataSort = $('body').find('.new-filter');
           var orderType ='';
           var order = '&orderColumn='+dataSort+'&orderType='+orderType;
           Hsis.Proxy.loadAbroadStudents(page, '', '', before, order );

       });*/

    //Module 1000114 Telebeler

    $('body').on('click', '#abroad_student_list th.asc', function () {
        var dataSort = $(this).attr('data-sort');
        var keyword = $('#abroad_student_search').val();
        var input = $('input[name="sortType"]');
        var sortType = input.val(dataSort);
        $('input[name="orderType"]').val("desc")
        $('input[name="orderColumn"]').val(dataSort)

        // var sortType = $('input[data]')
        $(this).removeClass('asc').addClass('desc');
        $('body').find('.table th i').css('display', 'none');
        $(this).find('i').css('display', 'inline-block');
        // var params = $('.student-search-form').serialize();
        var page = 1;
        var button = $('body').find('[data-table="abroad_students"]');
//        if(button && button.attr('data-page')){
        page = button.find('li.active a').text();
//        }
        Hsis.Proxy.loadAbroadStudents(page, 'orderColumn=' + dataSort + '&orderType=desc&keyword=' + keyword);
    });

    $('body').on('click', '#abroad_student_list th.desc', function () {
        var dataSort = $(this).attr('data-sort');
        var keyword = $('#abroad_student_search').val();
        console.log(dataSort)
        console.log(keyword)
        $(this).removeClass('desc').addClass('asc');
        $('body').find('.table th i').css('display', 'none');
        $(this).find('i').css('display', 'inline-block');
        // var params = $('.student-search-form').serialize();
        var button = $('body').find('[data-table="abroad_students"]');
        var page = 1;
        $('input[name="orderType"]').val("asc")
        $('input[name="orderColumn"]').val(dataSort)
        page = button.find('li.active a').text();
        Hsis.Proxy.loadAbroadStudents(page, 'orderColumn=' + dataSort + '&orderType=asc&keyword=' + keyword);
    });


    //HTP Emrler
    $('#main-div').on('click', '#operation_1001439', function (e) {
        try {
            var tr = $(this).parents('.info');
            var orgId = tr.attr('data-tr-orgId');
            var parentId = tr.attr('data-tr-parentId');
            var orderTypeId = tr.attr('data-tr-orderTypeId');
            var orderId = tr.attr('data-tr-orderId');
            $('body').find('.pelc-with-without-order .search-scroll').load('partials/pelc_order_students.html', function () {
                $('#main-div').find('#student_list-with').attr('order-id', orderId);
                $('#main-div').find('#student_list-with').attr('org-id', orgId);
                $('#main-div').find('#student_list-with').attr('type-parent-id', parentId);
                $('#main-div').find('#student_list-with').attr('type-id', orderTypeId);
                $('#main-div').attr('data-order-type', 'view');

                var form = {
                    orderTypeId: orderTypeId,
                    orderTypeParentId: parentId,
                    orgId: orgId,
                    orderId: orderId
                };
                Hsis.Proxy.getStudentsWithOrder(form, function (students) {
                    Hsis.Service.parseStudentsWithOrder(students, '', 'view');

                });
            });
            $('body').find('.pelc-with-without-order').css('right', '0');
        }
        catch (err) {
            console.error(err);
        }

    });


    $('body').on('click', '#abroad_structure_table th.asc', function () {
        var dataSort = $(this).attr('data-sort');
        $(this).removeClass('asc').addClass('desc');
        $('body').find('.table th i').css('display', 'none');
        $(this).find('i').css('display', 'inline-block');
        /*var params = $('.student-search-form').serialize();*/
        var page = 1;
        var button = $('body').find('[data-table="abroad_students"]');
//        if(button && button.attr('data-page')){
        page = button.find('li.active a').text();
//        }
        Hsis.Proxy.getAbroadStructure(page, 'orderColumn=' + dataSort + '&orderType=desc');
    });

    $('body').on('click', '#abroad_structure_table th.desc', function () {
        var dataSort = $(this).attr('data-sort');
        $(this).removeClass('desc').addClass('asc');
        $('body').find('.table th i').css('display', 'none');
        $(this).find('i').css('display', 'inline-block');
        // var params = $('.student-search-form').serialize();
        var page = 1;
        var button = $('body').find('[data-table="abroad_students"]');
        // abroad_structure_table
//        if(button && button.attr('data-page')){
        page = button.find('li.active a').text();
//        }
        Hsis.Proxy.getAbroadStructure(page, 'orderColumn=' + dataSort + '&orderType=asc');
    });

    $('body').on('click', '#operation_1001447', function () {
//       var id = $('#buttons_div').attr('data-id');
        var id = $('body').attr('data-pelc-id');

        Hsis.Proxy.restoreAbroadStudents(id, function (data) {
            if (data) {
                var queryparams = $('.main-content-upd .abroad_student-search-form').serialize();
                Hsis.Proxy.loadArchiveAbroadStudents('', queryparams);
            }
        })

    });

    $('body').on('click', '.user-doc-file img[data-type="view"]', function () {
//        var type = $(this).parents('.user-doc-file').attr('data-type');
//        if (type === 'view') {
            var link = $(this).attr('src');
            window.open(link, '_about');
//        }

    });

    $('body').on('click', '.user-doc-file img[data-type="view-order"]', function () {
//        var type = $(this).find('img').attr('data-type');
//        if (type === 'view') {
            var link = $(this).attr('data-url');
            window.open(link, '_about');
//        }

    });

    $('body').on('click', '.order-doc-file img', function () {
        var type = $(this).parents('.order-doc-file').attr('data-type');
        if (type === 'view') {
            var link = $(this).attr('src');
            window.open(link, '_about');
        }

    });


    $('#main-div').on('click', '#operation_1001448', function () {
        $('#main-div #exportModal').modal();

    });

    $('#main-div').on('click', '.abroad_report', function (e) {
        try {
            e.preventDefault();
            var type = $(this).attr('data-type');

            var format = $(this).attr('data-format');


            window.open(Hsis.urls.REPORT + 'reports/abroad/' + type + '/' + format + '?token=' + Hsis.token, '_blank');

        } catch (err) {
            console.error(err);
        }
    });

    $('#main-div').on('click', '.a-export', function () {
        try {
            var type = $(this).attr('alt');
            var searchParam = $('body').attr('search-param');
            var advancedForm = $('#main-div .abroad-student-advanced-search-form').serialize();
            var keyword = $('body #abroad_student_search').val();
            var params = '&searchAttr=0';
            if(searchParam === '0')
                params = '&keyword=' + keyword + '&searchAttr=0';
            else if(searchParam === '1') {
                params = '&' +advancedForm;
            }
            

            window.open(Hsis.urls.REPORT + 'reports/abroad/' + type + '?token=' + Hsis.token + params, '_blank');
            $('#exportModal').modal('hide');
        } catch (err) {
            console.error(err);
        }
    });


    $('body').on('click', '.addNewSpeciality', function () {

        $(this).parents('.spec_div1').addClass('hidden')

        $('body .spec_div2').removeClass('hidden')

    });

    $('body').on('click', '.removeNewSpeciality', function () {


        $(this).parents('.spec_div2').addClass('hidden')

        $('body .spec_div1').removeClass('hidden')


    });
    $('body').on('keyup', '#specialityName', function () {

        var count = $(this).val().trim().length

        if (count > 0) {
            $('body .removeNewSpeciality').addClass('hidden');
        } else {
            $('body .removeNewSpeciality').removeClass('hidden');
        }

    });


    // htp new users module operation type 2
    $('.content-part').on('click', '#operation_1001465', function (e) {
        try {
            $('body').addClass('operation-edit');
            var operation = $(this);
            if (!Hsis.tempDataId) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'warning'
                });
            }
            $("#main-div .crop-btn").hide();

            Hsis.operationList = 'edit';
            $('.content-part').load('partials/user_modal.html', function () {
                $('body').find('.sidebar').fadeOut(0);
                $('#confirm').html(Hsis.dictionary[Hsis.lang]["users.edit"]);

                var id = operation.parents('tr').attr('data-image-id');
                $('#userPhoto').attr('data-image-id', id);
            });

        }
        catch (err) {
            console.error(err);
        }

    });


    $('.content-part').on('click', '#operation_1001466', function () {
        try {
            if (!Hsis.tempDataId) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'warning'
                });
            }
            $.confirm({
                title: Hsis.dictionary[Hsis.lang]['warning'],
                content: Hsis.dictionary[Hsis.lang]['delete_user'],
                confirm: function () {
                    Hsis.Proxy.removeUser(Hsis.tempDataId, function (code) {
                        if (code) {
                            if (code.code === Hsis.statusCodes.OK) {
                                $.notify(Hsis.dictionary[Hsis.lang]['delete_user'], {
                                    type: 'success'
                                });
                                Hsis.Proxy.loadUsers();
                            }
                        }
                    });
                },
                theme: 'black'
            });
        }
        catch (err) {
            console.error(err);
        }
    });




    $('.content-part').on('click', '.table tr', function (e) {
        try {
            Hsis.tempDataId = $(this).attr("data-id");
        }
        catch (err) {
            console.error(err);
        }
    });


    $('.content-part').on('click', '#operation_1001467', function () {
        try {
            if (!Hsis.tempDataId) {

                $.notify("Please select data!", {
                    type: 'warning'
                });
                return false;
            }
            var block = $(this).parents('tr').attr('data-is-blocked');
            console.log(block);
            var string = block == "true" ? 'unblock' : 'block';
            $.confirm({
                title: Hsis.dictionary[Hsis.lang]['warning'],
                content: Hsis.dictionary[Hsis.lang][string + '_user'],
                confirm: function () {
                    Hsis.Proxy.blockUser(Hsis.tempDataId, block, function (code) {
                        if (code) {
                            if (code.code === Hsis.statusCodes.OK) {
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                Hsis.Proxy.loadUsers();
                            }
                        }
                    });
                },
                theme: 'black'
            });


        }
        catch (err) {
            console.error(err);
        }
    });




    $('.content-part').on('click', '#operation_1001469', function (e) {
        try {
            Hsis.operationList = 'add';
            $('.content-part').load('partials/user_modal.html', function () {
                $('body').find('.sidebar').fadeOut(0);
                $('#confirm').html(Hsis.dictionary[Hsis.lang]["users.add"]);
            });
        }
        catch (err) {
            console.error(err);
        }
    });


    //deactive session

    $('.content-part').on('click', '.table tr', function (e) {
        try {
            Hsis.tempDataId = $(this).attr("data-id");
        }
        catch (err) {
            console.error(err);
        }
    });





    /*$('.datepicker').on('changeDate', function(e){
        $(this).datepicker('hide');
    });*/


    $('.content-part').on('click', '#operation_1001468', function () {
        try {
            if (!Hsis.tempDataId) {
                $.notify(Hsis.dictionary[Hsis.lang]['select_information'], {
                    type: 'warning'
                });
                return false;
            }

            $.confirm({
                title: Hsis.dictionary[Hsis.lang]['warning'],
                content: Hsis.dictionary[Hsis.lang]['deactivate_session'],
                confirm: function () {
                    Hsis.Proxy.deactivateSession(Hsis.tempDataId, function (code) {
                        if (code) {
                            if (code.code === Hsis.statusCodes.OK) {
                                $.notify(Hsis.dictionary[Hsis.lang]['success'], {
                                    type: 'success'
                                });
                                Hsis.Proxy.loadUsers();
                            }
                        }
                    });
                },
                theme: 'black'
            });


        }
        catch (err) {
            console.error(err);
        }

    });


});

/*$(".centerloader").on("load",function() {
        $(".loader").fadeOut();
});*/

// function openFile(){
//     $('.open-file-modal').find('.modal-body iframe').attr('src','https://docs.google.com/viewer?url=http://192.168.1.78:8082/UnibookHsisRest/students/file/1000896?fileType=1&token=de31591681f84891b3dbd90d468dbff780d6d2299b714c579333eb2e0a93a774&embedded=true');
//
// }


/*function getFileType(type) {
    var fileType = '';
    switch (type) {
        case 'pdf':
            fileType = 'application/pdf';
            break;
        case 'jpg':
            fileType = 'image/png';
            break;
        case 'docx':
            fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
        case 'doc':
            fileType = 'application/msword';
            break;
        case 'xls':
            fileType = 'application/vnd.ms-excel';
            break;
        default:
            fileType = 'image/png';
            break;
    }
    return fileType;

}*/

function getUrl(id, type) {
    var url = '';
    switch (type) {
        case 'pdf':
            url = Hsis.urls.HTP + 'students/file2/' + id + '?token=' + Hsis.token;
            break;
        case 'docx':
            url = 'https://docs.google.com/viewer?url=' + Hsis.urls.HSIS + 'students/file/' + id + '?token=' + Hsis.token;
            //  var html = '<embed src="'+url+'" type="'+type+'">';
            //  $('#img').html(html);
            break;

        default:
            url = "http://192.168.1.8:8082/UnibookHsisRest/students/file/1000901?token=0b575f79978f4f9b99754ba90201fc2634561f6d7aa94fafac2bab324ab46dae";
            // $('#img').html('<img src="'+url+'">');
            break;
    }
    return url;

}


