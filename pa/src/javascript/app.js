(function () {
  if (typeof window.Siema !== "undefined") {
    if (window.innerWidth < 468) {
      new window.Siema({
        perPage: 1.1,
      });
    } else {
      new window.Siema({
        perPage: 1.5,
      });
    }
  }

  var overviewTabs = document.querySelectorAll("[data-overview-tab]");

  if (overviewTabs.length) {
    var overviewImage = document.querySelector("[data-overview-image]");
    var overviewDescription = document.querySelector(
      "[data-overview-description]"
    );
    var overviewFadeTimer = null;

    overviewTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        if (tab.classList.contains("overview__point--active")) {
          return;
        }

        overviewTabs.forEach(function (item) {
          item.classList.remove("overview__point--active");
          item.setAttribute("aria-selected", "false");
        });

        tab.classList.add("overview__point--active");
        tab.setAttribute("aria-selected", "true");

        if (overviewImage) {
          overviewImage.src = tab.dataset.image;
        }

        if (overviewDescription) {
          overviewDescription.classList.add("is-fading");
          window.clearTimeout(overviewFadeTimer);
          overviewFadeTimer = window.setTimeout(function () {
            overviewDescription.textContent = tab.dataset.description;
            overviewDescription.classList.remove("is-fading");
          }, 180);
        }
      });
    });
  }

  var pollutionLists = document.querySelectorAll("[data-pollution-list]");

  pollutionLists.forEach(function (list) {
    var pollutionCard = list.closest(".feature-card--pollution");
    var pollutionTrack = list.querySelector("[data-pollution-track]");
    var pollutionOptions = Array.from(
      list.querySelectorAll("[data-pollution-option]")
    );
    var pollutionImage = pollutionCard
      ? pollutionCard.querySelector("[data-pollution-image]")
      : null;
    var pollutionImageContainer = pollutionImage ? pollutionImage.parentElement : null;
    var pollutionChips = pollutionCard
      ? pollutionCard.querySelector("[data-pollution-chip-grid]")
      : null;

    if (!pollutionOptions.length || !pollutionTrack) {
      return;
    }

    var activeIndex = pollutionOptions.findIndex(function (option) {
      return option.classList.contains("is-active");
    });
    var currentPosition = 0;
    var dragStartY = 0;
    var dragStartPosition = 0;
    var isDragging = false;
    var hasDragged = false;
    var lastPointerY = 0;
    var lastPointerTime = 0;
    var velocity = 0;
    var animationFrame = null;
    var pressedOption = null;
    var visibleChipSlots = 5;
    var pollutionImageSwapId = 0;
    var displayedIndex = activeIndex;
    var activePollutionImage = pollutionImage;
    var inactivePollutionImage = null;

    if (activeIndex === -1) {
      activeIndex = 0;
    }

    displayedIndex = activeIndex;

    if (pollutionImageContainer && pollutionImage) {
      inactivePollutionImage = pollutionImage.cloneNode(false);
      inactivePollutionImage.removeAttribute("data-pollution-image");
      inactivePollutionImage.removeAttribute("alt");
      inactivePollutionImage.setAttribute("aria-hidden", "true");
      pollutionImage.classList.add("is-active");
      pollutionImageContainer.appendChild(inactivePollutionImage);
    }

    function clampIndexPosition(value) {
      return Math.min(pollutionOptions.length - 1, Math.max(0, value));
    }

    function getPollutionStep() {
      return (pollutionOptions[0] && pollutionOptions[0].offsetHeight) || 48;
    }

    function setActivePollution(index) {
      var nextIndex = clampIndexPosition(index);

      if (nextIndex === activeIndex) {
        displayedIndex = nextIndex;
        return;
      }

      activeIndex = nextIndex;
      displayedIndex = nextIndex;
      updatePollutionContent(pollutionOptions[activeIndex]);
    }

    function updateDisplayedPollution(index) {
      var nextIndex = clampIndexPosition(index);
      var option;

      if (nextIndex === displayedIndex) {
        return;
      }

      displayedIndex = nextIndex;
      option = pollutionOptions[displayedIndex];

      if (!option || !option.dataset.pollutionChipSet) {
        return;
      }

      try {
        renderPollutionChips(JSON.parse(option.dataset.pollutionChipSet));
      } catch (error) {
        console.error("Invalid pollution chip data", error);
      }
    }

    function renderPollutionChips(chips) {
      var normalizedChips;

      if (!pollutionChips || !Array.isArray(chips)) {
        return;
      }

      normalizedChips = chips.slice(0, visibleChipSlots);

      while (normalizedChips.length < visibleChipSlots) {
        normalizedChips.push({ value: "", label: "", empty: true });
      }

      pollutionChips.innerHTML = normalizedChips
        .map(function (chip) {
          return (
            '<div class="feature-card__chip' +
            (chip.empty ? " feature-card__chip--empty" : "") +
            '">' +
            "<span>" +
            chip.value +
            "</span>" +
            "<small>" +
            chip.label +
            "</small>" +
            "</div>"
          );
        })
        .join("");
    }

    function updatePollutionContent(option) {
      if (activePollutionImage && option.dataset.pollutionImage) {
        var nextSrc = option.dataset.pollutionImage;
        var nextAlt = option.dataset.pollutionAlt || activePollutionImage.alt;
        var swapId = pollutionImageSwapId + 1;

        pollutionImageSwapId = swapId;

        if (activePollutionImage.getAttribute("src") === nextSrc) {
          activePollutionImage.alt = nextAlt;
          activePollutionImage.removeAttribute("aria-hidden");
        } else {
          var nextImage = new window.Image();

          nextImage.onload = function () {
            if (swapId !== pollutionImageSwapId) {
              return;
            }

            if (!inactivePollutionImage) {
              activePollutionImage.src = nextSrc;
              activePollutionImage.alt = nextAlt;
              activePollutionImage.removeAttribute("aria-hidden");
              return;
            }

            inactivePollutionImage.classList.remove("is-active");
            inactivePollutionImage.src = nextSrc;
            inactivePollutionImage.alt = nextAlt;
            inactivePollutionImage.removeAttribute("aria-hidden");
            activePollutionImage.alt = "";
            activePollutionImage.setAttribute("aria-hidden", "true");

            window.requestAnimationFrame(function () {
              var outgoingImage;

              if (swapId !== pollutionImageSwapId) {
                return;
              }

              inactivePollutionImage.classList.add("is-active");
              activePollutionImage.classList.remove("is-active");
              outgoingImage = activePollutionImage;
              activePollutionImage = inactivePollutionImage;
              inactivePollutionImage = outgoingImage;
            });
          };

          nextImage.src = nextSrc;
        }
      } else if (activePollutionImage && option.dataset.pollutionAlt) {
        activePollutionImage.alt = option.dataset.pollutionAlt;
      }

      if (option.dataset.pollutionChipSet) {
        try {
          renderPollutionChips(JSON.parse(option.dataset.pollutionChipSet));
        } catch (error) {
          console.error("Invalid pollution chip data", error);
        }
      }
    }

    function renderPollutionWheel() {
      var step = getPollutionStep();
      var centerOffset = (list.clientHeight - step) / 2;
      var nearestIndex = Math.round(currentPosition);

      updateDisplayedPollution(nearestIndex);

      pollutionOptions.forEach(function (option, index) {
        var distance = index - currentPosition;
        var absDistance = Math.abs(distance);
        var translateY = centerOffset + distance * step;
        var scale =
          absDistance <= 0.5
            ? 1
            : absDistance <= 1.5
            ? 0.98
            : 0.95;
        var opacity =
          absDistance > 2.5
            ? 0
            : absDistance > 1.5
            ? 0.5
            : absDistance > 0.5
            ? 0.48
            : 1;
        var blur = absDistance > 1.5 ? 1.5 : absDistance > 0.5 ? 0.4 : 0;

        option.classList.remove("is-active", "is-near", "is-faint", "is-hidden");
        option.setAttribute(
          "aria-pressed",
          index === activeIndex ? "true" : "false"
        );
        option.style.transform =
          "translateY(" +
          translateY +
          "px) scale(" +
          scale +
          ")";
        option.style.opacity = String(opacity);
        option.style.filter = "blur(" + blur + "px)";

        if (absDistance <= 0.5) {
          option.classList.add("is-active");
        } else if (absDistance <= 1.5) {
          option.classList.add("is-near");
        } else if (absDistance <= 2.5) {
          option.classList.add("is-faint");
        } else {
          option.classList.add("is-hidden");
        }
      });
    }

    function stopPollutionAnimation() {
      window.cancelAnimationFrame(animationFrame);
    }

    function easePollutionTo(targetPosition) {
      var startPosition = currentPosition;
      var snappedTarget = Math.round(clampIndexPosition(targetPosition));
      var startTime = null;
      var duration = 180;

      stopPollutionAnimation();

      function tick(timestamp) {
        var elapsed;
        var progress;
        var easedProgress;

        if (startTime === null) {
          startTime = timestamp;
        }

        elapsed = timestamp - startTime;
        progress = Math.min(elapsed / duration, 1);
        easedProgress = 1 - Math.pow(1 - progress, 3);
        currentPosition =
          startPosition + (snappedTarget - startPosition) * easedProgress;
        renderPollutionWheel();

        if (progress >= 1) {
          currentPosition = snappedTarget;
          setActivePollution(snappedTarget);
          renderPollutionWheel();
          return;
        }

        animationFrame = window.requestAnimationFrame(tick);
      }

      animationFrame = window.requestAnimationFrame(tick);
    }

    function animatePollutionTo(targetPosition, initialVelocity) {
      var position = currentPosition;
      var momentum = initialVelocity || 0;
      var snappedTarget = Math.round(clampIndexPosition(targetPosition));

      stopPollutionAnimation();

      function tick() {
        var distance = snappedTarget - position;
        momentum += distance * 0.12;
        momentum *= 0.82;
        position += momentum;
        position = clampIndexPosition(position);
        currentPosition = position;
        renderPollutionWheel();

        if (Math.abs(distance) < 0.001 && Math.abs(momentum) < 0.001) {
          currentPosition = snappedTarget;
          setActivePollution(snappedTarget);
          renderPollutionWheel();
          return;
        }

        animationFrame = window.requestAnimationFrame(tick);
      }

      animationFrame = window.requestAnimationFrame(tick);
    }

    list.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) {
        return;
      }

      stopPollutionAnimation();
      isDragging = true;
      hasDragged = false;
      pressedOption = event.target.closest("[data-pollution-option]");
      dragStartY = event.clientY;
      dragStartPosition = currentPosition;
      lastPointerY = event.clientY;
      lastPointerTime = performance.now();
      velocity = 0;
      list.setPointerCapture(event.pointerId);
    });

    list.addEventListener("pointermove", function (event) {
      var deltaY;
      var step;
      var now;
      var deltaTime;

      if (!isDragging) {
        return;
      }

      deltaY = event.clientY - dragStartY;

      if (Math.abs(deltaY) > 4) {
        hasDragged = true;
      }

      step = getPollutionStep();
      currentPosition = clampIndexPosition(dragStartPosition - deltaY / step);
      renderPollutionWheel();

      now = performance.now();
      deltaTime = now - lastPointerTime;

      if (deltaTime > 0) {
        velocity = ((lastPointerY - event.clientY) / step) / (deltaTime / 16);
        lastPointerY = event.clientY;
        lastPointerTime = now;
      }
    });

    function finishPollutionDrag(pointerId) {
      var projected;
      var snapped;

      if (!isDragging) {
        return;
      }

      isDragging = false;
      if (
        typeof pointerId === "number" &&
        list.hasPointerCapture &&
        list.hasPointerCapture(pointerId)
      ) {
        list.releasePointerCapture(pointerId);
      }
      projected = clampIndexPosition(currentPosition + velocity * 0.35);
      snapped = Math.round(projected);
      animatePollutionTo(snapped, velocity * 0.1);
    }

    list.addEventListener("pointerup", function (event) {
      var clickedOption;
      var clickedIndex;

      if (isDragging && !hasDragged) {
        isDragging = false;
        if (list.hasPointerCapture && list.hasPointerCapture(event.pointerId)) {
          list.releasePointerCapture(event.pointerId);
        }
        clickedOption = pressedOption;
        pressedOption = null;

        if (clickedOption) {
          clickedIndex = pollutionOptions.indexOf(clickedOption);

          if (clickedIndex !== -1) {
            easePollutionTo(clickedIndex);
            return;
          }
        }

        easePollutionTo(activeIndex);
        return;
      }

      pressedOption = null;
      finishPollutionDrag(event.pointerId);
    });
    list.addEventListener("pointercancel", function (event) {
      if (list.hasPointerCapture && list.hasPointerCapture(event.pointerId)) {
        list.releasePointerCapture(event.pointerId);
      }
      pressedOption = null;
      finishPollutionDrag();
    });

    pollutionOptions.forEach(function (option, index) {
      option.addEventListener("click", function () {
        if (hasDragged) {
          hasDragged = false;
          return;
        }

        easePollutionTo(index);
      });
    });

    list.addEventListener(
      "wheel",
      function (event) {
        var direction;
        var nextIndex;

        event.preventDefault();
        direction = event.deltaY > 0 ? 1 : -1;
        nextIndex = clampIndexPosition(Math.round(currentPosition) + direction);
        animatePollutionTo(nextIndex);
      },
      { passive: false }
    );

    window.addEventListener("resize", function () {
      currentPosition = activeIndex;
      renderPollutionWheel();
    });

    currentPosition = activeIndex;
    updatePollutionContent(pollutionOptions[activeIndex]);
    renderPollutionWheel();
  });
})();
