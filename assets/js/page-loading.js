var pageLoading = document.querySelector('.temp-load');
var mainDiv =  document.getElementById('main-div');


setTimeout( function() {
    pageLoading.classList.add('fade');
    mainDiv.classList.remove('hidden');
    pageLoading.classList.add('hidden');
}, 1000);

