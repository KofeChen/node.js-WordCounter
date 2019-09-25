$('.selectBtn').on('click', function() {
  var inputObj = document.createElement('input');
  inputObj.setAttribute('type','file');
  inputObj.setAttribute("style",'visibility:hidden');
  document.body.appendChild(inputObj);
  inputObj.click();
  inputObj.value;
}) 