$(function () {

    $('body').on('click', '#student_list th.asc', function () {
        var sortValue = $(this).attr('data-sort');
        $(this).removeClass('asc').addClass('desc');
        $('body').find('.table th i').css('display', 'none');
        $(this).find('i').css('display', 'inline-block');
        var params = $('.student-search-form').serialize();
        Hsis.Proxy.loadStudents('', params + '&orderColumn=' + sortValue + '&orderType=desc' + '&subModuleId=' + Hsis.subModuleId);
    });

    $('body').on('click', '#student_list th.desc', function () {
        var sortValue = $(this).attr('data-sort');
        $(this).removeClass('desc').addClass('asc');
        $('body').find('.table th i').css('display', 'none');
        $(this).find('i').css('display', 'inline-block');
        var params = $('.student-search-form').serialize();
        Hsis.Proxy.loadStudents('', params + '&orderColumn=' + sortValue + '&orderType=asc' + '&subModuleId=' + Hsis.subModuleId);
    });

    $('body').on('click', '#teacher_list  th.asc', function (e) {
        var sortValue = $(this).attr('data-sort');
        $(this).removeClass('asc').addClass('desc');
        $('body').find('.table th i').css('display', 'none');
        $(this).find('i').css('display', 'inline-block');
        var params = $('.student-search-form').serialize();
        Hsis.Proxy.loadTeachers('', params + 'orderColumn=' + sortValue + '&orderType=desc');
    });

    $('body').on('click', '#teacher_list  th.desc', function (e) {
        var sortValue = $(this).attr('data-sort');
        $(this).removeClass('desc').addClass('asc');
        $('body').find('.table th i').css('display', 'none');
        $(this).find('i').css('display', 'inline-block');
        var params = $('.student-search-form').serialize();
        Hsis.Proxy.loadTeachers('', params + 'orderColumn=' + sortValue + '&orderType=asc');
    });
});

