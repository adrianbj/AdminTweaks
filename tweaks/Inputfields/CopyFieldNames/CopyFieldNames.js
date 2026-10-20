$(document).ready(function () {
  // Copy a string to the clipboard
  function copyToClipboard(string) {
    navigator.clipboard.writeText(string);
  }

  // When InputfieldHeader is clicked
  $(document).on("click", ".InputfieldHeader", function (event) {
    let text = "";
    if (!event.shiftKey) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    text = $(this).attr("for");
    if (!text) text = $(this).parent().attr("id");
    text = text.replace(/^Inputfield_|wrap_Inputfield_|wrap_/, "").trim();
    if (!text) return;

    copyToClipboard(text);
    $(this).effect("highlight", {}, 500);
  });
});
