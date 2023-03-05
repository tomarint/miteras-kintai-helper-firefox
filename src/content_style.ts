(function () {
  function stopLoginButtonAnimation() {
    chrome.storage.sync
      .get({
        breaktime1: "705",
        breaktime2: "-1",
        breaktime3: "0",
        loginButtonAnimation: "0",
      })
      .then(function (items: any) {
        let loginButtonAnimation = Number(items.loginButtonAnimation);
        if (loginButtonAnimation !== 1) {
          let style = document.createElement("style");
          style.innerHTML = `.login-button { transition: none !important; }`;
          document.head.appendChild(style);
        }
      })
      .catch(function (error: any) {
        console.log(error);
      });
  }
  stopLoginButtonAnimation();
})();
