$(function (e) {



    $('#tree1, #tree2').on('click', 'a', function (e) {
        var chosenText = '';
        chosenText = $(this).text();

        $('.modal-content').on('click', '.btn.btn-primary', function (e) {

            if (chosenText) {
                $('.btn.tree-modal').text(chosenText);
            }

        });
    });

    $('.btn.tree-modal').on('click', function (event) {
        try {
            var treeObj = $(':jstree').length;
            if (treeObj == 0) {
                var attr = $(this).attr('data-check');
                if(attr != 1) {
                    Hsis.Proxy.getOrgsWithoutSchools(function (tree) {
                    Hsis.Service.commonParseTree(tree, 'structures-tree');

                },$('#structures-tree'));
                }
                
            }

            $('.modal.tree-modal').modal();

        }
        catch (err) {
            console.error(err);
        }



    });

//    $('.close').on('click', function(e) {
//        $(this).closest('.modal-content').addClass('hidden');
//        $(this).closest('.modal-content').find('.btn-success').off('click');
//    });

//    $('.modal-content').on('click', '.btn-danger', function(e) {
//       $(this).closest('.modal-content').addClass('hidden');
//        $(this).closest('.modal-content').find('.btn-success').off('click');
//    });

});