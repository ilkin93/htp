(function () {
    $(document).ready(function () {
        $('#navbox-trigger').click(function () {
            return $('#navigation-bar').toggleClass('navbox-open');
        });

        return $(document).on('click', function (e) {
            var $target;
            $target = $(e.target);
            if (!$target.closest('.navbox').length && !$target.closest('#navbox-trigger').length) {
                return $('#navigation-bar').removeClass('navbox-open');
            }
        });
    });
}.call(this));

