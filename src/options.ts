// Saves options to chrome.storage
function save_options() {
  const breaktime1 = document.querySelector<HTMLSelectElement>("#breaktime1Select");
  const breaktime2 = document.querySelector<HTMLSelectElement>("#breaktime2Select");
  const breaktime3 = document.querySelector<HTMLSelectElement>("#breaktime3Select");
  const loginButtonAnimation = document.querySelector<HTMLSelectElement>("#loginButtonAnimationSelect");
  if (breaktime1 == null || breaktime2 == null || breaktime3 == null || loginButtonAnimation == null) {
    return;
  }
  chrome.storage.sync.set(
    {
      breaktime1: breaktime1.options[breaktime1.selectedIndex].value,
      breaktime2: breaktime2.options[breaktime2.selectedIndex].value,
      breaktime3: breaktime3.options[breaktime3.selectedIndex].value,
      loginButtonAnimation: loginButtonAnimation.options[loginButtonAnimation.selectedIndex].value,
    },
    function () {
      // Update status to let user know options were saved.
      const status = document.querySelector<HTMLElement>("#status");
      if (status != null) {
        // console.log("save breaktime1: ", breaktime1.options[breaktime1.selectedIndex].value);
        // console.log("save breaktime2: ", breaktime2.options[breaktime2.selectedIndex].value);
        // console.log("save breaktime3: ", breaktime3.options[breaktime3.selectedIndex].value);
        // console.log("save loginButtonAnimation: ", loginButtonAnimation.options[loginButtonAnimation.selectedIndex].value);
        status.textContent = "Saved!";
        setTimeout(function () {
          status.textContent = "";
        }, 750);
      }
    });
}

// Restores select box state using the preferences stored in chrome.storage.
function restore_options() {
  // Use default value
  chrome.storage.sync.get(
    {
      breaktime1: "705",
      breaktime2: "-1",
      breaktime3: "0",
      loginButtonAnimation: "0",
    },
    function (items) {
      const breaktime1 = document.querySelector<HTMLSelectElement>("#breaktime1Select");
      const breaktime2 = document.querySelector<HTMLSelectElement>("#breaktime2Select");
      const breaktime3 = document.querySelector<HTMLSelectElement>("#breaktime3Select");
      const loginButtonAnimation = document.querySelector<HTMLSelectElement>("#loginButtonAnimationSelect");
      if (breaktime1 != null && breaktime2 != null && breaktime3 != null && loginButtonAnimation != null) {
        // console.log("restore breaktime1: ", items.breaktime1);
        // console.log("restore breaktime2: ", items.breaktime2);
        // console.log("restore breaktime3: ", items.breaktime3);
        // console.log("restore loginButtonAnimation: ", items.loginButtonAnimation);
        breaktime1.value = items.breaktime1;
        breaktime2.value = items.breaktime2;
        breaktime3.value = items.breaktime3;
        loginButtonAnimation.value = items.loginButtonAnimation;
      }
    }
  );
}

document.addEventListener("DOMContentLoaded", restore_options);
document.querySelector("#save")?.addEventListener("click", save_options);
