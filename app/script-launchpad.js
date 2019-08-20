$(function () {
  var launchpad = $("#launchpad"),
          open = function () {
            launchpad.addClass("shown start");
            launchpad.find("nav").addClass("scale-down");
          },
          close = function () {
            return
            launchpad
                    .removeClass("start")
                    .addClass("end");
            launchpad.find("nav")
                    .removeClass("scale-down")
                    .addClass("scale-up");
            setTimeout(function () {
              launchpad.removeClass("shown end");
              launchpad.find("nav").removeClass("scale-up");
            }, 350);
          };

  // Open the launchpad
  //$(".open-menu").on("click", open);
  open()

  // Close the launchpad when the content is clicked, only if the  target is not a link
  $(document).mouseup(function (e) {
    var content = launchpad.find(".content"),
            nav = content.find("nav");

    if (content.is(e.target) || nav.is(e.target)) {
      close();
    }
  });

}); 